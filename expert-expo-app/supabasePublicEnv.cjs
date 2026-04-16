/**
 * Shared Supabase URL normalization for app.config.js and src/lib/supabase.js.
 * EAS can have duplicate EXPO_PUBLIC_SUPABASE_URL entries; a stale PROJECT var
 * may still be https://xyz.supabase.co (placeholder) and override the real URL.
 */
const DEFAULT_SUPABASE_PROJECT_URL = 'https://odaidoywiptuyadzmidf.supabase.co';

function sanitizeSupabaseUrl(url) {
  const u = String(url || '').trim();
  if (!u) return u;
  try {
    const { hostname } = new URL(u);
    if (hostname === 'xyz.supabase.co' || hostname === 'your-project.supabase.co') {
      return DEFAULT_SUPABASE_PROJECT_URL;
    }
    return u;
  } catch {
    return u;
  }
}

module.exports = { sanitizeSupabaseUrl, DEFAULT_SUPABASE_PROJECT_URL };
