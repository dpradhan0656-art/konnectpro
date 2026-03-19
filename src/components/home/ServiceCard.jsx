import React from 'react';
import { Plus, CheckCircle } from 'lucide-react';
// import { Zap } from 'lucide-react'; // AI/star badge – removed for clean native-like UI
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
    /* OLD: border-slate-100 shadow-[0_8px_30px...] — lighter card */
    <article className="min-w-[200px] w-[200px] max-w-[200px] flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 group overflow-hidden active:scale-[0.99]">
      {/* Image block – more prominent, interactive */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 shrink-0 flex items-center justify-center overflow-hidden">
        {useImageUrl ? (
          <img
            src={imageSrc}
            alt={service.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.onerror = null; e.target.src = SERVICE_IMAGE_FALLBACK; }}
          />
        ) : (
          <span className="text-6xl drop-shadow-md" aria-hidden="true">{emojiFallback}</span>
        )}
        {/* AI star/Zap badge removed for world-class native-like UI */}
        {/* <div className="absolute top-2 right-2 ..."><Zap size={18} /></div> */}
      </div>

      <div className="p-4 flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2 mb-2">
          <span className="text-[11px] font-bold text-slate-400 line-through shrink-0">₹{wasPrice}</span>
          <span className="text-slate-900 text-lg font-bold shrink-0">₹{displayPrice}</span>
        </div>
        {/* OLD: text-sm — NEW: more prominent title */}
        <h3 className="font-bold text-slate-800 text-base leading-tight mb-1 line-clamp-2 min-h-[40px] group-hover:text-blue-700 transition-colors">
          {service.name}
        </h3>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest truncate mb-4">
          {service.category}
        </p>
        <button
          type="button"
          onClick={() => onAddToCart(service)}
          disabled={isInCart}
          className={`w-full min-h-[44px] py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] mt-auto ${isInCart ? 'bg-green-50 text-green-600 border border-green-200 cursor-default' : 'bg-blue-700 text-white shadow-sm hover:bg-blue-600 border border-blue-700 hover:border-blue-600'}`}
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
