import React from 'react';
import { persistUserCity } from '../../lib/persistUserCity';
import { Search, Mic, MapPin, X } from 'lucide-react';
// import { Sparkles } from 'lucide-react'; // AI star icon – removed for clean native-like UI

/** Edit this for hero trust line (e.g. "Trusted by 10,000+ happy homes") */
export const HERO_TRUST_LINE =
  'Verified Electricians, Plumbers, and Beauticians. Safe, Reliable, and Professional Home Services starting at just ₹99.';

export default function HomeHero({
  locationName,
  setLocationName,
  isEditingLoc,
  setIsEditingLoc,
  cityStatus,
  setCityStatus,
  searchQuery,
  setSearchQuery,
}) {
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
    <section className="relative pt-6 pb-28 px-4 sm:px-6 w-full max-w-[100vw] overflow-x-hidden overflow-y-visible min-h-0 bg-slate-50 rounded-b-xl md:rounded-b-2xl shadow-sm box-border" aria-label="Welcome and search">
      <div className="hidden absolute inset-0 z-0 opacity-0 pointer-events-none" aria-hidden="true" />
      <div className="hidden absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" aria-hidden="true" />
      <div className="hidden absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-4xl mx-auto min-w-0 w-full box-border">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 bg-white border border-slate-200 w-fit max-w-full px-4 py-2.5 rounded-full shadow-sm">
          <div
            className={`p-1.5 rounded-full ${cityStatus.active ? 'bg-blue-700' : 'bg-slate-100'} shadow-sm border ${cityStatus.active ? 'border-blue-700/20' : 'border-slate-200'}`}
          >
            <MapPin
              size={14}
              className={cityStatus.active ? 'text-white' : 'text-slate-700'}
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest leading-none mb-1">{cityStatus.message}</p>
            {isEditingLoc ? (
              <input
                autoFocus
                placeholder="Enter City"
                className="bg-transparent border-b border-slate-300 text-slate-900 font-bold text-sm w-32 outline-none placeholder:text-slate-400"
                value={locationName === 'Select Location' ? '' : locationName}
                onChange={(e) => setLocationName(e.target.value)}
                onBlur={handleLocationBlur}
                aria-label="Edit your city"
              />
            ) : (
              <button type="button" onClick={() => setIsEditingLoc(true)} className="text-left text-sm font-bold text-slate-900 leading-none tracking-wide border-b border-transparent hover:border-slate-400 transition-all duration-300">
                {locationName}
              </button>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2 max-w-lg">
          Certified Experts at Your Doorstep in Bhopal, Jabalpur, Sagar & Jhansi
        </h1>
        <p className="text-slate-600 text-sm font-medium mb-8 sm:mb-10 flex items-center gap-2">
          {HERO_TRUST_LINE}
        </p>

        <div className="relative z-30 transform translate-y-6 w-full max-w-full">
          <div className="relative rounded-xl bg-white border border-slate-200 shadow-sm flex items-center p-2 min-h-[52px] w-full box-border">
            <Search className="absolute left-4 sm:left-5 text-slate-400" size={22} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for 'Plumber', 'AC Repair' or 'Salon'..."
              className="w-full min-w-0 py-3 sm:py-4 pl-12 sm:pl-14 pr-14 sm:pr-16 bg-transparent text-slate-900 font-semibold text-base sm:text-lg outline-none placeholder:text-slate-400"
              aria-label="Search services"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="absolute right-14 sm:right-16 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors duration-300" aria-label="Clear search">
                <X size={20} />
              </button>
            )}
            <span className="h-8 w-px bg-slate-200 mx-2 absolute right-12 sm:right-12" aria-hidden="true" />
            <button type="button" onClick={() => alert('🎤 Voice Search coming soon!')} className="absolute right-2 sm:right-3 p-2.5 min-h-[44px] min-w-[44px] rounded-xl text-blue-700 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center" aria-label="Voice search">
              <Mic size={22} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
