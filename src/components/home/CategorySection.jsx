import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { isImageUrl } from '../../lib/serviceIconUtils';
import { getCategoryFallbackImage } from '../../lib/fallbackImages';

/** Gradient fallbacks when category has no image (distinct from Deals — no top badge) */
const BG_GRADIENTS = [
  'from-teal-600/35 to-slate-950/90',
  'from-blue-600/30 to-slate-950/90',
  'from-cyan-600/25 to-slate-950/95',
  'from-indigo-600/30 to-slate-950/90',
  'from-emerald-600/25 to-slate-950/95',
  'from-sky-600/28 to-slate-950/90',
];

export default function CategorySection({ categories, loading }) {
  const navigate = useNavigate();

  return (
    <section className="px-4 sm:px-6 max-w-5xl mx-auto relative z-20 min-w-0 w-full overflow-hidden py-1" aria-labelledby="categories-heading">
      <div className="flex justify-between items-end mb-5">
        <h2 id="categories-heading" className="font-bold text-white text-xl sm:text-2xl tracking-tight">
          Explore Categories
        </h2>
        <Link to="/" className="text-teal-400 text-[11px] font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1 hover:text-teal-300 transition-colors duration-300">
          See All <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {/* OLD grid gaps: gap-4 sm:gap-5 — widened to gap-5 sm:gap-6 md:gap-7 for clearer card separation */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-7 animate-pulse" role="status" aria-label="Loading categories">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/3] sm:aspect-[5/4] bg-slate-800/80 rounded-2xl border border-white/5" />
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
                className="relative rounded-2xl sm:rounded-2xl overflow-hidden cursor-pointer group text-left touch-manipulation aspect-[4/3] sm:aspect-[5/4] min-h-[140px] sm:min-h-[160px] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(20,184,166,0.25)] transition-all duration-500 hover:-translate-y-1 border border-white/10 ring-1 ring-white/5"
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
                    className={`absolute inset-0 bg-gradient-to-br ${gradientClass} ${useImage ? 'opacity-65 group-hover:opacity-75' : 'opacity-75 group-hover:opacity-85'}`}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" aria-hidden="true" />
                </div>

                {/* Glassmorphism bar at bottom — distinct from Deals (no top-left badge) */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-slate-950/70 backdrop-blur-xl px-4 py-3 shadow-lg ring-1 ring-white/5">
                    <span className="font-bold text-sm sm:text-base text-white line-clamp-1 pr-2">
                      {cat.name}
                    </span>
                    <span className="flex items-center gap-0.5 text-teal-300 text-xs font-bold whitespace-nowrap shrink-0">
                      Explore <ChevronRight size={16} className="text-teal-400" aria-hidden="true" />
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
