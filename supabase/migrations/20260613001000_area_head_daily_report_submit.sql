-- Area Head Flutter Phase-5: daily field report + hardware shop visit log.
-- All writes/readbacks resolve the active Area Head from auth.uid(); clients never
-- provide area_head_id and never receive other Area Heads' reports.

CREATE TABLE IF NOT EXISTS public.area_head_daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_head_id uuid NOT NULL REFERENCES public.area_heads(id) ON DELETE CASCADE,
  submitted_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_date date NOT NULL,
  experts_contacted integer NOT NULL DEFAULT 0,
  experts_onboarded integer NOT NULL DEFAULT 0,
  shops_visited integer NOT NULL DEFAULT 0,
  jobs_followed_up integer NOT NULL DEFAULT 0,
  complaints_handled integer NOT NULL DEFAULT 0,
  hardware_shop_name text NULL,
  shop_owner_name text NULL,
  shop_mobile text NULL,
  shop_area text NULL,
  field_notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT area_head_daily_reports_one_per_day UNIQUE (area_head_id, report_date),
  CONSTRAINT area_head_daily_reports_counts_chk CHECK (
    experts_contacted BETWEEN 0 AND 500
    AND experts_onboarded BETWEEN 0 AND 500
    AND shops_visited BETWEEN 0 AND 500
    AND jobs_followed_up BETWEEN 0 AND 500
    AND complaints_handled BETWEEN 0 AND 500
  ),
  CONSTRAINT area_head_daily_reports_shop_mobile_chk CHECK (
    shop_mobile IS NULL OR shop_mobile ~ '^[6-9][0-9]{9}$'
  ),
  CONSTRAINT area_head_daily_reports_text_lengths_chk CHECK (
    (hardware_shop_name IS NULL OR char_length(hardware_shop_name) <= 120)
    AND (shop_owner_name IS NULL OR char_length(shop_owner_name) <= 120)
    AND (shop_area IS NULL OR char_length(shop_area) <= 120)
    AND (field_notes IS NULL OR char_length(field_notes) <= 1000)
  )
);

CREATE INDEX IF NOT EXISTS area_head_daily_reports_area_date_idx
  ON public.area_head_daily_reports (area_head_id, report_date DESC);

ALTER TABLE public.area_head_daily_reports ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.area_head_daily_reports IS
  'Area Head daily field activity reports. Contains operational shop visit/contact details only; no KYC, bank, payout, customer address, or identity document data.';

CREATE OR REPLACE FUNCTION public.area_head_submit_daily_report(
  report_date date,
  experts_contacted integer,
  experts_onboarded integer,
  shops_visited integer,
  jobs_followed_up integer,
  complaints_handled integer,
  hardware_shop_name text DEFAULT NULL,
  shop_owner_name text DEFAULT NULL,
  shop_mobile text DEFAULT NULL,
  shop_area text DEFAULT NULL,
  field_notes text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_area_head public.area_heads%ROWTYPE;
  v_report_date date := report_date;
  v_experts_contacted integer := COALESCE(experts_contacted, 0);
  v_experts_onboarded integer := COALESCE(experts_onboarded, 0);
  v_shops_visited integer := COALESCE(shops_visited, 0);
  v_jobs_followed_up integer := COALESCE(jobs_followed_up, 0);
  v_complaints_handled integer := COALESCE(complaints_handled, 0);
  v_shop_name text := NULLIF(trim(COALESCE(hardware_shop_name, '')), '');
  v_shop_owner text := NULLIF(trim(COALESCE(shop_owner_name, '')), '');
  v_shop_mobile text := regexp_replace(COALESCE(shop_mobile, ''), '[^0-9]', '', 'g');
  v_shop_area text := NULLIF(trim(COALESCE(shop_area, '')), '');
  v_notes text := NULLIF(trim(COALESCE(field_notes, '')), '');
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT *
  INTO v_area_head
  FROM public.area_heads
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;

  IF v_area_head.id IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF v_report_date IS NULL THEN
    RAISE EXCEPTION 'Report date is required';
  END IF;

  IF v_experts_contacted < 0 OR v_experts_contacted > 500
    OR v_experts_onboarded < 0 OR v_experts_onboarded > 500
    OR v_shops_visited < 0 OR v_shops_visited > 500
    OR v_jobs_followed_up < 0 OR v_jobs_followed_up > 500
    OR v_complaints_handled < 0 OR v_complaints_handled > 500 THEN
    RAISE EXCEPTION 'Daily report counts must be between 0 and 500';
  END IF;

  IF length(v_shop_mobile) = 12 AND left(v_shop_mobile, 2) = '91' THEN
    v_shop_mobile := right(v_shop_mobile, 10);
  END IF;
  v_shop_mobile := NULLIF(v_shop_mobile, '');

  IF v_shop_mobile IS NOT NULL AND v_shop_mobile !~ '^[6-9][0-9]{9}$' THEN
    RAISE EXCEPTION 'Shop mobile must be a valid 10-digit Indian mobile number';
  END IF;

  IF v_shop_name IS NOT NULL AND char_length(v_shop_name) > 120 THEN
    RAISE EXCEPTION 'Hardware shop name must be 120 characters or less';
  END IF;

  IF v_shop_owner IS NOT NULL AND char_length(v_shop_owner) > 120 THEN
    RAISE EXCEPTION 'Shop owner name must be 120 characters or less';
  END IF;

  IF v_shop_area IS NOT NULL AND char_length(v_shop_area) > 120 THEN
    RAISE EXCEPTION 'Shop area must be 120 characters or less';
  END IF;

  IF v_notes IS NOT NULL AND char_length(v_notes) > 1000 THEN
    RAISE EXCEPTION 'Field notes must be 1000 characters or less';
  END IF;

  INSERT INTO public.area_head_daily_reports (
    area_head_id,
    submitted_by_user_id,
    report_date,
    experts_contacted,
    experts_onboarded,
    shops_visited,
    jobs_followed_up,
    complaints_handled,
    hardware_shop_name,
    shop_owner_name,
    shop_mobile,
    shop_area,
    field_notes
  )
  VALUES (
    v_area_head.id,
    auth.uid(),
    v_report_date,
    v_experts_contacted,
    v_experts_onboarded,
    v_shops_visited,
    v_jobs_followed_up,
    v_complaints_handled,
    v_shop_name,
    v_shop_owner,
    v_shop_mobile,
    v_shop_area,
    v_notes
  )
  ON CONFLICT (area_head_id, report_date)
  DO UPDATE SET
    submitted_by_user_id = EXCLUDED.submitted_by_user_id,
    experts_contacted = EXCLUDED.experts_contacted,
    experts_onboarded = EXCLUDED.experts_onboarded,
    shops_visited = EXCLUDED.shops_visited,
    jobs_followed_up = EXCLUDED.jobs_followed_up,
    complaints_handled = EXCLUDED.complaints_handled,
    hardware_shop_name = EXCLUDED.hardware_shop_name,
    shop_owner_name = EXCLUDED.shop_owner_name,
    shop_mobile = EXCLUDED.shop_mobile,
    shop_area = EXCLUDED.shop_area,
    field_notes = EXCLUDED.field_notes;

  RETURN 'Daily report submitted';
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_area_head_daily_reports()
RETURNS TABLE (
  report_id text,
  report_date date,
  experts_contacted integer,
  experts_onboarded integer,
  shops_visited integer,
  jobs_followed_up integer,
  complaints_handled integer,
  hardware_shop_name text,
  shop_owner_name text,
  shop_mobile_masked text,
  shop_area text,
  field_notes text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_area_head public.area_heads%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT *
  INTO v_area_head
  FROM public.area_heads
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;

  IF v_area_head.id IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    r.id::text AS report_id,
    r.report_date,
    r.experts_contacted,
    r.experts_onboarded,
    r.shops_visited,
    r.jobs_followed_up,
    r.complaints_handled,
    r.hardware_shop_name,
    r.shop_owner_name,
    CASE
      WHEN r.shop_mobile ~ '^[0-9]{10}$' THEN '******' || right(r.shop_mobile, 4)
      ELSE NULL
    END AS shop_mobile_masked,
    r.shop_area,
    r.field_notes,
    r.created_at
  FROM public.area_head_daily_reports r
  WHERE r.area_head_id = v_area_head.id
  ORDER BY r.report_date DESC, r.created_at DESC
  LIMIT 30;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.area_head_submit_daily_report(date,integer,integer,integer,integer,integer,text,text,text,text,text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.area_head_submit_daily_report(date,integer,integer,integer,integer,integer,text,text,text,text,text) FROM public;
GRANT EXECUTE ON FUNCTION public.area_head_submit_daily_report(date,integer,integer,integer,integer,integer,text,text,text,text,text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_current_area_head_daily_reports() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_current_area_head_daily_reports() FROM public;
GRANT EXECUTE ON FUNCTION public.get_current_area_head_daily_reports() TO authenticated;

COMMENT ON FUNCTION public.area_head_submit_daily_report(date,integer,integer,integer,integer,integer,text,text,text,text,text) IS
  'Active Area Head submits or updates one daily field report per date. Resolves area_head_id from auth.uid(); no admin, payout, KYC, or customer PII access.';
COMMENT ON FUNCTION public.get_current_area_head_daily_reports() IS
  'Returns safe recent daily reports for the active Area Head resolved from auth.uid().';

NOTIFY pgrst, 'reload schema';
