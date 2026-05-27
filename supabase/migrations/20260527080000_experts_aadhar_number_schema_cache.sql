-- Repair/confirm Expert onboarding KYC column and refresh PostgREST schema cache.
-- Safe to run multiple times in Supabase SQL Editor.

ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS aadhar_number text;

COMMENT ON COLUMN public.experts.aadhar_number IS
  'Optional expert KYC Aadhaar number. Store only 12 digits; treat as sensitive PII.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'experts_aadhar_number_12_digits_chk'
      AND conrelid = 'public.experts'::regclass
  ) THEN
    ALTER TABLE public.experts
      ADD CONSTRAINT experts_aadhar_number_12_digits_chk
      CHECK (aadhar_number IS NULL OR aadhar_number ~ '^\d{12}$')
      NOT VALID;
  END IF;
END $$;

-- Tell Supabase/PostgREST to reload its schema cache so inserts can see the column.
NOTIFY pgrst, 'reload schema';
