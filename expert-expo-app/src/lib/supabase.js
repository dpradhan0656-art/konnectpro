import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line import/no-commonjs
const { sanitizeSupabaseUrl } = require('../../supabasePublicEnv.cjs');

/**
 * Same Supabase project as the web app — use EXPO_PUBLIC_* vars in `.env` (see `.env.example`).
 * Also reads `expo.extra` from app.config.js so release builds still resolve URL/key if one pipeline omits env.
 * `react-native-url-polyfill` is imported in `index.js` before this module loads.
 */
/** Resolved at call time so Metro/EAS env and `expo.extra` stay in sync. */
export function resolveSupabasePublicConfig() {
  const extra = Constants.expoConfig?.extra ?? {};
  const rawUrl = (
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    extra.supabaseUrl ??
    ''
  ).trim();
  const url = sanitizeSupabaseUrl(rawUrl);
  const anonKey = (
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    extra.supabaseAnonKey ??
    ''
  ).trim();
  return { url, anonKey };
}

const { url: supabaseUrl, anonKey: supabaseAnonKey } = resolveSupabasePublicConfig();

export function isSupabaseConfigured() {
  const c = resolveSupabasePublicConfig();
  return Boolean(c.url && c.anonKey);
}

if (__DEV__) {
  const viteUrl = (process.env.VITE_SUPABASE_URL ?? '').trim();
  const viteKey = (process.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
  if ((viteUrl || viteKey) && (!supabaseUrl || !supabaseAnonKey)) {
    // eslint-disable-next-line no-console
    console.warn(
      '[supabase] VITE_SUPABASE_* is set but Expo ignores it. Use EXPO_PUBLIC_SUPABASE_URL and ' +
        'EXPO_PUBLIC_SUPABASE_ANON_KEY in expert-expo-app/.env (and eas env:push for EAS builds).'
    );
  }
}

if (__DEV__ && (!supabaseUrl || !supabaseAnonKey)) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in expert-expo-app/.env'
  );
}

if (!__DEV__ && (!supabaseUrl || !supabaseAnonKey)) {
  // eslint-disable-next-line no-console
  console.error(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are empty in this build. ' +
      'Configure EAS Environment variables and rebuild; Google sign-in cannot reach your project.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
