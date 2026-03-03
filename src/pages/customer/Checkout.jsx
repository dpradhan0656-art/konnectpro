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
  User,
  Phone,
  Search,
  Crosshair,
  Layers
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

function SuccessScreen() {
  return (
    <div className="fixed inset-0 z-[100] bg-green-50 flex flex-col items-center justify-center p-6 text-center overflow-hidden h-[100dvh] w-screen">
      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-500/40 animate-bounce">
        <CheckCircle size={48} className="text-white" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Booking Confirmed!</h1>
      <p className="text-slate-500 font-medium text-lg">
        The expert will arrive at your selected location shortly.
      </p>
    </div>
  );
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

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newCoords, setNewCoords] = useState({ lat: null, lng: null });
  const [newTag, setNewTag] = useState('Home');
  const [locationLoading, setLocationLoading] = useState(false);

  // 🌍 Map View State (Satellite/Hybrid vs Street)
  const [mapType, setMapType] = useState('satellite');

  const [paymentMethod, setPaymentMethod] = useState('cash'); 
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

        const { data: addresses } = await supabase.from('user_addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        
        if (addresses && addresses.length > 0) {
            setSavedAddresses(addresses);
            setSelectedAddressId(addresses[0].id);
        } else {
            setShowNewForm(true);
        }
    };
    fetchUserData();
  }, [cart, navigate]);

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
        { headers: { 'User-Agent': 'KshatrApp/1.0' } }
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
    } else {
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

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourDummyKeyHere',
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
    return <SuccessScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 pt-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
         
         {/* LEFT SIDE: ADDRESS & DETAILS */}
         <div className="space-y-6">
             <div className="mb-2">
                 <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                    <ShieldCheck className="text-teal-500" size={32} /> Secure Checkout
                 </h1>
                 <p className="text-slate-500 text-sm mt-1 font-medium">Where should we send the expert?</p>
             </div>

             {/* 🏠 SAVED ADDRESSES LIST */}
             {!showNewForm && savedAddresses.length > 0 && (
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
                     <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
                         <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Saved Addresses</h3>
                         <button onClick={() => setShowNewForm(true)} className="text-teal-600 font-bold text-xs flex items-center gap-1 hover:text-teal-700 transition-colors bg-teal-50 px-3 py-1.5 rounded-full">
                             <Plus size={14}/> Add New
                         </button>
                     </div>
                     
                     <div className="space-y-3 mt-2">
                       {savedAddresses.map(addr => (
                           <div 
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                                  selectedAddressId === addr.id ? 'bg-teal-50 border-teal-500 shadow-sm' : 'bg-white border-slate-100 hover:border-teal-200'
                              }`}
                           >
                               <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                   selectedAddressId === addr.id ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-300'
                               }`}>
                                   {selectedAddressId === addr.id && <div className="w-2 h-2 bg-white rounded-full"/>}
                               </div>
                               <div className="w-full">
                                   <h3 className={`font-black text-sm flex items-center gap-2 ${selectedAddressId === addr.id ? 'text-teal-900' : 'text-slate-700'}`}>
                                      {addr.tag === 'Home' ? <Home size={14}/> : addr.tag === 'Work' ? <Briefcase size={14}/> : <MapPin size={14}/>} 
                                      {addr.tag}
                                   </h3>
                                   <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${selectedAddressId === addr.id ? 'text-teal-700/80' : 'text-slate-500'}`}>
                                       {addr.address}
                                   </p>
                               </div>
                           </div>
                       ))}
                     </div>
                 </div>
             )}

             {/* 📍 NEW ADDRESS FORM CARD */}
             {showNewForm && (
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-top-4 transition-all duration-300">
                     <div className="flex justify-between items-center mb-5 border-b border-slate-50 pb-4">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg"><MapPin className="text-teal-500"/> Add New Address</h3>
                        {savedAddresses.length > 0 && (
                            <button onClick={() => setShowNewForm(false)} className="text-slate-500 hover:text-slate-800 text-[11px] font-bold uppercase tracking-widest px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">Cancel</button>
                        )}
                     </div>

                     <div className="flex gap-2 mb-5">
                         {['Home', 'Work', 'Other'].map(tag => (
                             <button 
                                key={tag} 
                                onClick={() => setNewTag(tag)}
                                className={`px-5 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${newTag === tag ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                             >
                                 {tag}
                             </button>
                         ))}
                     </div>
                     
                     <textarea 
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="House No, Building, Landmark, Area..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white focus:border-transparent transition-all duration-300 outline-none h-28 resize-none mb-2"
                     />

                     {/* 🧭 Manual Map Pin */}
                     <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPinned className="text-teal-600" size={16}/>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pin Exact Location</p>
                        </div>
                        <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                            Search your area or tap on the map to drop a pin. This helps the expert reach you faster.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2 mb-4 p-2 bg-white border border-slate-200 shadow-sm rounded-2xl">
                          <div className="flex-1 flex items-center gap-2 px-3 bg-transparent">
                            <Search size={18} className="text-slate-400 shrink-0" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search area or landmark..."
                              className="w-full bg-transparent text-sm text-slate-900 font-medium outline-none placeholder-slate-400"
                            />
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={detectLocation}
                              disabled={locationLoading}
                              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1 transition-all duration-300 disabled:opacity-60"
                              title="Use GPS"
                            >
                              {locationLoading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                              GPS
                            </button>
                            <button
                              type="button"
                              onClick={handleSearchLocation}
                              disabled={searchLoading}
                              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 text-white text-[11px] font-bold uppercase tracking-widest flex items-center justify-center transition-all duration-300 disabled:opacity-60"
                            >
                              {searchLoading ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
                            </button>
                          </div>
                        </div>

                        {/* Map Container - THE FIX IS HERE (Explicit style={{height, width}}) */}
                        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md">
                          
                          {/* 🌍 Map Type Toggle Button */}
                          <button
                            type="button"
                            onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
                            className="absolute top-4 right-4 z-[400] bg-white p-2.5 rounded-xl shadow-lg border border-slate-200 text-slate-700 hover:text-teal-600 hover:border-teal-300 transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"
                          >
                            <Layers size={14} />
                            {mapType === 'street' ? 'Satellite View' : 'Map View'}
                          </button>

                          <MapContainer
                            center={
                              newCoords.lat && newCoords.lng
                                ? [newCoords.lat, newCoords.lng]
                                : [25.4484, 78.5685]
                            }
                            zoom={16}
                            className="z-10"
                            style={{ height: "400px", width: "100%" }}
                            scrollWheelZoom
                          >
                            {/* Toggle between Street Map and Google Hybrid Imagery */}
                            {mapType === 'street' ? (
                                <TileLayer
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                  attribution='© OpenStreetMap'
                                />
                            ) : (
                                <TileLayer
                                  url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                                  attribution='© Google Maps'
                                />
                            )}

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
                          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                            <div className="relative">
                              <div className="absolute inset-0 rounded-full bg-teal-500/20 blur-md animate-pulse" />
                              <div className="w-12 h-12 rounded-full border-2 border-teal-500/50 bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <Crosshair size={20} className="text-teal-600" />
                              </div>
                            </div>
                          </div>
                        </div>
                        {manualLat && manualLng && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${manualLat},${manualLng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-800 transition-colors bg-teal-50 px-3 py-1.5 rounded-lg"
                          >
                            <Navigation size={12}/> Open in Google Maps
                          </a>
                        )}
                     </div>
                 </div>
             )}

             {/* 📅 Date Picker Card */}
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Calendar size={14} className="text-teal-500"/> Preferred Service Date
                 </label>
                 <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all duration-300 outline-none"
                    min={new Date().toISOString().split('T')[0]}
                 />
             </div>

             {/* 👥 Remote Booking Card */}
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                            <User className="text-teal-600" size={18}/>
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-0.5">Booking for someone else?</p>
                            <p className="text-xs text-slate-500 font-medium">Use for parents / relatives.</p>
                        </div>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isRemoteBooking}
                          onChange={(e) => setIsRemoteBooking(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-teal-500 transition-colors relative shadow-inner">
                            <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
                        </div>
                    </label>
                </div>

                {isRemoteBooking && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-50">
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                             <User size={12}/> Contact Name
                         </label>
                         <input
                           type="text"
                           value={contactName}
                           onChange={(e) => setContactName(e.target.value)}
                           placeholder="Person at address"
                           className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                         />
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                             <Phone size={12}/> Contact Phone
                         </label>
                         <input
                           type="tel"
                           value={contactPhone}
                           onChange={(e) => setContactPhone(e.target.value)}
                           placeholder="10-digit mobile"
                           className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                         />
                     </div>
                  </div>
                )}
             </div>
         </div>

        {/* RIGHT SIDE: ORDER SUMMARY */}
        <div className="bg-slate-950 p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-slate-900/40 border border-slate-800 relative overflow-hidden h-fit sticky top-28 text-white">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

            <h2 className="text-xl font-black text-white mb-6 relative z-10 tracking-tight">Order Summary</h2>
             
            <div className="space-y-4 mb-6 relative z-10">
                 {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-800">{i+1}</div>
                            <span className="font-bold text-slate-200">{item.name}</span>
                         </div>
                        <span className="font-bold text-white tracking-wide">₹{item.price}</span>
                     </div>
                 ))}
             </div>

            <div className="border-t border-dashed border-slate-800 my-5 relative z-10"></div>

            <div className="space-y-3 mb-8 relative z-10">
                <div className="flex justify-between text-slate-400 text-sm font-medium">
                    <span>Item Total</span><span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-sm font-medium">
                    <span>Platform Fee</span><span className="text-emerald-400 font-bold tracking-wide">FREE</span>
                </div>
                <div className="flex justify-between items-end text-xl font-black text-white mt-5 pt-5 border-t border-slate-800">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">To Pay</span>
                    <span className="text-3xl tracking-tight">₹{grandTotal}</span>
                </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4 mb-8 relative z-10">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={14} className="text-teal-400"/> Payment Method
              </p>
              <div className="grid grid-cols-2 gap-3">
                 <button
                   type="button"
                   onClick={() => setPaymentMethod('online')}
                   className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                     paymentMethod === 'online'
                       ? 'border-teal-500 bg-teal-500/10 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.15)]'
                       : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 bg-slate-900/50'
                   }`}
                 >
                   <CreditCard size={20} className={paymentMethod === 'online' ? 'text-teal-400' : 'text-slate-500'}/>
                   Pay Online
                 </button>
                 <button
                   type="button"
                   onClick={() => setPaymentMethod('cash')}
                   className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                     paymentMethod === 'cash'
                       ? 'border-slate-400 bg-slate-800 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                       : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 bg-slate-900/50'
                   }`}
                 >
                   <ShieldCheck size={20} className={paymentMethod === 'cash' ? 'text-slate-300' : 'text-slate-500'}/>
                   Pay After
                 </button>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800/80 flex items-start gap-3 mb-8 relative z-10">
                <CreditCard className="text-teal-400 shrink-0 mt-0.5" size={16}/>
                <p className="text-xs font-medium text-slate-300 leading-relaxed">
                  {paymentMethod === 'online'
                    ? 'Secure payment via Razorpay. You will be redirected to complete the payment.'
                    : 'Pay via Cash or UPI directly to the expert after the service is completed.'}
                </p>
            </div>

            <button 
               onClick={handleBooking}
               disabled={loading}
               className="w-full relative z-10 bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_8px_20px_rgba(13,148,136,0.3)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
            >
               {loading ? <Loader2 className="animate-spin" size={18}/> : <ShieldCheck size={18}/>} 
               {loading ? 'Processing...' : (paymentMethod === 'online' ? 'Pay & Book Now' : 'Confirm Booking')}
            </button>
         </div>
      </div>
    </div>
  );
}