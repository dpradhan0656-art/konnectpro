import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import {
  buildCanonicalBookingRow,
  getStoredBookingCity,
  insertCanonicalBookings,
  PAYMENT_METHODS,
} from '../../services/canonicalBookingService';
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
  Layers
} from 'lucide-react';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import TimeSlotPicker from '../../components/booking/TimeSlotPicker';
import toast from 'react-hot-toast';

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
    /* Centering & containment: full viewport, safe for notches/gesture bars */
    <div
      className="fixed inset-0 z-[100] bg-gradient-to-b from-emerald-950 via-emerald-950 to-emerald-950 flex flex-col items-center justify-center p-6 text-center overflow-auto w-full max-w-[100vw] min-h-[100dvh]"
      style={{ minHeight: '100dvh' }}
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center mb-6 sm:mb-8 shadow-2xl shadow-amber-500/35 animate-bounce shrink-0 ring-4 ring-amber-400/25">
        <CheckCircle size={40} className="text-white sm:w-12 sm:h-12" aria-hidden />
      </div>
      <h1 className="text-2xl sm:text-4xl font-black text-white mb-3 tracking-tight">Booking Confirmed!</h1>
      <p className="text-slate-400 font-medium text-base sm:text-lg max-w-sm">
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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

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
            autoDetectOnNewAddress();
        }
    };
    fetchUserData();
  }, [cart, navigate]);

  const autoDetectOnNewAddress = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setNewCoords({ lat: latitude, lng: longitude });
        setManualLat(latitude.toString());
        setManualLng(longitude.toString());
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`, { headers: { 'User-Agent': 'KshatrApp/1.0' } });
          const data = await res.json();
          const addr = data.address;
          const full = [addr.road, addr.suburb, addr.city || addr.town, addr.state, addr.postcode].filter(Boolean).join(", ");
          setNewAddress(`House/Flat No: \nLandmark: \n${full}`);
        } catch {
          setNewAddress("Location detected. Add your house/flat number above.");
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
        toast.error("GPS not supported. Please type manually.");
        return;
    }
    setLocationLoading(true);
    const timeoutId = setTimeout(() => {
        if (locationLoading) { setLocationLoading(false); toast.error("GPS taking too long. Please type manually."); }
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
      toast.error('Please enter a city or area name to search.');
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
        toast.error('Location not found. Please try a nearby landmark or area name.');
        return;
      }
      const place = results[0];
      const lat = parseFloat(place.lat);
      const lng = parseFloat(place.lon);

      setNewCoords({ lat, lng });
      setManualLat(lat.toString());
      setManualLng(lng.toString());

      if (place.display_name) {
        setNewAddress(`House/Flat No: \nLandmark: \n${place.display_name}`);
      }
    } catch {
      toast.error('Failed to search location. Please try again.');
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
        toast.error('Please enter your complete address.');
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
        toast.error('Error saving address');
        return null;
      }
      finalAddress = insertedAddress.address;
      finalLat = insertedAddress.latitude;
      finalLng = insertedAddress.longitude;
    } else {
      if (!selectedAddressId) {
        toast.error('Please select a delivery address.');
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
    const bookingCity = getStoredBookingCity();
    try {
      const paymentMethod =
        mode === PAYMENT_METHODS.ONLINE ? PAYMENT_METHODS.ONLINE : PAYMENT_METHODS.CASH;
      const rows = cart.map((item) =>
        buildCanonicalBookingRow({
          userId: user.id,
          serviceName: item?.name,
          totalAmount: item?.price,
          bookingDate: date,
          scheduledDate: date,
          scheduledTime: selectedTimeSlot,
          address: finalAddress,
          latitude: finalLat,
          longitude: finalLng,
          city: bookingCity,
          paymentMethod,
          paymentStatus,
          razorpayPaymentId,
          isRemoteBooking,
          contactName,
          contactPhone,
        })
      );
      await insertCanonicalBookings(supabase, rows);

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setSuccess(true);
      setTimeout(() => {
        clearCart();
        navigate('/bookings');
      }, 2000);
    } catch (error) {
      toast.error('Booking Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async (resolvedAddress) => {
    if (!grandTotal) {
      toast.error('Invalid amount for payment.');
      setLoading(false);
      return;
    }
    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded || !window.Razorpay) {
      toast.error('Unable to load Razorpay. Check your connection and try again.');
      setLoading(false);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // was TEST fallback: || 'rzp_test_YourDummyKeyHere'
      amount: grandTotal * 100,
      currency: 'INR',
      name: 'Kshatryx Technologies',
      description: 'Home services booking',
      handler: async function (response) {
        await createBookings(
          PAYMENT_METHODS.ONLINE,
          'paid',
          response.razorpay_payment_id,
          resolvedAddress
        );
      },
      prefill: {
        name: user?.user_metadata?.name || 'Customer',
        email: user?.email,
        contact: contactPhone || '',
      },
      modal: {
        ondismiss: () => {
          toast('Payment window closed. No booking created.', { icon: 'ℹ️' });
          setLoading(false);
        },
      },
      theme: { color: '#047857' },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        toast.error('Payment failed. Please try again or choose Cash After Service.');
        setLoading(false);
      });
      rzp.open();
    } catch {
      toast.error('Unable to open payment window. Please try again.');
      setLoading(false);
    }
  };

  // 🚩 Feature Flag: true = customer can pay online via Razorpay (income source). false = only Pay After Service.
  const isOnlinePaymentEnabled = true;

  const handleBooking = async () => {
    if (!date) {
      toast.error('Please select a preferred Date');
      return;
    }
    if (!selectedTimeSlot) {
      toast.error('Please select a preferred Time Slot');
      return;
    }
    if (isRemoteBooking && (!contactName || !contactPhone)) {
      toast.error("Please enter contact person's name and phone number.");
      return;
    }
    setLoading(true);
    const resolvedAddress = await resolveAddress();
    if (!resolvedAddress) {
      setLoading(false);
      return;
    }

    if (isOnlinePaymentEnabled && paymentMethod === 'online') {
      await handleOnlinePayment(resolvedAddress);
    } else {
      // Direct booking: Pay After Service
      await createBookings(PAYMENT_METHODS.CASH, 'pending', null, resolvedAddress);
    }
  };

  if (success) {
    return <SuccessScreen />;
  }

  return (
    <div className="min-h-screen max-w-[100vw] w-full overflow-x-hidden bg-gradient-to-b from-emerald-950 via-emerald-950 to-emerald-950 pb-32 pt-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
         
         {/* LEFT SIDE: ADDRESS & DETAILS */}
         <div className="space-y-6">
             <div className="mb-2">
                 <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                    <ShieldCheck className="text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.35)]" size={32} /> Secure Checkout
                 </h1>
                 <p className="text-slate-400 text-sm mt-1 font-medium">Where should we send the expert?</p>
             </div>

             {/* 🏠 SAVED ADDRESSES LIST */}
             {!showNewForm && savedAddresses.length > 0 && (
                 <div className="bg-emerald-950/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 ring-1 ring-white/5">
                     <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                         <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Saved Addresses</h3>
                         <button onClick={() => setShowNewForm(true)} className="text-amber-300 font-bold text-xs flex items-center gap-1 hover:text-amber-200 transition-colors bg-emerald-500/15 border border-emerald-500/25 px-3 py-1.5 rounded-full">
                             <Plus size={14}/> Add New
                         </button>
                     </div>
                     
                     <div className="space-y-3 mt-2">
                       {savedAddresses.map(addr => (
                           <div 
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                                  selectedAddressId === addr.id ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'bg-white/5 border-white/10 hover:border-emerald-500/40'
                              }`}
                           >
                               <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                   selectedAddressId === addr.id ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-slate-500'
                               }`}>
                                   {selectedAddressId === addr.id && <div className="w-2 h-2 bg-white rounded-full"/>}
                               </div>
                               <div className="w-full">
                                   <h3 className={`font-black text-sm flex items-center gap-2 ${selectedAddressId === addr.id ? 'text-amber-200' : 'text-slate-200'}`}>
                                      {addr.tag === 'Home' ? <Home size={14}/> : addr.tag === 'Work' ? <Briefcase size={14}/> : <MapPin size={14}/>} 
                                      {addr.tag}
                                   </h3>
                                   <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${selectedAddressId === addr.id ? 'text-amber-300/90' : 'text-slate-400'}`}>
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
                 <div className="bg-emerald-950/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-4 transition-all duration-300 ring-1 ring-white/5">
                     <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-4">
                        <h3 className="font-black text-white flex items-center gap-2 text-lg"><MapPin className="text-emerald-400"/> Service Location</h3>
                        {savedAddresses.length > 0 && (
                            <button onClick={() => setShowNewForm(false)} className="text-slate-400 hover:text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors">Cancel</button>
                        )}
                     </div>

                     {/* 🎯 Primary CTA: Use My Location */}
                     <button
                       type="button"
                       onClick={detectLocation}
                       disabled={locationLoading}
                       className="w-full mb-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-emerald-700/30 transition-all duration-300 disabled:opacity-70 active:scale-[0.98]"
                     >
                       {locationLoading ? <Loader2 size={22} className="animate-spin" /> : <Navigation size={22} />}
                       {locationLoading ? 'Finding your location...' : '📍 Use My Current Location'}
                     </button>

                     <div className="flex gap-2 mb-5">
                         {['Home', 'Work', 'Other'].map(tag => (
                             <button 
                                key={tag} 
                                onClick={() => setNewTag(tag)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 ${newTag === tag ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white border-emerald-500/40 shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400 border-white/10 hover:border-emerald-500/30 hover:bg-white/10'}`}
                             >
                                 {tag === 'Home' && <Home size={12} className="inline mr-1.5 -mt-0.5" />}
                                 {tag === 'Work' && <Briefcase size={12} className="inline mr-1.5 -mt-0.5" />}
                                 {tag}
                             </button>
                         ))}
                     </div>
                     
                     <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">House / Flat / Landmark</label>
                     <textarea 
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="e.g. House 12, Near City Mall, Ranjhi..."
                        className="w-full bg-emerald-950/50 border border-white/10 rounded-2xl p-4 text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500/50 focus:bg-emerald-950/70 focus:border-emerald-500/30 transition-all duration-300 outline-none h-24 resize-none mb-5 placeholder:text-slate-500"
                     />

                     {/* 🗺️ Map & Search */}
                     <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPinned className="text-emerald-600" size={18}/>
                            <p className="text-sm font-black text-white">Pin your exact location</p>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 font-medium">
                            Search area or tap on map to drop pin. Drag to adjust. Expert will reach this spot.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2 mb-4 p-3 bg-white/5 rounded-2xl border border-white/10">
                          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-emerald-950/40 rounded-xl border border-white/10 focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500/30 transition-all">
                            <Search size={18} className="text-emerald-400/70 shrink-0" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchLocation())}
                              placeholder="Search: area, landmark, address..."
                              className="w-full bg-transparent text-sm text-slate-100 font-medium outline-none placeholder-slate-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleSearchLocation}
                            disabled={searchLoading || !searchQuery.trim()}
                            className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/30 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {searchLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            Search
                          </button>
                        </div>

                        <div className="relative rounded-2xl overflow-hidden border-2 border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.45)] ring-1 ring-white/5">
                          <button
                            type="button"
                            onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
                            className="absolute top-3 right-3 z-[400] bg-emerald-950/90 backdrop-blur-xl p-2.5 rounded-xl shadow-lg border border-white/15 text-slate-200 hover:text-amber-300 hover:border-emerald-500/40 transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"
                          >
                            <Layers size={14} />
                            {mapType === 'street' ? 'Satellite' : 'Map'}
                          </button>

                          {!manualLat && !manualLng && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none">
                              <div className="bg-emerald-950/90 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-xl border border-white/10 text-center ring-1 ring-emerald-500/20">
                                <MapPinned className="mx-auto text-emerald-400 mb-2" size={32} />
                                <p className="text-sm font-bold text-white">Tap on map to pin</p>
                                <p className="text-xs text-slate-400 mt-0.5">Or use "Use My Location" above</p>
                              </div>
                            </div>
                          )}

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
                            {mapType === 'street' ? (
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap' />
                            ) : (
                                <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution='© Google' />
                            )}

                            {manualLat && manualLng && (
                              <MapFocusController lat={parseFloat(manualLat)} lng={parseFloat(manualLng)} />
                            )}

                            <MapClickHandler
                              onPick={(lat, lng) => {
                                setNewCoords({ lat, lng });
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
                        </div>

                        {manualLat && manualLng && (
                          <div className="mt-3 flex items-center justify-between gap-4">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${manualLat},${manualLng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors bg-emerald-500/15 border border-emerald-500/25 px-4 py-2 rounded-xl"
                            >
                              <Navigation size={14}/> Open in Google Maps
                            </a>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                              <CheckCircle size={12}/> Location pinned
                            </span>
                          </div>
                        )}
                     </div>
                 </div>
             )}

             {/* 📅 Date Picker Card */}
             <div className="bg-emerald-950/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 ring-1 ring-white/5">
                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-400"/> Preferred Service Date
                 </label>
                 <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                   className="w-full bg-emerald-950/50 border border-white/10 rounded-2xl p-4 text-slate-100 font-bold focus:ring-2 focus:ring-emerald-500/50 focus:bg-emerald-950/70 focus:border-emerald-500/30 transition-all duration-300 outline-none [color-scheme:dark]"
                   min={new Date().toISOString().split('T')[0]}
                />
            </div>

            {/* ⏱️ Time Slot Picker Card (light-theme island on dark Checkout bg) */}
            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-emerald-500/10">
                <TimeSlotPicker selectedSlot={selectedTimeSlot} onSelectSlot={setSelectedTimeSlot} />
            </div>

            {/* 👥 Remote Booking Card */}
             <div className="bg-emerald-950/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 ring-1 ring-white/5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                            <User className="text-emerald-400" size={18}/>
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-white uppercase tracking-widest mb-0.5">Booking for someone else?</p>
                            <p className="text-xs text-slate-400 font-medium">Use for parents / relatives.</p>
                        </div>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isRemoteBooking}
                          onChange={(e) => setIsRemoteBooking(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer-checked:bg-emerald-500 transition-colors relative shadow-inner border border-white/10">
                            <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
                        </div>
                    </label>
                </div>

                {isRemoteBooking && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-5 border-t border-white/10">
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                             <User size={12}/> Contact Name
                         </label>
                         <input
                           type="text"
                           value={contactName}
                           onChange={(e) => setContactName(e.target.value)}
                           placeholder="Person at address"
                           className="w-full bg-emerald-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 placeholder:text-slate-500"
                         />
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                             <Phone size={12}/> Contact Phone
                         </label>
                         <input
                           type="tel"
                           value={contactPhone}
                           onChange={(e) => setContactPhone(e.target.value)}
                           placeholder="10-digit mobile"
                           className="w-full bg-emerald-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 placeholder:text-slate-500"
                         />
                     </div>
                  </div>
                )}
             </div>
         </div>

        {/* RIGHT SIDE: ORDER SUMMARY */}
        <div className="bg-emerald-950/95 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-black/50 border border-white/10 relative overflow-hidden h-fit sticky top-28 text-white ring-1 ring-emerald-500/15">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

            <h2 className="text-xl font-black text-white mb-6 relative z-10 tracking-tight">Order Summary</h2>
             
            <div className="space-y-4 mb-6 relative z-10">
                 {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-950 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs border border-emerald-900">{i+1}</div>
                            <span className="font-bold text-slate-200">{item.name}</span>
                         </div>
                        <span className="font-bold text-white tracking-wide">₹{item.price}</span>
                     </div>
                 ))}
             </div>

            <div className="border-t border-dashed border-emerald-900 my-5 relative z-10"></div>

            <div className="space-y-3 mb-8 relative z-10">
                <div className="flex justify-between text-slate-400 text-sm font-medium">
                    <span>Item Total</span><span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-sm font-medium">
                    <span>Platform Fee</span><span className="text-emerald-400 font-bold tracking-wide">FREE</span>
                </div>
                <div className="flex justify-between items-end text-xl font-black text-white mt-5 pt-5 border-t border-emerald-900">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">To Pay</span>
                    <span className="text-3xl tracking-tight">₹{grandTotal}</span>
                </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4 mb-8 relative z-10">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={14} className="text-emerald-400"/> Payment Method
              </p>
              
              {isOnlinePaymentEnabled ? (
                <div className="grid grid-cols-2 gap-3">
                   <button
                     type="button"
                     onClick={() => setPaymentMethod('online')}
                     className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                       paymentMethod === 'online'
                         ? 'border-emerald-500 bg-emerald-500/10 text-amber-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                         : 'border-emerald-900 text-slate-400 hover:border-slate-600 hover:text-slate-200 bg-emerald-950/50'
                     }`}
                   >
                     <CreditCard size={20} className={paymentMethod === 'online' ? 'text-emerald-400' : 'text-slate-500'}/>
                     Pay Online
                   </button>
                   <button
                     type="button"
                     onClick={() => setPaymentMethod('cash')}
                     className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                       paymentMethod === 'cash'
                         ? 'border-slate-400 bg-emerald-900 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                         : 'border-emerald-900 text-slate-400 hover:border-slate-600 hover:text-slate-200 bg-emerald-950/50'
                     }`}
                   >
                     <ShieldCheck size={20} className={paymentMethod === 'cash' ? 'text-slate-300' : 'text-slate-500'}/>
                     Pay After
                   </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                   <button
                     type="button"
                     onClick={() => setPaymentMethod('cash')}
                     className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-slate-400 bg-emerald-900 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] text-[11px] font-bold uppercase tracking-widest transition-all duration-300"
                   >
                     <ShieldCheck size={20} className="text-slate-300" />
                     Pay After Service (Cash / UPI)
                   </button>
                </div>
              )}
            </div>

            <div className="bg-emerald-950 p-4 rounded-2xl border border-emerald-900/80 flex items-start gap-3 mb-8 relative z-10">
                <CreditCard className="text-emerald-400 shrink-0 mt-0.5" size={16}/>
                <p className="text-xs font-medium text-slate-300 leading-relaxed">
                  {isOnlinePaymentEnabled && paymentMethod === 'online'
                    ? 'Secure payment via Razorpay. You will be redirected to complete the payment.'
                    : 'Pay via Cash or UPI directly to the expert after the service is completed.'}
                </p>
            </div>

            <button 
               onClick={handleBooking}
               disabled={loading}
               className="w-full relative z-10 bg-emerald-700 hover:bg-emerald-800 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_8px_20px_rgba(4,120,87,0.35)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
            >
               {loading ? <Loader2 className="animate-spin" size={18}/> : <ShieldCheck size={18}/>} 
               {loading ? 'Processing...' : (isOnlinePaymentEnabled && paymentMethod === 'online' ? 'Pay & Book Now' : 'Confirm Booking')}
            </button>
            {loading && (
              <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400/80 relative z-10">
                Powered by Kshatryx Technologies
              </p>
            )}
         </div>
      </div>
    </div>
  );
}