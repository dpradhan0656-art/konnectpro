-- Bhenaji / field partner portal: link Supabase Auth user to business_partners + scoped RLS reads.

ALTER TABLE public.business_partners
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.business_partners.user_id IS 'Supabase Auth user for /partner-login; set by admin per partner row.';

CREATE UNIQUE INDEX IF NOT EXISTS business_partners_user_id_unique
  ON public.business_partners (user_id)
  WHERE user_id IS NOT NULL;

-- Partner reads own active row (OR with existing admin policies)
DROP POLICY IF EXISTS "business_partners_select_own" ON public.business_partners;
CREATE POLICY "business_partners_select_own"
  ON public.business_partners
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND active_status = true);

-- Assigned experts visible to that partner
DROP POLICY IF EXISTS "experts_select_by_assigned_partner" ON public.experts;
CREATE POLICY "experts_select_by_assigned_partner"
  ON public.experts
  FOR SELECT
  TO authenticated
  USING (
    assigned_partner_id IN (
      SELECT id FROM public.business_partners
      WHERE user_id = auth.uid() AND active_status = true
    )
  );

-- Completed / in-progress bookings for those experts (partner cut view uses completed)
DROP POLICY IF EXISTS "bookings_select_field_partner" ON public.bookings;
CREATE POLICY "bookings_select_field_partner"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    expert_id IN (
      SELECT e.id FROM public.experts e
      WHERE e.assigned_partner_id IN (
        SELECT id FROM public.business_partners
        WHERE user_id = auth.uid() AND active_status = true
      )
    )
  );
