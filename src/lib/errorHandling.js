/**
 * Central error handling: log and optionally report. Replace critical alert(err) with this.
 */

export function reportError(message, error) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(`[${message}]`, err);
  if (typeof window !== 'undefined' && window.__SENTRY_DSN__) {
    try {
      window.__reportToSentry?.(message, err);
    } catch (_) {}
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
