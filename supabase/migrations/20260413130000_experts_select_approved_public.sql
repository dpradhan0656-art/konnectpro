-- Customers (anon + authenticated) can list approved experts for booking picker / hero CTA.
-- Complements existing experts_select_own and experts_admin_all (policies OR together).

CREATE POLICY "experts_select_approved_public"
  ON public.experts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');
