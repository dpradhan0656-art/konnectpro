-- =============================================================================
-- Fix process_job_payout overload: keep ONE function matching bookings.id type.
-- Run the CHECK below first. If result is 'bigint', run this whole file.
-- If result is 'uuid', run only: DROP FUNCTION IF EXISTS public.process_job_payout(bigint);
-- =============================================================================

-- CHECK (run in SQL Editor first):
-- SELECT data_type FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'id';
-- If result is 'bigint' → run this migration. If 'uuid' → run only the DROP for bigint.

-- Remove both overloads so we have a single definition
DROP FUNCTION IF EXISTS public.process_job_payout(uuid);
DROP FUNCTION IF EXISTS public.process_job_payout(bigint);

-- Single function: bigint (Supabase Table Editor default for id is often bigint)
CREATE OR REPLACE FUNCTION public.process_job_payout(p_booking_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking record;
  v_expert record;
  v_area_head record;
  v_total numeric;
  v_platform_fee numeric;
  v_expert_payout numeric;
  v_area_head_cut numeric;
  v_commission_pct numeric;
BEGIN
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found: %', p_booking_id;
  END IF;
  IF v_booking.status = 'completed' THEN
    RAISE EXCEPTION 'Booking already completed';
  END IF;

  v_total := COALESCE(v_booking.total_amount, 0);
  v_platform_fee := v_total * 0.20;
  v_expert_payout := v_total - v_platform_fee;

  UPDATE bookings SET
    status = 'completed',
    platform_fee = v_platform_fee,
    expert_payout = v_expert_payout
  WHERE id = p_booking_id;

  IF v_booking.expert_id IS NOT NULL THEN
    SELECT * INTO v_expert FROM experts WHERE id = v_booking.expert_id;
    IF FOUND THEN
      IF v_booking.payment_mode IN ('cash_after_service', 'cash') THEN
        UPDATE experts SET wallet_balance = COALESCE(wallet_balance, 0) - v_platform_fee WHERE id = v_expert.id;
        INSERT INTO wallet_transactions (user_id, user_type, amount, transaction_type, reason, description, booking_id)
        VALUES (v_expert.id, 'expert', v_platform_fee, 'debit', 'commission_cut', 'Job #' || left(p_booking_id::text, 6), p_booking_id);
      ELSE
        UPDATE experts SET wallet_balance = COALESCE(wallet_balance, 0) + v_expert_payout WHERE id = v_expert.id;
        INSERT INTO wallet_transactions (user_id, user_type, amount, transaction_type, reason, description, booking_id)
        VALUES (v_expert.id, 'expert', v_expert_payout, 'credit', 'online_payout', 'Job #' || left(p_booking_id::text, 6), p_booking_id);
      END IF;
    END IF;
  END IF;

  IF v_booking.area_head_id IS NOT NULL THEN
    SELECT * INTO v_area_head FROM area_heads WHERE id = v_booking.area_head_id AND status = 'active';
    IF FOUND AND v_area_head.employment_type = 'commission' THEN
      v_commission_pct := COALESCE(v_area_head.compensation_value, 0) / 100.0;
      v_area_head_cut := v_total * v_commission_pct;
      IF v_area_head_cut > 0 THEN
        UPDATE area_heads SET wallet_balance = COALESCE(wallet_balance, 0) + v_area_head_cut WHERE id = v_area_head.id;
        INSERT INTO wallet_transactions (user_id, user_type, amount, transaction_type, reason, description, booking_id)
        VALUES (v_area_head.id, 'area_head', v_area_head_cut, 'credit', 'area_commission', 'Job #' || left(p_booking_id::text, 6) || ' (' || COALESCE(v_booking.city, '') || ')', p_booking_id);
      END IF;
    END IF;
  END IF;
END;
$$;
