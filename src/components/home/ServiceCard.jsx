import React from 'react';
import { Zap, Plus, CheckCircle } from 'lucide-react';
import { isImageUrl, getServiceEmoji } from '../../lib/serviceIconUtils';

const SERVICE_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1581578731117-e0a820379b73?w=400&q=80';

export default function ServiceCard({ service, isInCart, onAddToCart }) {
  const displayPrice = service.base_price ?? service.price ?? 199;
  const wasPrice = displayPrice + 100;
  const rawImage = service.image || service.image_url || service.img || '';
  const useImageUrl = isImageUrl(rawImage);
  const imageSrc = useImageUrl ? rawImage : SERVICE_IMAGE_FALLBACK;
  const emojiFallback = !useImageUrl && rawImage ? rawImage : getServiceEmoji(service.category || service.name);

  return (
    <article className="min-w-[200px] w-[200px] max-w-[200px] flex flex-col bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden">
      {/* Image block – URL, emoji, ya fallback */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 shrink-0 flex items-center justify-center overflow-hidden">
        {useImageUrl ? (
          <img
            src={imageSrc}
            alt={service.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = SERVICE_IMAGE_FALLBACK; }}
          />
        ) : (
          <span className="text-6xl drop-shadow-md" aria-hidden="true">{emojiFallback}</span>
        )}
        <div className="absolute top-2 right-2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-teal-600 shrink-0">
          <Zap size={18} aria-hidden="true" />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2 mb-2">
          <span className="text-[11px] font-bold text-slate-400 line-through shrink-0">₹{wasPrice}</span>
          <span className="text-slate-900 text-base font-black shrink-0">₹{displayPrice}</span>
        </div>
        <h3 className="font-black text-slate-800 text-sm leading-tight mb-1 line-clamp-2 min-h-[36px]">
          {service.name}
        </h3>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest truncate mb-4">
          {service.category}
        </p>
        <button
          type="button"
          onClick={() => onAddToCart(service)}
          disabled={isInCart}
          className={`w-full min-h-[44px] py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] mt-auto ${isInCart ? 'bg-green-50 text-green-600 border border-green-200 cursor-default' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-teal-600 border border-slate-900 hover:border-teal-600'}`}
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
      </div>
    </article>
  );
}
