/**
 * Builds a Google Maps URL for expert navigation to a booking location.
 * Phase 1: prefer precise coordinates; fallback to text address search.
 *
 * @param {{ latitude?: unknown; longitude?: unknown; address?: unknown } | null | undefined} job
 * @returns {string | null} URL or null if no usable location data
 */
export function buildCustomerLocationMapsUrl(job) {
  if (!job || typeof job !== 'object') return null;

  const rawLat = job.latitude;
  const rawLng = job.longitude;
  const lat =
    typeof rawLat === 'number'
      ? rawLat
      : rawLat != null && String(rawLat).trim() !== ''
        ? Number(rawLat)
        : NaN;
  const lng =
    typeof rawLng === 'number'
      ? rawLng
      : rawLng != null && String(rawLng).trim() !== ''
        ? Number(rawLng)
        : NaN;

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  const addr = job.address != null ? String(job.address).trim() : '';
  if (addr) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
  }

  return null;
}
