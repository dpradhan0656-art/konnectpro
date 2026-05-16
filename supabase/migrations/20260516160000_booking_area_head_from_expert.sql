-- When an expert is assigned to a booking, copy experts.area_head_id → bookings.area_head_id
-- so the referring Area Commander (e.g. Sanju / Jhansi) gets commission on process_job_payout.

CREATE OR REPLACE FUNCTION public.set_booking_area_head_from_expert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_head_id uuid;
BEGIN
  IF NEW.expert_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT e.area_head_id INTO v_head_id
  FROM public.experts e
  WHERE e.id = NEW.expert_id;

  IF v_head_id IS NOT NULL THEN
    NEW.area_head_id := v_head_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_set_area_head_from_expert ON public.bookings;
CREATE TRIGGER bookings_set_area_head_from_expert
  BEFORE INSERT OR UPDATE OF expert_id ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_booking_area_head_from_expert();

-- Backfill: existing assigned bookings follow their expert's area head (e.g. Ashok → Sanju)
UPDATE public.bookings b
SET area_head_id = e.area_head_id
FROM public.experts e
WHERE b.expert_id = e.id
  AND e.area_head_id IS NOT NULL
  AND (b.area_head_id IS DISTINCT FROM e.area_head_id);

COMMENT ON FUNCTION public.set_booking_area_head_from_expert() IS
  'Ensures bookings.area_head_id matches experts.area_head_id when expert is set — commission to onboarding commander.';
