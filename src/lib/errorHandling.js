/**
 * Central error handling: log and optionally report. Replace critical alert(err) with this.
 * - Logs to console
 * - Optionally reports to Sentry (when DSN is set)
 * - Logs critical errors to Supabase error_logs for production monitoring
 */

import { supabase } from './supabase';

export function reportError(message, error, options = {}) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(`[${message}]`, err);

  if (typeof window !== 'undefined') {
    // Sentry (when founder pastes DSN)
    if (window.__SENTRY_DSN__) {
      try {
        window.__reportToSentry?.(message, err);
      } catch {
        void 0;
      }
    }

    // Supabase error_logs (production fallback)
    if (options.logToDb !== false) {
      supabase
        .from('error_logs')
        .insert({
          message: String(message).slice(0, 500),
          error_message: err.message?.slice(0, 500),
          error_stack: err.stack?.slice(0, 2000),
          path: window.location?.pathname,
          user_agent: navigator?.userAgent?.slice(0, 500),
          severity: options.severity || 'error'
        })
        .then(({ error }) => {
          if (error) console.warn('[reportError] DB log failed:', error.message);
        })
        .catch(() => undefined);
    }
  }
}

/**
 * User-friendly message for common errors (Supabase, network, etc.).
 */
export function getUserFriendlyMessage(error) {
  if (!error) return 'Something went wrong. Please try again.';
  const msg = error?.message || String(error);
  if (msg.includes('JWT') || msg.includes('session') || msg.includes('auth')) return 'Session expired. Please log in again.';
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('Failed to fetch')) return 'Network error. Check connection and try again.';
  if (msg.includes('RLS') || msg.includes('policy') || msg.includes('row-level')) return 'You don\'t have permission for this action.';
  if (msg.includes('duplicate') || msg.includes('unique')) return 'This item already exists.';
  return 'Something went wrong. Please try again.';
}
