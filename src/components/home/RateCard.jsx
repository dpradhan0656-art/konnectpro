import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, ChevronRight } from 'lucide-react';

const STARTING_PRICE = 199;

export default function RateCard() {
  const navigate = useNavigate();

  return (
    <section className="px-4 sm:px-6 max-w-4xl mx-auto min-w-0 w-full overflow-hidden" aria-labelledby="rate-heading">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 backdrop-blur-xl p-5 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.55)] overflow-visible ring-1 ring-white/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p id="rate-heading" className="text-[11px] font-bold text-teal-400/90 uppercase tracking-widest mb-2">
              Transparent pricing
            </p>
            <p className="text-3xl md:text-4xl font-bold text-white flex items-baseline gap-1">
              <IndianRupee size={28} className="text-teal-400" aria-hidden="true" />
              {STARTING_PRICE}
              <span className="text-lg font-bold text-slate-400"> onwards</span>
            </p>
            <p className="text-slate-400 text-sm font-medium mt-2 max-w-md">
              No hidden charges. Book in 3 taps. Expert at your doorstep.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="min-h-[44px] px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-teal-500/25 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 border border-teal-400/30"
            >
              Book Now <ChevronRight size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="min-h-[44px] px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-sm uppercase tracking-widest border border-white/15 transition-all duration-300 active:scale-[0.98]"
            >
              View Services
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
