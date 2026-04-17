import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePromoHero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-brand-primary shadow-2xl mt-2 sm:mt-6 mb-6 flex items-center justify-center min-h-[280px] md:min-h-[400px]">

      {/* =========================================================
          BACKGROUND IMAGES (Fluid & Responsive)
          ========================================================= */}
      <div className="absolute inset-0 flex w-full h-full pointer-events-none">
        
        {/* Left Image (Family) - Hidden on mobile to keep text clean, visible on PC */}
        <div className="relative hidden md:block md:w-1/2 h-full">
          <img
            src="/images/happy-customer.png"
            alt="Happy Customer"
            className="w-full h-full object-cover object-left-top"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400/064E3B/FFFFFF?text=Customer'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/80 to-brand-primary"></div>
        </div>

        {/* Right Image (Expert) - Full width & faded on mobile, half width & solid on PC */}
        <div className="relative w-full md:w-1/2 h-full">
          <img
            src="/images/kshatr-expert.png"
            alt="KSHATR Expert"
            className="w-full h-full object-cover object-center md:object-right-top opacity-20 md:opacity-100"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400/064E3B/FFFFFF?text=Expert'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-brand-primary/90 via-brand-primary/60 to-transparent md:to-brand-primary"></div>
        </div>
      </div>

      {/* =========================================================
          FOREGROUND CONTENT (Text & Button - Auto Scaling)
          ========================================================= */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-5 py-12 md:py-16 w-full max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white drop-shadow-xl mb-3">
          Book Trusted <br className="hidden sm:block" />
          <span className="text-brand-accent">Experts in 2 Hours!</span> ⚡
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-emerald-50 mb-8 font-medium drop-shadow-md max-w-sm md:max-w-md mx-auto">
          KSHATR Home Services, Guaranteed Quality
        </p>
        <button
          onClick={() => navigate('/category/all')}
          className="bg-brand-accent text-emerald-950 px-8 py-3.5 md:px-10 md:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg hover:bg-white transition-colors flex items-center gap-2 shadow-[0_8px_20px_-4px_rgba(245,158,11,0.5)] active:scale-95"
        >
          Explore Services
        </button>
      </div>

      {/* Abstract ambient glows */}
      <div className="absolute top-0 right-1/4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-brand-accent opacity-10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default HomePromoHero;