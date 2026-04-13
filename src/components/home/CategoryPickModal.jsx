import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, LayoutGrid, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isImageUrl } from '../../lib/serviceIconUtils';
import { getCategoryFallbackImage } from '../../lib/fallbackImages';

const BG_WASH = [
  'from-sky-400/25 to-white/75',
  'from-blue-400/22 to-slate-50/85',
  'from-indigo-400/20 to-white/80',
  'from-slate-300/30 to-white/82',
  'from-sky-500/18 to-slate-100/88',
  'from-blue-500/20 to-white/78',
];

/**
 * Hero CTA: pick a category → navigate to /category/:slug (same as Explore Categories cards).
 */
export default function CategoryPickModal({ open, onClose, categories, loading }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const goCategory = (cat) => {
    const slug = cat.slug || cat.name?.toLowerCase().replace(/[\s_]+/g, '-') || '';
    onClose();
    navigate(`/category/${slug}`);
  };

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-slate-950/70 backdrop-blur-md p-0 sm:p-4 sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-pick-title"
    >
      <div className="flex flex-col w-full max-w-lg max-h-[100dvh] sm:max-h-[min(90dvh,720px)] sm:rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200/90">
        <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div>
            <h2 id="category-pick-title" className="text-lg font-bold text-slate-900 font-display tracking-tight flex items-center gap-2">
              <LayoutGrid className="text-blue-600 shrink-0" size={22} aria-hidden="true" />
              Choose a category
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Electrician, Plumber, AC — jo chahiye woh chunein</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-200/80 transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3 [-webkit-overflow-scrolling:touch]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
              <Loader2 className="animate-spin text-blue-600" size={36} />
              <span className="text-sm font-semibold">Loading categories…</span>
            </div>
          )}

          {!loading && (!categories || categories.length === 0) && (
            <div className="text-center py-12 px-4">
              <p className="text-slate-700 font-semibold">Abhi koi category available nahi hai.</p>
              <p className="text-slate-500 text-sm mt-2">Thodi der baad try karein.</p>
            </div>
          )}

          {!loading && categories?.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-3">
              {categories.map((cat, i) => {
                const useImage = isImageUrl(cat?.icon);
                const imageUrl = useImage ? cat.icon : getCategoryFallbackImage(cat?.name);
                const wash = BG_WASH[i % BG_WASH.length];
                const slugUrl = cat.slug || cat.name?.toLowerCase().replace(/[\s_]+/g, '-');

                return (
                  <button
                    key={cat.id || slugUrl || i}
                    type="button"
                    onClick={() => goCategory(cat)}
                    className="relative rounded-xl overflow-hidden text-left aspect-[4/3] min-h-[100px] border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300/80 active:scale-[0.98] transition-all group"
                  >
                    <div className="absolute inset-0 z-0">
                      <img
                        src={imageUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getCategoryFallbackImage(cat?.name);
                        }}
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${wash} opacity-55 group-hover:opacity-60`}
                        aria-hidden="true"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 z-10 p-2">
                      <div className="rounded-lg bg-white/95 backdrop-blur-sm px-2.5 py-2 border border-slate-200/90 flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-tight">
                          {cat.name}
                        </span>
                        <ChevronRight className="text-blue-600 shrink-0" size={16} aria-hidden="true" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
