-- Partner system (Admin-Drishti): business partners + assignment FKs on experts & area_heads.
-- Note: Product UI calls these "Area Commanders"; database table is public.area_heads.

-- ---------------------------------------------------------------------------
-- 1) business_partners
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  razorpay_account_id text,
  active_status boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.business_partners IS 'Field / business partners (e.g. operations share) for Razorpay Route splits.';
COMMENT ON COLUMN public.business_partners.razorpay_account_id IS 'Linked account id from Razorpay (Route / linked account), when configured.';
COMMENT ON COLUMN public.business_partners.active_status IS 'Inactive partners are ignored by new assignments.';

CREATE INDEX IF NOT EXISTS business_partners_active_idx
  ON public.business_partners (active_status)
  WHERE active_status = true;

-- ---------------------------------------------------------------------------
-- 2) FKs: experts & area_heads (nullable, safe additive)
-- ---------------------------------------------------------------------------
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS assigned_partner_id uuid REFERENCES public.business_partners(id) ON DELETE SET NULL;

ALTER TABLE public.area_heads
  ADD COLUMN IF NOT EXISTS assigned_partner_id uuid REFERENCES public.business_partners(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.experts.assigned_partner_id IS 'Optional field partner linked to this expert (9.5% Route share in gross split model).';
COMMENT ON COLUMN public.area_heads.assigned_partner_id IS 'Optional field partner linked to this area commander (area_heads row).';

CREATE INDEX IF NOT EXISTS experts_assigned_partner_id_idx ON public.experts (assigned_partner_id);
CREATE INDEX IF NOT EXISTS area_heads_assigned_partner_id_idx ON public.area_heads (assigned_partner_id);

-- ---------------------------------------------------------------------------
-- 3) RLS (admin-only; same pattern as other HQ tables)
-- ---------------------------------------------------------------------------
ALTER TABLE public.business_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "business_partners_admin_all" ON public.business_partners;
CREATE POLICY "business_partners_admin_all"
  ON public.business_partners
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.app_admin WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.app_admin WHERE user_id = auth.uid())
  );
