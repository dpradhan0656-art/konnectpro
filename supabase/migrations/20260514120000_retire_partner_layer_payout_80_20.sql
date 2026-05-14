-- =============================================================================
-- Retire field-partner ("Bhenaji") layer. New split rule (May 2026):
--   Expert    80%
--   Kshatryx  20%   (super-admin pool)
-- Area-head commission (set by DeepakHQ → Area Commanders) is cut from the
-- 20% Kshatryx pool, capped at 20% of gross. business_partners.wallet_balance
-- is no longer credited; the table + historical ledger rows are preserved for
-- audit and can be archived later.
--
-- This migration replaces public.process_job_payout(bigint) only. It does NOT
-- drop business_partners, experts.assigned_partner_id, or any column added by
-- 20260412140000 — those stay for back-compat / data archive.
-- =============================================================================

-- Mark the field-partner table + linkage as deprecated so future devs know.
COMMENT ON TABLE public.business_partners IS
  'DEPRECATED (May 2026): field-partner "Bhenaji" layer retired. Kept for audit/historical wallet rows only. No new writes via process_job_payout — area-head commission now comes from the 20% Kshatryx pool.';

COMMENT ON COLUMN public.business_partners.wallet_balance IS
  'DEPRECATED: legacy partner share. process_job_payout no longer credits this column after 20260514.';

COMMENT ON COLUMN public.experts.assigned_partner_id IS
  'DEPRECATED (May 2026): field-partner linkage no longer used in payout. Reads are safe; new bookings ignore this field.';

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
  v_total_paise bigint;
  v_expert_paise bigint;
  v_kshatryx_pool_paise bigint;     -- 20% pool (raw, before area-head cut)
  v_area_head_paise bigint;
  v_kshatryx_net_paise bigint;      -- what stays with DeepakHQ after area-head cut
  v_expert_rupees numeric;
  v_kshatryx_net_rupees numeric;
  v_area_head_rupees numeric;
  v_cut_from_expert_rupees numeric; -- platform_fee for cash bookings (debit on expert wallet)
  v_area_head_pay_id bigint;
BEGIN
  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found: %', p_booking_id;
  END IF;
  IF v_booking.status = 'completed' THEN
    RAISE EXCEPTION 'Booking already completed';
  END IF;

  v_total := COALESCE(v_booking.total_amount, 0);
  v_total_paise := round(v_total * 100)::bigint;
  IF v_total_paise < 0 THEN
    v_total_paise := 0;
  END IF;

  -- 80% to expert; the rest (≈20% + any rounding remainder) is the Kshatryx pool.
  v_expert_paise := (v_total_paise * 8000) / 10000;
  v_kshatryx_pool_paise := v_total_paise - v_expert_paise;

  -- Optional area-head commission (cap 20%) taken from Kshatryx pool.
  v_area_head_paise := 0;
  v_area_head_pay_id := NULL;
  IF v_booking.area_head_id IS NOT NULL THEN
    SELECT * INTO v_area_head
    FROM public.area_heads
    WHERE id = v_booking.area_head_id AND status = 'active';
    IF FOUND AND v_area_head.employment_type = 'commission' THEN
      v_area_head_paise := floor(
        v_total_paise::numeric
        * LEAST(COALESCE(v_area_head.compensation_value, 0), 20)
        / 100.0
      )::bigint;
      IF v_area_head_paise > v_kshatryx_pool_paise THEN
        v_area_head_paise := v_kshatryx_pool_paise;
      END IF;
      v_area_head_pay_id := v_area_head.id;
    END IF;
  END IF;

  v_kshatryx_net_paise := v_kshatryx_pool_paise - v_area_head_paise;

  v_expert_rupees := v_expert_paise::numeric / 100.0;
  v_kshatryx_net_rupees := v_kshatryx_net_paise::numeric / 100.0;
  v_area_head_rupees := v_area_head_paise::numeric / 100.0;
  -- Platform = whatever the expert does NOT keep (cash-flow direction stays the same).
  v_cut_from_expert_rupees := v_kshatryx_pool_paise::numeric / 100.0;

  -- field_partner_fee = 0 forever from now on; column kept so old reports don't crash.
  UPDATE public.bookings SET
    status = 'completed',
    platform_fee = v_cut_from_expert_rupees,
    expert_payout = v_expert_rupees,
    kshatryx_fee = v_kshatryx_net_rupees,
    field_partner_fee = 0,
    area_head_job_fee = v_area_head_rupees
  WHERE id = p_booking_id;

  -- Expert wallet movement (same logic as before).
  IF v_booking.expert_id IS NOT NULL THEN
    SELECT * INTO v_expert FROM public.experts WHERE id = v_booking.expert_id;
    IF FOUND THEN
      IF v_booking.payment_mode IN ('cash_after_service', 'cash') THEN
        UPDATE public.experts
        SET wallet_balance = COALESCE(wallet_balance, 0) - v_cut_from_expert_rupees
        WHERE id = v_expert.id;
        INSERT INTO public.wallet_transactions (
          user_id, user_type, amount, transaction_type, reason, description, booking_id, business_partner_id
        ) VALUES (
          v_expert.id, 'expert', v_cut_from_expert_rupees, 'debit', 'commission_cut',
          'Job #' || left(p_booking_id::text, 8), p_booking_id, NULL
        );
      ELSE
        UPDATE public.experts
        SET wallet_balance = COALESCE(wallet_balance, 0) + v_expert_rupees
        WHERE id = v_expert.id;
        INSERT INTO public.wallet_transactions (
          user_id, user_type, amount, transaction_type, reason, description, booking_id, business_partner_id
        ) VALUES (
          v_expert.id, 'expert', v_expert_rupees, 'credit', 'online_payout',
          'Job #' || left(p_booking_id::text, 8), p_booking_id, NULL
        );
      END IF;
    END IF;
  END IF;

  -- Area-head commission credit (only when > 0 and head is on commission plan).
  IF v_area_head_pay_id IS NOT NULL AND v_area_head_paise > 0 THEN
    UPDATE public.area_heads
    SET wallet_balance = COALESCE(wallet_balance, 0) + v_area_head_rupees
    WHERE id = v_area_head_pay_id;
    INSERT INTO public.wallet_transactions (
      user_id, user_type, amount, transaction_type, reason, description, booking_id, business_partner_id
    ) VALUES (
      v_area_head_pay_id, 'area_head', v_area_head_rupees, 'credit', 'area_commission',
      'Job #' || left(p_booking_id::text, 8) || ' (' || COALESCE(v_booking.city, '') || ')',
      p_booking_id, NULL
    );
  END IF;

  -- Kshatryx ledger row (net of area-head cut).
  IF v_kshatryx_net_paise > 0 THEN
    INSERT INTO public.wallet_transactions (
      user_id, user_type, amount, transaction_type, reason, description, booking_id, business_partner_id
    ) VALUES (
      NULL, 'kshatryx', v_kshatryx_net_rupees, 'credit', 'kshatryx_gross_share',
      'Job #' || left(p_booking_id::text, 8), p_booking_id, NULL
    );
  END IF;

  -- NOTE: business_partners.wallet_balance / 'business_partner' ledger rows are
  -- intentionally NOT written anymore. The historical rows remain untouched.
END;
$$;
