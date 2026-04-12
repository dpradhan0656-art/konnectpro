import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { isImageUrl } from '../../lib/serviceIconUtils';
import { getCategoryFallbackImage } from '../../lib/fallbackImages';

/** Light wash over images — cool blues/slate only (no teal/green) */
const BG_GRADIENTS = [
  'from-sky-400/25 to-white/75',
  'from-blue-400/22 to-slate-50/85',
  'from-indigo-400/20 to-white/80',
  'from-slate-300/30 to-white/82',
  'from-sky-500/18 to-slate-100/88',
  'from-blue-500/20 to-white/78',
];

export default function CategorySection({ categories, loading }) {
  const navigate = useNavigate();

  return (
    <section className="px-4 sm:px-6 max-w-5xl mx-auto relative z-20 min-w-0 w-full overflow-hidden py-1" aria-labelledby="categories-heading">
      <div className="flex justify-between items-end mb-5">
        <h2 id="categories-heading" className="font-bold text-white text-xl sm:text-2xl tracking-tight">
          Explore Categories
        </h2>
        <Link to="/" className="text-blue-400 text-[11px] font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1 hover:text-blue-300 transition-colors duration-300">
          See All <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {/* OLD grid gaps: gap-4 sm:gap-5 — widened to gap-5 sm:gap-6 md:gap-7 for clearer card separation */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-7 animate-pulse" role="status" aria-label="Loading categories">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/3] sm:aspect-[5/4] bg-slate-200/40 rounded-2xl border border-slate-300/50" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-7" role="list">
          {categories.map((cat, i) => {
            const slugUrl = cat.slug || cat.name.toLowerCase().replace(/[\s_]+/g, '-');
            const useImage = isImageUrl(cat?.icon);
            const imageUrl = useImage ? cat.icon : getCategoryFallbackImage(cat?.name);
            const gradientClass = BG_GRADIENTS[i % BG_GRADIENTS.length];

            return (
              <button
                key={cat.id || i}
                type="button"
                onClick={() => navigate(`/category/${slugUrl}`)}
                className="relative rounded-2xl sm:rounded-2xl overflow-hidden cursor-pointer group text-left touch-manipulation aspect-[4/3] sm:aspect-[5/4] min-h-[140px] sm:min-h-[160px] shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] hover:shadow-[0_20px_48px_-10px_rgba(37,99,235,0.22)] transition-all duration-500 hover:-translate-y-1 border border-white/70 ring-1 ring-slate-200/80 bg-white"
                role="listitem"
              >
                {/* Full-bleed background: image or gradient */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getCategoryFallbackImage(cat?.name);
                    }}
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradientClass} ${useImage ? 'opacity-50 group-hover:opacity-55' : 'opacity-65 group-hover:opacity-72'}`}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-white/10 to-transparent pointer-events-none" aria-hidden="true" />
                </div>

                {/* Glassmorphism bar at bottom — distinct from Deals (no top-left badge) */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md px-4 py-3 shadow-md shadow-slate-900/10 ring-1 ring-white">
                    <span className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1 pr-2">
                      {cat.name}
                    </span>
                    <span className="flex items-center gap-0.5 text-blue-600 text-xs font-bold whitespace-nowrap shrink-0">
                      Explore <ChevronRight size={16} className="text-blue-600" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 rounded-2xl border border-dashed border-white/10 bg-white/5 backdrop-blur-sm">
          <span className="text-4xl block mb-2">📂</span>
          <p className="text-slate-400 text-sm font-bold">No categories found.</p>
        </div>
      )}
    </section>
  );
}
