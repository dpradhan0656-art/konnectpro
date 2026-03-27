import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
      // Keep values untouched so numeric strings always stay standard 0-9.
      format: (value) => value,
    },
    returnNull: false,
  });
}

export default i18n;
