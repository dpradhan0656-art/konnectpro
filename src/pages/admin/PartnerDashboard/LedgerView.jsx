import React from 'react';
import { splitGrossPaymentPaise } from '../../../services/paymentSplitService';

function rupeesToPaise(rupees) {
  const n = Number(rupees);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function formatInrFromPaise(paise) {
  const n = Number(paise);
  if (!Number.isFinite(n)) return '—';
  return `₹${(n / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Transparent ledger: each completed job row shows gross + 81 / 9.5 / partner pool split (computed).
 * Optional areaHeadCommissionPercentage: if set, area-head share is taken only from the 9.5% partner pool (same as payout RPC).
 *
 * @param {{ rows: Array<{ id: string, service_name?: string, total_amount?: number, updated_at?: string }>, loading?: boolean, areaHeadCommissionPercentage?: number|null }} props
 */
export default function LedgerView({ rows, loading, areaHeadCommissionPercentage }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-500 text-sm font-bold">
        Ledger load ho rahi hai…
      </div>
    );
  }

  if (!rows?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-slate-500 text-sm">
        Abhi koi completed job nahi mila (assigned experts ke through). Jab bookings complete hongi, yahan real-time style breakdown dikhega.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-inner">
      <table className="min-w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <th className="px-4 py-3">Job</th>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3 text-right">Gross</th>
            <th className="px-4 py-3 text-right text-teal-400">Expert 81%</th>
            <th className="px-4 py-3 text-right text-amber-400">Kshatryx 9.5%</th>
            <th className="px-4 py-3 text-right text-rose-300">Area Head</th>
            <th className="px-4 py-3 text-right text-violet-400">Partner (net)</th>
            <th className="px-4 py-3 text-slate-500">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const paise = rupeesToPaise(row.total_amount);
            const s = splitGrossPaymentPaise(paise, areaHeadCommissionPercentage);
            return (
              <tr key={row.id} className="border-b border-slate-800/80 hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 font-mono text-slate-300">{String(row.id).slice(0, 8)}…</td>
                <td className="px-4 py-3 text-slate-300 max-w-[140px] truncate">{row.service_name || '—'}</td>
                <td className="px-4 py-3 text-right font-bold text-white">{formatInrFromPaise(s.totalPaise)}</td>
                <td className="px-4 py-3 text-right text-teal-300">{formatInrFromPaise(s.expertPaise)}</td>
                <td className="px-4 py-3 text-right text-amber-200">{formatInrFromPaise(s.kshatryxPaise)}</td>
                <td className="px-4 py-3 text-right text-rose-200">{formatInrFromPaise(s.areaHeadPaise)}</td>
                <td className="px-4 py-3 text-right text-violet-200">{formatInrFromPaise(s.partnerPaise)}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                  {row.updated_at ? new Date(row.updated_at).toLocaleString('en-IN') : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="px-4 py-2 text-[10px] text-slate-600 border-t border-slate-800">
        Split engine: Kshatryx 9.5% aur Expert 81% floor; jo bachi paise partner pool mein — wahan se optional Area Head cut; total hamesha match.
      </p>
    </div>
  );
}
