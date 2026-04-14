-- Expert mobile (Google): admin / area-head created rows often have user_id NULL until first app login.
-- Allow the authenticated user (JWT email) to SELECT and UPDATE-link their row when email matches.

DROP POLICY IF EXISTS "experts_select_unlinked_matching_jwt_email" ON public.experts;
CREATE POLICY "experts_select_unlinked_matching_jwt_email"
  ON public.experts
  FOR SELECT
  TO authenticated
  USING (
    user_id IS NULL
    AND email IS NOT NULL
    AND length(trim(email)) > 0
    AND lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  );

DROP POLICY IF EXISTS "experts_update_link_user_id_matching_email" ON public.experts;
CREATE POLICY "experts_update_link_user_id_matching_email"
  ON public.experts
  FOR UPDATE
  TO authenticated
  USING (
    user_id IS NULL
    AND email IS NOT NULL
    AND length(trim(email)) > 0
    AND lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  )
  WITH CHECK (user_id = auth.uid());

COMMENT ON POLICY "experts_select_unlinked_matching_jwt_email" ON public.experts IS
  'Lets experts see their admin/onboarded row (user_id NULL) when JWT email matches experts.email, for first Google sign-in.';
COMMENT ON POLICY "experts_update_link_user_id_matching_email" ON public.experts IS
  'First login: set experts.user_id = auth.uid() when row is still unlinked and email matches JWT.';
