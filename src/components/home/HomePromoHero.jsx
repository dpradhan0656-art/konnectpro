import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * HomePromoHero — KSHATR Premium 3-part promo banner.
 * Additive: renders above the existing interactive HomeHero (location/search/categories)
 * so we never break core booking flow state or routing.
 */
const HomePromoHero = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-brand-primary text-white rounded-2xl mx-4 my-6 overflow-hidden relative shadow-xl">
      {/* 3-Part Flex Container */}
      <div className="flex items-center justify-between gap-2 px-3 py-8 md:gap-4 md:px-8 md:py-10 relative z-10">

        {/* Left: Happy Customer Image */}
        <div className="w-1/4 flex justify-center">
          <img
            src="/images/happy-customer.png"
            alt="Happy Customer"
            className="w-28 sm:w-32 md:w-44 lg:w-52 h-auto object-contain drop-shadow-2xl"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/100/064E3B/FFFFFF?text=Customer';
            }}
          />
        </div>

        {/* Center: Offer & Text */}
        <div className="w-2/4 text-center px-1">
          <h2 className="text-base md:text-2xl font-extrabold leading-tight mb-1">
            Book Trusted <br className="hidden md:block" />
            <span className="text-brand-accent">Experts in 2 Hours!</span> ⚡
          </h2>
          <p className="text-[10px] md:text-sm text-gray-200 mb-3 font-medium">
            KSHATR Home Services. Guaranteed Quality.
          </p>
          <button
            onClick={() => navigate('/category/all')}
            className="bg-white text-brand-primary text-xs md:text-sm font-bold py-2 px-5 rounded-full shadow-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Explore Services
          </button>
        </div>

        {/* Right: KSHATR Professional Image */}
        <div className="w-1/4 flex justify-center">
          <img
            src="/images/kshatr-expert.png"
            alt="KSHATR Professional"
            className="w-28 sm:w-32 md:w-44 lg:w-52 h-auto object-contain drop-shadow-2xl"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/100/064E3B/FFFFFF?text=Expert';
            }}
          />
        </div>

      </div>

      {/* Abstract Background Elements for Premium Feel */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent opacity-20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
    </div>
  );
};

export default HomePromoHero;
