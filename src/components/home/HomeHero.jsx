import React from 'react';
import { persistUserCity } from '../../lib/persistUserCity';
import { Search, Mic, MapPin, X, Sparkles } from 'lucide-react';

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
  setGreeting,
  greeting,
  searchQuery,
  setSearchQuery,
}) {
  const handleLocationBlur = () => {
    setIsEditingLoc(false);
    if (locationName && locationName.trim() !== '' && locationName !== 'Select Location') {
      persistUserCity(locationName.trim());
      setCityStatus({ active: true, message: 'Serving In' });
      setGreeting(`Welcome to ${locationName.trim()}! How can we help you today?`);
    } else {
      setLocationName('Select Location');
      setCityStatus({ active: false, message: 'Location Required' });
    }
  };

  return (
    <section
      className="relative pt-8 pb-24 px-4 sm:px-6 w-full max-w-[100vw] overflow-x-hidden overflow-y-visible min-h-0 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 rounded-b-3xl shadow-2xl box-border"
      aria-label="Welcome and search"
    >
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.18),transparent_45%),radial-gradient(circle_at_15%_75%,rgba(45,212,191,0.14),transparent_40%)]" aria-hidden="true" />
      <div className="absolute -top-20 -right-14 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-20 -left-16 w-72 h-72 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-4xl mx-auto min-w-0 w-full box-border">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 bg-white/10 backdrop-blur-md border border-white/20 w-fit max-w-full px-4 py-2.5 rounded-full shadow-xl animate-fade-in-up [animation-delay:80ms] [animation-fill-mode:both]">
          <div
            className={`p-1.5 rounded-full ${cityStatus.active ? 'bg-teal-500' : 'bg-slate-700'} shadow-sm border ${cityStatus.active ? 'border-teal-500/20' : 'border-slate-500'}`}
          >
            <MapPin
              size={14}
              className={cityStatus.active ? 'text-white' : 'text-slate-200'}
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-[9px] font-bold text-teal-300 uppercase tracking-widest leading-none mb-1">{cityStatus.message}</p>
            {isEditingLoc ? (
              <input
                autoFocus
                placeholder="Enter City"
                className="bg-transparent border-b border-slate-500 text-white font-bold text-sm w-32 outline-none placeholder:text-slate-400"
                value={locationName === 'Select Location' ? '' : locationName}
                onChange={(e) => setLocationName(e.target.value)}
                onBlur={handleLocationBlur}
                aria-label="Edit your city"
              />
            ) : (
              <button type="button" onClick={() => setIsEditingLoc(true)} className="text-left text-sm font-bold text-white leading-none tracking-wide border-b border-transparent hover:border-teal-200 transition-all duration-300">
                {locationName}
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
          <div className="animate-fade-in-up [animation-delay:170ms] [animation-fill-mode:both]">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight mb-3">
              Premium Home Services by Trusted Kshatr Experts
            </h1>
            <p className="text-slate-200 text-sm sm:text-base font-medium mb-8 sm:mb-10 max-w-xl">
              {HERO_TRUST_LINE}
            </p>

            <div className="relative z-30 w-full max-w-full animate-fade-in-up [animation-delay:280ms] [animation-fill-mode:both]">
              <div className="relative rounded-3xl bg-white/10 border border-white/20 shadow-[0_20px_60px_-20px_rgba(20,184,166,0.6)] backdrop-blur-xl flex items-center p-2 min-h-[62px] w-full box-border">
                <Search className="absolute left-5 text-teal-200" size={24} aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What service do you need today?"
                  className="w-full min-w-0 py-4 pl-14 pr-16 bg-transparent text-white font-semibold text-base sm:text-lg outline-none placeholder:text-slate-300"
                  aria-label="Search services"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="absolute right-16 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white transition-colors duration-300" aria-label="Clear search">
                    <X size={20} />
                  </button>
                )}
                <span className="h-8 w-px bg-white/25 mx-2 absolute right-12" aria-hidden="true" />
                <button type="button" onClick={() => alert('🎤 Voice Search coming soon!')} className="absolute right-2 p-2.5 min-h-[44px] min-w-[44px] rounded-2xl text-teal-300 hover:bg-white/10 transition-all duration-300 flex items-center justify-center" aria-label="Voice search">
                  <Mic size={22} />
                </button>
              </div>
            </div>
          </div>

          <div className="hidden md:block animate-fade-in-up [animation-delay:350ms] [animation-fill-mode:both]">
            <div className="relative rounded-3xl border border-white/20 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur p-6 shadow-[0_30px_80px_-30px_rgba(45,212,191,0.55)]">
              <div className="absolute -top-5 -right-4 h-20 w-20 rounded-2xl bg-gradient-to-br from-teal-300/55 to-cyan-300/15 blur-md" aria-hidden="true" />
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] uppercase tracking-[0.2em] text-teal-300 font-bold">Kshatr Premier</span>
                <Sparkles size={18} className="text-teal-200" aria-hidden="true" />
              </div>
              <div className="space-y-3">
                <div className="h-14 rounded-2xl bg-gradient-to-r from-teal-500/25 to-cyan-500/10 border border-teal-300/25" />
                <div className="h-12 rounded-2xl bg-white/5 border border-white/10" />
                <div className="h-10 w-2/3 rounded-xl bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
