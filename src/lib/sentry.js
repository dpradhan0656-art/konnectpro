/**
 * Sentry initialization for production error monitoring.
 *
 * TO ENABLE:
 * 1. npm install @sentry/react
 * 2. Add VITE_SENTRY_DSN=your-dsn to .env (get from sentry.io)
 * 3. Uncomment the init block below
 */

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
// Paste your DSN here as fallback: const SENTRY_DSN = 'https://xxx@xxx.ingest.sentry.io/xxx';

export function initSentry() {
  if (!SENTRY_DSN || typeof window === 'undefined') return;

  /*
  // Uncomment when @sentry/react is installed:
  import * as Sentry from '@sentry/react';

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    environment: import.meta.env.MODE,
  });

  window.__SENTRY_DSN__ = SENTRY_DSN;
  window.__reportToSentry = (message, err) => {
    Sentry.captureException(err, { extra: { message } });
  };
  */
}
