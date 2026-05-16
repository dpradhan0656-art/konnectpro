-- Area commanders can read experts they onboarded (MyExpertsList on /areahead).

CREATE POLICY "experts_select_area_head_referred" ON public.experts
  FOR SELECT
  USING (
    area_head_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.area_heads ah
      WHERE ah.id = experts.area_head_id
        AND ah.user_id = auth.uid()
        AND ah.status = 'active'
    )
  );

COMMENT ON POLICY "experts_select_area_head_referred" ON public.experts IS
  'Active area head may list pending/approved experts linked via experts.area_head_id.';
