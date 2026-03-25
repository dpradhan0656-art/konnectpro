/**
 * Single key for customer city (used by filters, checkout, dynamic pricing).
 * Dispatches a same-tab event so LocationContext stays in sync without polling.
 */
export const USER_CITY_STORAGE_KEY = 'kshatr_user_city';
export const DEFAULT_USER_CITY = 'Jabalpur';

export const SUPPORTED_USER_CITIES = Object.freeze([
  'Jabalpur',
  'Bhopal',
  'Sagar',
  'Jhansi',
]);

const CITY_ALIAS_TO_CANONICAL = Object.freeze({
  jabalpur: 'Jabalpur',
  jbp: 'Jabalpur',
  ranjhi: 'Jabalpur',
  gwarighat: 'Jabalpur',
  bhopal: 'Bhopal',
  sagar: 'Sagar',
  jhansi: 'Jhansi',
});

function toCompactKey(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Hard-lock city string into one canonical supported city.
 * Unknown values fallback to DEFAULT_USER_CITY.
 */
export function normalizeUserCity(city) {
  const raw = String(city || '').trim();
  if (!raw) return DEFAULT_USER_CITY;
  const key = toCompactKey(raw);
  if (!key) return DEFAULT_USER_CITY;

  if (CITY_ALIAS_TO_CANONICAL[key]) return CITY_ALIAS_TO_CANONICAL[key];

  const exact = SUPPORTED_USER_CITIES.find((c) => c.toLowerCase() === key);
  if (exact) return exact;

  // If geocoder returns long address text containing a supported city.
  const contains = SUPPORTED_USER_CITIES.find((c) => key.includes(c.toLowerCase()));
  if (contains) return contains;

  return DEFAULT_USER_CITY;
}

export function getStoredUserCity() {
  try {
    if (typeof window === 'undefined') return DEFAULT_USER_CITY;
    const raw = window.localStorage.getItem(USER_CITY_STORAGE_KEY);
    return normalizeUserCity(raw);
  } catch {
    return DEFAULT_USER_CITY;
  }
}

export function persistUserCity(city) {
  const v = normalizeUserCity(city);
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USER_CITY_STORAGE_KEY, v);
      window.dispatchEvent(
        new CustomEvent('kshatr:user-city-changed', { detail: { city: v } })
      );
    }
  } catch {
    /* ignore quota / private mode */
  }
  return v;
}
