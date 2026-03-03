/**
 * Multi-city serviceability: service is shown if available in user's city.
 * service_cities: null | [] | ['all'] => all cities; else e.g. ['jabalpur','indore'] (lowercase).
 */
export function isServiceAvailableInCity(service, userCity) {
  const cities = service?.service_cities;
  if (!cities || !Array.isArray(cities) || cities.length === 0) return true;
  if (cities.some((c) => String(c).toLowerCase() === 'all')) return true;
  if (!userCity || typeof userCity !== 'string') return true;
  const normalized = userCity.trim().toLowerCase();
  if (!normalized) return true;
  return cities.some((c) => String(c).trim().toLowerCase() === normalized);
}

/** Get current user city key from localStorage (normalized for filtering). */
export function getUserCityKey() {
  try {
    const raw = localStorage.getItem('kshatr_user_city') || '';
    return raw.trim().toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Filter list of services to those available in the given city.
 */
export function filterServicesByCity(services, userCity) {
  if (!Array.isArray(services)) return [];
  if (!userCity) return services;
  return services.filter((s) => isServiceAvailableInCity(s, userCity));
}
