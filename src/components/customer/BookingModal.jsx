import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Calendar, Clock, MapPin, CreditCard, ShieldCheck, Phone, ArrowRight, Crosshair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BookingModal({ service, onClose, user }) {
  const navigate = useNavigate();
  
  // States
  const [step, setStep] = useState(user ? 'booking' : 'login');
  const [loading, setLoading] = useState(false);
  
  // Login States
  const [email, setEmail] = useState('');
  const [loginSent, setLoginSent] = useState(false);

  // Booking States
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [paymentMode, setPaymentMode] = useState('cash');

  // --- 1. SMART GPS LOCATION (With English Force Fix) ---
  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }
    setLoading(true);
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            const coords = `${latitude},${longitude}`;
            setGpsCoords(coords);
            
            try {
                // 🌍 ADDED "&accept-language=en" TO FORCE ENGLISH
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
                const data = await response.json();
                
                if (data && data.display_name) {
                    setAddress(data.display_name); // ✅ Pure English Address
                } else {
                    setAddress(`GPS Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
                }
            } catch (error) {
                console.error("Address fetch failed:", error);
                setAddress(`GPS Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
            } finally {
                setLoading(false);
            }
        },
        (error) => {
            alert("Location access denied. Please enable GPS.");
            setLoading(false);
        }
    );
  };

  // --- 2. SMART LOGIN LOGIC ---
  const handleQuickLogin = async () => {
    if (!email) return alert("Please enter email!");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert("Error: " + error.message);
    else {
        setLoginSent(true);
        alert(`Check your email (${email}) for the login link!`);
    }
    setLoading(false);
  };

  // --- 3. RAZORPAY LOGIC ---
  const handleOnlinePayment = () => {
    if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Check internet connection.");
        return;
    }
    const options = {
        key: "rzp_test_YOUR_KEY_HERE", // 🔴 APNI KEY DALEIN
        amount: service.price * 100,
        currency: "INR",
        name: "Kshatr",
        description: `Payment for ${service.name}`,
        handler: async function (response) {
            await saveBooking('online', 'Paid', response.razorpay_payment_id);
        },
        prefill: {
            name: user?.user_metadata?.name || "Customer",
            email: user?.email,
            contact: "9999999999"
        },
        theme: { color: "#0d9488" }
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  // --- 4. SAVE BOOKING ---
  const saveBooking = async (mode, payStatus, txId = null) => {
    setLoading(true);
    const companyPart = (service.price * 0.19).toFixed(2);
    const expertPart = (service.price * 0.81).toFixed(2);

    try {
      const { error } = await supabase.from('bookings').insert({
        user_id: user?.id,
        customer_name: user?.user_metadata?.name || 'Guest User',
        service_name: service.name,
        price: service.price,
        status: mode === 'online' ? 'Confirmed' : 'Pending',
        scheduled_date: date,
        scheduled_time: time,
        customer_address: address,
        gps_coordinates: gpsCoords,
        payment_mode: mode,
        payment_status: payStatus,
        transaction_id: txId,
        company_commission: companyPart,
        expert_earnings: expertPart
      });

      if (error) throw error;
      alert(`✅ Booking Confirmed via ${mode.toUpperCase()}!`);
      onClose();
      navigate('/bookings');

    } catch (error) {
      console.error(error);
      alert("Booking Failed!");
    } finally {
      setLoading(false);
    }
  };

  // Main Confirm Handler
  const handleConfirm = () => {
    if (!date || !time) return alert("Select Date & Time");
    if (!address) return alert("Enter Address or use GPS");

    if (paymentMode === 'online') {
        handleOnlinePayment();
    } else {
        saveBooking('cash', 'Pending', null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 bg-gray-100 p-2 rounded-full hover:bg-red-50 text-slate-500 hover:text-red-50">
            <X size={20} />
        </button>

        {/* --- VIEW 1: LOGIN --- */}
        {step === 'login' && (
            <div className="text-center py-4">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600">
                    <Phone size={28} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Quick Login</h2>
                <p className="text-xs text-slate-400 mb-6">Enter your email to book <b>{service.name}</b> instantly.</p>

                {!loginSent ? (
                    <div className="space-y-4">
                        <input type="email" placeholder="Enter Email ID" className="w-full bg-gray-50 border p-3 rounded-xl font-bold" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <button onClick={handleQuickLogin} disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">
                            {loading ? 'Sending...' : 'Send Login Link'}
                        </button>
                    </div>
                ) : (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-green-800">
                        <p className="font-bold text-sm">✅ Link Sent!</p>
                        <button onClick={onClose} className="mt-3 text-xs font-bold underline">Close</button>
                    </div>
                )}
            </div>
        )}

        {/* --- VIEW 2: BOOKING --- */}
        {step === 'booking' && (
            <div>
                <div className="mb-6">
                    <h2 className="text-xl font-black text-slate-900">Confirm Details</h2>
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">{service.name}</p>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-2xl"><label className="text-[10px] font-bold uppercase">Date</label><input type="date" className="w-full bg-transparent font-bold text-sm" onChange={(e) => setDate(e.target.value)} /></div>
                        <div className="bg-gray-50 p-3 rounded-2xl"><label className="text-[10px] font-bold uppercase">Time</label><input type="time" className="w-full bg-transparent font-bold text-sm" onChange={(e) => setTime(e.target.value)} /></div>
                    </div>

                    {/* Address + GPS Button */}
                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 relative">
                         <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1"><MapPin size={10}/> Address</label>
                         <textarea 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-transparent font-bold text-slate-700 outline-none text-sm resize-none pr-8"
                            rows="2"
                            placeholder="Type address or use GPS..."
                         />
                         <button onClick={handleGPSLocation} className="absolute right-2 bottom-2 p-2 bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200 transition">
                             <Crosshair size={18} />
                         </button>
                    </div>

                    <div className="flex gap-3">
                         <button onClick={()=>setPaymentMode('online')} className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-bold uppercase ${paymentMode==='online'?'border-teal-500 bg-teal-50 text-teal-700':'border-gray-100'}`}>Pay Online</button>
                         <button onClick={()=>setPaymentMode('cash')} className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-bold uppercase ${paymentMode==='cash'?'border-teal-500 bg-teal-50 text-teal-700':'border-gray-100'}`}>Cash</button>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div><p className="text-[10px] font-bold uppercase">Total</p><p className="text-2xl font-black">₹{service.price}</p></div>
                    <button onClick={handleConfirm} disabled={loading} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-600 transition-all">
                        {loading ? 'Processing...' : (paymentMode === 'online' ? 'Pay Now' : 'Confirm')}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}