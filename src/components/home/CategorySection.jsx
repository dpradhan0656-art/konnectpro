import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Wrench,
  Brush,
  Sparkles,
  Home,
  ShieldCheck,
  Fan,
  Zap,
  Droplets,
  Hammer,
} from 'lucide-react';
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

function resolveCategoryIcon(name) {
  const value = String(name || '').toLowerCase();
  if (value.includes('clean')) return Sparkles;
  if (value.includes('salon') || value.includes('beauty')) return Brush;
  if (value.includes('elect')) return Zap;
  if (value.includes('plumb')) return Droplets;
  if (value.includes('ac') || value.includes('repair')) return Fan;
  if (value.includes('security')) return ShieldCheck;
  if (value.includes('carpen')) return Hammer;
  if (value.includes('home')) return Home;
  return Wrench;
}

export default function CategorySection({ categories, loading }) {
  const navigate = useNavigate();

  return (
    <section className="px-4 sm:px-6 max-w-6xl mx-auto relative z-20 min-w-0 w-full overflow-hidden py-1" aria-labelledby="categories-heading">
      <div className="flex justify-between items-end mb-5 animate-fade-in-up [animation-delay:120ms] [animation-fill-mode:both]">
        <h2 id="categories-heading" className="font-bold text-slate-100 text-xl sm:text-2xl tracking-tight">
          Explore Categories
        </h2>
        <Link to="/" className="text-teal-300 text-[11px] font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1 hover:text-teal-200 transition-colors duration-300">
          See All <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {/* OLD grid gaps: gap-4 sm:gap-5 — widened to gap-5 sm:gap-6 md:gap-7 for clearer card separation */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-7 animate-pulse" role="status" aria-label="Loading categories">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/3] sm:aspect-[5/4] bg-slate-800 rounded-3xl" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-7" role="list">
          {categories.map((cat, i) => {
            const slugUrl = cat.slug || cat.name.toLowerCase().replace(/[\s_]+/g, '-');
            const useImage = isImageUrl(cat?.icon);
            const imageUrl = useImage ? cat.icon : CATEGORY_IMAGE_FALLBACK;
            const gradientClass = BG_GRADIENTS[i % BG_GRADIENTS.length];
            const Icon = resolveCategoryIcon(cat.name);

            return (
              <button
                key={cat.id || i}
                type="button"
                onClick={() => navigate(`/category/${slugUrl}`)}
                className="relative rounded-3xl overflow-hidden cursor-pointer group text-left touch-manipulation aspect-[4/3] sm:aspect-[5/4] min-h-[140px] sm:min-h-[160px] shadow-[0_10px_40px_-20px_rgba(30,41,59,0.8)] hover:shadow-teal-500/20 transition-all duration-300 hover:scale-105 border border-slate-700/60 animate-fade-in-up [animation-fill-mode:both]"
                role="listitem"
                style={{ animationDelay: `${140 + i * 70}ms` }}
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
                    className={`absolute inset-0 bg-gradient-to-br ${gradientClass} ${useImage ? 'opacity-60 group-hover:opacity-75' : ''}`}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/20 to-transparent pointer-events-none" aria-hidden="true" />
                </div>

                <div className="absolute top-3 left-3 z-10 p-2 rounded-2xl bg-slate-900/70 backdrop-blur border border-teal-300/20 shadow-lg">
                  <Icon size={16} className="text-teal-300" aria-hidden="true" />
                </div>

                {/* Glassmorphism bar at bottom — distinct from Deals (no top-left badge) */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2 rounded-2xl border border-teal-300/20 bg-slate-900/65 backdrop-blur px-4 py-3 shadow-sm">
                    <span className="font-bold text-sm sm:text-base text-slate-100 line-clamp-1 pr-2">
                      {cat.name}
                    </span>
                    <span className="flex items-center gap-0.5 text-teal-200 text-xs font-bold whitespace-nowrap shrink-0">
                      Explore <ChevronRight size={16} className="text-teal-300" aria-hidden="true" />
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
          <p className="text-slate-400 text-sm font-bold">No categories found.</p>
        </div>
      )}
    </section>
  );
}
