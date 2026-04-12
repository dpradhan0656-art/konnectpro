/**
 * Extends app.json with EAS project id (Expo Push / EAS Build).
 * Override: EXPO_PUBLIC_EAS_PROJECT_ID in .env
 */
const appJson = require('./app.json');

/** Default = KonnectPro / Kshatr Expert EAS project (same as app.json extra.eas.projectId). */
const DEFAULT_EAS_PROJECT_ID = '935435de-9eba-4416-9ef8-9ce694d302b3';

const projectId =
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
  (appJson.expo?.extra?.eas?.projectId || '').trim() ||
  DEFAULT_EAS_PROJECT_ID;

const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const hasSupabasePublicEnv = Boolean(supabaseUrl && supabaseAnonKey);

// EAS sets EAS_BUILD=true on build workers — warn in logs when the JS bundle will have empty Supabase config.
if (process.env.EAS_BUILD === 'true' && !hasSupabasePublicEnv) {
  // eslint-disable-next-line no-console
  console.warn(
    '[app.config] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Set them under Project → Environment variables (or eas.json env) for this profile, then rebuild. ' +
      'Google sign-in will not work in the APK/AAB without these.'
  );
}

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
      eas: {
        ...(appJson.expo.extra?.eas || {}),
        projectId,
      },
      /** Mirrors whether EXPO_PUBLIC_SUPABASE_* were present at bundle time (for support builds). */
      hasSupabasePublicEnv,
    },
  },
};
