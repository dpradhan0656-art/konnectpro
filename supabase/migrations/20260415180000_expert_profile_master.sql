-- =============================================================================
-- Expert KYC / bank / address "master" extension + experts column alignment
-- =============================================================================
-- Inventory (software ke hisaab se — spelling yahin lock rakhi gayi):
--
-- A) public.experts (pehle se bookings / wallet / auth isi par)
--    Registration (ExpertRegistrationForm): name, phone, email, service_category,
--      city, experience_years, aadhar_number, status, user_id, area_head_id
--    Admin roster (ExpertControl): photo_url, category, kyc_status, average_rating,
--      is_active, is_verified, …
--    KYC web (ExpertKYC): is_kyc_submitted, status
--    Expo Profile: photo_url, category | service_category | primary_category, city, kyc_status
--
-- B) public.expert_profile_master (1 row per expert — sensitive / extended KYC)
--    residential_address, bank_account_number, ifsc_code, bank_account_holder_name,
--    pan_number, aadhar_card_photo_url
--    expert_id = text form of public.experts.id (uuid ya bigint dono ke saath match;
--      expert_reviews jaisa pattern)
--
-- Purani tables (expert_reviews, bookings, …) DELETE NAHI — runtime par zaroori hain.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) experts — missing optional columns (IF NOT EXISTS = zero breakage)
-- ---------------------------------------------------------------------------
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS primary_category text,
  ADD COLUMN IF NOT EXISTS is_kyc_submitted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS kyc_verification_status text;

COMMENT ON COLUMN public.experts.full_name IS 'Display / auth metadata; UI falls back: name || full_name.';
COMMENT ON COLUMN public.experts.primary_category IS 'Alias bucket for category/service_category (Expo ProfileScreen).';
COMMENT ON COLUMN public.experts.is_kyc_submitted IS 'ExpertKYC / verification flow — set true when documents submitted.';
COMMENT ON COLUMN public.experts.kyc_verification_status IS 'Optional legacy mirror of kyc_status; keep in sync in app if used.';

-- ---------------------------------------------------------------------------
-- 2) expert_profile_master — bank + residential + ID scan URLs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expert_profile_master (
  expert_id text PRIMARY KEY,
  residential_address text,
  bank_account_number text,
  ifsc_code text,
  bank_account_holder_name text,
  pan_number text,
  aadhar_card_photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.expert_profile_master IS 'Extended expert KYC & payout identity; keyed by experts.id as text (uuid/bigint-safe).';
COMMENT ON COLUMN public.expert_profile_master.expert_id IS 'Must equal public.experts.id::text for that expert.';
COMMENT ON COLUMN public.expert_profile_master.residential_address IS 'Full residential address (ExpertKYC fullAddress).';
COMMENT ON COLUMN public.expert_profile_master.bank_account_number IS 'Beneficiary bank account number (digits only recommended at app layer).';
COMMENT ON COLUMN public.expert_profile_master.ifsc_code IS '11-character IFSC (store uppercase in app).';
COMMENT ON COLUMN public.expert_profile_master.bank_account_holder_name IS 'Name as per bank passbook / NPCI.';
COMMENT ON COLUMN public.expert_profile_master.pan_number IS 'PAN (10 chars) when collected.';
COMMENT ON COLUMN public.expert_profile_master.aadhar_card_photo_url IS 'Supabase Storage or CDN URL for Aadhaar card image (front).';

CREATE INDEX IF NOT EXISTS expert_profile_master_updated_idx
  ON public.expert_profile_master (updated_at DESC);

-- Touch updated_at on row change
CREATE OR REPLACE FUNCTION public.set_expert_profile_master_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_expert_profile_master_updated_at ON public.expert_profile_master;
CREATE TRIGGER trg_expert_profile_master_updated_at
  BEFORE UPDATE ON public.expert_profile_master
  FOR EACH ROW
  EXECUTE FUNCTION public.set_expert_profile_master_updated_at();

-- ---------------------------------------------------------------------------
-- 3) RLS — mirror experts "own row" + admin
-- ---------------------------------------------------------------------------
ALTER TABLE public.expert_profile_master ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "expert_profile_master_select_own" ON public.expert_profile_master;
CREATE POLICY "expert_profile_master_select_own"
  ON public.expert_profile_master
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.experts e
      WHERE e.user_id = auth.uid()
        AND e.id::text = public.expert_profile_master.expert_id
    )
  );

DROP POLICY IF EXISTS "expert_profile_master_insert_own" ON public.expert_profile_master;
CREATE POLICY "expert_profile_master_insert_own"
  ON public.expert_profile_master
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.experts e
      WHERE e.user_id = auth.uid()
        AND e.id::text = public.expert_profile_master.expert_id
    )
  );

DROP POLICY IF EXISTS "expert_profile_master_update_own" ON public.expert_profile_master;
CREATE POLICY "expert_profile_master_update_own"
  ON public.expert_profile_master
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.experts e
      WHERE e.user_id = auth.uid()
        AND e.id::text = public.expert_profile_master.expert_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.experts e
      WHERE e.user_id = auth.uid()
        AND e.id::text = public.expert_profile_master.expert_id
    )
  );

DROP POLICY IF EXISTS "expert_profile_master_admin_all" ON public.expert_profile_master;
CREATE POLICY "expert_profile_master_admin_all"
  ON public.expert_profile_master
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.app_admin WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.app_admin WHERE user_id = auth.uid()));
