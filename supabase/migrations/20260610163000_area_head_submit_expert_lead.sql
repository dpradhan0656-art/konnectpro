-- Area Head mobile Phase-3: submit expert lead for central verification.
-- Area Heads cannot verify/approve/delete experts. This RPC only creates a
-- pending_verification lead linked to the current active Area Head.

CREATE OR REPLACE FUNCTION public.area_head_submit_expert_lead(
  expert_name text,
  expert_phone text,
  expert_category text,
  expert_city text,
  experience_years numeric DEFAULT 0,
  local_note text DEFAULT NULL
)
RETURNS TABLE (
  out_expert_id text,
  lead_status text,
  lead_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  v_area_head public.area_heads%ROWTYPE;
  v_name text := NULLIF(trim(expert_name), '');
  v_phone text := regexp_replace(COALESCE(expert_phone, ''), '[^0-9]', '', 'g');
  v_category text := NULLIF(trim(expert_category), '');
  v_city text := NULLIF(trim(expert_city), '');
  v_experience numeric := COALESCE(experience_years, 0);
  v_lead_email text;
  v_expert_id text;
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

  IF v_name IS NULL OR length(v_name) < 2 THEN
    RAISE EXCEPTION 'Expert name must be at least 2 characters';
  END IF;

  IF length(v_phone) = 12 AND left(v_phone, 2) = '91' THEN
    v_phone := right(v_phone, 10);
  END IF;

  IF v_phone !~ '^[6-9][0-9]{9}$' THEN
    RAISE EXCEPTION 'Expert phone must be a valid 10-digit Indian mobile number';
  END IF;

  IF v_category IS NULL THEN
    RAISE EXCEPTION 'Expert category is required';
  END IF;

  IF v_city IS NULL OR length(v_city) < 2 THEN
    RAISE EXCEPTION 'Expert city/area is required';
  END IF;

  IF v_experience < 0 OR v_experience > 60 THEN
    RAISE EXCEPTION 'Experience years must be between 0 and 60';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.experts e
    WHERE (
      CASE
        WHEN length(regexp_replace(COALESCE(e.phone, ''), '[^0-9]', '', 'g')) = 12
          AND left(regexp_replace(COALESCE(e.phone, ''), '[^0-9]', '', 'g'), 2) = '91'
          THEN right(regexp_replace(COALESCE(e.phone, ''), '[^0-9]', '', 'g'), 10)
        ELSE regexp_replace(COALESCE(e.phone, ''), '[^0-9]', '', 'g')
      END
    ) = v_phone
  ) THEN
    RAISE EXCEPTION 'Expert already exists or is already under review';
  END IF;

  -- Placeholder email only (no client PII). Expert supplies real email during KYC.
  v_lead_email := format('areahead-lead+%s@pending.kshatr.local', v_phone);

  INSERT INTO public.experts (
    name,
    phone,
    email,
    service_category,
    category,
    city,
    experience_years,
    status,
    kyc_status,
    user_id,
    area_head_id
  )
  VALUES (
    v_name,
    v_phone,
    v_lead_email,
    v_category,
    v_category,
    v_city,
    v_experience,
    'pending_verification',
    'pending',
    NULL,
    v_area_head.id
  )
  RETURNING id::text INTO v_expert_id;

  -- Audit TODO: write expert_onboarded into a hardened admin/action audit table
  -- after admin_action_logs policies are tightened to admin/system-only reads.
  -- Do not store raw local_note until a safe lead-notes/audit schema is approved.
  PERFORM local_note;

  RETURN QUERY SELECT
    v_expert_id,
    'pending_verification'::text,
    'Expert submitted for verification'::text;
END;
$$;

revoke execute on function public.area_head_submit_expert_lead(text,text,text,text,numeric,text) from anon;
revoke execute on function public.area_head_submit_expert_lead(text,text,text,text,numeric,text) from public;
grant execute on function public.area_head_submit_expert_lead(text,text,text,text,numeric,text) to authenticated;

COMMENT ON FUNCTION public.area_head_submit_expert_lead(text,text,text,text,numeric,text) IS
  'Active Area Head submits a safe expert lead for central pending_verification review.';

-- Refresh PostgREST schema cache after function/column alignment.
NOTIFY pgrst, 'reload schema';
