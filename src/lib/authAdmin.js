/**
 * Admin-only auth operations (calls Edge Function with service_role on backend).
 * Used from DeepakHQ for password reset of users, experts, area heads.
 *
 * Uses direct fetch + refreshSession (same pattern as wallet Edge Functions) so the
 * gateway does not block the request; function still validates JWT in the handler.
 */
import { supabase } from './supabase';

export const EXPERT_DEFAULT_PASSWORD = 'Kshatr@7979';

async function getAdminSession() {
  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
  const session = refreshData?.session ?? (await supabase.auth.getSession()).data?.session;
  if (!session?.access_token) {
    throw new Error(refreshError?.message || 'Session expired. Please sign in again.');
  }
  return session;
}

async function callAdminAuthFunction(functionName, payload) {
  const session = await getAdminSession();
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!baseUrl || !anonKey) {
    throw new Error('Supabase URL or anon key is not configured.');
  }

  let res;
  try {
    res = await fetch(`${baseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: anonKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const msg = e?.message || String(e);
    throw new Error(
      msg.includes('Failed to fetch')
        ? 'Network error: could not reach the server. Check connection and Supabase URL.'
        : `Failed to send a request to the Edge Function: ${msg}`
    );
  }

  const raw = await res.text();
  let body = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    body = { _raw: raw };
  }
  if (!res.ok) {
    const detail =
      body?.error ||
      body?.message ||
      body?.details ||
      (body?._raw ? String(body._raw).slice(0, 300) : null) ||
      res.statusText ||
      'Admin auth operation failed.';
    throw new Error(`HTTP ${res.status}: ${detail}`);
  }
  if (body?.error) throw new Error(body.error);
  return body;
}

export async function adminResetPassword(userId, newPassword) {
  if (!userId || !newPassword || newPassword.length < 6) {
    throw new Error('user_id and new password (min 6 chars) required');
  }

  return callAdminAuthFunction('admin-reset-password', {
    user_id: userId,
    new_password: newPassword,
  });
}

export async function adminEnsureExpertAuth({ expertId, email, password = EXPERT_DEFAULT_PASSWORD }) {
  if (!expertId) throw new Error('expertId is required.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    throw new Error('Valid expert email is required before approval.');
  }
  if (!password || password.length < 8) {
    throw new Error('Default expert password must be at least 8 characters.');
  }
  return callAdminAuthFunction('admin-ensure-expert-auth', {
    expert_id: expertId,
    email: String(email).trim().toLowerCase(),
    password,
  });
}
