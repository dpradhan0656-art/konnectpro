import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import pa from './locales/pa.json';
import ur from './locales/ur.json';
import or from './locales/or.json';
import asLocale from './locales/as.json';
import ne from './locales/ne.json';
import sd from './locales/sd.json';
import mai from './locales/mai.json';
import ks from './locales/ks.json';
import kok from './locales/kok.json';
import brx from './locales/brx.json';
import mni from './locales/mni.json';
import lus from './locales/lus.json';
import kha from './locales/kha.json';
import grt from './locales/grt.json';
import trp from './locales/trp.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  gu: { translation: gu },
  bn: { translation: bn },
  ta: { translation: ta },
  te: { translation: te },
  kn: { translation: kn },
  ml: { translation: ml },
  pa: { translation: pa },
  ur: { translation: ur },
  or: { translation: or },
  as: { translation: asLocale },
  ne: { translation: ne },
  sd: { translation: sd },
  mai: { translation: mai },
  ks: { translation: ks },
  kok: { translation: kok },
  brx: { translation: brx },
  mni: { translation: mni },
  lus: { translation: lus },
  kha: { translation: kha },
  grt: { translation: grt },
  trp: { translation: trp },
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
