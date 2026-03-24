import React from 'react';
import { ShieldCheck, CheckCircle, Star } from 'lucide-react';

export default function TrustBanner() {
  return (
    <section className="px-6 max-w-6xl mx-auto w-full min-w-0 overflow-hidden animate-fade-in-up [animation-delay:200ms] [animation-fill-mode:both]" aria-labelledby="trust-heading">
      <div className="rounded-3xl p-6 md:p-8 text-slate-100 shadow-[0_20px_70px_-25px_rgba(45,212,191,0.4)] relative overflow-hidden border border-white/10 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_20%,rgba(45,212,191,0.16),transparent_35%),radial-gradient(circle_at_90%_90%,rgba(20,184,166,0.12),transparent_35%)]" aria-hidden="true" />
        <div className="relative z-10">
          <div className="text-center mb-6">
            <h2 id="trust-heading" className="text-2xl md:text-3xl font-bold mb-2">
              Why Homeowners Trust Kshatr
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              Premium quality assurance with verified experts and transparent service delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="rounded-2xl border border-teal-300/20 bg-white/5 backdrop-blur-md p-4 md:p-5 text-center hover:bg-white/10 transition-colors">
              <ShieldCheck size={28} className="mx-auto mb-3 text-teal-300" aria-hidden="true" />
              <div className="text-sm md:text-base font-bold text-slate-100">Verified Kshatr Experts</div>
            </div>
            <div className="rounded-2xl border border-teal-300/20 bg-white/5 backdrop-blur-md p-4 md:p-5 text-center hover:bg-white/10 transition-colors">
              <Star size={28} className="mx-auto mb-3 text-amber-300" aria-hidden="true" />
              <div className="text-sm md:text-base font-bold text-slate-100">Transparent Pricing</div>
            </div>
            <div className="rounded-2xl border border-teal-300/20 bg-white/5 backdrop-blur-md p-4 md:p-5 text-center hover:bg-white/10 transition-colors">
              <CheckCircle size={28} className="mx-auto mb-3 text-emerald-300" aria-hidden="true" />
              <div className="text-sm md:text-base font-bold text-slate-100">100% Quality Guarantee</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
