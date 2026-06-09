-- Area Commander profile edit RPC.
-- Security: profile-only update. Password reset is intentionally disabled here.
-- Keep `new_password` only as an ignored legacy parameter so older clients do not break.

CREATE OR REPLACE FUNCTION public.update_area_commander_profile(
  target_user_id uuid,
  new_password text DEFAULT NULL,
  new_name text DEFAULT NULL,
  new_phone text DEFAULT NULL,
  new_city text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text := NULLIF(trim(new_name), '');
  v_phone text := NULLIF(trim(new_phone), '');
  v_city text := NULLIF(trim(new_city), '');
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.app_admin
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF target_user_id IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.area_heads
    WHERE user_id = target_user_id
  ) THEN
    RAISE EXCEPTION 'Area commander not found';
  END IF;

  IF v_name IS NOT NULL AND length(v_name) < 2 THEN
    RAISE EXCEPTION 'Full name must be at least 2 characters';
  END IF;

  IF v_city IS NOT NULL AND length(v_city) < 2 THEN
    RAISE EXCEPTION 'City must be at least 2 characters';
  END IF;

  IF v_phone IS NOT NULL AND v_phone !~ '^[6-9][0-9]{9}$' THEN
    RAISE EXCEPTION 'Phone number must be a valid 10-digit Indian mobile number';
  END IF;

  -- Password reset is paused for security review. `new_password` is intentionally unused.
  -- Do not touch auth.users here. Future reset must use a service-role Edge Function
  -- or verified Supabase Auth Admin flow.

  UPDATE public.area_heads
  SET
    name = COALESCE(v_name, name),
    phone = COALESCE(v_phone, phone),
    assigned_area = COALESCE(v_city, assigned_area)
  WHERE user_id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_area_commander_profile(uuid, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_area_commander_profile(uuid, text, text, text, text) TO authenticated;
