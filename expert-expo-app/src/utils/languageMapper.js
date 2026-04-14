import * as Location from 'expo-location';

const DEFAULT_LANGUAGE = 'en';

const STATE_LANGUAGE_MAP = {
  // Common abbreviations
  'tn': 'ta',
  'mh': 'mr',
  'mp': 'hi',
  'up': 'hi',
  'wb': 'bn',
  'gj': 'gu',
  'tg': 'te',
  'ap': 'te',
  'ka': 'kn',
  'kl': 'ml',
  'pb': 'pa',
  'od': 'or',
  'or': 'or',
  'as': 'as',

  // Marathi belt
  'maharashtra': 'mr',
  'goa': 'mr',
  'dadra and nagar haveli': 'mr',
  'daman and diu': 'mr',

  // Hindi belt
  'uttar pradesh': 'hi',
  'madhya pradesh': 'hi',
  'delhi': 'hi',
  'bihar': 'hi',
  'rajasthan': 'hi',
  'haryana': 'hi',
  'uttarakhand': 'hi',
  'chhattisgarh': 'hi',
  'jharkhand': 'hi',
  'himachal pradesh': 'hi',
  'chandigarh': 'hi',

  // Gujarati
  'gujarat': 'gu',

  // Bengali
  'west bengal': 'bn',

  // Tamil
  'tamil nadu': 'ta',
  'pondicherry': 'ta',
  'puducherry': 'ta',

  // Telugu
  'andhra pradesh': 'te',
  'telangana': 'te',

  // Kannada
  'karnataka': 'kn',

  // Malayalam
  'kerala': 'ml',

  // Punjabi
  'punjab': 'pa',

  // Odia
  'odisha': 'or',
  'orissa': 'or',

  // Assamese
  'assam': 'as',

  // Nepali (fallback for bordering usage)
  'sikkim': 'ne',
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