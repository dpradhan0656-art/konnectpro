import { getStoredUserCity, normalizeUserCity } from '../lib/persistUserCity';

export const BOOKING_STATUSES = Object.freeze({
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

export const PAYMENT_METHODS = Object.freeze({
  ONLINE: 'online',
  CASH: 'cash',
});

export const PAYMENT_MODES = Object.freeze({
  ONLINE_PREPAID: 'online_prepaid',
  CASH_AFTER_SERVICE: 'cash_after_service',
});

function normalizeText(value) {
  if (value == null) return '';
  return String(value).trim();
}

function normalizeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function resolveBookingCity(rawCity) {
  return normalizeUserCity(rawCity);
}

export function getStoredBookingCity() {
  return getStoredUserCity();
}

export function buildCanonicalBookingRow(input) {
  const paymentMethod =
    input?.paymentMethod === PAYMENT_METHODS.ONLINE
      ? PAYMENT_METHODS.ONLINE
      : PAYMENT_METHODS.CASH;
  const paymentMode =
    paymentMethod === PAYMENT_METHODS.ONLINE
      ? PAYMENT_MODES.ONLINE_PREPAID
      : PAYMENT_MODES.CASH_AFTER_SERVICE;

  const paymentStatus = normalizeText(input?.paymentStatus).toLowerCase();
  const finalPaymentStatus =
    paymentStatus === 'paid' || paymentStatus === 'failed'
      ? paymentStatus
      : 'pending';

  const bookingDate = normalizeText(input?.bookingDate);
  const scheduledDate = normalizeText(input?.scheduledDate) || bookingDate;
  const scheduledTime = normalizeText(input?.scheduledTime);
  const address = normalizeText(input?.address);
  const serviceName = normalizeText(input?.serviceName) || 'Service';
  const city = resolveBookingCity(input?.city);

  return {
    user_id: input?.userId,
    service_name: serviceName,
    total_amount: normalizeNumber(input?.totalAmount) || 0,
    booking_date: bookingDate,
    scheduled_date: scheduledDate || null,
    scheduled_time: scheduledTime || null,
    address,
    latitude: normalizeNumber(input?.latitude),
    longitude: normalizeNumber(input?.longitude),
    city,
    status: BOOKING_STATUSES.PENDING,
    payment_mode: paymentMode,
    payment_method: paymentMethod,
    payment_status: finalPaymentStatus,
    razorpay_payment_id: normalizeText(input?.razorpayPaymentId) || null,
    is_remote_booking: Boolean(input?.isRemoteBooking),
    contact_name: input?.isRemoteBooking ? normalizeText(input?.contactName) || null : null,
    contact_phone: input?.isRemoteBooking ? normalizeText(input?.contactPhone) || null : null,
  };
}

export async function insertCanonicalBookings(supabaseClient, rows) {
  const payload = Array.isArray(rows) ? rows : [rows];
  if (payload.length === 0) return { ok: true };
  const { error } = await supabaseClient.from('bookings').insert(payload);
  if (error) throw error;
  return { ok: true };
}
