import React from 'react';
import { Gift, ChevronRight } from 'lucide-react';

export default function OffersSection({ offers }) {
  return (
    <section className="px-6 max-w-4xl mx-auto" aria-labelledby="offers-heading">
      <div className="flex justify-between items-end mb-4">
        <h2 id="offers-heading" className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-2">
          <Gift size={22} className="text-rose-500" aria-hidden="true" />
          Deals & Spotlight
        </h2>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar px-1" role="list">
        {offers.length > 0 ? (
          offers.map((item) => (
            <article
              key={item.id}
              className={`min-w-[280px] md:min-w-[320px] h-40 rounded-3xl relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 bg-gradient-to-br ${item.gradient_color || 'from-teal-600 to-emerald-800'} cursor-pointer group transition-all duration-300 hover:shadow-lg`}
              role="listitem"
            >
              <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 2px, transparent 2px)', backgroundSize: '14px 14px' }} />
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" aria-hidden="true" />
              <div className="absolute top-5 left-5 z-10 text-white">
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md">
                  Exclusive
                </span>
                <h3 className="font-black text-2xl mt-3 w-[85%] leading-tight drop-shadow-md">{item.title}</h3>
                <p className="font-bold text-sm mt-1 text-teal-100 flex items-center gap-1">
                  {item.discount_text} <ChevronRight size={14} aria-hidden="true" />
                </p>
              </div>
            </article>
          ))
        ) : (
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest w-full text-center p-6 border border-dashed border-slate-200 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            No active offers currently running.
          </div>
        )}
      </div>
    </section>
  );
}
