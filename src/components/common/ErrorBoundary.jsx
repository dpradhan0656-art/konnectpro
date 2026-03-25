import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { reportError } from '../../lib/errorHandling';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    reportError('ErrorBoundary', error, { severity: 'critical' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" aria-hidden />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h1>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            We’re sorry. You can try refreshing the page. If the problem continues, please contact support.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-500 transition-colors"
          >
            <RefreshCw size={18} /> Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
