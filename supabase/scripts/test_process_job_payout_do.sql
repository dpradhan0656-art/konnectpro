-- =============================================================================
-- Safe test for process_job_payout(bigint) — 80/20 + area-head commission
--
-- HOW TO RUN (Supabase SQL Editor — paste all, run once):
--   Entire script runs inside BEGIN … ROLLBACK — production data unchanged.
-- =============================================================================

BEGIN;

DO $$
DECLARE
  v_area_head_id uuid;
  v_expert_id uuid;
  v_booking_id bigint;

  v_expert_balance numeric;
  v_area_head_balance numeric;
  v_kshatryx_net numeric;
  v_kshatryx_ledger numeric;
  v_booking_total numeric := 1000;
BEGIN
  SELECT id INTO v_area_head_id
  FROM public.area_heads
  WHERE status = 'active'
    AND employment_type = 'commission'
  ORDER BY created_at DESC NULLS LAST
  LIMIT 1;

  IF v_area_head_id IS NULL THEN
    RAISE EXCEPTION 'No active commission area_head. Add one in DeepakHQ → Area Commanders.';
  END IF;

  INSERT INTO public.experts (
    name, phone, email, service_category, city, status, area_head_id, wallet_balance, user_id
  ) VALUES (
    'Payout Test Expert',
    '9999900001',
    'payout.test.expert@kshatr.test',
    'Test',
    'Jabalpur',
    'approved',
    v_area_head_id,
    0,
    NULL
  )
  RETURNING id INTO v_expert_id;

  INSERT INTO public.bookings (
    service_name,
    address,
    city,
    total_amount,
    status,
    payment_mode,
    payment_method,
    expert_id,
    area_head_id
  ) VALUES (
    'Payout Test Job',
    'Test Address, Jabalpur',
    'Jabalpur',
    v_booking_total,
    'assigned',
    'online_prepaid',
    'online',
    v_expert_id,
    v_area_head_id
  )
  RETURNING id INTO v_booking_id;

  RAISE NOTICE 'booking_id=% amount=₹%', v_booking_id, v_booking_total;

  PERFORM public.process_job_payout(v_booking_id);

  SELECT wallet_balance INTO v_expert_balance FROM public.experts WHERE id = v_expert_id;
  SELECT wallet_balance INTO v_area_head_balance FROM public.area_heads WHERE id = v_area_head_id;
  SELECT COALESCE(kshatryx_fee, 0) INTO v_kshatryx_net FROM public.bookings WHERE id = v_booking_id;

  SELECT COALESCE(sum(amount), 0) INTO v_kshatryx_ledger
  FROM public.wallet_transactions
  WHERE booking_id = v_booking_id
    AND user_type = 'kshatryx'
    AND transaction_type = 'credit';

  RAISE NOTICE 'Expert wallet: ₹%', COALESCE(v_expert_balance, 0);
  RAISE NOTICE 'Area head wallet: ₹%', COALESCE(v_area_head_balance, 0);
  RAISE NOTICE 'Kshatryx net (bookings.kshatryx_fee): ₹%', COALESCE(v_kshatryx_net, 0);
  RAISE NOTICE 'Kshatryx ledger credit sum: ₹%', COALESCE(v_kshatryx_ledger, 0);
END $$;

ROLLBACK;
