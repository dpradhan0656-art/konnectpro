-- Customer reviews for experts (Expert app Profile — only real rows; no mock data in the app)
-- expert_id stored as text so it matches public.experts.id whether that column is uuid or bigint.

CREATE TABLE IF NOT EXISTS public.expert_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id text NOT NULL,
  customer_name text,
  rating numeric(4, 2) NOT NULL DEFAULT 0,
  review_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT expert_reviews_rating_range CHECK (rating >= 0 AND rating <= 5)
);

CREATE INDEX IF NOT EXISTS expert_reviews_expert_id_created_idx
  ON public.expert_reviews (expert_id, created_at DESC);

ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "expert_reviews_select_own_expert" ON public.expert_reviews;
CREATE POLICY "expert_reviews_select_own_expert"
  ON public.expert_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.experts e
      WHERE e.user_id = auth.uid()
        AND e.id::text = public.expert_reviews.expert_id
    )
  );

DROP POLICY IF EXISTS "expert_reviews_admin_all" ON public.expert_reviews;
CREATE POLICY "expert_reviews_admin_all"
  ON public.expert_reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM public.app_admin WHERE user_id = auth.uid()));

COMMENT ON TABLE public.expert_reviews IS 'Customer reviews linked to experts; app shows only DB-backed rows.';
