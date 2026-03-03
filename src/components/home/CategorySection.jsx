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
    <section className="px-4 sm:px-6 max-w-4xl mx-auto relative z-20 min-w-0" aria-labelledby="categories-heading">
      <div className="flex justify-between items-end mb-4">
        <h2 id="categories-heading" className="font-black text-slate-900 text-xl tracking-tight">
          Explore Categories
        </h2>
        <span className="text-teal-600 text-[11px] font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1 hover:text-teal-700 transition-colors duration-300">
          See All <ChevronRight size={14} aria-hidden="true" />
        </span>
      </div>

      {loading ? (
        <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 pt-2 px-1 animate-pulse" role="status" aria-label="Loading categories">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[90px] h-28 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 pt-2 px-1 min-w-0 scroll-smooth" role="list">
          {categories.map((cat, i) => {
            const colorClass = BG_COLORS[i % BG_COLORS.length];
            const slugUrl = cat.slug || cat.name.toLowerCase().replace(/[\s_]+/g, '-');
            return (
              <button
                key={cat.id || i}
                type="button"
                onClick={() => navigate(`/category/${slugUrl}`)}
                className="flex flex-col items-center gap-3 min-w-[85px] min-h-[44px] cursor-pointer group text-left touch-manipulation"
                role="listitem"
              >
                <div className={`w-20 h-20 ${colorClass} rounded-3xl flex items-center justify-center shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] group-hover:shadow-[0_10px_25px_-5px_rgba(20,184,166,0.25)] group-hover:-translate-y-0.5 transition-all duration-300 border border-white relative overflow-hidden`}>
                  <SmartIcon iconValue={cat.icon} />
                </div>
                <span className="text-[11px] font-black text-slate-700 text-center leading-tight group-hover:text-teal-600 transition-colors duration-300">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-slate-500 text-sm py-4">No categories found.</p>
      )}
    </section>
  );
}
