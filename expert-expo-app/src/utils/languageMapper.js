import * as Location from 'expo-location';

const DEFAULT_LANGUAGE = 'en';

// 🚀 SUPER COMPUTER LEVEL: All states mapped with perfect syntax (quotes added for spaces)
const STATE_LANGUAGE_MAP = {
  // Marathi Belt
  'maharashtra': 'mr',
  'goa': 'mr',
  'dadra and nagar haveli': 'mr',
  'daman and diu': 'mr',

  // Hindi Belt (The Core Heartland)
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
};

/**
 * 🛠️ Utility: Normalizes the text (removes extra spaces and converts to lowercase)
 */
function normalize(input) {
  if (!input) return '';
  return String(input).trim().toLowerCase();
}

/**
 * 🌍 Core Logic: Maps a state name to our supported App Language
 */
export function mapRegionToLanguage(regionOrState) {
  const normalized = normalize(regionOrState);
  return STATE_LANGUAGE_MAP[normalized] || DEFAULT_LANGUAGE;
}

/**
 * 🛰️ GPS Engine: Converts real-time GPS Coordinates to Local Language
 */
export async function mapGpsToLanguage(coords) {
  // 1. Safety Check: If GPS coords are missing, return default safely
  if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
    console.warn('⚠️ [LanguageMapper]: Invalid GPS coords passed. Defaulting to English.');
    return { lang: DEFAULT_LANGUAGE, region: null };
  }

  try {
    // 2. Reverse Geocode: Ask Expo Location for the Address
    const [place] = await Location.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    if (!place) {
      return { lang: DEFAULT_LANGUAGE, region: null };
    }

    // 3. Extract the State (Expo usually puts State in 'region' or 'subregion')
    const state = place.region || place.subregion || place.city || null;
    
    // 🎯 Co-Founder Debug Log: See what the satellite found!
    console.log(`📍 [GPS Engine]: Satellite detected region -> "${state}"`); 
    
    return {
      lang: mapRegionToLanguage(state),
      region: state,
    };

  } catch (error) {
    console.error('❌ [LanguageMapper]: Reverse Geocoding Failed:', error);
    return { lang: DEFAULT_LANGUAGE, region: null };
  }
}