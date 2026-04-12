import React, { useRef } from 'react';
import { Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import ServiceCard from './ServiceCard';

const SCROLL_STEP = 220;

export default function ServicesSection({ services, cart, onAddToCart }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const step = dir === 'left' ? -SCROLL_STEP : SCROLL_STEP;
    scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
  };

  return (
    <section className="px-4 sm:px-6 max-w-4xl mx-auto w-full min-w-0 overflow-hidden" aria-labelledby="services-heading">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 id="services-heading" className="font-bold text-white text-xl tracking-tight flex items-center gap-2">
          <Tag size={20} className="text-blue-400" aria-hidden="true" />
          Bestselling Services
        </h2>
        {services.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-300 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-300 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
      {/* Card-style list with consistent gap */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto overflow-y-hidden pb-8 px-1 min-w-0 scroll-smooth"
        style={{ scrollbarGutter: 'stable' }}
        role="list"
      >
        {services.length > 0 ? (
          services.map((service, i) => {
            const isInCart = cart.some((item) => item.id === service.id);
            return (
              <div key={service.id || i} className="flex-shrink-0" role="listitem">
                <ServiceCard service={service} isInCart={isInCart} onAddToCart={onAddToCart} />
              </div>
            );
          })
        ) : (
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest p-6 border border-dashed border-white/10 rounded-2xl w-full text-center bg-white/5 backdrop-blur-sm min-w-0">
            <span className="text-3xl block mb-2">🛠️</span>
            Loading popular services...
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Powered by Kshatryx Technologies
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
