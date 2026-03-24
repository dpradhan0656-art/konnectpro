import React from 'react';
import { ShieldCheck, CheckCircle, Clock } from 'lucide-react';

/** Edit these for TrustBanner stats (no Supabase — change here to update) */
export const TRUST_VERIFIED_LABEL = '100%';
export const TRUST_FAST_ARRIVAL_LABEL = '45m';

export default function TrustBanner() {
  return (
    <section className="px-6 max-w-4xl mx-auto w-full min-w-0 overflow-hidden" aria-labelledby="trust-heading">
      <div className="bg-white rounded-xl p-6 md:p-8 text-slate-900 shadow-sm relative overflow-hidden border border-slate-200">
        <div className="hidden absolute inset-0 opacity-0 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-700/10 text-blue-700 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 border border-blue-700/15">
              <ShieldCheck size={12} aria-hidden="true" /> Kshatr Guarantee
            </div>
            <h2 id="trust-heading" className="text-2xl font-bold mb-2">
              Safe. Reliable. Fast.
            </h2>
            <p className="text-slate-600 text-sm max-w-sm mx-auto md:mx-0 font-medium leading-relaxed">
              All experts are background-verified. We guarantee your satisfaction with our 7-day re-work policy.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <CheckCircle size={28} className="mx-auto mb-2 text-blue-700" aria-hidden="true" />
              <div className="text-xl font-bold text-slate-900">{TRUST_VERIFIED_LABEL}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Verified</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <Clock size={28} className="mx-auto mb-2 text-blue-700" aria-hidden="true" />
              <div className="text-xl font-bold text-slate-900">{TRUST_FAST_ARRIVAL_LABEL}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Fast Arrival</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
