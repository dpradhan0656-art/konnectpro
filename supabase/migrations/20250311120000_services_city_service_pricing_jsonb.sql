-- Optional JSON store for per-city overrides synced from src/data/servicesData.js (cityPricing).
-- Distinct from the relational table public.city_service_pricing (city × service rows).

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS city_service_pricing jsonb DEFAULT NULL;

COMMENT ON COLUMN public.services.city_service_pricing IS
  'Per-city price overrides as JSON, e.g. {"jabalpur":149,"sagar":129}. Null if none.';
