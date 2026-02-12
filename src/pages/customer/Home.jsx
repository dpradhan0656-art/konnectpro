import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { BRAND } from '../../config/brandConfig';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import SOSButton from '../../components/common/SOSButton';
import BookingModal from '../../components/customer/BookingModal';
import { 
  Search, Mic, ShieldCheck, Zap, Star, Clock, 
  MapPin, Camera, Wallet, ArrowRight,
  Home as HomeIcon, Calendar, Bell, User,
  Gift, TrendingUp
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [locationName, setLocationName] = useState('Detecting...');
  const [cityStatus, setCityStatus] = useState({ active: true, message: "Serving In" });
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // --- DATA SECTIONS ---
  const categories = [
    { name: "AC Repair", icon: "❄️", color: "bg-blue-50 border-blue-100" },
    { name: "Cleaning", icon: "🧹", color: "bg-green-50 border-green-100" },
    { name: "Electrician", icon: "⚡", color: "bg-amber-50 border-amber-100" },
    { name: "Plumber", icon: "🚰", color: "bg-cyan-50 border-cyan-100" },
    { name: "Carpenter", icon: "🪑", color: "bg-orange-50 border-orange-100" },
  ];

  const spotlights = [
    { id: 1, title: "AC Service", discount: "Starts @ ₹499", color: "from-blue-500 to-blue-700", img: "https://images.unsplash.com/photo-1581094794329-cd56b5095bb4?w=400" },
    { id: 2, title: "Deep Cleaning", discount: "Flat 20% OFF", color: "from-teal-500 to-teal-700", img: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=400" },
  ];

  const mostBooked = [
    { id: 1, name: "Power Saver AC Service", price: 599, rating: 4.8, reviews: "2k+", img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500" },
    { id: 2, name: "Intense Bathroom Clean", price: 399, rating: 4.7, reviews: "1.5k+", img: "https://images.unsplash.com/photo-1585412727339-54e4513e2213?w=500" },
  ];

  // --- HELPER: Format Location Name ---
  const formatLocationDisplay = (loc) => {
    if (!loc.includes(',')) return loc;
    const parts = loc.split(',');
    const area = parts[0].trim();
    const city = parts[1].trim();
    // Agar Area aur City same hain (e.g. Jabalpur, Jabalpur) toh ek hi dikhao
    return area === city ? area : `${area} | ${city}`;
  };

  // --- LOGIC: Lifecycle & Database Connection ---
  useEffect(() => {
    document.title = `${BRAND.name} | India's Trusted Home Services`;
    
    // 1. User Session
    const getUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    };
    getUser();

    // 2. 🛰️ SMART GPS & REAL DATABASE CHECK
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const addr = data.address;
          const localArea = addr.suburb || addr.neighbourhood || addr.village || addr.road || "";
          const city = addr.city || addr.town || "Jabalpur";

          setLocationName(localArea ? `${localArea}, ${city}` : city);

          // ✅ REAL DATABASE CHECK
          const { count, error } = await supabase
            .from('experts')
            .select('*', { count: 'exact', head: true })
            .ilike('city', `%${city}%`)
            .eq('is_verified', true);

          if (error) {
             console.log("DB Check skipped (Dev Mode)");
             setCityStatus({ active: true, message: "Serving In" });
          } else if (count > 0) {
             setCityStatus({ active: true, message: "Serving In" });
          } else {
             // DEV MODE LOCK: Jab tak Admin Panel nahi banta, Active rakhte hain
             setCityStatus({ active: true, message: "Serving In" }); 
          }
        } catch (err) {
          setLocationName("Jabalpur, MP");
          setCityStatus({ active: true, message: "Serving In" });
        }
      }, () => {
          setLocationName("Jabalpur (Default)");
          setCityStatus({ active: true, message: "Serving In" });
      }, { enableHighAccuracy: true });
    }
  }, []);

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (e) => setSearchQuery(e.results[0][0].transcript);
      recognition.start();
    } else { alert("Voice search not supported"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-teal-100 relative">
      <Navbar user={user} />
      <SOSButton />

      {/* --- HERO SECTION (Important: overflow-visible for Dropdown) --- */}
      <div className={`relative pt-6 pb-24 px-6 rounded-b-[2.5rem] shadow-2xl overflow-visible transition-colors duration-500 ${cityStatus.active ? 'bg-teal-800' : 'bg-slate-800'}`}>
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* 📍 PINPOINT LOCATION HEADER */}
          <div className="flex items-center gap-3 mb-8 bg-white/10 backdrop-blur-md w-fit px-4 py-2 rounded-full border border-white/20 shadow-lg">
            <div className={`p-1.5 rounded-full ${cityStatus.active ? 'bg-amber-400' : 'bg-red-500'} animate-pulse shadow-md`}>
               <MapPin size={16} className="text-teal-900" />
            </div>
            <div>
                <p className="text-[10px] font-black text-teal-200 uppercase tracking-widest leading-none mb-0.5">{cityStatus.message}</p>
                <h2 className="text-sm font-black text-white leading-none tracking-wide">
                  {formatLocationDisplay(locationName)}
                </h2>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-8">
            {cityStatus.active ? (
                <span>Experts at your doorstep in <br/><span className="text-amber-400 underline decoration-amber-400/30 underline-offset-8">{locationName.split(',').pop()}</span></span>
            ) : (
                <span>Services starting soon in <span className="text-red-400">{locationName}</span></span>
            )}
          </h1>

          {/* --- SMART SEARCH BAR WITH FLOATING RESULTS --- */}
          <div className="relative z-50"> 
            {cityStatus.active ? (
              <div className="relative group">
                {/* Input Field */}
                <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl bg-white z-50 transform transition-transform group-focus-within:scale-[1.02]">
                  <Search className="absolute left-5 top-5 text-slate-400" size={22} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for 'AC Repair', 'Cleaning'..." 
                    className="w-full p-5 pl-14 pr-14 rounded-2xl bg-white text-slate-900 font-bold text-lg focus:ring-4 focus:ring-amber-400/50 outline-none transition-all placeholder:text-slate-300 placeholder:font-medium"
                  />
                  <button onClick={handleVoiceSearch} className={`absolute right-4 top-3.5 p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-teal-700 bg-teal-50 hover:bg-teal-100'}`}>
                    <Mic size={22} />
                  </button>
                </div>

                {/* 🔥 RESULTS DROPDOWN (Highest Z-Index) */}
                {searchQuery.length > 0 && (
                  <div className="absolute top-full mt-3 left-0 w-full bg-white rounded-2xl shadow-[0_50px_100px_-20px_rgba(50,50,93,0.25)] border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="p-3 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Best Matches
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {mostBooked.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                        mostBooked.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((service) => (
                          <div key={service.id} onClick={() => { setSelectedService(service); setSearchQuery(''); }} className="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-teal-50 cursor-pointer transition-colors group">
                            <div className="flex items-center gap-4">
                              <img src={service.img} className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm" alt="" />
                              <div>
                                <p className="text-sm font-bold text-slate-900 group-hover:text-teal-700">{service.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-teal-700 font-black text-xs bg-teal-50 px-2 py-0.5 rounded">₹{service.price}</span>
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Star size={10} className="fill-amber-400 text-amber-400"/> {service.rating}</span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white border border-slate-100 p-2.5 rounded-full group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all shadow-sm">
                                <ArrowRight size={18} />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                             <Search className="text-slate-300" size={32}/>
                          </div>
                          <p className="text-sm font-bold text-slate-500">No services found for "{searchQuery}"</p>
                          <p className="text-xs text-slate-400 mt-1">Try searching for 'AC' or 'Cleaning'</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-white shadow-xl">
                <p className="text-lg font-bold mb-2">Expansion Alert! 🚀</p>
                <p className="text-sm font-medium leading-relaxed opacity-90">We are expanding rapidly! Get notified as soon as we launch in <span className="font-black text-amber-400 underline">{locationName}</span>.</p>
                <button className="mt-5 bg-amber-400 text-teal-900 px-6 py-3 rounded-xl font-black text-xs uppercase shadow-lg hover:scale-105 transition-transform">Notify Me</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      {cityStatus.active && (
        <>
          {/* Trust Bar (Now Z-index lowered to avoid overlap) */}
          <div className="px-6 -mt-10 relative z-20">
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex justify-between items-center">
                  <div className="flex flex-col items-center gap-1">
                      <div className="bg-green-100 p-2 rounded-full text-green-700"><ShieldCheck size={18} /></div>
                      <span className="text-[10px] font-bold text-slate-600">Verified</span>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-100"></div>
                  <div className="flex flex-col items-center gap-1">
                      <div className="bg-amber-100 p-2 rounded-full text-amber-700"><Star size={18} /></div>
                      <span className="text-[10px] font-bold text-slate-600">4.8 Rated</span>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-100"></div>
                  <div className="flex flex-col items-center gap-1">
                      <div className="bg-blue-100 p-2 rounded-full text-blue-700"><Wallet size={18} /></div>
                      <span className="text-[10px] font-bold text-slate-600">Insured</span>
                  </div>
              </div>
          </div>

          {/* Categories */}
          <div className="mt-8 px-6">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-slate-900 text-lg">Categories</h2>
                  <span className="text-teal-700 text-xs font-bold cursor-pointer hover:underline">View All</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {categories.map((cat, i) => (
                      <div key={i} onClick={() => navigate(`/services/${cat.name.toLowerCase().replace(' ', '-')}`)} className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group active:scale-90 transition-transform duration-200">
                          <div className={`w-16 h-16 ${cat.color} border rounded-2xl flex items-center justify-center text-2xl bg-white group-hover:shadow-md transition-all`}>{cat.icon}</div>
                          <span className="text-[11px] font-bold text-slate-600 group-hover:text-teal-700 whitespace-nowrap">{cat.name}</span>
                      </div>
                  ))}
              </div>
          </div>

          {/* Spotlight Offers */}
          <div className="mt-4 px-6">
              <h2 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2"><Gift size={20} className="text-amber-500" /> In Spotlight</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {spotlights.map((item) => (
                      <div key={item.id} className={`min-w-[260px] h-36 rounded-3xl relative overflow-hidden shadow-lg bg-gradient-to-r ${item.color} cursor-pointer`}>
                          <div className="absolute top-4 left-4 z-10 text-white">
                              <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-white/20 backdrop-blur-sm">Offer</span>
                              <h3 className="font-black text-xl mt-2 w-2/3 leading-tight">{item.title}</h3>
                              <p className="font-bold text-sm mt-1 text-white/90">{item.discount}</p>
                          </div>
                          <img src={item.img} className="absolute right-0 bottom-0 w-32 h-32 object-contain translate-x-4 translate-y-4" alt="" />
                      </div>
                  ))}
              </div>
          </div>

          {/* MOST BOOKED SECTION (Static Recommendations) */}
          <div className="mt-6 px-6 mb-10">
              <h2 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-teal-600" /> Most Booked
              </h2>
              <div className="flex flex-col gap-4">
                  {mostBooked.map((service) => (
                      <div key={service.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex gap-4 cursor-pointer active:scale-95 transition-transform hover:border-teal-100">
                          <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative">
                              <img src={service.img} className="w-full h-full object-cover" alt="" />
                              <div className="absolute bottom-0 w-full bg-black/50 text-white text-[9px] font-bold text-center py-1 backdrop-blur-sm">{service.reviews} Bookings</div>
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                              <div>
                                  <h3 className="font-bold text-slate-900 text-sm">{service.name}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                      <span className="flex items-center gap-1 text-slate-800 text-xs font-bold"><Star size={12} className="fill-amber-400 text-amber-400"/> {service.rating}</span>
                                      <span className="text-slate-300">•</span>
                                      <span className="text-xs text-slate-500 font-medium">45 mins</span>
                                  </div>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                  <span className="text-teal-700 font-black text-sm">₹{service.price}</span>
                                  <button onClick={() => setSelectedService(service)} className="bg-white border border-slate-200 text-teal-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-teal-50 shadow-sm">ADD +</button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        </>
      )}

      <Footer />

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 pb-safe">
        <button onClick={() => window.scrollTo(0,0)} className="flex flex-col items-center gap-1 text-teal-700">
            <HomeIcon size={24} /> <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => navigate('/bookings')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-teal-700">
            <Calendar size={24} /> <span className="text-[10px] font-bold">Bookings</span>
        </button>
        <div className="relative -top-6">
            <button className="bg-teal-700 text-white p-4 rounded-full shadow-xl shadow-teal-700/30 ring-4 ring-white hover:scale-110 transition-transform"><Zap size={24} fill="white" /></button>
        </div>
        <button onClick={() => alert("No Alerts")} className="flex flex-col items-center gap-1 text-slate-400 hover:text-teal-700">
            <Bell size={24} /> <span className="text-[10px] font-bold">Alerts</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-teal-700">
            <User size={24} /> <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>

      {selectedService && (
        <BookingModal service={selectedService} user={user} onClose={() => setSelectedService(null)} />
      )}
    </div>
  );
}