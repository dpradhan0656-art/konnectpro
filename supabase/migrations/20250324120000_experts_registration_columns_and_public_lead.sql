-- Expert registration standardization: optional columns + anonymous "lead" inserts (e.g. footer form).
-- Safe defaults: nullable text / numeric.

ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS experience_years numeric DEFAULT 0;

ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS aadhar_number text;

COMMENT ON COLUMN public.experts.email IS 'Contact email captured at registration (may duplicate auth.users.email later).';
COMMENT ON COLUMN public.experts.experience_years IS 'Years of experience in primary service category.';
COMMENT ON COLUMN public.experts.aadhar_number IS 'Optional KYC — 12 digits when provided.';

-- Unauthenticated partner interest rows (Footer / marketing). Review for spam in admin queue.
DROP POLICY IF EXISTS "experts_insert_public_lead" ON public.experts;
CREATE POLICY "experts_insert_public_lead" ON public.experts
  FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND user_id IS NULL
    AND area_head_id IS NULL
  );
