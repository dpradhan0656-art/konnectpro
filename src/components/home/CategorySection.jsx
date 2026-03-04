import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import SmartIcon from './SmartIcon';

const BG_COLORS = [
  'bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600',
  'bg-gradient-to-br from-green-50 to-green-100/50 text-green-600',
  'bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-600',
  'bg-gradient-to-br from-purple-50 to-purple-100/50 text-purple-600',
  'bg-gradient-to-br from-pink-50 to-pink-100/50 text-pink-600',
  'bg-gradient-to-br from-teal-50 to-teal-100/50 text-teal-600',
];

export default function CategorySection({ categories, loading }) {
  const navigate = useNavigate();

  return (
    <section className="px-4 sm:px-6 max-w-4xl mx-auto relative z-20 min-w-0 w-full overflow-hidden" aria-labelledby="categories-heading">
      <div className="flex justify-between items-end mb-4">
        <h2 id="categories-heading" className="font-black text-slate-900 text-xl tracking-tight">
          Explore Categories
        </h2>
        <span className="text-teal-600 text-[11px] font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1 hover:text-teal-700 transition-colors duration-300">
          See All <ChevronRight size={14} aria-hidden="true" />
        </span>
      </div>

      {loading ? (
        /* OLD: horizontal scroll skeleton */
        <div className="grid grid-cols-3 gap-3 sm:gap-4 animate-pulse" role="status" aria-label="Loading categories">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[0.95] bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        /* NEW: 3-column grid, rounded card boxes, subtle shadows — premium boxed style */
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4" role="list">
          {categories.map((cat, i) => {
            const colorClass = BG_COLORS[i % BG_COLORS.length];
            const slugUrl = cat.slug || cat.name.toLowerCase().replace(/[\s_]+/g, '-');
            return (
              <button
                key={cat.id || i}
                type="button"
                onClick={() => navigate(`/category/${slugUrl}`)}
                className="flex flex-col items-center justify-center gap-2 sm:gap-3 min-h-[100px] sm:min-h-[110px] cursor-pointer group text-left touch-manipulation rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_-8px_rgba(20,184,166,0.35)] hover:border-teal-200/80 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden p-3 sm:p-4"
                role="listitem"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${colorClass} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-white/80 flex-shrink-0`}>
                  <SmartIcon iconValue={cat.icon} categoryName={cat.name} />
                </div>
                <span className="text-[10px] sm:text-[11px] font-black text-slate-700 text-center leading-tight group-hover:text-teal-600 transition-colors duration-300 line-clamp-2">
                  {cat.name}
                </span>
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
