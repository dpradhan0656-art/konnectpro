-- Experts can update their own profile row (push token + UI language).
-- Safe to run if a broader "update own" policy already exists (Postgres ORs permissive policies).
DROP POLICY IF EXISTS "experts_expo_push_update_own" ON public.experts;

CREATE POLICY "experts_expo_push_update_own"
  ON public.experts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
