import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_USER_CITY,
  USER_CITY_STORAGE_KEY,
  getStoredUserCity,
  persistUserCity,
} from '../lib/persistUserCity';

const DEFAULT_CITY = DEFAULT_USER_CITY;

const LocationContext = createContext(null);

function readCityFromStorage() {
  return getStoredUserCity();
}

/**
 * Global customer city for kshatr.com (pricing, copy, filters).
 * Persists to localStorage under USER_CITY_STORAGE_KEY; default display 'Jabalpur'.
 *
 * Same-tab updates: use `persistUserCity()` from lib (Home / HomeHero already wired).
 */
export function LocationProvider({ children }) {
  const [userCity, setUserCityState] = useState(() => readCityFromStorage());

  const syncFromStorage = useCallback(() => {
    setUserCityState(readCityFromStorage());
  }, []);

  useEffect(() => {
    syncFromStorage();
    const onExternal = (e) => {
      if (e?.type === 'storage' && e.key && e.key !== USER_CITY_STORAGE_KEY) return;
      syncFromStorage();
    };
    window.addEventListener('storage', onExternal);
    window.addEventListener('kshatr:user-city-changed', syncFromStorage);
    return () => {
      window.removeEventListener('storage', onExternal);
      window.removeEventListener('kshatr:user-city-changed', syncFromStorage);
    };
  }, [syncFromStorage]);

  const setUserCity = useCallback((city) => {
    const v = persistUserCity(city);
    setUserCityState(v);
  }, []);

  const value = useMemo(
    () => ({
      userCity,
      setUserCity,
      defaultCity: DEFAULT_CITY,
    }),
    [userCity, setUserCity]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

/**
 * @returns {{ userCity: string, setUserCity: (c: string) => void, defaultCity: string }}
 */
export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocationContext must be used within LocationProvider');
  }
  return ctx;
}

/** Safe for components that may render outside LocationProvider (falls back to localStorage). */
export function useOptionalLocationContext() {
  return useContext(LocationContext);
}
