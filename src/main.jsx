import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { initSentry } from './lib/sentry'

// Production error monitoring (Sentry when DSN set; Supabase error_logs as fallback)
initSentry()

// App loaded successfully — clear chunk-error reload flag so a future chunk/MIME error can trigger one refresh again
try { sessionStorage.removeItem('kshatr_chunk_error_reload'); } catch { void 0; }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#064E3B',
            color: '#fff',
            fontWeight: 600,
            fontSize: '13px',
            padding: '12px 16px',
            borderRadius: '14px',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            boxShadow: '0 10px 30px -10px rgba(4, 120, 87, 0.45)',
          },
          success: {
            iconTheme: { primary: '#f59e0b', secondary: '#064E3B' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </ErrorBoundary>
  </StrictMode>,
)
