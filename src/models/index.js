/**
 * Data models for kshatr.com (Supabase / PostgreSQL).
 * These modules document table shapes and mappers; migrations live under `supabase/migrations/`.
 */

export {
  CITY_TABLE,
  CityFields,
  mapCityRow,
} from './City.js';

export {
  SERVICE_TABLE,
  ServiceFields,
  mapServiceRow,
} from './Service.js';

export {
  CITY_SERVICE_PRICING_TABLE,
  CityServicePricingFields,
  CityServicePricingRefs,
  mapCityServicePricingRow,
} from './CityServicePricing.js';
