-- =============================================================================
-- process_job_payout: 81% / 9.5% / 9.5% gross split in integer paise; Area Head
-- commission (employment_type = commission) is taken only from the partner pool
-- and capped so partner net is never negative.
-- Additive: business_partners.wallet_balance, bookings fee columns, wallet_transactions.business_partner_id,
-- wallet_transactions.user_id nullable for kshatryx rows.
-- =============================================================================

ALTER TABLE public.business_partners
  ADD COLUMN IF NOT EXISTS wallet_balance numeric NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.business_partners.wallet_balance IS 'Accrued field-partner share (rupees) from completed jobs (net of area-head commission from the 9.5% pool).';

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS kshatryx_fee numeric,
  ADD COLUMN IF NOT EXISTS field_partner_fee numeric,
  ADD COLUMN IF NOT EXISTS area_head_job_fee numeric;

COMMENT ON COLUMN public.bookings.kshatryx_fee IS 'Kshatryx gross share (rupees) for this job at completion.';
COMMENT ON COLUMN public.bookings.field_partner_fee IS 'Field partner net share (rupees) after area-head cut from partner pool.';
COMMENT ON COLUMN public.bookings.area_head_job_fee IS 'Area head commission (rupees) from partner pool for this job, if any.';

ALTER TABLE public.wallet_transactions
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.wallet_transactions
  ADD COLUMN IF NOT EXISTS business_partner_id uuid REFERENCES public.business_partners(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.wallet_transactions.business_partner_id IS 'When user_type = business_partner, the partner row this ledger line applies to.';

-- Allow new ledger identities (kshatryx, business_partner) if a legacy CHECK existed.
ALTER TABLE public.wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_user_type_check;

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
  v_kshatryx_paise bigint;
  v_expert_paise bigint;
  v_partner_pool_paise bigint;
  v_area_head_paise bigint;
  v_partner_net_paise bigint;
  v_kshatryx_rupees numeric;
  v_expert_rupees numeric;
  v_partner_net_rupees numeric;
  v_area_head_rupees numeric;
  v_cut_from_expert_rupees numeric;
  v_area_head_pay_id bigint;
  v_partner_id uuid;
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

  v_kshatryx_paise := (v_total_paise * 950) / 10000;
  v_expert_paise := (v_total_paise * 8100) / 10000;
  v_partner_pool_paise := v_total_paise - v_kshatryx_paise - v_expert_paise;

  v_area_head_paise := 0;
  v_area_head_pay_id := NULL;
  IF v_booking.area_head_id IS NOT NULL THEN
    SELECT * INTO v_area_head
    FROM public.area_heads
    WHERE id = v_booking.area_head_id AND status = 'active';
    IF FOUND AND v_area_head.employment_type = 'commission' THEN
      v_area_head_paise := floor(v_total_paise::numeric * COALESCE(v_area_head.compensation_value, 0) / 100.0)::bigint;
      IF v_area_head_paise > v_partner_pool_paise THEN
        v_area_head_paise := v_partner_pool_paise;
      END IF;
      v_area_head_pay_id := v_area_head.id;
    END IF;
  END IF;

  v_partner_net_paise := v_partner_pool_paise - v_area_head_paise;

  v_kshatryx_rupees := v_kshatryx_paise::numeric / 100.0;
  v_expert_rupees := v_expert_paise::numeric / 100.0;
  v_partner_net_rupees := v_partner_net_paise::numeric / 100.0;
  v_area_head_rupees := v_area_head_paise::numeric / 100.0;
  v_cut_from_expert_rupees := (v_kshatryx_paise + v_partner_pool_paise)::numeric / 100.0;

  UPDATE public.bookings SET
    status = 'completed',
    platform_fee = v_cut_from_expert_rupees,
    expert_payout = v_expert_rupees,
    kshatryx_fee = v_kshatryx_rupees,
    field_partner_fee = v_partner_net_rupees,
    area_head_job_fee = v_area_head_rupees
  WHERE id = p_booking_id;

  v_partner_id := NULL;
  IF v_booking.expert_id IS NOT NULL THEN
    SELECT * INTO v_expert FROM public.experts WHERE id = v_booking.expert_id;
    IF FOUND THEN
      v_partner_id := v_expert.assigned_partner_id;
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

  IF v_kshatryx_paise > 0 THEN
    INSERT INTO public.wallet_transactions (
      user_id, user_type, amount, transaction_type, reason, description, booking_id, business_partner_id
    ) VALUES (
      NULL, 'kshatryx', v_kshatryx_rupees, 'credit', 'kshatryx_gross_share',
      'Job #' || left(p_booking_id::text, 8), p_booking_id, NULL
    );
  END IF;

  IF v_partner_net_paise > 0 AND v_partner_id IS NOT NULL THEN
    UPDATE public.business_partners
    SET wallet_balance = COALESCE(wallet_balance, 0) + v_partner_net_rupees
    WHERE id = v_partner_id;
    INSERT INTO public.wallet_transactions (
      user_id, user_type, amount, transaction_type, reason, description, booking_id, business_partner_id
    ) VALUES (
      NULL, 'business_partner', v_partner_net_rupees, 'credit', 'partner_gross_share',
      'Job #' || left(p_booking_id::text, 8), p_booking_id, v_partner_id
    );
  END IF;
END;
$$;
