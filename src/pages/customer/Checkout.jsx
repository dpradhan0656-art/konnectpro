import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Calendar,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  Navigation,
  Loader2,
  MapPinned,
  Home,
  Briefcase,
  Plus,
  Edit3,
  User,
  Phone,
  Search,
  Crosshair,
} from 'lucide-react';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapFocusController({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    map.flyTo([lat, lng], 18, { animate: true, duration: 0.7 });
  }, [lat, lng, map]);

  return null;
}

function MapClickHandler({ onPick }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPick(lat, lng);
      map.flyTo([lat, lng], 18, { animate: true, duration: 0.5 });
    },
  });
  return null;
}

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

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, grandTotal, clearCart } = useCart();
  
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

  // 💳 Payment & Remote Booking
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'online' | 'cash'
  const [isRemoteBooking, setIsRemoteBooking] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

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
        alert("GPS not supported. Please type manually.");
        return;
    }

    setLocationLoading(true);
    const timeoutId = setTimeout(() => {
        if (locationLoading) { setLocationLoading(false); alert("GPS taking too long. Please type manually."); }
    }, 6000);

    navigator.geolocation.getCurrentPosition(async (position) => {
        clearTimeout(timeoutId); 
        const { latitude, longitude } = position.coords;
        setNewCoords({ lat: latitude, lng: longitude });
        setManualLat(latitude.toString());
        setManualLng(longitude.toString());

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`, {
                headers: { 'User-Agent': 'KshatrApp/1.0' }
            });
            const data = await response.json();
            const addr = data.address;
            const fullAddress = [addr.road, addr.suburb, addr.city || addr.town, addr.state, addr.postcode].filter(Boolean).join(", ");
            setNewAddress(`House/Flat No: \nLandmark: \n${fullAddress}`);
        } catch {
            setNewAddress("Location found. Please type your complete house address.");
        }
        setLocationLoading(false);
    }, () => {
        clearTimeout(timeoutId); setLocationLoading(false);
    });
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a city or area name to search.');
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&addressdetails=1&limit=1&accept-language=en`,
        {
          headers: { 'User-Agent': 'KshatrApp/1.0' },
        }
      );
      const results = await res.json();

      if (!results || results.length === 0) {
        alert('Location not found. Please try a nearby landmark or area name.');
        return;
      }

      const place = results[0];
      const lat = parseFloat(place.lat);
      const lng = parseFloat(place.lon);

      setManualLat(lat.toString());
      setManualLng(lng.toString());

      if (place.display_name) {
        setNewAddress(`House/Flat No: \nLandmark: \n${place.display_name}`);
      }
    } catch {
      alert('Failed to search location. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const resolveAddress = async () => {
    let finalAddress = '';
    let finalLat = null;
    let finalLng = null;

    // 1️⃣ IF USING NEW ADDRESS FORM
    if (showNewForm) {
      if (!newAddress || newAddress.trim() === '') {
        alert('⚠️ Please enter your complete address.');
        return null;
      }

      const hasGpsCoords = !!newCoords.lat;
      const hasManualPin = manualLat && manualLng;

      if (!hasGpsCoords && !hasManualPin) {
        const confirmNoGPS = window.confirm(
          '⚠️ GPS is not locked and no manual pin is set. Proceed with address only?'
        );
        if (!confirmNoGPS) return null;
      }

      const { data: insertedAddress, error: addressError } = await supabase
        .from('user_addresses')
        .insert([{
          user_id: user.id,
          tag: newTag,
          address: newAddress,
          latitude: hasManualPin ? parseFloat(manualLat) : newCoords.lat,
          longitude: hasManualPin ? parseFloat(manualLng) : newCoords.lng,
        }])
        .select()
        .single();

      if (addressError) {
        alert('Error saving address');
        return null;
      }

      finalAddress = insertedAddress.address;
      finalLat = insertedAddress.latitude;
      finalLng = insertedAddress.longitude;
    }
    // 2️⃣ IF USING SAVED ADDRESS
    else {
      if (!selectedAddressId) {
        alert('⚠️ Please select a delivery address.');
        return null;
      }
      const selected = savedAddresses.find((a) => a.id === selectedAddressId);
      finalAddress = selected.address;
      finalLat = selected.latitude;
      finalLng = selected.longitude;
    }

    return { finalAddress, finalLat, finalLng };
  };

  const createBookings = async (mode, paymentStatus, razorpayPaymentId, resolvedAddress) => {
    const { finalAddress, finalLat, finalLng } = resolvedAddress;

    try {
      for (const item of cart) {
        const { error } = await supabase.from('bookings').insert({
          user_id: user.id,
          service_name: item.name,
          total_amount: parseFloat(item.price) || 0,
          booking_date: date,
          address: finalAddress,
          latitude: finalLat,
          longitude: finalLng,
          status: 'pending',
          payment_mode: mode === 'online' ? 'online_prepaid' : 'cash_after_service',
          payment_method: mode,
          payment_status: paymentStatus,
          razorpay_payment_id: razorpayPaymentId,
          is_remote_booking: isRemoteBooking,
          contact_name: isRemoteBooking ? contactName : null,
          contact_phone: isRemoteBooking ? contactPhone : null,
        });
        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        clearCart();
        navigate('/bookings');
      }, 2000);
    } catch (error) {
      alert('❌ Booking Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async (resolvedAddress) => {
    if (!grandTotal) {
      alert('Invalid amount for payment.');
      setLoading(false);
      return;
    }

    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded || !window.Razorpay) {
      alert('Unable to load Razorpay. Check your connection and try again.');
      setLoading(false);
      return;
    }

    const options = {
      key: 'rzp_test_YourDummyKeyHere',
      amount: grandTotal * 100,
      currency: 'INR',
      name: 'Kshatr Home Services',
      description: 'Home services booking',
      handler: async function (response) {
        await createBookings('online', 'paid', response.razorpay_payment_id, resolvedAddress);
      },
      prefill: {
        name: user?.user_metadata?.name || 'Customer',
        email: user?.email,
        contact: contactPhone || '',
      },
      theme: { color: '#0f766e' },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function () {
      alert('Payment failed. Please try again or choose Cash After Service.');
      setLoading(false);
    });
    rzp.open();
  };

  const handleBooking = async () => {
    if (!date) {
      alert('⚠️ Please select a preferred Date!');
      return;
    }

    if (isRemoteBooking && (!contactName || !contactPhone)) {
      alert("⚠️ Please enter contact person's name and phone number.");
      return;
    }

    setLoading(true);
    const resolvedAddress = await resolveAddress();
    if (!resolvedAddress) {
      setLoading(false);
      return;
    }

    if (paymentMethod === 'online') {
      await handleOnlinePayment(resolvedAddress);
    } else {
      await createBookings('cash', 'pending', null, resolvedAddress);
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

                     {/* 🧭 Manual Map Pin (interactive map) */}
                     <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <MapPinned className="text-teal-600" size={16}/>
                              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Manual Map Pin</p>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3">
                            Search any city/area or tap on the map to drop a pin at the exact house. Perfect for booking from another city/country.
                        </p>

                        {/* Search City/Area */}
                        <div className="flex flex-col sm:flex-row gap-2 mb-3">
                          <div className="flex-1 flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-2xl px-3 py-2.5">
                            <Search size={16} className="text-slate-400 shrink-0" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search city, area, or landmark..."
                              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-slate-500"
                            />
                            <button
                              type="button"
                              onClick={detectLocation}
                              disabled={locationLoading}
                              className="shrink-0 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-1 disabled:opacity-60"
                              title="Use current GPS location"
                            >
                              {locationLoading ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Navigation size={14} />
                              )}
                              Current
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleSearchLocation}
                            disabled={searchLoading}
                            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            {searchLoading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Search size={16} />
                            )}
                            Search
                          </button>
                        </div>

                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-[55vh] min-h-[450px]">
                          <MapContainer
                            center={
                              newCoords.lat && newCoords.lng
                                ? [newCoords.lat, newCoords.lng]
                                : [25.4484, 78.5685]
                            }
                            zoom={14}
                            className="w-full h-full"
                            scrollWheelZoom
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />

                            {/* Zoom in for precision whenever manual pin is set (search/GPS/click) */}
                            {manualLat && manualLng && (
                              <MapFocusController
                                lat={parseFloat(manualLat)}
                                lng={parseFloat(manualLng)}
                              />
                            )}

                            <MapClickHandler
                              onPick={(lat, lng) => {
                                setManualLat(lat.toString());
                                setManualLng(lng.toString());
                              }}
                            />

                            {/* Marker: shown as soon as we have a manual pin */}
                            {manualLat && manualLng && (
                              <Marker
                                position={[parseFloat(manualLat), parseFloat(manualLng)]}
                                draggable
                                eventHandlers={{
                                  dragend: (e) => {
                                    const { lat, lng } = e.target.getLatLng();
                                    setManualLat(lat.toString());
                                    setManualLng(lng.toString());
                                  },
                                }}
                              />
                            )}
                          </MapContainer>

                          {/* Visual cue: center target */}
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                              <div className="absolute inset-0 rounded-full bg-teal-500/20 blur-md animate-pulse" />
                              <div className="w-14 h-14 rounded-full border border-teal-500/40 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <Crosshair size={22} className="text-teal-300" />
                              </div>
                            </div>
                          </div>
                        </div>
                        {manualLat && manualLng && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${manualLat},${manualLng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-800"
                          >
                            <Navigation size={12}/> Preview in Google Maps
                          </a>
                        )}
                     </div>
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

             {/* 👥 Remote Booking Toggle */}
             <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <User className="text-teal-600" size={18}/>
                    <div>
                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Booking for someone else?</p>
                        <p className="text-[11px] text-slate-500">Use for parents / relatives at another address.</p>
                    </div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isRemoteBooking}
                      onChange={(e) => setIsRemoteBooking(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer-checked:bg-teal-500 transition-colors relative">
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
                    </div>
                </label>
             </div>

             {isRemoteBooking && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                          <User size={12}/> Contact Name
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Person at service address"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                      />
                  </div>
                  <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                          <Phone size={12}/> Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                      />
                  </div>
               </div>
             )}
         </div>

        {/* RIGHT SIDE: ORDER SUMMARY */}
        <div className="bg-slate-950 p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/60 border border-slate-800 h-fit sticky top-28 text-white">
            <h2 className="text-lg font-black text-white mb-6">Order Summary</h2>
             
            <div className="space-y-4 mb-6">
                 {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-slate-300 font-bold text-xs">{i+1}</div>
                            <span className="font-bold text-slate-100">{item.name}</span>
                         </div>
                        <span className="font-bold text-white">₹{item.price}</span>
                     </div>
                 ))}
             </div>

            <div className="border-t border-dashed border-slate-800 my-4"></div>

            <div className="space-y-2 mb-6">
                <div className="flex justify-between text-slate-400 text-sm">
                    <span>Item Total</span><span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-sm">
                    <span>Platform Fee</span><span className="text-emerald-400 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-black text-white mt-4 pt-4 border-t border-slate-800">
                    <span>To Pay</span><span>₹{grandTotal}</span>
                </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3 mb-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <CreditCard size={12} className="text-teal-400"/> Payment Method
              </p>
              <div className="grid grid-cols-2 gap-3">
                 <button
                   type="button"
                   onClick={() => setPaymentMethod('online')}
                   className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-[11px] font-bold uppercase tracking-widest transition-all ${
                     paymentMethod === 'online'
                       ? 'border-teal-500 bg-teal-500/10 text-teal-300'
                       : 'border-slate-700 text-slate-300'
                   }`}
                 >
                   <CreditCard size={14}/>
                   Pay Online Now
                 </button>
                 <button
                   type="button"
                   onClick={() => setPaymentMethod('cash')}
                   className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-[11px] font-bold uppercase tracking-widest transition-all ${
                     paymentMethod === 'cash'
                       ? 'border-teal-500 bg-slate-900 text-teal-300'
                       : 'border-slate-700 text-slate-300'
                   }`}
                 >
                   <ShieldCheck size={14}/>
                   Cash After Service
                 </button>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 mb-6">
                <CreditCard className="text-teal-400 shrink-0"/>
                <p className="text-xs font-bold text-slate-100">
                  {paymentMethod === 'online'
                    ? 'Secure payment via Razorpay in test mode. You will be redirected to complete the payment.'
                    : 'Pay via Cash/UPI directly to the expert after service.'}
                </p>
            </div>

            <button 
               onClick={handleBooking}
               disabled={loading}
               className="w-full bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-2xl font-black uppercase tracking-[0.25em] shadow-lg shadow-teal-900/40 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
               {loading ? <Loader2 className="animate-spin" size={18}/> : <ShieldCheck size={18}/>} 
               {loading ? 'Processing...' : (paymentMethod === 'online' ? 'Pay & Book' : 'Confirm Booking')}
            </button>
         </div>
      </div>
    </div>
  );
}