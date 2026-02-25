import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../../lib/supabase";
import { BRAND } from '../../config/brandConfig';
import { useCart } from '../../context/CartContext'; 

// Components
import SOSButton from '../../components/common/SOSButton';

// Icons
import { 
  Search, Mic, MapPin, Gift, Tag, Check, Plus, X, 
  Home as HomeIcon, Calendar, Bell, User, ShoppingCart,
  ShieldCheck, Zap, Clock, CheckCircle, ChevronRight, Sparkles
} from 'lucide-react';

// 🎨 Smart Icon Renderer
const SmartIcon = ({ iconValue }) => {
  if (!iconValue) return <span className="text-3xl drop-shadow-md transition-transform group-hover:scale-110">🔧</span>;
  if (iconValue.startsWith('http')) {
      return <img src={iconValue} alt="Category" className="w-10 h-10 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110" />;
  }
  return <span className="text-3xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">{iconValue}</span>;
};

export default function Home({ session }) {
  const navigate = useNavigate();
  const { addToCart, cart } = useCart(); 

  const [locationName, setLocationName] = useState('Locating...');
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [cityStatus, setCityStatus] = useState({ active: true, message: "Serving In" });
  
  const [greeting, setGreeting] = useState("Welcome! How can we help you today?"); 
  const [searchQuery, setSearchQuery] = useState('');
  
  const [categories, setCategories] = useState([]); 
  const [offers, setOffers] = useState([]); 
  const [services, setServices] = useState([]); 
  const [loading, setLoading] = useState(true);

  // 🌈 Premium Pastel Colors for Categories
  const bgColors = [
    "bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600",
    "bg-gradient-to-br from-green-50 to-green-100/50 text-green-600",
    "bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-600",
    "bg-gradient-to-br from-purple-50 to-purple-100/50 text-purple-600",
    "bg-gradient-to-br from-pink-50 to-pink-100/50 text-pink-600",
    "bg-gradient-to-br from-teal-50 to-teal-100/50 text-teal-600",
  ];

  const filteredCategories = categories.filter(cat => 
    cat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const { data: catData } = await supabase.from('categories').select('*').eq('is_active', true).order('created_at', { ascending: true });
        if (catData) setCategories(catData);

        const { data: offerData } = await supabase.from('spotlight_offers').select('*').eq('is_active', true);
        if (offerData) setOffers(offerData);

        const { data: serviceData } = await supabase.from('services').select('*').eq('is_active', true).limit(10);
        if (serviceData) setServices(serviceData);
      } catch (err) { console.error("Fetch Error:", err); }
      setLoading(false);
    };
    fetchAllData();
  }, []);

  // --- 🌍 SUPER FAST ZOMATO-STYLE GPS LOGIC ---
// --- 🌍 TRUE DYNAMIC AUTO-GPS LOGIC ---
  useEffect(() => {
    document.title = `${BRAND.name} | Shield of Trust`;
    
    const cityGreetings = {
      "jabalpur": "Namaste! Aapka swagat hai. Kahiye, aaj hum aapki kya seva kar sakte hain?",
      "indore": "Namaste! Swagat hai aapka. Bataiye, kaise madad karein?",
      "bhopal": "Namaste! Swagat hai aapka. Bataiye, kya seva karein?",
      "delhi": "Namaste ji! Swagat hai. Bataiye, hum aapke liye kya kar sakte hain?",
      "mumbai": "Namaskar! Swagat aahe. Bola, aamhi tumchi kay madat karu shakto?",
      "pune": "Namaskar! Swagat aahe. Bola, kay sewa karu?",
      "bengaluru": "Namaskara! Swagatha. Bataiye, hum aapki kaise madad kar sakte hain?",
      "hyderabad": "Namaskaram! Swagatam. Memu meeku ela sahayapadagalamu?",
      "kolkata": "Nomoshkar! Apnar swagoto. Bolun, amra apnar ki bhabe sahajyo korte pari?",
    };

    // 1. पुरानी लोकेशन चेक करें
    const savedCity = localStorage.getItem('kshatr_user_city');
    if (savedCity) {
        setLocationName(savedCity);
        const lowerCity = savedCity.toLowerCase();
        setGreeting(cityGreetings[lowerCity] || `Welcome to ${savedCity}! How can we help you today?`);
        setCityStatus({ active: true, message: "Serving In" });
    } else {
        setLocationName('Detecting Area...');
        setGreeting("Please allow location access to continue.");
        setCityStatus({ active: false, message: "Locating" });
    }

    // 2. ऑटोमैटिक परमिशन मांगें
    if (navigator.geolocation) {
      const fastGpsOptions = { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
            const data = await res.json();
            
            const city = data.address.city || data.address.town || data.address.county || "Your City";
            const area = data.address.suburb || data.address.neighbourhood || city;
            
            // UI अपडेट करें
            setLocationName(area);
            localStorage.setItem('kshatr_user_city', area);
            setCityStatus({ active: true, message: "Serving In" });
            
            const lowerCity = city.toLowerCase();
            setGreeting(cityGreetings[lowerCity] || `Welcome to ${city}! How can we help you today?`); 
          } catch (err) { 
            console.error("Location API Failed", err); 
          }
        }, 
        (error) => { 
          console.warn("Location Denied:", error);
          if (!savedCity) {
            setLocationName('Select Location');
            setGreeting("Welcome! Please tap above to enter your city manually.");
            setCityStatus({ active: false, message: "Location Required" });
          }
        }, 
        fastGpsOptions
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-teal-200 relative pb-32">
      <SOSButton />

      {/* --- 🌌 PREMIUM HERO SECTION (With Chamkili Dots) --- */}
      <div className="relative pt-6 pb-28 px-6 overflow-hidden bg-slate-950 rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-2xl">
        
        {/* ✨ MAGIC DOTTED OVERLAY ✨ */}
        <div className="absolute inset-0 z-0 opacity-25 pointer-events-none mix-blend-screen" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.25) 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }}></div>

        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -ml-20 -mb-20"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          
          {/* Glassmorphism Location Badge */}
          <div className="flex items-center gap-3 mb-8 bg-white/10 backdrop-blur-md w-fit px-4 py-2.5 rounded-full border border-white/10 shadow-inner">
            <div className={`p-1.5 rounded-full ${cityStatus.active ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-red-500'} shadow-[0_0_15px_rgba(74,222,128,0.4)]`}>
               <MapPin size={14} className="text-white" />
            </div>
            <div>
                <p className="text-[9px] font-black text-teal-300 uppercase tracking-widest leading-none mb-1">{cityStatus.message}</p>
                {isEditingLoc ? (
                    <input 
                        autoFocus placeholder="Enter City"
                        className="bg-transparent border-b border-white text-white font-black text-sm w-32 outline-none placeholder:text-slate-400"
                        value={locationName === 'Select Location' ? '' : locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        onBlur={() => {
                            setIsEditingLoc(false);
                            if(locationName && locationName.trim() !== '' && locationName !== 'Select Location') {
                                localStorage.setItem('kshatr_user_city', locationName.trim());
                                setCityStatus({ active: true, message: "Serving In" });
                                setGreeting(`Welcome to ${locationName.trim()}! How can we help you today?`);
                            } else {
                                setLocationName('Select Location');
                                setCityStatus({ active: false, message: "Location Required" });
                            }
                        }}
                    />
                ) : (
                    <h2 onClick={() => setIsEditingLoc(true)} className="text-sm font-black text-white leading-none tracking-wide cursor-pointer border-b border-transparent hover:border-white/50 transition-all">
                        {locationName}
                    </h2>
                )}
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2 drop-shadow-lg max-w-lg">
              {greeting}
          </h1>
          <p className="text-slate-400 text-sm font-medium mb-10 flex items-center gap-2">
             <Sparkles size={16} className="text-teal-400"/> Trusted by 10,000+ happy homes
          </p>

          {/* Floating Search Bar */}
          <div className="relative z-30 transform translate-y-6"> 
              <div className="relative shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] rounded-2xl bg-white border border-slate-100 flex items-center p-2">
                <Search className="absolute left-6 text-slate-400" size={22} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search 'Salon', 'Plumber', 'Cleaning'...`} 
                  className="w-full py-4 pl-14 pr-16 bg-transparent text-slate-900 font-bold text-lg outline-none placeholder:text-slate-300"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-16 p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                )}
                <div className="h-8 w-px bg-slate-200 mx-2 absolute right-12"></div>
                <button onClick={() => alert("🎤 Voice Search coming soon!")} className="absolute right-3 p-2.5 rounded-xl text-teal-600 hover:bg-teal-50 transition-all">
                  <Mic size={22} />
                </button>
              </div>
          </div>
        </div>
      </div>

      {/* --- 🎨 REDESIGNED CATEGORIES --- */}
      <div className="mt-14 px-6 max-w-4xl mx-auto relative z-20"> 
          <div className="flex justify-between items-end mb-4">
              <h2 className="font-black text-slate-900 text-xl tracking-tight">Explore Categories</h2>
              <span className="text-teal-600 text-xs font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1 hover:text-teal-700">See All <ChevronRight size={14}/></span>
          </div>
          
          {loading ? (
              <div className="flex gap-5 overflow-x-auto pb-6 pt-2 no-scrollbar animate-pulse">
                  {[1,2,3,4].map(i => <div key={i} className="min-w-[90px] h-28 bg-slate-200 rounded-[1.5rem]"></div>)}
              </div>
          ) : filteredCategories.length > 0 ? (
            <div className="flex gap-5 overflow-x-auto pb-6 pt-2 no-scrollbar px-1">
                {filteredCategories.map((cat, i) => {
                    const colorClass = bgColors[i % bgColors.length];
                    const slugUrl = cat.slug || cat.name.toLowerCase().replace(/[\s_]+/g, '-');
                    
                    return (
                    <div key={cat.id || i} onClick={() => navigate(`/category/${slugUrl}`)} className="flex flex-col items-center gap-3 min-w-[85px] cursor-pointer group">
                        <div className={`w-20 h-20 ${colorClass} rounded-[1.5rem] flex items-center justify-center shadow-sm group-hover:shadow-[0_10px_25px_-5px_rgba(20,184,166,0.3)] group-hover:-translate-y-1 transition-all duration-300 border border-white relative overflow-hidden`}>
                            <SmartIcon iconValue={cat.icon} />
                        </div>
                        <span className="text-[11px] font-black text-slate-700 text-center leading-tight group-hover:text-teal-600 transition-colors">{cat.name}</span>
                    </div>
                )})}
            </div>
          ) : ( <p className="text-center text-slate-400 text-sm py-4">No categories found.</p> )}
      </div>

      {/* --- 🔥 PREMIUM OFFERS (With Chamkili Dots) --- */}
      <div className="mt-4 px-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-end mb-4">
              <h2 className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-2">
                  <Gift size={22} className="text-rose-500" /> Deals & Spotlight
              </h2>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar px-1">
              {offers.length > 0 ? offers.map((item) => (
                  <div key={item.id} className={`min-w-[280px] md:min-w-[320px] h-40 rounded-[2rem] relative overflow-hidden shadow-lg bg-gradient-to-br ${item.gradient_color || 'from-teal-600 to-emerald-800'} cursor-pointer group`}>
                      
                      {/* ✨ MAGIC DOTTED OVERLAY FOR OFFERS ✨ */}
                      <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 2px, transparent 2px)', backgroundSize: '14px 14px' }}></div>
                      
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="absolute top-5 left-5 z-10 text-white">
                          <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md">Exclusive</span>
                          <h3 className="font-black text-2xl mt-3 w-[85%] leading-tight drop-shadow-md">{item.title}</h3>
                          <p className="font-bold text-sm mt-1 text-teal-100 flex items-center gap-1">{item.discount_text} <ChevronRight size={14}/></p>
                      </div>
                  </div>
              )) : ( <div className="text-xs text-slate-400 italic w-full text-center p-6 border border-dashed border-slate-300 rounded-[2rem] bg-white">No active offers currently running.</div> )}
          </div>
      </div>

      {/* --- ⚡ POPULAR SERVICES (BEAUTIFUL CARDS) --- */}
      <div className="mt-6 px-6 max-w-4xl mx-auto">
          <h2 className="font-black text-slate-900 text-xl tracking-tight mb-4 flex items-center gap-2"><Tag size={20} className="text-amber-500" /> Bestselling Services</h2>
          <div className="flex gap-5 overflow-x-auto pb-8 no-scrollbar px-1">
              {services.length > 0 ? services.map((service, i) => {
                  const isInCart = cart.find(item => item.id === service.id);
                  const displayPrice = service.base_price || service.price || 199;
                  return (
                   <div key={service.id || i} className="min-w-[200px] bg-white p-5 rounded-[2rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative border border-slate-100">
                       <div className="flex justify-between items-start mb-4">
                           <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-300"><Zap size={20}/></div>
                           <div className="flex flex-col items-end">
                               <span className="text-[10px] text-slate-400 font-bold line-through">₹{displayPrice + 100}</span>
                               <span className="text-slate-900 text-sm font-black">₹{displayPrice}</span>
                           </div>
                       </div>
                       <h3 className="font-black text-slate-800 text-base leading-tight mb-1 line-clamp-2 min-h-[40px]">{service.name}</h3>
                       <p className="text-[10px] text-slate-400 mb-4 font-bold uppercase tracking-widest truncate">{service.category}</p>
                       
                       <button onClick={() => addToCart(service)} disabled={isInCart} className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${isInCart ? 'bg-green-50 text-green-600 border border-green-200 cursor-default' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-teal-600'}`}>
                         {isInCart ? <><CheckCircle size={14}/> Added</> : <><Plus size={14}/> Add to Cart</>}
                       </button>
                   </div>
                  );
              }) : ( <div className="text-xs text-slate-400 italic p-6 border border-dashed rounded-[2rem] w-full text-center bg-white">Loading popular services...</div> )}
          </div>
      </div>

      {/* 🛡️ PREMIUM TRUST BANNER (With Chamkili Dots) */}
      <div className="px-6 mt-4 max-w-4xl mx-auto mb-10">
          <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
              
              {/* ✨ MAGIC DOTTED OVERLAY FOR TRUST BANNER ✨ */}
              <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-color-dodge" style={{ backgroundImage: "radial-gradient(#14b8a6 1.5px, transparent 1.5px)", backgroundSize: "16px 16px" }}></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                      <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-teal-500/20">
                          <ShieldCheck size={12} /> Kshatr Guarantee
                      </div>
                      <h2 className="text-2xl font-black mb-2">Safe. Reliable. Fast.</h2>
                      <p className="text-slate-400 text-sm max-w-sm mx-auto md:mx-0 font-medium leading-relaxed">All experts are background-verified. We guarantee your satisfaction with our 7-day re-work policy.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                      <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800 text-center backdrop-blur-sm">
                          <CheckCircle size={28} className="mx-auto mb-2 text-teal-400"/>
                          <div className="text-xl font-black text-white">100%</div>
                          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Verified</div>
                      </div>
                      <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800 text-center backdrop-blur-sm">
                          <Clock size={28} className="mx-auto mb-2 text-blue-400"/>
                          <div className="text-xl font-black text-white">45m</div>
                          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Fast Arrival</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 📱 STICKY BOTTOM NAV (Glassmorphism) */}
      <div className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-2.5 flex justify-between items-center z-50 max-w-md mx-auto left-0 right-0 md:hidden pb-safe">
        <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className={`flex flex-col items-center gap-1 text-teal-600 transition-transform active:scale-90`}><HomeIcon size={22} /> <span className="text-[10px] font-black">Home</span></button>
        <button onClick={() => navigate('/bookings')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-teal-600 transition-all active:scale-90"><Calendar size={22} /> <span className="text-[10px] font-bold">Bookings</span></button>
        
        {/* Floating Cart Button */}
        <div className="relative -top-6" onClick={() => navigate('/cart')}>
            <button className={`p-4 rounded-full shadow-[0_10px_25px_-5px_rgba(20,184,166,0.5)] ring-4 ring-white bg-slate-900 text-white active:scale-90 transition-transform relative`}> 
               <ShoppingCart size={22} className="text-teal-400" />
               {cart.length > 0 && ( <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">{cart.length}</span> )}
            </button>
        </div>
        
        <button onClick={() => alert("No new alerts")} className="flex flex-col items-center gap-1 text-slate-400 hover:text-teal-600 transition-all active:scale-90"><Bell size={22} /> <span className="text-[10px] font-bold">Alerts</span></button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-teal-600 transition-all active:scale-90"><User size={22} /> <span className="text-[10px] font-bold">Profile</span></button>
      </div>

    </div>
  );
}