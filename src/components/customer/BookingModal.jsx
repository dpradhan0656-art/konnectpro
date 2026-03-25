import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  buildCanonicalBookingRow,
  getStoredBookingCity,
  insertCanonicalBookings,
  PAYMENT_METHODS,
} from '../../services/canonicalBookingService';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  Phone,
  ArrowRight,
  Crosshair,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(false);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function BookingModal({ service, onClose, user }) {
  const navigate = useNavigate();

  const [step] = useState(user ? 'booking' : 'login');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [loginSent, setLoginSent] = useState(false);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'online' | 'cash'

  const [isRemoteBooking, setIsRemoteBooking] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat.toString());
        setLongitude(lng.toString());

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`
          );
          const data = await response.json();

          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`GPS Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          }
        } catch (error) {
          console.error('Address fetch failed:', error);
          setAddress(`GPS Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert('Location access denied. Please enable GPS.');
        setLoading(false);
      }
    );
  };

  const handleQuickLogin = async () => {
    if (!email) {
      alert('Please enter email!');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      alert('Error: ' + error.message);
    } else {
      setLoginSent(true);
      alert(`Check your email (${email}) for the login link!`);
    }
    setLoading(false);
  };

  const saveBooking = async (mode, payStatus, razorpayPaymentId = null) => {
    setLoading(true);
    const bookingCity = getStoredBookingCity();

    const latParsed =
      latitude !== '' && latitude != null ? parseFloat(String(latitude).trim()) : NaN;
    const lngParsed =
      longitude !== '' && longitude != null ? parseFloat(String(longitude).trim()) : NaN;
    const latitudeRow = Number.isFinite(latParsed) ? latParsed : null;
    const longitudeRow = Number.isFinite(lngParsed) ? lngParsed : null;

    try {
      /*
       * OLD insert payload (pre-Phase-1): used customer_address + gps_coordinates instead of
       * aligning with Checkout on `address` / `latitude` / `longitude`.
       *
       * const { error } = await supabase.from('bookings').insert({
       *   user_id: user?.id,
       *   customer_name: user?.user_metadata?.name || 'Guest User',
       *   service_name: service.name,
       *   price: service.price,
       *   status: mode === 'online' ? 'Confirmed' : 'Pending',
       *   scheduled_date: date,
       *   scheduled_time: time,
       *   customer_address: address,
       *   gps_coordinates: gpsCoords,
       *   latitude: latitude ? parseFloat(latitude) : null,
       *   longitude: longitude ? parseFloat(longitude) : null,
       *   is_remote_booking: isRemoteBooking,
       *   contact_name: isRemoteBooking ? contactName : null,
       *   contact_phone: isRemoteBooking ? contactPhone : null,
       *   payment_mode: mode === 'online' ? 'online' : 'cash',
       *   payment_method: mode,
       *   payment_status: payStatus,
       *   transaction_id: razorpayPaymentId,
       *   razorpay_payment_id: razorpayPaymentId,
       *   company_commission: companyPart,
       *   expert_earnings: expertPart,
       * });
       */

      const paymentMethod =
        mode === PAYMENT_METHODS.ONLINE ? PAYMENT_METHODS.ONLINE : PAYMENT_METHODS.CASH;
      const row = buildCanonicalBookingRow({
        userId: user?.id,
        serviceName: service?.name,
        totalAmount: service?.price,
        bookingDate: date,
        scheduledDate: date,
        scheduledTime: time,
        address,
        latitude: latitudeRow,
        longitude: longitudeRow,
        city: bookingCity,
        paymentMethod,
        paymentStatus: payStatus,
        razorpayPaymentId,
        isRemoteBooking,
        contactName,
        contactPhone,
      });
      await insertCanonicalBookings(supabase, row);
      alert(`✅ Booking Confirmed via ${mode === 'online' ? 'ONLINE' : 'CASH'}!`);
      onClose();
      navigate('/bookings');
    } catch (error) {
      console.error(error);
      alert('Booking Failed!');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (!service?.price) {
      alert('Invalid amount for payment.');
      return;
    }

    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded || !window.Razorpay) {
      alert('Unable to load Razorpay SDK. Check connection and try again.');
      return;
    }

    const amountInPaise = service.price * 100;

    const options = {
      // TEST key (commented): 'rzp_test_YourDummyKeyHere'
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Kshatr Home Services',
      description: `Payment for ${service.name}`,
      handler: async function (response) {
        await saveBooking(PAYMENT_METHODS.ONLINE, 'paid', response.razorpay_payment_id);
      },
      prefill: {
        name: user?.user_metadata?.name || 'Customer',
        email: user?.email,
        contact: contactPhone || '',
      },
      modal: {
        ondismiss: () => {
          alert('Payment window closed. No booking created.');
        },
      },
      theme: { color: '#0f766e' },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        alert('Payment failed. Please try again or choose Cash After Service.');
      });
      rzp.open();
    } catch {
      alert('Unable to open payment window. Please try again.');
    }
  };

  const handleConfirm = async () => {
    if (!date || !time) {
      alert('Select Date & Time');
      return;
    }
    if (!address) {
      alert('Enter address or use GPS');
      return;
    }

    if (isRemoteBooking) {
      if (!contactName || !contactPhone) {
        alert("Enter contact person's name and phone number");
        return;
      }
      if (!latitude || !longitude) {
        alert('Please drop a map pin or enter latitude & longitude for the service address.');
        return;
      }
    }

    if (paymentMethod === 'online') {
      await handleOnlinePayment();
    } else {
      await saveBooking(PAYMENT_METHODS.CASH, 'pending', null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-slate-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 bg-slate-800/80 p-2 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors"
        >
          <X size={18} />
        </button>

        {step === 'login' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-400 border border-teal-500/40">
              <Phone size={28} />
            </div>
            <h2 className="text-xl font-black text-white">Quick Login</h2>
            <p className="text-xs text-slate-400 mb-6">
              Enter your email to book <b>{service.name}</b> instantly.
            </p>

            {!loginSent ? (
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter Email ID"
                  className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl font-medium text-sm outline-none focus:border-teal-500 placeholder-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  onClick={handleQuickLogin}
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send Login Link'}
                </button>
              </div>
            ) : (
              <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/40 text-emerald-100">
                <p className="font-bold text-sm flex items-center justify-center gap-2">
                  <ShieldCheck size={16} /> Link Sent!
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 text-[11px] font-bold underline text-emerald-200"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'booking' && (
          <div className="space-y-5">
            <div className="mb-1">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Calendar size={18} className="text-teal-400" />
                Confirm Details
              </h2>
              <p className="text-[11px] font-bold text-teal-400 uppercase tracking-widest mt-1">
                {service.name}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                  <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
                    <Calendar size={10} /> Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-transparent font-semibold text-sm text-white outline-none"
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                  <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
                    <Clock size={10} /> Time
                  </label>
                  <input
                    type="time"
                    className="w-full bg-transparent font-semibold text-sm text-white outline-none"
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                  <MapPin size={10} /> Service Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-transparent font-medium text-slate-100 outline-none text-sm resize-none pr-9"
                  rows="2"
                  placeholder="Type full address (floor, landmark, city)..."
                />
                <button
                  type="button"
                  onClick={handleGPSLocation}
                  className="absolute right-2 bottom-2 p-2 bg-teal-500/15 text-teal-300 rounded-full hover:bg-teal-500/25 transition"
                >
                  <Crosshair size={16} />
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-teal-400" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-200">
                      Booking for someone else?
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Use for parents / relatives at another address.
                    </p>
                  </div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isRemoteBooking}
                    onChange={(e) => setIsRemoteBooking(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-slate-700 rounded-full peer-checked:bg-teal-500 transition-colors relative">
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
                  </div>
                </label>
              </div>

              {isRemoteBooking && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                    <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
                      <User size={10} /> Contact Name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-transparent text-sm text-white font-medium outline-none placeholder-slate-500"
                      placeholder="Person at service address"
                    />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                    <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
                      <Phone size={10} /> Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-transparent text-sm text-white font-medium outline-none placeholder-slate-500"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-teal-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">
                      Manual Location Pin
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">
                  Open Google Maps, long-press to drop a pin, then copy the latitude & longitude and
                  paste here. Perfect for remote bookings from another city/country.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-teal-500 placeholder-slate-500"
                    placeholder="Lat e.g. 23.1827"
                  />
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-teal-500 placeholder-slate-500"
                    placeholder="Long e.g. 79.9864"
                  />
                </div>
                {latitude && longitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[10px] text-teal-400 hover:text-teal-300"
                  >
                    <ArrowRight size={12} /> Preview in Google Maps
                  </a>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <CreditCard size={10} className="text-teal-400" />
                  Payment Method
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online')}
                    className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      paymentMethod === 'online'
                        ? 'border-teal-500 bg-teal-500/10 text-teal-300'
                        : 'border-slate-700 text-slate-300'
                    }`}
                  >
                    <CreditCard size={14} />
                    Pay Online Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-teal-500 bg-slate-800 text-teal-300'
                        : 'border-slate-700 text-slate-300'
                    }`}
                  >
                    <ShieldCheck size={14} />
                    Cash After Service
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Total</p>
                <p className="text-2xl font-black text-white flex items-center gap-1">
                  ₹{service.price}
                </p>
              </div>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.18em] flex items-center gap-2 shadow-lg shadow-teal-900/40 transition-all disabled:opacity-60"
              >
                {loading ? (
                  'Processing...'
                ) : paymentMethod === 'online' ? (
                  <>
                    Pay Now <ArrowRight size={14} />
                  </>
                ) : (
                  <>
                    Book Now <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
            {loading && (
              <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400/80">
                Powered by Kshatryx Technologies
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}