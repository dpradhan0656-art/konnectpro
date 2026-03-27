import * as Location from 'expo-location';

const DEFAULT_LANGUAGE = 'en';

const STATE_LANGUAGE_MAP = {
  maharashtra: 'mr',
  goa: 'mr',
  uttar pradesh: 'hi',
  madhya pradesh: 'hi',
  delhi: 'hi',
  bihar: 'hi',
  rajasthan: 'hi',
  haryana: 'hi',
  uttarakhand: 'hi',
  chhattisgarh: 'hi',
  jharkhand: 'hi',
  himachal pradesh: 'hi',
};

function normalize(input) {
  return String(input || '')
    .trim()
    .toLowerCase();
}

export function mapRegionToLanguage(regionOrState) {
  const normalized = normalize(regionOrState);
  return STATE_LANGUAGE_MAP[normalized] || DEFAULT_LANGUAGE;
}

export async function mapGpsToLanguage(coords) {
  if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
    return { lang: DEFAULT_LANGUAGE, region: null };
  }

  try {
    const [place] = await Location.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    const state = place?.region || place?.subregion || place?.city || null;
    return {
      lang: mapRegionToLanguage(state),
      region: state,
    };
  } catch {
    return { lang: DEFAULT_LANGUAGE, region: null };
  }
}
