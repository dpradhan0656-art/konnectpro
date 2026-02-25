import React from 'react';
import { BRAND } from '../../config/brandConfig';

const BrandLogo = ({ size = "w-10 h-10", showTagline = false }) => {
  return (
    <div className="flex items-center gap-3">
      {/* 🛡️ Asli Logo Image (Mercury/Sun Energy) */}
      <img 
        src="/logo.png" 
        alt="Kshatr Logo" 
        className={`${size} object-contain`} 
      />

      <div className="flex flex-col">
        <div className="text-xl md:text-2xl font-sans tracking-tight">
          <span className="font-bold text-slate-800">
            Konnect<span className="text-teal-700">Pro</span>
          </span>
        </div>
        
        {showTagline && (
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">
            {BRAND.tagline}
          </p>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;