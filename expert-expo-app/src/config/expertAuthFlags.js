/**
 * Expert auth feature flags (EXPO_PUBLIC_* inlined at Metro build time).
 *
 * EXPO_PUBLIC_FORCE_EXPERT_MODE — dev/QA only (e.g. Expo Go): skip DB expert gate and show dashboard.
 * Omit or set to false in production / store builds so normal validateExpertAccess runs.
 */

function parseTruthyEnv(value) {
  if (value == null || value === '') return false;
  const v = String(value).trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

/**
 * When true, App routes signed-in users straight to Expert dashboard with a fallback expert
 * object (no experts table check). Use only for local/Expo Go testing.
 * @returns {boolean}
 */
export function isForceExpertDashboardMode() {
  return parseTruthyEnv(process.env.EXPO_PUBLIC_FORCE_EXPERT_MODE);
}

/**
 * Minimal expert-shaped object for dashboard when force mode is on (id may be null; some features need real id).
 * @param {import('@supabase/supabase-js').User | null | undefined} user
 * @returns {{ id: null, name: string, email: string | null, user_id: string | null, status: string }}
 */
export function buildFallbackExpertFromUser(user) {
  return {
    id: null,
    name: user?.user_metadata?.full_name || user?.email || 'Expert',
    email: user?.email || null,
    user_id: user?.id || null,
    status: 'approved',
  };
}
