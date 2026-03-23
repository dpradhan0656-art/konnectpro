/**
 * City ↔ Service pricing map — table `public.city_service_pricing` (Supabase).
 * One row per (city_id, service_id); dynamic_price overrides static base_price for that city.
 *
 * @module models/CityServicePricing
 */

import { CITY_TABLE } from './City.js';
import { SERVICE_TABLE } from './Service.js';

export const CITY_SERVICE_PRICING_TABLE = 'city_service_pricing';

export const CityServicePricingFields = {
  id: 'id',
  cityId: 'city_id',
  serviceId: 'service_id',
  dynamicPrice: 'dynamic_price',
  platformFee: 'platform_fee',
  isSurgeActive: 'is_surge_active',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

/** FK target tables (for documentation / joins) */
export const CityServicePricingRefs = {
  cityTable: CITY_TABLE,
  serviceTable: SERVICE_TABLE,
};

/**
 * @typedef {Object} CityServicePricingRow
 * @property {string} id
 * @property {string} city_id
 * @property {string} service_id
 * @property {number} dynamic_price
 * @property {number|null} [platform_fee]
 * @property {boolean} is_surge_active
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @param {CityServicePricingRow} row
 */
export function mapCityServicePricingRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    cityId: row.city_id,
    serviceId: row.service_id,
    dynamicPrice: Number(row.dynamic_price),
    platformFee: row.platform_fee != null ? Number(row.platform_fee) : null,
    isSurgeActive: Boolean(row.is_surge_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
