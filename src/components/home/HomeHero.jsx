import React from 'react';
import { Search, Mic, MapPin, Sparkles, X } from 'lucide-react';

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
      localStorage.setItem('kshatr_user_city', locationName.trim());
      setCityStatus({ active: true, message: 'Serving In' });
      setGreeting(`Welcome to ${locationName.trim()}! How can we help you today?`);
    } else {
      setLocationName('Select Location');
      setCityStatus({ active: false, message: 'Location Required' });
    }
  };

  return (
    <section className="relative pt-6 pb-28 px-6 overflow-hidden bg-slate-950 rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-2xl" aria-label="Welcome and search">
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none mix-blend-screen" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.25) 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }} />
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/20 rounded-full blur-[80px] -mr-20 -mt-20" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -ml-20 -mb-20" aria-hidden="true" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8 bg-white/10 backdrop-blur-md w-fit px-4 py-2.5 rounded-full border border-white/10 shadow-inner">
          <div className={`p-1.5 rounded-full ${cityStatus.active ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-red-500'} shadow-[0_0_15px_rgba(74,222,128,0.4)]`}>
            <MapPin size={14} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[9px] font-black text-teal-300 uppercase tracking-widest leading-none mb-1">{cityStatus.message}</p>
            {isEditingLoc ? (
              <input
                autoFocus
                placeholder="Enter City"
                className="bg-transparent border-b border-white text-white font-black text-sm w-32 outline-none placeholder:text-slate-400"
                value={locationName === 'Select Location' ? '' : locationName}
                onChange={(e) => setLocationName(e.target.value)}
                onBlur={handleLocationBlur}
                aria-label="Edit your city"
              />
            ) : (
              <button type="button" onClick={() => setIsEditingLoc(true)} className="text-left text-sm font-black text-white leading-none tracking-wide border-b border-transparent hover:border-white/50 transition-all duration-300">
                {locationName}
              </button>
            )}
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2 drop-shadow-lg max-w-lg">
          {greeting}
        </h1>
        <p className="text-slate-400 text-sm font-medium mb-10 flex items-center gap-2">
          <Sparkles size={16} className="text-teal-400" aria-hidden="true" />
          Trusted by 10,000+ happy homes
        </p>

        <div className="relative z-30 transform translate-y-6">
          <div className="relative rounded-2xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center p-2">
            <Search className="absolute left-5 text-slate-400" size={22} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 'Salon', 'Plumber', 'Cleaning'..."
              className="w-full py-4 pl-14 pr-16 bg-transparent text-slate-900 font-bold text-lg outline-none placeholder:text-slate-400"
              aria-label="Search services"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="absolute right-16 p-2 text-slate-400 hover:text-slate-600 transition-colors duration-300" aria-label="Clear search">
                <X size={20} />
              </button>
            )}
            <span className="h-8 w-px bg-slate-200 mx-2 absolute right-12" aria-hidden="true" />
            <button type="button" onClick={() => alert('🎤 Voice Search coming soon!')} className="absolute right-3 p-2.5 rounded-xl text-teal-600 hover:bg-teal-50 transition-all duration-300" aria-label="Voice search">
              <Mic size={22} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
