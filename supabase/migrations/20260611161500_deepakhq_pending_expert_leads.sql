-- DeepakHQ Phase-4: admin-only Pending Expert Leads approval queue.
-- Area Heads can submit leads, but cannot approve/reject/verify/delete/block them.
-- These RPCs return/update only safe lead-review fields.

CREATE OR REPLACE FUNCTION public.get_pending_expert_leads_for_admin()
RETURNS TABLE (
  expert_id uuid,
  expert_name text,
  phone_masked text,
  service_category text,
  city text,
  experience_years numeric,
  lead_status text,
  kyc_status text,
  submitted_at timestamptz,
  area_head_name text,
  area_head_assigned_area text
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
    e.id AS expert_id,
    COALESCE(NULLIF(e.name, ''), NULLIF(e.full_name, ''), 'Expert') AS expert_name,
    CASE
      WHEN regexp_replace(COALESCE(e.phone, ''), '[^0-9]', '', 'g') ~ '^[0-9]{10,}$'
        THEN '******' || right(regexp_replace(e.phone, '[^0-9]', '', 'g'), 4)
      ELSE NULL
    END AS phone_masked,
    COALESCE(NULLIF(e.service_category, ''), NULLIF(e.category, ''), NULLIF(e.primary_category, ''), 'Service') AS service_category,
    COALESCE(NULLIF(e.city, ''), 'Unknown') AS city,
    COALESCE(e.experience_years, 0)::numeric AS experience_years,
    COALESCE(NULLIF(e.status, ''), 'pending_verification') AS lead_status,
    COALESCE(NULLIF(e.kyc_status, ''), 'pending') AS kyc_status,
    e.created_at AS submitted_at,
    COALESCE(NULLIF(ah.name, ''), 'Area Head') AS area_head_name,
    COALESCE(NULLIF(ah.assigned_area, ''), 'Assigned area') AS area_head_assigned_area
  FROM public.experts e
  LEFT JOIN public.area_heads ah
    ON ah.id = e.area_head_id
  WHERE e.status = 'pending_verification'
    AND e.area_head_id IS NOT NULL
  ORDER BY e.created_at DESC NULLS LAST
  LIMIT 200;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_approve_expert_lead(target_expert_id uuid)
RETURNS text
LANGUAGE plpgsql
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

  IF target_expert_id IS NULL THEN
    RAISE EXCEPTION 'Target expert id is required';
  END IF;

  UPDATE public.experts
  SET
    status = 'active',
    kyc_status = COALESCE(NULLIF(kyc_status, ''), 'pending')
  WHERE id = target_expert_id
    AND status = 'pending_verification';

  IF NOT FOUND THEN
    IF EXISTS (SELECT 1 FROM public.experts WHERE id = target_expert_id) THEN
      RAISE EXCEPTION 'Expert lead is not pending verification';
    END IF;
    RAISE EXCEPTION 'Expert lead not found';
  END IF;

  -- Audit TODO: admin_action_logs currently has broad authenticated policies in docs.
  -- Add a hardened admin-only/server-only audit RPC before storing approval events.
  RETURN 'Expert lead approved';
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_expert_lead(
  target_expert_id uuid,
  reject_note text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
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

  IF target_expert_id IS NULL THEN
    RAISE EXCEPTION 'Target expert id is required';
  END IF;

  UPDATE public.experts
  SET status = 'rejected'
  WHERE id = target_expert_id
    AND status = 'pending_verification';

  IF NOT FOUND THEN
    IF EXISTS (SELECT 1 FROM public.experts WHERE id = target_expert_id) THEN
      RAISE EXCEPTION 'Expert lead is not pending verification';
    END IF;
    RAISE EXCEPTION 'Expert lead not found';
  END IF;

  -- reject_note intentionally not stored: no safe admin_note column is present in
  -- source-controlled experts schema. Avoid creating a broad notes/audit surface.
  PERFORM reject_note;

  -- Audit TODO: admin_action_logs currently has broad authenticated policies in docs.
  -- Add a hardened admin-only/server-only audit RPC before storing rejection events.
  RETURN 'Expert lead rejected';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_pending_expert_leads_for_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_pending_expert_leads_for_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.get_pending_expert_leads_for_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_approve_expert_lead(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_approve_expert_lead(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_approve_expert_lead(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_reject_expert_lead(uuid,text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_reject_expert_lead(uuid,text) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_reject_expert_lead(uuid,text) TO authenticated;

COMMENT ON FUNCTION public.get_pending_expert_leads_for_admin() IS
  'DeepakHQ admin-only safe pending expert leads queue. Returns no sensitive KYC, bank, full address, or identity document fields.';
COMMENT ON FUNCTION public.admin_approve_expert_lead(uuid) IS
  'DeepakHQ admin-only approval for Area Head submitted expert leads. Does not verify KYC or touch payout/bank fields.';
COMMENT ON FUNCTION public.admin_reject_expert_lead(uuid,text) IS
  'DeepakHQ admin-only rejection for Area Head submitted expert leads. Does not delete expert rows.';

NOTIFY pgrst, 'reload schema';
