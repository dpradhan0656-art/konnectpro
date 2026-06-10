-- Area Head Flutter Phase-2 read-only RPCs.
-- These functions never accept area_head_id from the client. They resolve the
-- active Area Head from auth.uid() and return only mobile-safe fields.

CREATE OR REPLACE FUNCTION public.get_current_area_head_experts()
RETURNS TABLE (
  expert_id text,
  name text,
  phone_masked text,
  service_category text,
  status text,
  rating numeric,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    e.id::text AS expert_id,
    COALESCE(NULLIF(e.name, ''), NULLIF(e.full_name, ''), 'Expert') AS name,
    CASE
      WHEN regexp_replace(COALESCE(e.phone, ''), '[^0-9]', '', 'g') ~ '^[0-9]{10,}$'
        THEN '******' || right(regexp_replace(e.phone, '[^0-9]', '', 'g'), 4)
      ELSE NULL
    END AS phone_masked,
    COALESCE(NULLIF(e.service_category, ''), NULLIF(e.primary_category, ''), 'Service') AS service_category,
    COALESCE(NULLIF(e.status, ''), 'pending') AS status,
    e.average_rating::numeric AS rating,
    e.created_at
  FROM public.experts e
  INNER JOIN public.area_heads ah
    ON ah.id = e.area_head_id
  WHERE auth.uid() IS NOT NULL
    AND ah.user_id = auth.uid()
    AND ah.status = 'active'
  ORDER BY e.created_at DESC NULLS LAST
  LIMIT 100;
$$;

revoke execute on function public.get_current_area_head_experts() from anon;
revoke execute on function public.get_current_area_head_experts() from public;
grant execute on function public.get_current_area_head_experts() to authenticated;

COMMENT ON FUNCTION public.get_current_area_head_experts() IS
  'Read-only safe expert list for the active Area Head resolved from auth.uid().';

CREATE OR REPLACE FUNCTION public.get_current_area_head_jobs()
RETURNS TABLE (
  job_id text,
  service_name text,
  status text,
  amount numeric,
  area text,
  created_at timestamptz,
  assigned_expert_name text,
  assigned_expert_phone_masked text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id::text AS job_id,
    COALESCE(NULLIF(b.service_name, ''), 'Service') AS service_name,
    COALESCE(NULLIF(b.status, ''), 'unknown') AS status,
    b.total_amount::numeric AS amount,
    COALESCE(NULLIF(b.city, ''), ah.assigned_area, 'Assigned area') AS area,
    b.created_at,
    COALESCE(NULLIF(e.name, ''), NULLIF(e.full_name, '')) AS assigned_expert_name,
    CASE
      WHEN regexp_replace(COALESCE(e.phone, ''), '[^0-9]', '', 'g') ~ '^[0-9]{10,}$'
        THEN '******' || right(regexp_replace(e.phone, '[^0-9]', '', 'g'), 4)
      ELSE NULL
    END AS assigned_expert_phone_masked
  FROM public.bookings b
  INNER JOIN public.area_heads ah
    ON ah.id = b.area_head_id
  LEFT JOIN public.experts e
    ON e.id = b.expert_id
  WHERE auth.uid() IS NOT NULL
    AND ah.user_id = auth.uid()
    AND ah.status = 'active'
  ORDER BY b.created_at DESC
  LIMIT 100;
$$;

revoke execute on function public.get_current_area_head_jobs() from anon;
revoke execute on function public.get_current_area_head_jobs() from public;
grant execute on function public.get_current_area_head_jobs() to authenticated;

COMMENT ON FUNCTION public.get_current_area_head_jobs() IS
  'Read-only safe job list for the active Area Head resolved from auth.uid().';
