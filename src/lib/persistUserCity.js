/**
 * Single key for customer city (used by filters, checkout, dynamic pricing).
 * Dispatches a same-tab event so LocationContext stays in sync without polling.
 */
export const USER_CITY_STORAGE_KEY = 'kshatr_user_city';

export function persistUserCity(city) {
  const v = city && String(city).trim() ? String(city).trim() : 'Jabalpur';
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
