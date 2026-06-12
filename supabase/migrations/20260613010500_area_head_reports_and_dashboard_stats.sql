-- Area Head operations Phase: DeepakHQ daily reports viewer + mobile dashboard stats.
-- Financial totals are calculated only in PostgreSQL from the verified
-- wallet_transactions area-head commission ledger.

CREATE OR REPLACE FUNCTION public.admin_get_daily_reports(filter_date date DEFAULT NULL)
RETURNS TABLE (
  report_id text,
  area_head_name text,
  assigned_area text,
  report_date date,
  experts_contacted integer,
  experts_onboarded integer,
  shops_visited integer,
  jobs_followed_up integer,
  complaints_handled integer,
  hardware_shop_name text,
  shop_area text,
  field_notes text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.app_admin aa
    WHERE aa.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    r.id::text AS report_id,
    COALESCE(NULLIF(ah.name, ''), 'Area Head') AS area_head_name,
    COALESCE(NULLIF(ah.assigned_area, ''), 'Assigned area') AS assigned_area,
    r.report_date,
    r.experts_contacted,
    r.experts_onboarded,
    r.shops_visited,
    r.jobs_followed_up,
    r.complaints_handled,
    r.hardware_shop_name,
    r.shop_area,
    r.field_notes,
    r.created_at
  FROM public.area_head_daily_reports r
  INNER JOIN public.area_heads ah
    ON ah.id = r.area_head_id
  WHERE (
    filter_date IS NOT NULL
    AND r.report_date = filter_date
  ) OR (
    filter_date IS NULL
    AND r.report_date >= (CURRENT_DATE - INTERVAL '30 days')::date
  )
  ORDER BY r.report_date DESC, r.created_at DESC
  LIMIT 500;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_area_head_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_area_head public.area_heads%ROWTYPE;
  v_total_income numeric := 0;
  v_total_experts_count integer := 0;
  v_experts_list jsonb := '[]'::jsonb;
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

  -- wallet_transactions.user_id stores the Area Head auth user id in live data,
  -- not area_heads.id. Match the confirmed ledger query shape.
  SELECT COALESCE(SUM(wt.amount), 0)::numeric
  INTO v_total_income
  FROM public.wallet_transactions wt
  WHERE wt.user_id = v_area_head.user_id
    AND wt.user_type = 'area_head'
    AND wt.transaction_type = 'credit'
    AND wt.reason = 'area_commission';

  SELECT COUNT(*)::integer
  INTO v_total_experts_count
  FROM public.experts e
  WHERE e.area_head_id = v_area_head.id;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'expert_name', COALESCE(NULLIF(e.name, ''), NULLIF(e.full_name, ''), 'Expert'),
        'field_category', COALESCE(NULLIF(e.service_category, ''), NULLIF(e.category, ''), NULLIF(e.primary_category, ''), 'Service'),
        'status', COALESCE(NULLIF(e.status, ''), 'unknown'),
        'kyc_status', COALESCE(NULLIF(e.kyc_status, ''), 'pending')
      )
      ORDER BY e.created_at DESC NULLS LAST
    ),
    '[]'::jsonb
  )
  INTO v_experts_list
  FROM public.experts e
  WHERE e.area_head_id = v_area_head.id;

  RETURN jsonb_build_object(
    'total_income', v_total_income,
    'total_experts_count', v_total_experts_count,
    'experts_list', v_experts_list
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_daily_reports(date) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_get_daily_reports(date) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_get_daily_reports(date) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_area_head_dashboard_stats() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_area_head_dashboard_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.get_area_head_dashboard_stats() TO authenticated;

COMMENT ON FUNCTION public.admin_get_daily_reports(date) IS
  'DeepakHQ admin-only daily Area Head reports viewer. Returns safe operational report fields only.';
COMMENT ON FUNCTION public.get_area_head_dashboard_stats() IS
  'Active Area Head dashboard stats. Computes income in PostgreSQL from area_commission wallet ledger rows and returns safe expert summary only.';

NOTIFY pgrst, 'reload schema';
