import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_LANG, LANGUAGE_ORDER, STORAGE_KEY_LANG, getStrings } from '../constants/expertVoiceDict';

/** @typedef {{ lang: string; setLang: (code: string) => Promise<void>; t: Record<string, string>; ready: boolean }} LanguageContextValue */

/** @type {React.Context<LanguageContextValue | null>} */
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_LANG);
        if (!cancelled && stored && LANGUAGE_ORDER.includes(stored)) {
          setLangState(stored);
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

  const setLang = useCallback(async (code) => {
    const next = LANGUAGE_ORDER.includes(code) ? code : DEFAULT_LANG;
    setLangState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_LANG, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useMemo(() => getStrings(lang), [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      ready,
    }),
    [lang, setLang, t, ready]
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
