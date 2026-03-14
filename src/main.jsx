import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { initSentry } from './lib/sentry'

// Production error monitoring (Sentry when DSN set; Supabase error_logs as fallback)
initSentry()

// So index.html version-check can detect new deploy and reload once (avoids MIME error from stale cached index)
try {
  const path = typeof import.meta.url === 'string' ? new URL(import.meta.url).pathname : ''
  if (path) sessionStorage.setItem('kshatr_last_run', path)
} catch (_) {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
