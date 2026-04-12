import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, ChevronRight } from 'lucide-react';

const OFFER_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80';

export default function OffersSection({ offers }) {
  const navigate = useNavigate();

  return (
    <section className="px-4 sm:px-6 max-w-4xl mx-auto w-full min-w-0 overflow-hidden" aria-labelledby="offers-heading">
      <div className="flex justify-between items-end mb-4">
        <h2 id="offers-heading" className="font-bold text-white text-xl tracking-tight flex items-center gap-2">
          <Gift size={22} className="text-blue-400" aria-hidden="true" />
          Deals & Spotlight
        </h2>
      </div>
      <div className="flex gap-4 sm:gap-5 overflow-x-auto overflow-y-hidden pb-6 px-1 min-w-0" role="list">
        {offers.length > 0 ? (
          offers.map((item) => {
            const imageUrl = item.image_url || OFFER_IMAGE_FALLBACK;
            return (
              <article
                key={item.id}
                role="listitem"
                onClick={() => navigate('/')}
                className={`min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] flex-shrink-0 rounded-2xl relative overflow-hidden shadow-[0_16px_48px_-12px_rgba(15,23,42,0.12)] hover:shadow-[0_20px_50px_-8px_rgba(37,99,235,0.18)] border border-white/60 cursor-pointer group transition-all duration-300 hover:-translate-y-1 bg-white ring-1 ring-slate-200/80`}
                style={{ aspectRatio: '16/10' }}
              >
                {/* NEW: rounded-2xl + stronger shadow so offers "pop" — Image layer: fixed aspect, lazy, object-cover */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={imageUrl}
                    alt={item.title || 'Offer'}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = OFFER_IMAGE_FALLBACK; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/15 to-transparent" aria-hidden="true" />
                </div>
                <div className="absolute inset-0 z-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.2) 2px, transparent 2px)', backgroundSize: '14px 14px' }} />
                <div className="hidden absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 right-0 top-0 flex flex-col justify-end p-4 sm:p-5 z-10 text-white">
                  <span className="bg-white/90 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/80 w-fit backdrop-blur-sm shadow-sm">
                    Exclusive
                  </span>
                  <h3 className="font-bold text-lg sm:text-2xl mt-2 w-[90%] leading-tight drop-shadow-md">{item.title}</h3>
                  <p className="font-semibold text-xs sm:text-sm mt-1 text-slate-300 flex items-center gap-1">
                    {item.discount_text} <ChevronRight size={14} aria-hidden="true" />
                  </p>
                </div>
              </article>
            );
          })
        ) : (
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-full text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm shadow-inner">
            <span className="text-4xl block mb-2">🎁</span>
            No active offers currently running.
          </div>
        )}
      </div>
    </section>
  );
}
