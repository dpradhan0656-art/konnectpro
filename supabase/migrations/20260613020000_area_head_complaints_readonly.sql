-- Area Head read-only complaints feed derived from the Area Head's own daily reports.
-- No client area_head_id. No customer PII. No shop contact fields.

CREATE OR REPLACE FUNCTION public.get_current_area_head_complaints()
RETURNS TABLE (
  complaint_id text,
  report_date date,
  category text,
  status text,
  priority text,
  summary text,
  complaints_count integer,
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
    r.id::text AS complaint_id,
    r.report_date,
    'Field Issue'::text AS category,
    'Handled'::text AS status,
    CASE
      WHEN r.complaints_handled >= 5 THEN 'High'
      WHEN r.complaints_handled >= 2 THEN 'Medium'
      ELSE 'Normal'
    END AS priority,
    COALESCE(
      NULLIF(left(trim(r.field_notes), 140), ''),
      format('%s complaint(s) handled on %s', r.complaints_handled, r.report_date)
    ) AS summary,
    r.complaints_handled AS complaints_count,
    r.created_at
  FROM public.area_head_daily_reports r
  WHERE r.area_head_id = v_area_head.id
    AND r.complaints_handled > 0
  ORDER BY r.report_date DESC, r.created_at DESC
  LIMIT 50;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_current_area_head_complaints() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_current_area_head_complaints() FROM public;
GRANT EXECUTE ON FUNCTION public.get_current_area_head_complaints() TO authenticated;

COMMENT ON FUNCTION public.get_current_area_head_complaints() IS
  'Read-only complaint activity for the active Area Head. Derived from own daily reports with complaints_handled > 0. No customer PII.';

NOTIFY pgrst, 'reload schema';
