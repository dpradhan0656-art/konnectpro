-- Area Head route access hardening.
-- Provides an owner-scoped read path for /areahead dashboard bookings.

CREATE OR REPLACE FUNCTION public.get_current_area_head_bookings()
RETURNS TABLE (
  id bigint,
  status text,
  service_name text,
  total_amount numeric,
  address text,
  created_at timestamptz,
  expert_name text,
  expert_phone text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id,
    b.status,
    b.service_name,
    b.total_amount,
    b.address,
    b.created_at,
    e.name AS expert_name,
    e.phone AS expert_phone
  FROM public.bookings b
  INNER JOIN public.area_heads ah
    ON ah.id = b.area_head_id
  LEFT JOIN public.experts e
    ON e.id = b.expert_id
  WHERE auth.uid() IS NOT NULL
    AND ah.user_id = auth.uid()
    AND ah.status = 'active'
  ORDER BY b.created_at DESC
  LIMIT 20;
$$;

REVOKE ALL ON FUNCTION public.get_current_area_head_bookings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_area_head_bookings() TO authenticated;

COMMENT ON FUNCTION public.get_current_area_head_bookings() IS
  'Returns recent bookings for the active area_head row owned by the current authenticated user.';
