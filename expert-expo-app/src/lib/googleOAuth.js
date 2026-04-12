import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

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
  const redirectTo = EXPERT_GOOGLE_OAUTH_REDIRECT_URI;

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

  /*
   * OLD trial: AuthSession.startAsync was not used here; Supabase recommends signInWithOAuth
   * + WebBrowser.openAuthSessionAsync for the PKCE / implicit redirect back into the app.
   */

  if (Platform.OS === 'android') {
    await WebBrowser.warmUpAsync().catch(() => {});
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success' || !result.url) {
    if (Platform.OS === 'android') {
      await WebBrowser.coolDownAsync().catch(() => {});
    }
    return { cancelled: true };
  }

  const normalizedRedirect = redirectTo.toLowerCase();
  const normalizedResult = String(result.url).toLowerCase();
  const isExpectedCallback = normalizedResult.startsWith(normalizedRedirect);
  if (!isExpectedCallback) {
    if (Platform.OS === 'android') {
      await WebBrowser.coolDownAsync().catch(() => {});
    }
    throw new Error('OAuth callback did not return to Expert app. Verify Supabase redirect URLs include expert-expo-app://auth/callback.');
  }

  try {
    return await applyOAuthCallbackUrl(supabase, result.url);
  } finally {
    if (Platform.OS === 'android') {
      await WebBrowser.coolDownAsync().catch(() => {});
    }
  }
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
