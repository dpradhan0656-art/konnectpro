import React, { useState } from 'react';
import { persistUserCity } from '../../lib/persistUserCity';
import { Search, Mic, MapPin, X } from 'lucide-react';
import CategoryPickModal from './CategoryPickModal';

/** Sub-headline copy (SEO / reuse) */
export const HERO_TRUST_LINE =
  'Experience seamless and high-quality services. Book top-rated, certified professionals with a single tap.';

export default function HomeHero({
  locationName,
  setLocationName,
  isEditingLoc,
  setIsEditingLoc,
  cityStatus,
  setCityStatus,
  searchQuery,
  setSearchQuery,
  categories = [],
  categoriesLoading = false,
}) {
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const handleLocationBlur = () => {
    setIsEditingLoc(false);
    if (locationName && locationName.trim() !== '' && locationName !== 'Select Location') {
      const canonicalCity = persistUserCity(locationName.trim());
      setLocationName(canonicalCity);
      setCityStatus({ active: true, message: 'Serving In' });
    } else {
      setLocationName('Select Location');
      setCityStatus({ active: false, message: 'Location Required' });
    }
  };

  return (
    <section
      className="relative pt-6 pb-28 w-full max-w-[100vw] overflow-x-hidden overflow-y-visible min-h-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-b-3xl shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)] border-b border-white/5 box-border px-0"
      aria-label="Welcome and search"
    >
      <div className="absolute inset-0 z-0 opacity-100 pointer-events-none overflow-hidden rounded-b-3xl" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[min(100vw,28rem)] h-[min(100vw,28rem)] bg-teal-500/20 rounded-full blur-[100px] -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-[min(90vw,24rem)] h-[min(90vw,24rem)] bg-blue-600/15 rounded-full blur-[90px] -ml-16 -mb-16" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(120vw,40rem)] h-[min(120vw,40rem)] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 max-w-4xl mx-auto min-w-0 w-full box-border">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 bg-white/5 backdrop-blur-xl border border-white/10 w-fit max-w-full px-4 py-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.25)] ring-1 ring-white/5">
          <div
            className={`p-1.5 rounded-full ${cityStatus.active ? 'bg-gradient-to-br from-teal-400 to-teal-600' : 'bg-slate-800'} shadow-lg border ${cityStatus.active ? 'border-teal-400/30' : 'border-white/10'}`}
          >
            <MapPin
              size={14}
              className={cityStatus.active ? 'text-white' : 'text-slate-300'}
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest leading-none mb-1">{cityStatus.message}</p>
            {isEditingLoc ? (
              <input
                autoFocus
                placeholder="Enter City"
                className="bg-transparent border-b border-white/20 text-white font-bold text-sm w-32 outline-none placeholder:text-slate-500"
                value={locationName === 'Select Location' ? '' : locationName}
                onChange={(e) => setLocationName(e.target.value)}
                onBlur={handleLocationBlur}
                aria-label="Edit your city"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingLoc(true)}
                className="text-left text-sm font-bold text-white leading-none tracking-wide border-b border-transparent hover:border-teal-400/50 transition-all duration-300"
              >
                {locationName}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full-bleed hero copy (edge-to-edge at any zoom) */}
      <div className="relative z-10 w-full mb-8 sm:mb-10">
        <div className="w-full min-w-0 bg-white text-center py-10 sm:py-12 md:py-14 px-5 sm:px-8 md:px-12 lg:px-16 border-y border-slate-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <h1 className="font-display font-extrabold text-gray-900 leading-[1.08] tracking-[-0.02em] text-[clamp(1.75rem,5.5vw,3.75rem)] max-w-4xl mx-auto">
            <span className="block">Your Trusted Experts.</span>
            <span className="block text-blue-600 mt-2 sm:mt-3">Right at Your Doorstep.</span>
          </h1>
          <p className="mt-5 sm:mt-7 text-base sm:text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
            {HERO_TRUST_LINE}
          </p>
          <button
            type="button"
            onClick={() => setCategoryPickerOpen(true)}
            className="mt-7 sm:mt-9 inline-flex items-center justify-center bg-blue-600 text-white font-semibold text-base rounded-xl px-10 py-4 shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/35 transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Book Your Expert
          </button>
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 max-w-4xl mx-auto min-w-0 w-full box-border">
        <div className="relative z-30 transform translate-y-6 w-full max-w-full">
          <div className="relative rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.35)] flex items-center p-2 min-h-[52px] w-full box-border ring-1 ring-white/5">
            <Search className="absolute left-4 sm:left-5 text-teal-400/80" size={22} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for 'Plumber', 'AC Repair' or 'Salon'..."
              className="w-full min-w-0 py-3 sm:py-4 pl-12 sm:pl-14 pr-14 sm:pr-16 bg-transparent text-white font-semibold text-base sm:text-lg outline-none placeholder:text-slate-500"
              aria-label="Search services"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-14 sm:right-16 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white transition-colors duration-300"
                aria-label="Clear search"
              >
                <X size={20} />
              </button>
            )}
            <span className="h-8 w-px bg-white/15 mx-2 absolute right-12 sm:right-12" aria-hidden="true" />
            <button
              type="button"
              onClick={() => alert('🎤 Voice Search coming soon!')}
              className="absolute right-2 sm:right-3 p-2.5 min-h-[44px] min-w-[44px] rounded-xl text-teal-300 hover:bg-teal-500/15 hover:text-teal-200 transition-all duration-300 flex items-center justify-center border border-transparent hover:border-teal-500/20"
              aria-label="Voice search"
            >
              <Mic size={22} />
            </button>
          </div>
        </div>
      </div>

      <CategoryPickModal
        open={categoryPickerOpen}
        onClose={() => setCategoryPickerOpen(false)}
        categories={categories}
        loading={categoriesLoading}
      />
    </section>
  );
}
