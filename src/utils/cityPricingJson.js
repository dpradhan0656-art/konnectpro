/**
 * Normalizes `cityPricing` from servicesData / API into a plain JSON-serializable object
 * for `services.city_service_pricing` (jsonb). Keys are lowercase city slugs; values are numbers.
 *
 * @param {Record<string, number>|null|undefined} raw
 * @returns {Record<string, number>|null} null if missing, empty, or invalid
 */
export function normalizeCityPricingObject(raw) {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  /** @type {Record<string, number>} */
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = String(k)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');
    if (!key) continue;
    const n = Number(v);
    if (Number.isNaN(n) || n < 0) continue;
    out[key] = n;
  }
  return Object.keys(out).length > 0 ? out : null;
}
