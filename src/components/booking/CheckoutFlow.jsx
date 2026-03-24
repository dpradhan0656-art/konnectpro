import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Clock3, Loader2, MapPin, ShieldCheck, UserRound, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import { useBookingBridge } from '../../hooks/useBookingBridge';

const DAY_OPTIONS = [
  { id: 'today', label: 'Today', offset: 0 },
  { id: 'tomorrow', label: 'Tomorrow', offset: 1 },
];

const TIME_SLOTS = [
  'Morning (8 AM - 12 PM)',
  'Afternoon (12 PM - 4 PM)',
  'Evening (4 PM - 8 PM)',
];

const CITY_OPTIONS = ['Bhopal', 'Jabalpur', 'Sagar', 'Jhansi', 'Indore', 'Delhi', 'Mumbai', 'Pune'];

function toDateFromOffset(offset) {
  const dt = new Date();
  dt.setDate(dt.getDate() + offset);
  return dt.toISOString().split('T')[0];
}

function SuccessState({ autoAssigned }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 px-6">
      <div className="w-full max-w-md rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center shadow-2xl shadow-emerald-500/20">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle2 className="h-12 w-12 text-emerald-300" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-black text-white">Booking Confirmed</h2>
        <p className="mt-2 text-sm text-slate-300">
          {autoAssigned
            ? 'An expert has been assigned to your booking!'
            : 'Your request is now in the queue. We will match you with the best available expert.'}
        </p>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
          Redirecting to Home...
        </p>
      </div>
    </div>
  );
}

export default function CheckoutFlow() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { submitting, error, submitBooking } = useBookingBridge();

  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [autoAssigned, setAutoAssigned] = useState(false);

  const [selectedDay, setSelectedDay] = useState(DAY_OPTIONS[0].id);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(CITY_OPTIONS[0]);
  const [validationError, setValidationError] = useState('');

  const bookingDate = useMemo(() => {
    const day = DAY_OPTIONS.find((d) => d.id === selectedDay) || DAY_OPTIONS[0];
    return toDateFromOffset(day.offset);
  }, [selectedDay]);

  useEffect(() => {
    if (!Array.isArray(cart) || cart.length === 0) {
      navigate('/cart', { replace: true });
      return;
    }

    let mounted = true;
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!mounted) return;
      if (!authUser) {
        navigate('/login', { replace: true });
        return;
      }
      setUser(authUser);
      setCustomerName(authUser.user_metadata?.name || '');
      setCustomerPhone(authUser.user_metadata?.phone || '');
    });

    return () => {
      mounted = false;
    };
  }, [cart, navigate]);

  useEffect(() => {
    if (!success) return;
    const id = setTimeout(() => {
      clearCart();
      navigate('/', { replace: true });
    }, 2800);
    return () => clearTimeout(id);
  }, [success, clearCart, navigate]);

  const handleNext = () => {
    setValidationError('');
    if (step === 2) {
      if (!customerName.trim()) {
        setValidationError('Please enter full name.');
        return;
      }
      if (!/^\d{10}$/.test(customerPhone.trim())) {
        setValidationError('Please enter a valid 10-digit phone number.');
        return;
      }
      if (!address.trim()) {
        setValidationError('Please enter complete service address.');
        return;
      }
      if (!city.trim()) {
        setValidationError('Please select city.');
        return;
      }
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const handleBack = () => {
    setValidationError('');
    setStep((s) => Math.max(1, s - 1));
  };

  const handleConfirm = async () => {
    setValidationError('');
    const res = await submitBooking({
      userId: user?.id,
      cartItems: cart,
      bookingDate,
      timeSlot: selectedSlot,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      address: address.trim(),
      city: city.trim(),
    });
    if (res?.ok) {
      setAutoAssigned(Boolean(res?.autoAssigned));
      setSuccess(true);
      return;
    }
    setValidationError(res?.error?.message || 'Unable to confirm booking right now.');
  };

  if (success) {
    return <SuccessState autoAssigned={autoAssigned} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-32 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-black text-white">Complete Your Booking</h1>
          <span className="rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-teal-200">
            Step {step} of 3
          </span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 md:p-8 backdrop-blur">
          {/* Step Indicators */}
          <div className="mb-8 grid grid-cols-3 gap-2 text-center">
            {['When', 'Where', 'Confirm'].map((label, idx) => {
              const active = step >= idx + 1;
              return (
                <div
                  key={label}
                  className={`rounded-2xl border px-2 py-3 text-xs font-bold uppercase tracking-widest ${
                    active
                      ? 'border-teal-300/40 bg-teal-300/15 text-teal-200'
                      : 'border-slate-700 bg-slate-800 text-slate-400'
                  }`}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-white mb-3">Step 1: Select Date</h2>
                <div className="grid grid-cols-2 gap-3">
                  {DAY_OPTIONS.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setSelectedDay(day.id)}
                      className={`min-h-[52px] rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                        selectedDay === day.id
                          ? 'border-teal-300/40 bg-teal-300/15 text-teal-100'
                          : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">Time Slot</h3>
                <div className="grid gap-3">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`min-h-[50px] rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        selectedSlot === slot
                          ? 'border-teal-300/40 bg-teal-300/15 text-teal-100'
                          : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <Clock3 className="mr-2 inline h-4 w-4" />
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-black text-white">Step 2: Customer & Address Details</h2>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Full Name</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full min-h-[50px] rounded-2xl border border-slate-700 bg-slate-800 px-4 text-white outline-none focus:border-teal-400"
                  placeholder="Enter full name"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Phone Number</span>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                  className="w-full min-h-[50px] rounded-2xl border border-slate-700 bg-slate-800 px-4 text-white outline-none focus:border-teal-400"
                  placeholder="10-digit mobile number"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Complete Address</span>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-teal-400 min-h-[110px]"
                  placeholder="House/Flat No, Landmark, Street, Area"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">City</span>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full min-h-[50px] rounded-2xl border border-slate-700 bg-slate-800 px-4 text-white outline-none focus:border-teal-400"
                >
                  {CITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-black text-white">Step 3: Confirm Booking</h2>
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-teal-200 mb-2">Selected Services</p>
                <div className="space-y-2">
                  {cart.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-center justify-between text-sm">
                      <span className="text-slate-100">{item.name}</span>
                      <span className="font-bold text-white">₹{Number(item.price) || 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 text-sm text-slate-200 space-y-2">
                <p><Clock3 className="mr-2 inline h-4 w-4 text-teal-300" /> {bookingDate} • {selectedSlot}</p>
                <p><UserRound className="mr-2 inline h-4 w-4 text-teal-300" /> {customerName} • {customerPhone}</p>
                <p><MapPin className="mr-2 inline h-4 w-4 text-teal-300" /> {address}, {city}</p>
                <p className="pt-2 text-base font-black text-white">Total: ₹{cartTotal}</p>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full min-h-[54px] rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-black uppercase tracking-wider shadow-[0_18px_40px_-20px_rgba(20,184,166,0.9)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                {submitting ? 'Confirming Booking...' : 'Confirm Booking'}
              </button>
            </div>
          )}

          {(validationError || error) ? (
            <div className="mt-5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {validationError || error}
            </div>
          ) : null}

          <div className="mt-7 flex items-center justify-between">
            <button
              type="button"
              onClick={step === 1 ? () => navigate('/cart') : handleBack}
              className="min-h-[46px] rounded-xl border border-slate-600 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-slate-800"
            >
              {step === 1 ? 'Back to Cart' : 'Back'}
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="min-h-[46px] rounded-xl bg-slate-100 px-5 py-2 text-sm font-black text-slate-900 hover:bg-white flex items-center gap-2"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="text-[11px] font-bold uppercase tracking-widest text-teal-200 flex items-center gap-1">
                <Zap className="h-4 w-4" /> Final Step
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
