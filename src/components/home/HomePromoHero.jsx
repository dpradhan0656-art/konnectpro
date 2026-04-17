// src/components/home/HomePromoHero.jsx (Smart Anchor Fix)

import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePromoHero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full max-w-[100vw] overflow-hidden rounded-3xl bg-brand-primary shadow-2xl px-0 pt-0 pb-0">
      <div className="relative flex items-center justify-between w-full h-[320px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
        
        {/* ==============================
           LEFT IMAGE: HAPPY CUSTOMER
           Fix: Changed back to object-cover and added object-left-top to eliminate top blank space
           ============================== */}
        <div className="absolute left-0 top-0 h-full w-[45%] md:w-[40%] z-0">
          <img
            src="/images/happy-customer.png"
            alt="Happy Customer"
            className="w-full h-full object-cover object-left-top z-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300/064E3B/FFFFFF?text=Customer';
            }}
          />
          {/* subtle gradient fade for better blend */}
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent via-brand-primary/60 to-brand-primary" />
        </div>

        {/* ==============================
           CENTRAL TEXT: Book Trusted Experts
           ============================== */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-xl mx-auto px-4 w-[50%] md:w-[60%] h-full">
          <p className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg">
            Book Trusted <br />
            <span className="text-brand-accent">Experts in 2 Hours!</span> ⚡
          </p>
          <p className="text-white/90 text-sm sm:text-base mt-3 mb-6 max-w-md drop-shadow-md">
            KSHATR Home Services, Guaranteed Quality
          </p>
          <button 
            onClick={() => navigate('/category/all')}
            className="bg-brand-accent text-emerald-950 px-10 py-4 rounded-full font-bold text-lg hover:bg-white transition-colors flex items-center gap-2 group shadow-xl"
          >
            Explore Services
          </button>
        </div>

        {/* ==============================
           RIGHT IMAGE: KSHATR EXPERT
           Fix: Changed back to object-cover and added object-right-top to eliminate top blank space
           ============================= */}
        <div className="absolute right-0 top-0 h-full w-[45%] md:w-[40%] z-0">
          <img
            src="/images/kshatr-expert.png"
            alt="KSHATR Expert"
            className="w-full h-full object-cover object-right-top z-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300/064E3B/FFFFFF?text=Expert';
            }}
          />
          {/* subtle gradient fade for better blend */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-l from-transparent via-brand-primary/60 to-brand-primary" />
        </div>

      </div>
    </div>
  );
};

export default HomePromoHero;