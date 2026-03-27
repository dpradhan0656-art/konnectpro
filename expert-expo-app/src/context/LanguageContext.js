import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { DEFAULT_LANG, LANGUAGE_ORDER, STORAGE_KEY_LANG, getStrings } from '../constants/expertVoiceDict';
import i18n from '../i18n';
import { mapGpsToLanguage } from '../utils/languageMapper';

const STORAGE_KEY_LANG_MODE = 'kshatr_expo_lang_mode';
const MODE_AUTO = 'auto';
const MODE_MANUAL = 'manual';

/** @typedef {{ lang: string; setLang: (code: string) => Promise<void>; setAutoLanguage: () => Promise<void>; languageMode: string; autoRegion: string | null; t: Record<string, string>; ready: boolean }} LanguageContextValue */

/** @type {React.Context<LanguageContextValue | null>} */
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);
  const [languageMode, setLanguageMode] = useState(MODE_AUTO);
  const [autoRegion, setAutoRegion] = useState(null);
  const [ready, setReady] = useState(false);

  const detectAndApplyGpsLanguage = useCallback(async () => {
    try {
      const existing = await Location.getForegroundPermissionsAsync();
      let status = existing?.status;
      if (status !== 'granted') {
        const requested = await Location.requestForegroundPermissionsAsync();
        status = requested?.status;
      }
      if (status !== 'granted') return;

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const mapped = await mapGpsToLanguage({
        latitude: pos?.coords?.latitude,
        longitude: pos?.coords?.longitude,
      });
      const detectedLang = LANGUAGE_ORDER.includes(mapped.lang) ? mapped.lang : DEFAULT_LANG;

      setLangState(detectedLang);
      setAutoRegion(mapped.region || null);
      await i18n.changeLanguage(detectedLang);
      await AsyncStorage.setItem(STORAGE_KEY_LANG, detectedLang);
    } catch {
      // Keep current language when GPS is unavailable.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_LANG);
        const storedMode = await AsyncStorage.getItem(STORAGE_KEY_LANG_MODE);
        const nextMode = storedMode === MODE_MANUAL ? MODE_MANUAL : MODE_AUTO;
        if (!cancelled) {
          setLanguageMode(nextMode);
          if (stored && LANGUAGE_ORDER.includes(stored)) {
            setLangState(stored);
            await i18n.changeLanguage(stored);
          }
        }
      } catch {
        /* keep default */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || languageMode !== MODE_AUTO) return;
    detectAndApplyGpsLanguage();
  }, [ready, languageMode, detectAndApplyGpsLanguage]);

  const setLang = useCallback(async (code) => {
    const next = LANGUAGE_ORDER.includes(code) ? code : DEFAULT_LANG;
    setLangState(next);
    setLanguageMode(MODE_MANUAL);
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY_LANG, next),
        AsyncStorage.setItem(STORAGE_KEY_LANG_MODE, MODE_MANUAL),
        i18n.changeLanguage(next),
      ]);
    } catch {
      /* ignore */
    }
  }, []);

  const setAutoLanguage = useCallback(async () => {
    setLanguageMode(MODE_AUTO);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_LANG_MODE, MODE_AUTO);
    } catch {
      // ignore storage failures
    }
    await detectAndApplyGpsLanguage();
  }, [detectAndApplyGpsLanguage]);

  const t = useMemo(() => {
    const legacy = getStrings(lang);
    const next = { ...legacy };
    Object.keys(legacy).forEach((key) => {
      next[key] = i18n.t(key, { lng: lang, defaultValue: legacy[key] });
    });
    return next;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      setAutoLanguage,
      languageMode,
      autoRegion,
      t,
      ready,
    }),
    [lang, setLang, setAutoLanguage, languageMode, autoRegion, t, ready]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
