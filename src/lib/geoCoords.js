/**
 * Canonical parsing + Haversine for dispatch / maps.
 * PostgREST may return numeric columns as number or string — always normalize.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * @param {unknown} value
 * @returns {number | null}
 */
export function toFiniteCoord(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {unknown} lat
 * @param {unknown} lon
 * @returns {boolean} true only if both are finite and in valid geographic ranges
 */
export function isValidLatLon(lat, lon) {
  const la = toFiniteCoord(lat);
  const lo = toFiniteCoord(lon);
  if (la === null || lo === null) return false;
  if (Math.abs(la) > 90 || Math.abs(lo) > 180) return false;
  // (0,0) is almost never a real service location in your markets — usually bad data
  if (la === 0 && lo === 0) return false;
  return true;
}

/**
 * Great-circle distance in kilometers, or null if any coordinate is invalid.
 *
 * @param {unknown} lat1
 * @param {unknown} lon1
 * @param {unknown} lat2
 * @param {unknown} lon2
 * @returns {number | null}
 */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const φ1 = toFiniteCoord(lat1);
  const λ1 = toFiniteCoord(lon1);
  const φ2 = toFiniteCoord(lat2);
  const λ2 = toFiniteCoord(lon2);
  if (φ1 === null || λ1 === null || φ2 === null || λ2 === null) return null;
  if (!isValidLatLon(φ1, λ1) || !isValidLatLon(φ2, λ2)) return null;

  const rφ1 = (φ1 * Math.PI) / 180;
  const rφ2 = (φ2 * Math.PI) / 180;
  const dφ = ((φ2 - φ1) * Math.PI) / 180;
  const dλ = ((λ2 - λ1) * Math.PI) / 180;
  const a =
    Math.sin(dφ / 2) * Math.sin(dφ / 2) +
    Math.cos(rφ1) * Math.cos(rφ2) * Math.sin(dλ / 2) * Math.sin(dλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * @param {unknown} lat1
 * @param {unknown} lon1
 * @param {unknown} lat2
 * @param {unknown} lon2
 * @returns {string | null} one decimal place, or null
 */
export function formatDistanceKm(lat1, lon1, lat2, lon2) {
  const km = haversineKm(lat1, lon1, lat2, lon2);
  if (km === null) return null;
  return km.toFixed(1);
}
