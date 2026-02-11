import React from 'react';

const BrandLogo = ({ size = "text-2xl", showTagline = false }) => {
  return (
    <div className="flex flex-col">
      <div className={`flex items-center gap-2 font-sans tracking-tight ${size}`}>
        {/* The 'K' Icon - Deep Teal (Mercury) */}
        <div className="bg-teal-700 text-white px-3 py-1 rounded-lg font-extrabold shadow-sm flex items-center justify-center">
          K
        </div>

        {/* The Brand Name */}
        <span className="font-bold text-slate-800">
          Konnect<span className="text-teal-700">Pro</span>
        </span>
      </div>

      {/* Tagline */}
      {showTagline && (
        <p className="text-xs text-slate-500 mt-1 ml-1">
          Expert Connections, Trusted Results
        </p>
      )}
    </div>
  );
};

export default BrandLogo;