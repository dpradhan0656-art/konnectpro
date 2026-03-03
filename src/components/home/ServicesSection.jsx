import React from 'react';
import { Tag } from 'lucide-react';
import ServiceCard from './ServiceCard';

export default function ServicesSection({ services, cart, onAddToCart }) {
  return (
    <section className="px-6 max-w-4xl mx-auto" aria-labelledby="services-heading">
      <h2 id="services-heading" className="font-black text-slate-900 text-xl tracking-tight mb-4 flex items-center gap-2">
        <Tag size={20} className="text-amber-500" aria-hidden="true" />
        Bestselling Services
      </h2>
      <div className="flex gap-5 overflow-x-auto pb-8 no-scrollbar px-1" role="list">
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
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest p-6 border border-dashed border-slate-200 rounded-3xl w-full text-center bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            Loading popular services...
          </div>
        )}
      </div>
    </section>
  );
}
