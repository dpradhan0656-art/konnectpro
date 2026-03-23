/**
 * Dynamic geolocation-based pricing controller (kshatr.com).
 *
 * Reads from Supabase: `cities` + `city_service_pricing` (see migration
 * `20250308100000_dynamic_pricing_schema.sql`).
 *
 * Contract (unchanged — frontend depends on this):
 * - Success: { ok: true, price: number, currency: 'INR' }
 * - Fallback: { ok: false, useFallback: true, reason?: string }
 *
 * Never throws: all failures return `useFallback: true`.
 */

import { supabase } from '../lib/supabase';
import { isDynamicPricingEnabled } from '../config/pricingFeatureFlags';

/** @deprecated Kept for backward compatibility; prefer resolving cities via DB. */
export const MOCK_SUPPORTED_CITY_KEYS = ['jabalpur', 'bhopal', 'sagar', 'jhansi'];

/**
 * @deprecated Legacy helper from mock era. Prefer `cities` table in Supabase.
 */
export function normalizeCityForPricing(city) {
  if (!city || typeof city !== 'string') return null;
  const t = city.trim().toLowerCase();
  if (!t) return null;
  if (MOCK_SUPPORTED_CITY_KEYS.includes(t)) return t;
  for (const key of MOCK_SUPPORTED_CITY_KEYS) {
    if (t.includes(key) || key.includes(t)) return key;
  }
  return null;
}

/**
 * Step A/B: Find active city row id by name (case-insensitive), with loose substring fallback.
 * @param {string} cityRaw
 * @returns {Promise<string|null>} city UUID or null
 */
async function resolveCityId(cityRaw) {
  const q = String(cityRaw ?? '').trim();
  if (!q) return null;

  const { data: exact, error: exactErr } = await supabase
    .from('cities')
    .select('id')
    .eq('is_active', true)
    .ilike('name', q)
    .maybeSingle();

  if (exactErr) {
    if (import.meta.env.DEV) {
      console.debug('[pricingController] cities exact match error:', exactErr.message);
    }
    return null;
  }
  if (exact?.id) return exact.id;

  const { data: list, error: listErr } = await supabase
    .from('cities')
    .select('id, name')
    .eq('is_active', true);

  if (listErr) {
    if (import.meta.env.DEV) {
      console.debug('[pricingController] cities list error:', listErr.message);
    }
    return null;
  }

  const lower = q.toLowerCase();
  const hit = (list || []).find((c) => {
    const n = (c.name || '').trim().toLowerCase();
    if (!n) return false;
    return n === lower || lower.includes(n) || n.includes(lower);
  });
  return hit?.id ?? null;
}

/**
 * Fetch dynamic price for a service in a city.
 *
 * @param {string} city - Raw city from LocationContext / localStorage
 * @param {string} serviceId - services.id (UUID)
 * @returns {Promise<{ ok: true, price: number, currency: 'INR' } | { ok: false, useFallback: true, reason?: string }>}
 */
export async function fetchDynamicPrice(city, serviceId) {
  if (!isDynamicPricingEnabled) {
    return { ok: false, useFallback: true, reason: 'FEATURE_DISABLED' };
  }

  try {
    const sid = String(serviceId ?? '').trim();
    if (!sid) {
      return { ok: false, useFallback: true, reason: 'MISSING_SERVICE_ID' };
    }

    const cityId = await resolveCityId(city);
    if (!cityId) {
      return { ok: false, useFallback: true, reason: 'CITY_NOT_FOUND' };
    }

    const { data: row, error: priceErr } = await supabase
      .from('city_service_pricing')
      .select('dynamic_price')
      .eq('city_id', cityId)
      .eq('service_id', sid)
      .maybeSingle();

    if (priceErr) {
      if (import.meta.env.DEV) {
        console.debug('[pricingController] city_service_pricing error:', priceErr.message);
      }
      return { ok: false, useFallback: true, reason: 'PRICING_QUERY_FAILED' };
    }

    if (row == null || row.dynamic_price == null) {
      return { ok: false, useFallback: true, reason: 'PRICING_NOT_FOUND' };
    }

    const price = Number(row.dynamic_price);
    if (Number.isNaN(price)) {
      return { ok: false, useFallback: true, reason: 'INVALID_PRICE' };
    }

    return { ok: true, price, currency: 'INR' };
  } catch (_e) {
    if (import.meta.env.DEV) {
      console.debug('[pricingController] fetchDynamicPrice:', _e);
    }
    return { ok: false, useFallback: true, reason: 'CONTROLLER_ERROR' };
  }
}
