import React from 'react';
import { ShieldCheck, CheckCircle, Clock } from 'lucide-react';

export default function TrustBanner() {
  return (
    <section className="px-6 max-w-4xl mx-auto w-full min-w-0 overflow-hidden" aria-labelledby="trust-heading">
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-color-dodge" style={{ backgroundImage: 'radial-gradient(#14b8a6 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} aria-hidden="true" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-teal-500/20">
              <ShieldCheck size={12} aria-hidden="true" /> Kshatr Guarantee
            </div>
            <h2 id="trust-heading" className="text-2xl font-black mb-2">
              Safe. Reliable. Fast.
            </h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto md:mx-0 font-medium leading-relaxed">
              All experts are background-verified. We guarantee your satisfaction with our 7-day re-work policy.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800 text-center backdrop-blur-sm">
              <CheckCircle size={28} className="mx-auto mb-2 text-teal-400" aria-hidden="true" />
              <div className="text-xl font-black text-white">100%</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Verified</div>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800 text-center backdrop-blur-sm">
              <Clock size={28} className="mx-auto mb-2 text-blue-400" aria-hidden="true" />
              <div className="text-xl font-black text-white">45m</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Fast Arrival</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
