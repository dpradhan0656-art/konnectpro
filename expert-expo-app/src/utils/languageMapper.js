import * as Location from 'expo-location';

const DEFAULT_LANGUAGE = 'en';

/**
 * Indian states / UTs (lowercase keys) → primary app language code.
 * GPS uses expo reverse geocode `region` (often state name in English).
 * NE: Nagaland & Arunachal → English (en); Tripura → Kokborok (trp) + Bengali available via manual picker; Assam → Assamese (as), Bodo (brx) via manual picker.
 */
const STATE_LANGUAGE_MAP = {
  // Common abbreviations & postal-style codes
  tn: 'ta',
  mh: 'mr',
  mp: 'hi',
  up: 'hi',
  wb: 'bn',
  gj: 'gu',
  tg: 'te',
  ap: 'te',
  ka: 'kn',
  kl: 'ml',
  pb: 'pa',
  od: 'or',
  or: 'or',
  as: 'as',

  // ——— North-East ———
  assam: 'as',
  manipur: 'mni',
  mizoram: 'lus',
  meghalaya: 'kha',
  tripura: 'trp',
  sikkim: 'ne',
  nagaland: 'en',
  'arunachal pradesh': 'en',

  // ——— Hindi belt & central ———
  'uttar pradesh': 'hi',
  'madhya pradesh': 'hi',
  delhi: 'hi',
  bihar: 'hi',
  rajasthan: 'hi',
  haryana: 'hi',
  uttarakhand: 'hi',
  chhattisgarh: 'hi',
  jharkhand: 'hi',
  'himachal pradesh': 'hi',
  chandigarh: 'hi',

  // ——— Marathi belt ———
  maharashtra: 'mr',
  goa: 'mr',
  'dadra and nagar haveli': 'mr',
  'daman and diu': 'mr',
  'dadra and nagar haveli and daman and diu': 'mr',

  // ——— Western & northern regional ———
  gujarat: 'gu',
  punjab: 'pa',

  // ——— Eastern ———
  'west bengal': 'bn',

  // ——— Dravidian belt ———
  'tamil nadu': 'ta',
  pondicherry: 'ta',
  puducherry: 'ta',
  'andhra pradesh': 'te',
  telangana: 'te',
  karnataka: 'kn',
  kerala: 'ml',

  // ——— Odia ———
  odisha: 'or',
  orissa: 'or',

  // ——— Union territories & frontier ———
  ladakh: 'en',
  'jammu and kashmir': 'hi',
  'jammu & kashmir': 'hi',
  'andaman and nicobar islands': 'en',
  'andaman and nicobar': 'en',
  lakshadweep: 'ml',

  // ——— Optional English-forward hubs ———
  bengaluru: 'kn',
  bangalore: 'kn',
  mumbai: 'mr',
  hyderabad: 'te',
  chennai: 'ta',
  kolkata: 'bn',
};

function normalize(input) {
  if (!input) return '';
  return String(input).trim().toLowerCase();
}

export function mapRegionToLanguage(regionOrState) {
  const normalized = normalize(regionOrState);
  return STATE_LANGUAGE_MAP[normalized] || DEFAULT_LANGUAGE;
}

export async function mapGpsToLanguage(coords) {
  if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[LanguageMapper]: Invalid GPS coords; defaulting to English.');
    }
    return { lang: DEFAULT_LANGUAGE, region: null };
  }

  try {
    const [place] = await Location.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    if (!place) {
      return { lang: DEFAULT_LANGUAGE, region: null };
    }

    const state = place.region || place.subregion || place.city || null;

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[GPS Engine]: region -> "${state}"`);
    }

    return {
      lang: mapRegionToLanguage(state),
      region: state,
    };
  } catch (error) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('[LanguageMapper]: Reverse geocoding failed:', error);
    }
    return { lang: DEFAULT_LANGUAGE, region: null };
  }
}
