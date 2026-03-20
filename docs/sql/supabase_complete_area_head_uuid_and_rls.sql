-- =============================================================================
-- KonnectPro — पूरा SQL (एक बार Supabase → SQL Editor में चलाएँ)
--
-- यह script:
--   • bookings.area_head_id को UUID + area_heads(id) से जोड़ती है (गलत type हो तो ठीक करती है)
--   • experts.area_head_id को UUID + area_heads(id) से जोड़ती है
--   • experts.user_id को NULL मानने देती है (बिना ऐप लॉगिन के area head द्वारा कारीगर जोड़ना)
--   • सही RLS policy: सिर्फ active area head अपने id पर pending + user_id NULL insert कर सके
--
-- Production पर चलाने से पहले backup लें।
-- अगर कॉलम पहले से सही UUID है, तो नीचे वाला DO block उसे नहीं हटाएगा।
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) BOOKINGS — area_head_id = uuid (कमीशन / assignment के लिए)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  dt text;
BEGIN
  SELECT c.data_type INTO dt
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'bookings'
    AND c.column_name = 'area_head_id';

  IF dt IS NOT NULL AND dt <> 'uuid' THEN
    EXECUTE 'ALTER TABLE public.bookings DROP COLUMN area_head_id CASCADE';
  END IF;
END $$;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS area_head_id uuid REFERENCES public.area_heads(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 2) EXPERTS — area_head_id = uuid (Karigar jode / onboarding)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  dt text;
BEGIN
  SELECT c.data_type INTO dt
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'experts'
    AND c.column_name = 'area_head_id';

  IF dt IS NOT NULL AND dt <> 'uuid' THEN
    EXECUTE 'ALTER TABLE public.experts DROP COLUMN area_head_id CASCADE';
  END IF;
END $$;

ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS area_head_id uuid REFERENCES public.area_heads(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS experts_area_head_id_idx ON public.experts (area_head_id);

-- ---------------------------------------------------------------------------
-- 3) EXPERTS — user_id nullable (homepage वाला flow जहाँ auth तुरंत है वहाँ भी चलेगा)
-- ---------------------------------------------------------------------------
ALTER TABLE public.experts ALTER COLUMN user_id DROP NOT NULL;

-- ---------------------------------------------------------------------------
-- 4) RLS — गलत policy (जैसे area_head_id = auth.uid()) कभी न चलाएँ; यही सही है
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "experts_insert_area_head_pending" ON public.experts;

CREATE POLICY "experts_insert_area_head_pending" ON public.experts
  FOR INSERT
  WITH CHECK (
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

-- =============================================================================
-- हो गया। App में: AreaHeadApp + OnboardExpertForm, DispatchTab bookings update,
-- ExpertVerification pending list — सब इस schema से मेल खाते हैं।
-- =============================================================================
