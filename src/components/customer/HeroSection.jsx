import React from 'react';
import { MapPin, Search, Mic } from 'lucide-react';

export default function HeroSection({ location, searchQuery, setSearchQuery, onVoiceSearch }) {
  return (
    <div className="bg-white px-6 pb-4 pt-2">
      {/* Location Bar */}
      <div className="flex items-center gap-2 mb-3 cursor-pointer">
        <MapPin size={16} className="text-teal-500" />
        <p className="text-xs font-bold text-slate-600 truncate max-w-[250px]">
          {location} <span className="text-teal-500">▼</span>
        </p>
      </div>

      {/* Search Bar with Voice */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search 'AC Repair' or 'Plumber'..." 
          className="w-full bg-gray-100 text-slate-800 text-sm font-bold py-3 pl-12 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-inner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* Voice Search Button */}
        <div 
            onClick={onVoiceSearch}
            className="absolute right-2 top-2 bg-white p-1.5 rounded-xl shadow-sm text-teal-600 cursor-pointer hover:bg-teal-50"
        >
          <Mic size={18} />
        </div>
      </div>
    </div>
  );
}