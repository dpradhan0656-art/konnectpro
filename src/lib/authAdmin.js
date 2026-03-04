/**
 * Admin-only auth operations (calls Edge Function with service_role on backend).
 * Used from DeepakHQ for password reset of users, experts, area heads.
 */
import { supabase } from './supabase';

export async function adminResetPassword(userId, newPassword) {
  if (!userId || !newPassword || newPassword.length < 6) {
    throw new Error('user_id and new password (min 6 chars) required');
  }
  const { data, error } = await supabase.functions.invoke('admin-reset-password', {
    body: { user_id: userId, new_password: newPassword },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}
