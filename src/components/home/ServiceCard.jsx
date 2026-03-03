import React from 'react';
import { Zap, Plus, CheckCircle } from 'lucide-react';

export default function ServiceCard({ service, isInCart, onAddToCart }) {
  const displayPrice = service.base_price ?? service.price ?? 199;
  const wasPrice = displayPrice + 100;

  return (
    <article className="min-w-[200px] bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-11 h-11 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform duration-300">
          <Zap size={20} aria-hidden="true" />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-bold text-slate-400 line-through">₹{wasPrice}</span>
          <span className="text-slate-900 text-base font-black">₹{displayPrice}</span>
        </div>
      </div>
      <h3 className="font-black text-slate-800 text-base leading-tight mb-1 line-clamp-2 min-h-[40px]">
        {service.name}
      </h3>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest truncate mb-4">
        {service.category}
      </p>
      <button
        type="button"
        onClick={() => onAddToCart(service)}
        disabled={isInCart}
        className={`w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] ${isInCart ? 'bg-green-50 text-green-600 border border-green-200 cursor-default' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-teal-600 border border-slate-900 hover:border-teal-600'}`}
      >
        {isInCart ? (
          <>
            <CheckCircle size={14} aria-hidden="true" /> Added
          </>
        ) : (
          <>
            <Plus size={14} aria-hidden="true" /> Add to Cart
          </>
        )}
      </button>
    </article>
  );
}
