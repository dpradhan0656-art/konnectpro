-- =============================================================================
-- Dynamic Geolocation-Based Pricing Engine — schema (PostgreSQL / Supabase)
-- Non-breaking: only ADDs new tables + optional nullable column on services.
-- =============================================================================

-- Optional: long-form copy for listings (fallback pricing remains base_price)
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS description text;

COMMENT ON COLUMN public.services.base_price IS 'Static catalog price — fallback when dynamic pricing is off or missing.';
COMMENT ON COLUMN public.services.description IS 'Optional long description; legacy note field may still be used in UI.';

-- ---------------------------------------------------------------------------
-- cities: canonical cities for pricing & ops
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cities_name_unique UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS cities_is_active_idx ON public.cities (is_active);

COMMENT ON TABLE public.cities IS 'Canonical cities for dynamic pricing (kshatr.com).';

-- ---------------------------------------------------------------------------
-- city_service_pricing: city × service → dynamic price (+ optional fee / surge)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.city_service_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.cities (id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services (id) ON DELETE CASCADE,
  dynamic_price numeric NOT NULL CHECK (dynamic_price >= 0),
  platform_fee numeric CHECK (platform_fee IS NULL OR platform_fee >= 0),
  is_surge_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT city_service_pricing_unique_pair UNIQUE (city_id, service_id)
);

CREATE INDEX IF NOT EXISTS city_service_pricing_city_idx ON public.city_service_pricing (city_id);
CREATE INDEX IF NOT EXISTS city_service_pricing_service_idx ON public.city_service_pricing (service_id);

COMMENT ON TABLE public.city_service_pricing IS 'Per-city dynamic price for each service; falls back to services.base_price when no row.';

-- ---------------------------------------------------------------------------
-- RLS (public read for active catalog; admin for writes — align with app_admin)
-- ---------------------------------------------------------------------------
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_service_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cities_select_public" ON public.cities;
CREATE POLICY "cities_select_public" ON public.cities
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "cities_admin_all" ON public.cities;
CREATE POLICY "cities_admin_all" ON public.cities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.app_admin WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "city_service_pricing_select_public" ON public.city_service_pricing;
CREATE POLICY "city_service_pricing_select_public" ON public.city_service_pricing
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "city_service_pricing_admin_all" ON public.city_service_pricing;
CREATE POLICY "city_service_pricing_admin_all" ON public.city_service_pricing
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.app_admin WHERE user_id = auth.uid())
  );
