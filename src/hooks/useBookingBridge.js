import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Booking bridge hook:
 * Creates booking rows from selected cart services and customer details.
 */
export function useBookingBridge() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submitBooking = useCallback(async ({
    userId,
    cartItems,
    bookingDate,
    timeSlot,
    customerName,
    customerPhone,
    address,
    city,
  }) => {
    if (!userId) return { ok: false, error: new Error('Please login to continue.') };
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { ok: false, error: new Error('No services selected for booking.') };
    }

    setSubmitting(true);
    setError(null);

    try {
      let matchedExpert = null;
      let resolvedStatus = 'pending';

      // Try auto-assignment first. If matching fails, we safely continue with pending booking.
      try {
        const normalizedCity = String(city || '').trim();
        if (normalizedCity) {
          const { data: expert, error: expertErr } = await supabase
            .from('experts')
            .select('id, city, is_verified')
            .ilike('city', normalizedCity)
            .eq('is_verified', true)
            .limit(1)
            .maybeSingle();

          if (expertErr) {
            console.error('[BookingBridge] Expert match query failed:', expertErr);
          } else if (expert?.id) {
            matchedExpert = expert;
            resolvedStatus = 'assigned';
          }
        }
      } catch (matchErr) {
        console.error('[BookingBridge] Expert auto-assignment error:', matchErr);
      }

      const rows = cartItems.map((item) => ({
        user_id: userId,
        customer_name: customerName,
        contact_name: customerName,
        contact_phone: customerPhone,
        service_name: item?.name || 'Service',
        total_amount: Number(item?.price) || 0,
        booking_date: bookingDate,
        scheduled_date: bookingDate,
        scheduled_time: timeSlot,
        address,
        city,
        status: resolvedStatus,
        expert_id: matchedExpert?.id || null,
        payment_mode: 'cash_after_service',
        payment_method: 'cash',
        payment_status: 'pending',
      }));

      const { error: insertErr } = await supabase.from('bookings').insert(rows);
      if (insertErr) throw insertErr;

      return {
        ok: true,
        count: rows.length,
        autoAssigned: Boolean(matchedExpert?.id),
        assignedExpertId: matchedExpert?.id || null,
      };
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error('[BookingBridge] Booking insert failed:', err);
      setError(err.message);
      return { ok: false, error: err };
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    submitting,
    error,
    submitBooking,
  };
}
