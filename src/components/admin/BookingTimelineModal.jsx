import React, { useEffect, useState } from 'react';
import { Clock3, Loader2, X } from 'lucide-react';
import { fetchBookingAuditLogs } from '../../utils/adminAuditTrail';

export default function BookingTimelineModal({ bookingId, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!open || !bookingId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const data = await fetchBookingAuditLogs(bookingId);
      if (!cancelled) setLogs(data);
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, bookingId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Clock3 size={18} className="text-teal-400" />
            Booking Timeline
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-4">
          Booking #{String(bookingId).slice(0, 8)}
        </p>

        {loading ? (
          <div className="py-10 text-center text-slate-400">
            <Loader2 size={16} className="inline animate-spin mr-2" />
            Loading timeline...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-sm border border-dashed border-slate-700 rounded-xl">
            No audit events found yet.
          </div>
        ) : (
          <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-white">{log.action}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                  </p>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  by {log.actor_email || 'system'}
                </p>
                {log.metadata && Object.keys(log.metadata).length > 0 ? (
                  <pre className="mt-2 text-[11px] text-slate-300 bg-slate-950/60 border border-slate-700 rounded-lg p-2 overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

