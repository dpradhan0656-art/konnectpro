-- =============================================================================
-- Security hardening: expert workflow write guards + payout RPC caller checks
-- =============================================================================
-- Goals:
-- 1) A logged-in expert can only complete their own assigned booking via RPC.
-- 2) Direct expert booking updates can only change operational status.
-- 3) Direct expert profile updates cannot self-approve, move wallet balance,
--    change role/linkage fields, or edit reputation/payout-controlled columns.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.kshatr_is_admin_or_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    OR EXISTS (SELECT 1 FROM public.app_admin WHERE user_id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.kshatr_is_admin_or_service_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.kshatr_is_admin_or_service_role() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.guard_expert_self_update_sensitive_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_old jsonb;
  v_new jsonb;
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;

  IF COALESCE(current_setting('app.kshatr_internal_payout', true), '') = 'on'
     OR public.kshatr_is_admin_or_service_role() THEN
    RETURN NEW;
  END IF;

  IF v_actor IS NULL OR OLD.user_id IS DISTINCT FROM v_actor THEN
    RETURN NEW;
  END IF;

  -- Experts may resubmit a rejected profile for review, but never self-approve.
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NOT (OLD.status = 'rejected' AND NEW.status = 'pending') THEN
    RAISE EXCEPTION 'Experts cannot change approval status directly';
  END IF;

  v_old := to_jsonb(OLD)
    - ARRAY[
      'is_active',
      'is_online',
      'latitude',
      'longitude',
      'photo_url',
      'aadhar_number',
      'experience_years',
      'is_kyc_submitted',
      'kyc_status',
      'kyc_verification_status',
      'expo_push_token',
      'expo_push_token_updated_at',
      'expo_ui_lang',
      'status',
      'updated_at'
    ]::text[];

  v_new := to_jsonb(NEW)
    - ARRAY[
      'is_active',
      'is_online',
      'latitude',
      'longitude',
      'photo_url',
      'aadhar_number',
      'experience_years',
      'is_kyc_submitted',
      'kyc_status',
      'kyc_verification_status',
      'expo_push_token',
      'expo_push_token_updated_at',
      'expo_ui_lang',
      'status',
      'updated_at'
    ]::text[];

  IF v_old IS DISTINCT FROM v_new THEN
    RAISE EXCEPTION 'Experts cannot update protected profile, wallet, approval, or linkage fields directly';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS experts_guard_self_update_sensitive_columns ON public.experts;
CREATE TRIGGER experts_guard_self_update_sensitive_columns
  BEFORE UPDATE ON public.experts
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_expert_self_update_sensitive_columns();

CREATE OR REPLACE FUNCTION public.guard_booking_expert_direct_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_old jsonb;
  v_new jsonb;
  v_is_assigned_expert boolean;
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;

  IF COALESCE(current_setting('app.kshatr_internal_payout', true), '') = 'on'
     OR public.kshatr_is_admin_or_service_role() THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.experts e
    WHERE e.id = OLD.expert_id
      AND e.user_id = v_actor
  ) INTO v_is_assigned_expert;

  IF NOT v_is_assigned_expert THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status NOT IN ('accepted', 'in_progress') THEN
    RAISE EXCEPTION 'Experts can only move assigned jobs to accepted or in_progress directly';
  END IF;

  v_old := to_jsonb(OLD) - ARRAY['status', 'updated_at']::text[];
  v_new := to_jsonb(NEW) - ARRAY['status', 'updated_at']::text[];

  IF v_old IS DISTINCT FROM v_new THEN
    RAISE EXCEPTION 'Experts cannot update protected booking fields directly; use the approved RPC';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_guard_expert_direct_update ON public.bookings;
CREATE TRIGGER bookings_guard_expert_direct_update
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_booking_expert_direct_update();

CREATE OR REPLACE FUNCTION public.process_job_payout(p_booking_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.process_job_payout_with_final_amount(p_booking_id, NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.process_job_payout_with_final_amount(
  p_booking_id bigint,
  p_final_amount numeric DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_booking record;
  v_expert record;
  v_area_head record;
  v_total numeric;
  v_total_paise bigint;
  v_expert_paise bigint;
  v_kshatryx_pool_paise bigint;
  v_area_head_paise bigint;
  v_kshatryx_net_paise bigint;
  v_expert_rupees numeric;
  v_kshatryx_net_rupees numeric;
  v_area_head_rupees numeric;
  v_cut_from_expert_rupees numeric;
  v_area_head_pay_id uuid;
BEGIN
  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found: %', p_booking_id;
  END IF;
  IF v_booking.status = 'completed' THEN
    RAISE EXCEPTION 'Booking already completed';
  END IF;

  IF NOT public.kshatr_is_admin_or_service_role() THEN
    IF v_actor IS NULL THEN
      RAISE EXCEPTION 'Authentication required';
    END IF;
    IF v_booking.expert_id IS NULL THEN
      RAISE EXCEPTION 'Booking has no assigned expert';
    END IF;
    SELECT * INTO v_expert
    FROM public.experts
    WHERE id = v_booking.expert_id
      AND user_id = v_actor;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'You can only complete your own assigned booking';
    END IF;
  END IF;

  IF p_final_amount IS NOT NULL AND p_final_amount <= 0 THEN
    RAISE EXCEPTION 'Final amount must be greater than zero';
  END IF;

  v_total := COALESCE(p_final_amount, v_booking.final_amount, v_booking.total_amount, 0);
  v_total_paise := round(v_total * 100)::bigint;
  IF v_total_paise < 0 THEN
    v_total_paise := 0;
  END IF;

  v_expert_paise := (v_total_paise * 8000) / 10000;
  v_kshatryx_pool_paise := v_total_paise - v_expert_paise;

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
  v_cut_from_expert_rupees := v_kshatryx_pool_paise::numeric / 100.0;

  PERFORM set_config('app.kshatr_internal_payout', 'on', true);

  UPDATE public.bookings SET
    status = 'completed',
    final_amount = COALESCE(p_final_amount, final_amount),
    total_amount = v_total,
    platform_fee = v_cut_from_expert_rupees,
    expert_payout = v_expert_rupees,
    kshatryx_fee = v_kshatryx_net_rupees,
    field_partner_fee = 0,
    area_head_job_fee = v_area_head_rupees
  WHERE id = p_booking_id;

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

  IF v_kshatryx_net_paise > 0 THEN
    INSERT INTO public.wallet_transactions (
      user_id, user_type, amount, transaction_type, reason, description, booking_id, business_partner_id
    ) VALUES (
      NULL, 'kshatryx', v_kshatryx_net_rupees, 'credit', 'kshatryx_gross_share',
      'Job #' || left(p_booking_id::text, 8), p_booking_id, NULL
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.process_job_payout(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_job_payout_with_final_amount(bigint, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_job_payout(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_job_payout_with_final_amount(bigint, numeric) TO authenticated;

COMMENT ON FUNCTION public.process_job_payout(bigint) IS
  'Completes a booking and posts payout rows. Hardened: caller must be admin/service_role or the assigned expert.';
COMMENT ON FUNCTION public.process_job_payout_with_final_amount(bigint, numeric) IS
  'Completes an assigned booking with final bill amount. Hardened: caller must be admin/service_role or the assigned expert.';

-- Private KYC document bucket for Aadhaar / identity scans. Profile photos stay
-- in expert-photos; sensitive documents move here and are viewed through signed URLs.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'expert-kyc-documents',
  'expert-kyc-documents',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "expert_kyc_documents_select_scoped" ON storage.objects;
CREATE POLICY "expert_kyc_documents_select_scoped"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'expert-kyc-documents'
    AND (
      public.kshatr_is_admin_or_service_role()
      OR EXISTS (
        SELECT 1
        FROM public.experts e
        WHERE e.user_id = auth.uid()
          AND e.id::text = (storage.foldername(name))[2]
      )
    )
  );

DROP POLICY IF EXISTS "expert_kyc_documents_insert_scoped" ON storage.objects;
CREATE POLICY "expert_kyc_documents_insert_scoped"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'expert-kyc-documents'
    AND (storage.foldername(name))[1] = 'experts'
    AND (
      public.kshatr_is_admin_or_service_role()
      OR EXISTS (
        SELECT 1
        FROM public.experts e
        WHERE e.user_id = auth.uid()
          AND e.id::text = (storage.foldername(name))[2]
      )
    )
  );

DROP POLICY IF EXISTS "expert_kyc_documents_update_scoped" ON storage.objects;
CREATE POLICY "expert_kyc_documents_update_scoped"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'expert-kyc-documents'
    AND (
      public.kshatr_is_admin_or_service_role()
      OR EXISTS (
        SELECT 1
        FROM public.experts e
        WHERE e.user_id = auth.uid()
          AND e.id::text = (storage.foldername(name))[2]
      )
    )
  )
  WITH CHECK (
    bucket_id = 'expert-kyc-documents'
    AND (
      public.kshatr_is_admin_or_service_role()
      OR EXISTS (
        SELECT 1
        FROM public.experts e
        WHERE e.user_id = auth.uid()
          AND e.id::text = (storage.foldername(name))[2]
      )
    )
  );
