-- =============================================================================
-- Multi-city serviceability: services can be scoped to cities
-- =============================================================================

-- services.service_cities: NULL or {} or ['all'] = available everywhere
-- Otherwise e.g. ['jabalpur','indore'] = only those cities (lowercase)
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS service_cities text[] DEFAULT NULL;

COMMENT ON COLUMN public.services.service_cities IS 'NULL or empty or [''all''] = all cities; else list of lowercase city keys e.g. [''jabalpur'',''indore'']';

-- Backfill: existing rows get NULL so they remain "all cities"
UPDATE public.services SET service_cities = NULL WHERE service_cities IS NULL;
