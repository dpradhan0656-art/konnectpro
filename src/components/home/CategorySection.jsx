import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { isImageUrl } from '../../lib/serviceIconUtils';

/** Gradient fallbacks when category has no image (distinct from Deals — no top badge) */
const BG_GRADIENTS = [
  'from-blue-700/20 to-indigo-900/10',
  'from-blue-600/18 to-sky-900/8',
  'from-indigo-700/18 to-blue-900/10',
  'from-slate-200/40 to-slate-50/20',
  'from-blue-600/15 to-emerald-900/8',
  'from-slate-300/35 to-white/10',
];

const CATEGORY_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80';

export default function CategorySection({ categories, loading }) {
  const navigate = useNavigate();

  return (
    <section className="px-4 sm:px-6 max-w-5xl mx-auto relative z-20 min-w-0 w-full overflow-hidden py-1" aria-labelledby="categories-heading">
      <div className="flex justify-between items-end mb-5">
        <h2 id="categories-heading" className="font-bold text-slate-900 text-xl sm:text-2xl tracking-tight">
          Explore Categories
        </h2>
        <Link to="/" className="text-teal-600 text-[11px] font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1 hover:text-teal-700 transition-colors duration-300">
          See All <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {/* OLD grid gaps: gap-4 sm:gap-5 — widened to gap-5 sm:gap-6 md:gap-7 for clearer card separation */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-7 animate-pulse" role="status" aria-label="Loading categories">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/3] sm:aspect-[5/4] bg-slate-100 rounded-xl sm:rounded-xl" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-7" role="list">
          {categories.map((cat, i) => {
            const slugUrl = cat.slug || cat.name.toLowerCase().replace(/[\s_]+/g, '-');
            const useImage = isImageUrl(cat?.icon);
            const imageUrl = useImage ? cat.icon : CATEGORY_IMAGE_FALLBACK;
            const gradientClass = BG_GRADIENTS[i % BG_GRADIENTS.length];

            return (
              <button
                key={cat.id || i}
                type="button"
                onClick={() => navigate(`/category/${slugUrl}`)}
                className="relative rounded-xl sm:rounded-xl overflow-hidden cursor-pointer group text-left touch-manipulation aspect-[4/3] sm:aspect-[5/4] min-h-[140px] sm:min-h-[160px] shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-0.5 border border-slate-200"
                role="listitem"
              >
                {/* Full-bleed background: image or gradient */}
                <div className="absolute inset-0 z-0">
                  {useImage ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = CATEGORY_IMAGE_FALLBACK;
                      }}
                    />
                  ) : null}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradientClass} ${useImage ? 'opacity-70 group-hover:opacity-80' : ''}`}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent pointer-events-none" aria-hidden="true" />
                </div>

                {/* Glassmorphism bar at bottom — distinct from Deals (no top-left badge) */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                    <span className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1 pr-2">
                      {cat.name}
                    </span>
                    <span className="flex items-center gap-0.5 text-slate-700 text-xs font-bold whitespace-nowrap shrink-0">
                      Explore <ChevronRight size={16} className="text-slate-500" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <span className="text-4xl block mb-2">📂</span>
          <p className="text-slate-500 text-sm font-bold">No categories found.</p>
        </div>
      )}
    </section>
  );
}
