-- Area Head → onboard expert (karigar): same `experts` table as public registration.
-- Adds area_head_id + allows NULL user_id until expert signs up later.
-- RLS: only active area heads may insert pending rows for their own area_head_id.

-- area_heads.id is uuid in this project (not bigint).
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS area_head_id uuid REFERENCES public.area_heads(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS experts_area_head_id_idx ON public.experts (area_head_id);

-- Public registration links auth immediately; area-head referrals may not.
ALTER TABLE public.experts ALTER COLUMN user_id DROP NOT NULL;

CREATE POLICY "experts_insert_area_head_pending" ON public.experts
  FOR INSERT WITH CHECK (
    status = 'pending'
    AND user_id IS NULL
    AND area_head_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.area_heads ah
      WHERE ah.id = experts.area_head_id
        AND ah.user_id = auth.uid()
        AND ah.status = 'active'
    )
  );

COMMENT ON COLUMN public.experts.area_head_id IS 'Area head who referred/onboarded this expert (pending until admin approves).';
