import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BRAND } from '../../config/brandConfig';
import { useCart } from '../../context/CartContext';
import { getUserCityKey, filterServicesByCity } from '../../lib/serviceCityUtils';
import { getStoredUserCity, persistUserCity } from '../../lib/persistUserCity';
import { reportError } from '../../lib/errorHandling';
import { runWithRetryTimeout } from '../../utils/apiWrapper';
import Logger from '../../utils/logger';

import SOSButton from '../../components/common/SOSButton';
import HomeHero from '../../components/home/HomeHero';
import HomePromoHero from '../../components/home/HomePromoHero';
import CategorySection from '../../components/home/CategorySection';
import OffersSection from '../../components/home/OffersSection';
import ServicesSection from '../../components/home/ServicesSection';
import RateCard from '../../components/home/RateCard';
import TrustBanner from '../../components/home/TrustBanner';
import BottomNav from '../../components/home/BottomNav';

export default function Home() {
  const [locationName, setLocationName] = useState('Locating...');
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [cityStatus, setCityStatus] = useState({ active: true, message: 'Serving In' });
  const [searchQuery, setSearchQuery] = useState('');

  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

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
        // POC for standardized retry+timeout wrapper on one safe read-only query.
        const categoryResult = await runWithRetryTimeout(
          () => supabase.from('categories').select('*').eq('is_active', true).order('created_at', { ascending: true }),
          { scope: 'Home:categories', timeoutMs: 8000, retries: 2 }
        );
        const { data: catData } = categoryResult;
        /*
          Legacy direct call (kept for safe reference, no business logic rewrite):
          const { data: catData } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: true });
        */
        if (catData) setCategories(catData);

        const { data: offerData } = await supabase.from('spotlight_offers').select('*').eq('is_active', true);
        if (offerData) setOffers(offerData);

        const { data: serviceData } = await supabase.from('services').select('*').eq('is_active', true).limit(10);
        if (serviceData) setServices(serviceData);
      } catch (err) {
        Logger.error('Home.fetchAllData', err);
        reportError('Home fetch', err);
      }
      setLoading(false);
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    document.title = `${BRAND.name} | Shield of Trust`;

    const savedCity = getStoredUserCity();
    if (savedCity) {
      setLocationName(savedCity);
      setCityStatus({ active: true, message: 'Serving In' });
    } else {
      setLocationName('Detecting Area...');
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

            const canonicalCity = persistUserCity(area || city);
            setLocationName(canonicalCity);
            setCityStatus({ active: true, message: 'Serving In' });
          } catch (err) {
            console.error('Location API Failed', err);
          }
        },
        (error) => {
          console.warn('Location Denied:', error);
          if (!savedCity) {
            setLocationName('Select Location');
            setCityStatus({ active: false, message: 'Location Required' });
          }
        },
        fastGpsOptions
      );
    }
  }, []);

  return (
    <div className="min-h-screen max-w-[100vw] w-full overflow-x-hidden bg-slate-950 font-sans text-slate-100 selection:bg-teal-500/35 relative pb-32">
      <SOSButton />

      <HomePromoHero />

      <HomeHero
        locationName={locationName}
        setLocationName={setLocationName}
        isEditingLoc={isEditingLoc}
        setIsEditingLoc={setIsEditingLoc}
        cityStatus={cityStatus}
        setCityStatus={setCityStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        categoriesLoading={loading}
      />

      {/* Consistent gap between sections — premium boxed layout */}
      <div className="mt-10 flex flex-col gap-10 w-full min-w-0 max-w-[100vw] pb-4">
        <CategorySection categories={filteredCategories} loading={loading} />
        <OffersSection offers={offers} />
        <ServicesSection services={filteredServices} cart={cart} onAddToCart={addToCart} />
        <RateCard />
        <div className="mb-10">
          <TrustBanner />
        </div>
      </div>

      <BottomNav cartCount={cart.length} />
    </div>
  );
}
