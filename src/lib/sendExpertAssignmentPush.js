import { supabase } from './supabase';

/**
 * Notify expert device via Expo Push after admin assigns booking (FCM-backed on Android).
 * No-op if Edge Function fails — assignment already succeeded in DB.
 *
 * @param {{ bookingId: string; expertId: string | number }} params
 * @returns {Promise<{ ok: boolean; skipped?: boolean; error?: unknown }>}
 */
export async function sendExpertAssignmentPush({ bookingId, expertId }) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { ok: false, error: 'no_session' };
    }
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!baseUrl || !anonKey) {
      return { ok: false, error: 'missing_env' };
    }
    const res = await fetch(`${baseUrl}/functions/v1/send-expert-assignment-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: anonKey,
      },
      body: JSON.stringify({
        booking_id: bookingId,
        expert_id: expertId,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn('[sendExpertAssignmentPush]', res.status, json);
      return { ok: false, error: json };
    }
    return { ok: true, ...json };
  } catch (e) {
    console.warn('[sendExpertAssignmentPush]', e);
    return { ok: false, error: e };
  }
}
