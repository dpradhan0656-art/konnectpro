import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, ChevronRight } from 'lucide-react';

const STARTING_PRICE = 199;

export default function RateCard() {
  const navigate = useNavigate();

  return (
    <section className="px-4 sm:px-6 max-w-4xl mx-auto min-w-0 w-full overflow-hidden" aria-labelledby="rate-heading">
      <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-visible">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p id="rate-heading" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Transparent pricing
            </p>
            <p className="text-3xl md:text-4xl font-black text-slate-900 flex items-baseline gap-1">
              <IndianRupee size={28} className="text-teal-600" aria-hidden="true" />
              {STARTING_PRICE}
              <span className="text-lg font-bold text-slate-500"> onwards</span>
            </p>
            <p className="text-slate-500 text-sm font-medium mt-2 max-w-md">
              No hidden charges. Book in 3 taps. Expert at your doorstep.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="min-h-[44px] px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-teal-900/25 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Book Now <ChevronRight size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="min-h-[44px] px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm uppercase tracking-widest border border-slate-200 transition-all duration-300 active:scale-[0.98]"
            >
              View Services
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
