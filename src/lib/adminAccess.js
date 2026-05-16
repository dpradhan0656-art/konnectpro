import { supabase } from './supabase';

/**
 * Co-Founder / emergency bypass: set in `.env` as comma-separated list, e.g.
 *   VITE_SUPERADMIN_EMAILS=you@company.com,other@company.com
 */
function parseEnvEmailList() {
  const raw = import.meta.env.VITE_SUPERADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * @param {string | null | undefined} email
 * @returns {boolean}
 */
export function isSuperAdminEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const e = email.trim().toLowerCase();
  if (!e) return false;
  const fromEnv = parseEnvEmailList();
  if (fromEnv.includes(e)) return true;
  /* Single-email env (optional) */
  const single = (import.meta.env.VITE_SUPERADMIN_EMAIL || '').trim().toLowerCase();
  if (single && e === single) return true;
  return false;
}

/**
 * @param {string | null | undefined} userId
 * @returns {Promise<boolean>}
 */
export async function isAppAdminUser(userId) {
  if (!userId) return false;
  const { data, error } = await supabase.from('app_admin').select('user_id').eq('user_id', userId).limit(1);
  if (error) {
    console.warn('[adminAccess] app_admin check:', error.message);
    return false;
  }
  return !!(data && data.length > 0);
}

/**
 * DeepakHQ and expert-route bypass: app_admin row OR superadmin email allowlist.
 *
 * @param {{ id: string, email?: string | null } | null | undefined} user — Supabase auth user
 * @returns {Promise<boolean>}
 */
export async function canAccessDeepakHQ(user) {
  if (!user?.id) return false;
  if (isSuperAdminEmail(user.email)) return true;
  return isAppAdminUser(user.id);
}

/**
 * Superadmin can open DeepakHQ via env allowlist, but RLS used to require `app_admin`.
 * After migration `20260516120000_founder_hq_catalog_rls`, founder JWT also passes catalog RLS.
 * This RPC also inserts `app_admin` so all other HQ tables work without duplicate policies.
 */
export async function syncFounderAdminRow(user) {
  if (!user?.id || !isSuperAdminEmail(user.email)) return { ok: true, skipped: true };
  const { error } = await supabase.rpc('ensure_founder_app_admin');
  if (error) {
    console.warn('[adminAccess] ensure_founder_app_admin:', error.message);
    return { ok: false, error };
  }
  return { ok: true };
}
