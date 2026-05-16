-- Founder / co-founder emails (align with VITE_SUPERADMIN_EMAILS in web .env).
-- Lets DeepakHQ catalog writes work when logged in as superadmin without a manual app_admin row.

CREATE TABLE IF NOT EXISTS public.hq_founder_emails (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hq_founder_emails ENABLE ROW LEVEL SECURITY;

INSERT INTO public.hq_founder_emails (email) VALUES
  ('dpradhan0656@gmail.com'),
  ('omipra08_email@gmail.com')
ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE public.hq_founder_emails IS
  'Co-founder allowlist for HQ catalog RLS. Keep in sync with VITE_SUPERADMIN_EMAILS.';

CREATE OR REPLACE FUNCTION public.auth_is_founder_email()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.hq_founder_emails f
    WHERE lower(f.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

REVOKE ALL ON FUNCTION public.auth_is_founder_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_founder_email() TO authenticated, anon;

-- Optional: grant app_admin row on login (existing policies keep working everywhere).
CREATE OR REPLACE FUNCTION public.ensure_founder_app_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF NOT public.auth_is_founder_email() THEN
    RAISE EXCEPTION 'Not a founder email';
  END IF;
  INSERT INTO public.app_admin (user_id)
  VALUES (auth.uid())
  ON CONFLICT DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_founder_app_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_founder_app_admin() TO authenticated;

-- Permissive OR with existing *_admin_all policies (app_admin).
CREATE POLICY "categories_founder_all" ON public.categories
  FOR ALL USING (public.auth_is_founder_email());

CREATE POLICY "services_founder_all" ON public.services
  FOR ALL USING (public.auth_is_founder_email());

CREATE POLICY "spotlight_offers_founder_all" ON public.spotlight_offers
  FOR ALL USING (public.auth_is_founder_email());

CREATE POLICY "admin_settings_founder_all" ON public.admin_settings
  FOR ALL USING (public.auth_is_founder_email());

CREATE POLICY "cities_founder_all" ON public.cities
  FOR ALL USING (public.auth_is_founder_email());

CREATE POLICY "city_service_pricing_founder_all" ON public.city_service_pricing
  FOR ALL USING (public.auth_is_founder_email());
