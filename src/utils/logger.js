/**
 * Centralized lightweight logger for consistent diagnostics.
 * Additive utility: only console logging, no schema/business coupling.
 */
function normalizeError(error) {
  if (!error) return { message: 'Unknown error', stack: undefined };
  if (error instanceof Error) return { message: error.message, stack: error.stack };
  return { message: String(error), stack: undefined };
}

export const Logger = {
  info(scope, message, meta) {
    console.info(`[${scope}]`, message, meta || '');
  },

  warn(scope, message, meta) {
    console.warn(`[${scope}]`, message, meta || '');
  },

  error(scope, error, meta) {
    const normalized = normalizeError(error);
    console.error(`[${scope}]`, normalized.message, {
      ...(meta || {}),
      stack: normalized.stack,
      raw: error,
    });
  },
};

export default Logger;
