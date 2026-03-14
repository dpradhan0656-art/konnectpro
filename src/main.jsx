import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { initSentry } from './lib/sentry'

// Production error monitoring (Sentry when DSN set; Supabase error_logs as fallback)
initSentry()

// App loaded successfully — clear chunk-error reload flag so a future chunk/MIME error can trigger one refresh again
try { sessionStorage.removeItem('kshatr_chunk_error_reload'); } catch (_) {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
