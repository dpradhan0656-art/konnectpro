import React from 'react';

/**
 * Lightweight route fallback for lazy-loaded customer chunks (speed: minimal DOM/CSS).
 */
export default function CustomerRouteFallback() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 pt-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-teal-500/30 border-t-teal-500"
        aria-hidden
      />
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Loading</p>
      <p className="text-[9px] text-slate-400">Powered by Kshatryx Technologies</p>
    </div>
  );
}
