import React from 'react';
import { ShieldCheck, CheckCircle, Clock } from 'lucide-react';

/** Edit these for TrustBanner stats (no Supabase — change here to update) */
export const TRUST_VERIFIED_LABEL = '100%';
export const TRUST_FAST_ARRIVAL_LABEL = '45m';

export default function TrustBanner() {
  return (
    <section className="px-6 max-w-4xl mx-auto w-full min-w-0 overflow-hidden" aria-labelledby="trust-heading">
      <div className="rounded-2xl p-6 md:p-8 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/10 bg-slate-900/70 backdrop-blur-xl ring-1 ring-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-blue-600/10 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-teal-500/15 text-teal-300 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 border border-teal-400/25 backdrop-blur-sm">
              <ShieldCheck size={12} aria-hidden="true" /> Kshatr Guarantee
            </div>
            <h2 id="trust-heading" className="text-2xl font-bold mb-2 text-white">
              Safe. Reliable. Fast.
            </h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto md:mx-0 font-medium leading-relaxed">
              All experts are background-verified. We guarantee your satisfaction with our 7-day re-work policy.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center backdrop-blur-sm">
              <CheckCircle size={28} className="mx-auto mb-2 text-teal-400" aria-hidden="true" />
              <div className="text-xl font-bold text-white">{TRUST_VERIFIED_LABEL}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Verified</div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center backdrop-blur-sm">
              <Clock size={28} className="mx-auto mb-2 text-cyan-400" aria-hidden="true" />
              <div className="text-xl font-bold text-white">{TRUST_FAST_ARRIVAL_LABEL}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Fast Arrival</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
