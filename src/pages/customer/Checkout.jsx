import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { MapPin, Calendar, CreditCard, ShieldCheck, CheckCircle, Navigation, Loader2, MapPinned, Home, Briefcase, Plus, Edit3 } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, convenienceFee, grandTotal, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [date, setDate] = useState('');

  // 🏠 Address States (Amazon/Blinkit Style)
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  
  // 📍 New Address Form States
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newCoords, setNewCoords] = useState({ lat: null, lng: null });
  const [newTag, setNewTag] = useState('Home');
  const [locationLoading, setLocationLoading] = useState(false);
  const [gpsError, setGpsError] = useState(false);

  useEffect(() => {
    if (cart.length === 0) navigate('/');
    
    const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login'); return; }
        setUser(user);

        // 🌟 Fetch All Saved Addresses
        const { data: addresses } = await supabase.from('user_addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        
        if (addresses && addresses.length > 0) {
            setSavedAddresses(addresses);
            setSelectedAddressId(addresses[0].id); // Select first by default
        } else {
            setShowNewForm(true); // Default show form if no address exists
        }
    };
    fetchUserData();
  }, [cart, navigate]);

  // 🚀 SMART GPS DETECTION
  const detectLocation = () => {
    if (!navigator.geolocation) {
        setGpsError(true);
        alert("GPS not supported. Please type manually.");
        return;
    }

    setLocationLoading(true); setGpsError(false);
    const timeoutId = setTimeout(() => {
        if (locationLoading) { setLocationLoading(false); setGpsError(true); alert("GPS taking too long. Please type manually."); }
    }, 6000);

    navigator.geolocation.getCurrentPosition(async (position) => {
        clearTimeout(timeoutId); 
        const { latitude, longitude } = position.coords;
        setNewCoords({ lat: latitude, lng: longitude });

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`, {
                headers: { 'User-Agent': 'KshatrApp/1.0' }
            });
            const data = await response.json();
            const addr = data.address;
            const fullAddress = [addr.road, addr.suburb, addr.city || addr.town, addr.state, addr.postcode].filter(Boolean).join(", ");
            setNewAddress(`House/Flat No: \nLandmark: \n${fullAddress}`);
        } catch (error) {
            setNewAddress("Location found. Please type your complete house address.");
        }
        setLocationLoading(false);
    }, () => {
        clearTimeout(timeoutId); setLocationLoading(false); setGpsError(true);
    });
  };

  const handleBooking = async () => {
    if (!date) return alert("⚠️ Please select a preferred Date!");

    let finalAddress = '';
    let finalLat = null;
    let finalLng = null;

    // 1️⃣ IF USING NEW ADDRESS FORM
    if (showNewForm) {
        if (!newAddress || newAddress.trim() === '') return alert("⚠️ Please enter your complete address.");
        if (!newCoords.lat) {
            const confirmNoGPS = window.confirm("⚠️ GPS is not locked. Proceed with manual address only?");
            if(!confirmNoGPS) return;
        }

        setLoading(true);
        // Save new address to Database permanently
        const { data: insertedAddress, error: addressError } = await supabase.from('user_addresses').insert([{
            user_id: user.id,
            tag: newTag,
            address: newAddress,
            latitude: newCoords.lat,
            longitude: newCoords.lng
        }]).select().single();

        if (addressError) { alert("Error saving address"); setLoading(false); return; }

        finalAddress = insertedAddress.address;
        finalLat = insertedAddress.latitude;
        finalLng = insertedAddress.longitude;
    } 
    // 2️⃣ IF USING SAVED ADDRESS
    else {
        if (!selectedAddressId) return alert("⚠️ Please select a delivery address.");
        const selected = savedAddresses.find(a => a.id === selectedAddressId);
        finalAddress = selected.address;
        finalLat = selected.latitude;
        finalLng = selected.longitude;
    }

    setLoading(true);
    try {
        for (const item of cart) {
            const { error } = await supabase.from('bookings').insert({
                user_id: user.id,
                service_name: item.name,
                total_amount: parseFloat(item.price) || 0,
                payment_mode: 'cash_after_service',
                payment_status: 'pending',
                booking_date: date,
                address: finalAddress, 
                latitude: finalLat,  
                longitude: finalLng, 
                status: 'pending'
            });
            if (error) throw error; 
        }

        setSuccess(true);
        setTimeout(() => { clearCart(); navigate('/bookings'); }, 2000);
    } catch (error) {
        alert("❌ Booking Failed: " + error.message); 
        setLoading(false);
    }
  };

  if (success) {
      return (
          <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
                  <CheckCircle size={40} className="text-white"/>
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">Booking Confirmed!</h1>
              <p className="text-slate-500 mb-8">Expert will arrive at your selected location.</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 pt-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
         
         {/* LEFT SIDE: ADDRESS & DETAILS */}
         <div className="space-y-6">
             <div>
                 <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="text-teal-500"/> Secure Checkout
                 </h1>
                 <p className="text-slate-400 text-sm">Where should we send the expert?</p>
             </div>

             {/* 🏠 SAVED ADDRESSES LIST (Blinkit Style) */}
             {!showNewForm && savedAddresses.length > 0 && (
                 <div className="space-y-3">
                     <div className="flex justify-between items-center mb-2">
                         <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Saved Addresses</h3>
                         <button onClick={() => setShowNewForm(true)} className="text-teal-600 font-bold text-xs flex items-center gap-1 hover:text-teal-700">
                             <Plus size={14}/> Add New
                         </button>
                     </div>
                     
                     {savedAddresses.map(addr => (
                         <div 
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                                selectedAddressId === addr.id ? 'bg-teal-50 border-teal-500 shadow-md' : 'bg-white border-slate-200 hover:border-teal-300'
                            }`}
                         >
                             <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                 selectedAddressId === addr.id ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-300'
                             }`}>
                                 {selectedAddressId === addr.id && <div className="w-2 h-2 bg-white rounded-full"/>}
                             </div>
                             <div className="w-full">
                                 <h3 className={`font-black text-sm flex items-center gap-2 ${selectedAddressId === addr.id ? 'text-teal-900' : 'text-slate-700'}`}>
                                    {addr.tag === 'Home' ? <Home size={14}/> : addr.tag === 'Work' ? <Briefcase size={14}/> : <MapPin size={14}/>} 
                                    {addr.tag}
                                 </h3>
                                 <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${selectedAddressId === addr.id ? 'text-teal-700' : 'text-slate-500'}`}>
                                     {addr.address}
                                 </p>
                             </div>
                         </div>
                     ))}
                 </div>
             )}

             {/* 📍 NEW ADDRESS FORM */}
             {showNewForm && (
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4">
                     <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                        <h3 className="font-black text-slate-800 flex items-center gap-2"><MapPin className="text-teal-500"/> Add New Address</h3>
                        {savedAddresses.length > 0 && (
                            <button onClick={() => setShowNewForm(false)} className="text-slate-400 hover:text-red-500 text-xs font-bold px-3 py-1 bg-slate-100 rounded-full">Cancel</button>
                        )}
                     </div>

                     {/* Tags: Home, Work, Other */}
                     <div className="flex gap-2 mb-4">
                         {['Home', 'Work', 'Other'].map(tag => (
                             <button 
                                key={tag} 
                                onClick={() => setNewTag(tag)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${newTag === tag ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                             >
                                 {tag}
                             </button>
                         ))}
                     </div>
                     
                     {/* GPS Button */}
                     <button 
                        onClick={detectLocation}
                        disabled={locationLoading}
                        className={`w-full mb-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border ${
                            newCoords.lat ? 'bg-green-50 text-green-700 border-green-200' : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                        }`}
                     >
                        {locationLoading ? <Loader2 size={16} className="animate-spin"/> : newCoords.lat ? <CheckCircle size={16}/> : <Navigation size={16}/>}
                        {locationLoading ? "Detecting GPS..." : newCoords.lat ? "GPS Locked Successfully 🎯" : "Detect My Current Location"}
                     </button>

                     <textarea 
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="House No, Building, Landmark, Area..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 outline-none h-28 resize-none"
                     />
                 </div>
             )}

             {/* 📅 Date Picker */}
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Calendar size={14}/> Preferred Service Date
                 </label>
                 <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                    min={new Date().toISOString().split('T')[0]}
                 />
             </div>
         </div>

         {/* RIGHT SIDE: ORDER SUMMARY */}
         <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 h-fit sticky top-28">
             <h2 className="text-lg font-black text-slate-900 mb-6">Order Summary</h2>
             
             <div className="space-y-4 mb-6">
                 {cart.map((item, i) => (
                     <div key={i} className="flex justify-between items-center text-sm">
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs">{i+1}</div>
                             <span className="font-bold text-slate-700">{item.name}</span>
                         </div>
                         <span className="font-bold text-slate-900">₹{item.price}</span>
                     </div>
                 ))}
             </div>

             <div className="border-t border-dashed border-slate-200 my-4"></div>

             <div className="space-y-2 mb-8">
                 <div className="flex justify-between text-slate-500 text-sm">
                     <span>Item Total</span><span>₹{cartTotal}</span>
                 </div>
                 <div className="flex justify-between text-slate-500 text-sm">
                     <span>Platform Fee</span><span className="text-green-600 font-bold">FREE</span>
                 </div>
                 <div className="flex justify-between text-xl font-black text-slate-900 mt-4 pt-4 border-t border-slate-100">
                     <span>To Pay</span><span>₹{grandTotal}</span>
                 </div>
             </div>

             <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3 mb-6">
                 <CreditCard className="text-blue-500 shrink-0"/>
                 <p className="text-xs font-bold text-blue-900">Pay via Cash/UPI directly to the expert after service.</p>
             </div>

             <button 
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
             >
                {loading ? <Loader2 className="animate-spin" size={18}/> : <ShieldCheck size={18}/>} 
                {loading ? 'Processing...' : 'Confirm Booking'}
             </button>
         </div>
      </div>
    </div>
  );
}