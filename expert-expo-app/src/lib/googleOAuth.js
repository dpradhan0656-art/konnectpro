import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { isSupabaseConfigured } from './supabase';
import {
  clearPendingOAuthRedirect,
  peekPendingOAuthRedirect,
  takePendingOAuthRedirect,
} from './oauthRedirectBuffer';

/**
 * Exact OAuth redirect (must match Supabase Auth → URL configuration → Redirect URLs).
 * Using a literal avoids Expo `makeRedirectUri` variants (e.g. triple-slash) that break callback matching on Play builds.
 *
 * Keep in sync with `expo.scheme` in app.json (`expert-expo-app`).
 */
export const EXPERT_GOOGLE_OAUTH_REDIRECT_URI = 'expert-expo-app://auth/callback';

/**
 * Google OAuth for Expo → Supabase session.
 * Supabase Dashboard → Authentication → Redirect URLs must include:
 *   expert-expo-app://auth/callback
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<{ cancelled?: boolean, session?: import('@supabase/supabase-js').Session }>}
 */
export async function signInWithGoogle(supabase) {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'This build is missing Supabase settings (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY). ' +
        'Add expert-expo-app/.env and rebuild the APK, or set them in EAS Environment variables, then rebuild.'
    );
  }

  const redirectTo = EXPERT_GOOGLE_OAUTH_REDIRECT_URI;
  const normalizedRedirect = redirectTo.toLowerCase();

  const matchesRedirect = (url) => {
    if (!url) return false;
    return String(url).toLowerCase().startsWith(normalizedRedirect);
  };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('No OAuth URL returned from Supabase');

  const cleanup = async () => {
    if (Platform.OS === 'android') {
      await WebBrowser.coolDownAsync().catch(() => {});
    }
  };

  /** Android: `openAuthSessionAsync` can hang forever; never await it without a ceiling. */
  const BROWSER_WAIT_MS = Platform.OS === 'android' ? 48000 : 120000;

  try {
    if (Platform.OS === 'android') {
      await WebBrowser.warmUpAsync().catch(() => {});
    }

    // Fresh Custom Tabs session — drop any buffered URL from an older attempt (not the upcoming return).
    clearPendingOAuthRedirect();

    const result = await Promise.race([
      WebBrowser.openAuthSessionAsync(data.url, redirectTo),
      new Promise((resolve) =>
        setTimeout(() => resolve({ type: '__oauth_browser_timeout', url: null }), BROWSER_WAIT_MS)
      ),
    ]);

    const browserTimedOut = result?.type === '__oauth_browser_timeout';

    let urlToUse = result.type === 'success' && result.url ? result.url : null;
    if (!urlToUse) {
      const fromBuffer = takePendingOAuthRedirect();
      if (matchesRedirect(fromBuffer)) urlToUse = fromBuffer;
    }

    if (urlToUse && matchesRedirect(urlToUse)) {
      return await applyOAuthCallbackUrl(supabase, urlToUse);
    }

    // Dismiss / timeout / missing URL — deep link or session may arrive late (very common on Android).
    const stepMs = 200;
    const maxSteps = browserTimedOut ? 100 : 60;
    for (let i = 0; i < maxSteps; i++) {
      await new Promise((r) => setTimeout(r, stepMs));
      const buffered = peekPendingOAuthRedirect();
      if (matchesRedirect(buffered)) {
        return await applyOAuthCallbackUrl(supabase, takePendingOAuthRedirect());
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        return { session };
      }
    }

    if (result.type !== 'success' || !result.url || browserTimedOut) {
      const {
        data: { session: lastChance },
      } = await supabase.auth.getSession();
      if (lastChance?.user) {
        return { session: lastChance };
      }
      return { cancelled: true };
    }

    throw new Error(
      'OAuth callback did not return to Expert app. Verify Supabase redirect URLs include expert-expo-app://auth/callback.'
    );
  } finally {
    clearPendingOAuthRedirect();
    await cleanup();
  }
}

/**
 * If the app cold-started from expert-expo-app://auth/callback?code=... (e.g. process killed during OAuth),
 * exchange the code using the PKCE verifier Supabase stored in AsyncStorage.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
export async function tryResumeOAuthFromPendingDeepLink(supabase) {
  if (!isSupabaseConfigured()) return;
  const u = peekPendingOAuthRedirect();
  if (!u) return;
  if (!String(u).toLowerCase().startsWith(normalizedRedirectStatic())) {
    clearPendingOAuthRedirect();
    return;
  }
  takePendingOAuthRedirect();
  try {
    await applyOAuthCallbackUrl(supabase, u);
  } catch {
    /* invalid/expired code or missing verifier — user can tap Google again */
  }
}

function normalizedRedirectStatic() {
  return EXPERT_GOOGLE_OAUTH_REDIRECT_URI.toLowerCase();
}

/**
 * Parses Supabase OAuth callback (query `code` for PKCE, or hash tokens for implicit).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} url
 */
async function applyOAuthCallbackUrl(supabase, url) {
  const oauthErr = extractParam(url, 'error');
  if (oauthErr) {
    const desc = extractParam(url, 'error_description');
    throw new Error(desc ? decodeURIComponent(desc.replace(/\+/g, ' ')) : oauthErr);
  }

  const code = extractParam(url, 'code');
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return { session: data.session };
  }

  const accessToken = extractFromHashOrQuery(url, 'access_token');
  const refreshToken = extractFromHashOrQuery(url, 'refresh_token');
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return { session: data.session };
  }

  throw new Error('Could not read session from OAuth callback URL');
}

function extractParam(url, key) {
  const re = new RegExp(`[?&#]${key}=([^&]+)`);
  const m = url.match(re);
  return m ? decodeURIComponent(m[1]) : null;
}

function extractFromHashOrQuery(url, key) {
  const hashPart = url.includes('#') ? url.split('#')[1] : '';
  const searchPart = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
  const tryParse = (segment) => {
    if (!segment) return null;
    const params = new URLSearchParams(segment);
    return params.get(key);
  };
  return tryParse(hashPart) || tryParse(searchPart);
}
