-- Area Commander dashboard: list experts they onboarded (fixes empty list when SELECT RLS missing).

-- Optional column (some projects created experts without it)
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- SELECT policy (idempotent)
DROP POLICY IF EXISTS "experts_select_area_head_referred" ON public.experts;
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

-- Reliable read path: SECURITY DEFINER RPC (still scoped to logged-in area head)
CREATE OR REPLACE FUNCTION public.get_area_head_experts()
RETURNS SETOF public.experts
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.*
  FROM public.experts e
  INNER JOIN public.area_heads ah ON ah.id = e.area_head_id
  WHERE ah.user_id = auth.uid()
    AND ah.status = 'active'
  ORDER BY e.created_at DESC NULLS LAST;
$$;

REVOKE ALL ON FUNCTION public.get_area_head_experts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_area_head_experts() TO authenticated;

COMMENT ON FUNCTION public.get_area_head_experts() IS
  'Returns experts linked via experts.area_head_id for the current area commander session.';

-- Parameterized: matches dashboard manager.id (still requires logged-in user owns that row)
CREATE OR REPLACE FUNCTION public.get_area_head_experts_for(p_area_head_id uuid)
RETURNS SETOF public.experts
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.*
  FROM public.experts e
  WHERE e.area_head_id = p_area_head_id
    AND EXISTS (
      SELECT 1
      FROM public.area_heads ah
      WHERE ah.id = p_area_head_id
        AND ah.user_id = auth.uid()
        AND ah.status = 'active'
    )
  ORDER BY e.created_at DESC NULLS LAST;
$$;

REVOKE ALL ON FUNCTION public.get_area_head_experts_for(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_area_head_experts_for(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_area_head_experts_for(uuid) IS
  'List experts for area_heads.id passed from /areahead UI; caller must own that commander row.';
