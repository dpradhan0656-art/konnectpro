import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BRAND } from '../../config/brandConfig';
import { useCart } from '../../context/CartContext';
import { getUserCityKey, filterServicesByCity } from '../../lib/serviceCityUtils';
import { reportError } from '../../lib/errorHandling';
import { persistUserCity } from '../../lib/persistUserCity';
import { Zap } from 'lucide-react';

import SOSButton from '../../components/common/SOSButton';
import HomeHero from '../../components/home/HomeHero';
import CategorySection from '../../components/home/CategorySection';
import OffersSection from '../../components/home/OffersSection';
import ServicesSection from '../../components/home/ServicesSection';
import RateCard from '../../components/home/RateCard';
import TrustBanner from '../../components/home/TrustBanner';
import BottomNav from '../../components/home/BottomNav';

export default function Home({ session }) {
  const [locationName, setLocationName] = useState('Locating...');
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [cityStatus, setCityStatus] = useState({ active: true, message: 'Serving In' });

  const [greeting, setGreeting] = useState('Welcome! How can we help you today?');
  const [searchQuery, setSearchQuery] = useState('');

  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const categoriesSectionRef = useRef(null);

  const { addToCart, cart } = useCart();

  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userCity = getUserCityKey();
  const filteredServices = filterServicesByCity(services, userCity);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const { data: catData } = await supabase.from('categories').select('*').eq('is_active', true).order('created_at', { ascending: true });
        if (catData) setCategories(catData);

        const { data: offerData } = await supabase.from('spotlight_offers').select('*').eq('is_active', true);
        if (offerData) setOffers(offerData);

        const { data: serviceData } = await supabase.from('services').select('*').eq('is_active', true).limit(10);
        if (serviceData) setServices(serviceData);
      } catch (err) {
        reportError('Home fetch', err);
      }
      setLoading(false);
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const doc = document.documentElement;
      const nearBottom = y + window.innerHeight >= (doc?.scrollHeight || 0) - 180;
      setShowStickyCta(y > 180 && !nearBottom);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToCategories = () => {
    categoriesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    document.title = `${BRAND.name} | Shield of Trust`;

    const cityGreetings = {
      jabalpur: "Namaste! Aapka swagat hai. Kahiye, aaj hum aapki kya seva kar sakte hain?",
      indore: "Namaste! Swagat hai aapka. Bataiye, kaise madad karein?",
      bhopal: "Namaste! Swagat hai aapka. Bataiye, kya seva karein?",
      delhi: "Namaste ji! Swagat hai. Bataiye, hum aapke liye kya kar sakte hain?",
      mumbai: "Namaskar! Swagat aahe. Bola, aamhi tumchi kay madat karu shakto?",
      pune: "Namaskar! Swagat aahe. Bola, kay sewa karu?",
      bengaluru: "Namaskara! Swagatha. Bataiye, hum aapki kaise madad kar sakte hain?",
      hyderabad: "Namaskaram! Swagatam. Memu meeku ela sahayapadagalamu?",
      kolkata: "Nomoshkar! Apnar swagoto. Bolun, amra apnar ki bhabe sahajyo korte pari?",
    };

    const savedCity = localStorage.getItem('kshatr_user_city');
    if (savedCity) {
      setLocationName(savedCity);
      const lowerCity = savedCity.toLowerCase();
      setGreeting(cityGreetings[lowerCity] || `Welcome to ${savedCity}! How can we help you today?`);
      setCityStatus({ active: true, message: 'Serving In' });
    } else {
      setLocationName('Detecting Area...');
      setGreeting('Please allow location access to continue.');
      setCityStatus({ active: false, message: 'Locating' });
    }

    if (navigator.geolocation) {
      const fastGpsOptions = { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
            const data = await res.json();

            const city = data.address?.city || data.address?.town || data.address?.county || 'Your City';
            const area = data.address?.suburb || data.address?.neighbourhood || city;

            setLocationName(area);
            persistUserCity(area);
            setCityStatus({ active: true, message: 'Serving In' });

            const lowerCity = city.toLowerCase();
            setGreeting(cityGreetings[lowerCity] || `Welcome to ${city}! How can we help you today?`);
          } catch (err) {
            console.error('Location API Failed', err);
          }
        },
        (error) => {
          console.warn('Location Denied:', error);
          if (!savedCity) {
            setLocationName('Select Location');
            setGreeting('Welcome! Please tap above to enter your city manually.');
            setCityStatus({ active: false, message: 'Location Required' });
          }
        },
        fastGpsOptions
      );
    }
  }, []);

  return (
    <div className="min-h-screen max-w-[100vw] w-full overflow-x-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 font-sans selection:bg-teal-200/40 relative pb-32">
      <SOSButton />

      <HomeHero
        locationName={locationName}
        setLocationName={setLocationName}
        isEditingLoc={isEditingLoc}
        setIsEditingLoc={setIsEditingLoc}
        cityStatus={cityStatus}
        setCityStatus={setCityStatus}
        setGreeting={setGreeting}
        greeting={greeting}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Consistent gap between sections — premium boxed layout */}
      <div className="mt-10 md:mt-14 flex flex-col gap-8 w-full min-w-0 max-w-[100vw]">
        <div ref={categoriesSectionRef} id="categories-section">
          <CategorySection categories={filteredCategories} loading={loading} />
        </div>
        <OffersSection offers={offers} />
        <ServicesSection services={filteredServices} cart={cart} onAddToCart={addToCart} />
        <RateCard />
        <div className="mb-10">
          <TrustBanner />
        </div>
      </div>

      <div
        className={`fixed left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[480px] lg:hidden z-50 transition-all duration-300 ${
          showStickyCta ? 'opacity-100 translate-y-0 bottom-20 sm:bottom-24' : 'opacity-0 translate-y-6 pointer-events-none bottom-16'
        }`}
      >
        <button
          type="button"
          onClick={scrollToCategories}
          className="w-full min-h-[54px] rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-extrabold tracking-wide shadow-[0_16px_40px_-15px_rgba(20,184,166,0.9)] shadow-teal-500/50 px-5 py-3 flex items-center justify-center gap-2 animate-pulse-slow"
        >
          <Zap size={18} aria-hidden="true" />
          Book a Service Now
        </button>
      </div>

      <BottomNav cartCount={cart.length} />
    </div>
  );
}
