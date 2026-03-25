import { supabase } from '../lib/supabase';
import Logger from './logger';

/**
 * Non-blocking admin audit trail helper.
 * If table/policy is missing, this should never break core flows.
 */
export async function writeAdminAuditLog({
  action,
  entityType,
  entityId,
  metadata = {},
}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const row = {
      action: String(action || 'unknown_action'),
      entity_type: String(entityType || 'unknown_entity'),
      entity_id: entityId == null ? null : String(entityId),
      actor_user_id: user?.id || null,
      actor_email: user?.email || null,
      metadata: metadata || {},
    };

    const { error } = await supabase.from('admin_action_logs').insert(row);
    if (error) {
      Logger.warn('AdminAudit.write', 'Log insert skipped', { error: error.message, row });
    }
  } catch (error) {
    Logger.warn('AdminAudit.write', 'Log write failed safely', { error: String(error?.message || error) });
  }
}

export async function fetchBookingAuditLogs(bookingId) {
  if (!bookingId) return [];
  try {
    const { data, error } = await supabase
      .from('admin_action_logs')
      .select('id, created_at, action, actor_email, metadata, entity_type, entity_id')
      .eq('entity_type', 'booking')
      .eq('entity_id', String(bookingId))
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      Logger.warn('AdminAudit.fetchBooking', 'Timeline fetch skipped', { error: error.message, bookingId });
      return [];
    }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    Logger.warn('AdminAudit.fetchBooking', 'Timeline fetch failed safely', {
      error: String(error?.message || error),
      bookingId,
    });
    return [];
  }
}

