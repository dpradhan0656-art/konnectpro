import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ User ke purane code ke hisaab se path adjust kiya hai
import { supabase } from '../../lib/supabase'; 
import { BRAND } from '../../config/brandConfig';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import SOSButton from '../../components/common/SOSButton';
import ExpertCard from '../../components/ExpertCard';
import { 
  Search, Mic, ShieldCheck, Zap, Star, 
  MapPin, Wallet, Home as HomeIcon, Calendar, Bell, User,
  Gift, TrendingUp, Tag 
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [locationName, setLocationName] = useState('Detecting...');
  const [currentCity, setCurrentCity] = useState('Jabalpur');
  const [cityStatus, setCityStatus] = useState({ active: true, message: "Serving In" });
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // ✅ States
  const [experts, setExperts] = useState([]);
  const [offers, setOffers] = useState([]); 
  const [services, setServices] = useState([]); // Real Services from DB
  const [tickerText, setTickerText] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [themeGradient, setThemeGradient] = useState('from-teal-900 via-teal-800 to-teal-600');
  const [accentColor, setAccentColor] = useState('text-teal-600');

  // ✅ Fallback Categories
  const defaultCategories = [
    { name: "AC Repair", icon: "❄️" },
    { name: "Cleaning", icon: "🧹" },
    { name: "Electrician", icon: "⚡" },
    { name: "Plumber", icon: "🚰" },
    { name: "Carpenter", icon: "🪑" },
    { name: "RO Service", icon: "💧" }
  ];

  // --- HELPER: Category Colors ---
  const getColorByIndex = (index) => {
      const colors = [
          "bg-blue-50 border-blue-100 text-blue-600",
          "bg-green-50 border-green-100 text-green-600",
          "bg-amber-50 border-amber-100 text-amber-600",
          "bg-cyan-50 border-cyan-100 text-cyan-600",
          "bg-rose-50 border-rose-100 text-rose-600"
      ];
      return colors[index % colors.length];
  };

  // --- 1. FETCH ALL DATA ---
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // A. Admin Settings
        const { data: themeData } = await supabase.from('admin_settings').select('*').eq('setting_key', 'theme_color').single();
        if (themeData) {
            const gradients = {
                'teal': 'from-teal-900 via-teal-800 to-teal-600',
                'blue': 'from-blue-900 via-blue-800 to-blue-600',
                'rose': 'from-rose-900 via-rose-800 to-rose-600'
            };
            const accents = {
                'teal': 'text-teal-600', 'blue': 'text-blue-600', 'rose': 'text-rose-600'
            };
            setThemeGradient(gradients[themeData.setting_value] || gradients['teal']);
            setAccentColor(accents[themeData.setting_value] || accents['teal']);
        }
        
        const { data: tickerData } = await supabase.from('admin_settings').select('*').eq('setting_key', 'ticker_text').single();
        if (tickerData) setTickerText(tickerData.setting_value || "");

        // B. Offers
        const { data: offerData } = await supabase.from('spotlight_offers').select('*').eq('is_active', true);
        if (offerData) setOffers(offerData);

        // C. Services & Prices (Live from DB)
        const { data: serviceData } = await supabase.from('services').select('*').limit(10);
        if (serviceData) setServices(serviceData);

        // D. Experts
        fetchExpertsByCity("Jabalpur");

      } catch (err) { console.error("Fetch Error:", err); }
      setLoading(false);
    };

    fetchAllData();
  }, []);

  const fetchExpertsByCity = async (city) => {
    const { data } = await supabase
        .from('experts')
        .select('*')
        .ilike('city', `%${city}%`)
        .eq('is_verified', true)
        .limit(10);
    setExperts(data || []);
  };

  // --- 2. USER & GPS LOGIC ---
  useEffect(() => {
    document.title = `${BRAND.name} | India's Trusted Home Services`;
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || "Jabalpur";
          setLocationName(data.address.suburb || city);
          setCurrentCity(city);
          fetchExpertsByCity(city);
        } catch (err) { fetchExpertsByCity("Jabalpur"); }
      }, () => fetchExpertsByCity("Jabalpur"));
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
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-teal-100 relative pb-24">
      
      {/* 📢 TICKER */}
      {tickerText && (
        <div className="bg-amber-400 text-slate-900 text-[11px] font-black py-2 overflow-hidden relative z-50 shadow-md">
          <marquee scrollamount="6" className="w-full">
              <span className="flex gap-10 uppercase tracking-widest font-bold">
                  📢 {tickerText} &nbsp;&nbsp;&nbsp;&nbsp; 🔥 {tickerText}
              </span>
          </marquee>
        </div>
      )}

      <Navbar user={user} />
      <SOSButton />

      {/* --- HERO SECTION --- */}
      <div className={`relative pt-6 pb-24 px-6 rounded-b-[2.5rem] shadow-2xl overflow-hidden transition-all duration-1000 bg-gradient-to-br ${themeGradient}`}>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8 bg-white/10 backdrop-blur-md w-fit px-4 py-2 rounded-full border border-white/20 shadow-lg">
            <div className={`p-1.5 rounded-full ${cityStatus.active ? 'bg-amber-400' : 'bg-red-500'} animate-pulse shadow-md`}>
               <MapPin size={16} className="text-teal-900" />
            </div>
            <div>
                <p className="text-[10px] font-black text-teal-200 uppercase tracking-widest leading-none mb-0.5">{cityStatus.message}</p>
                <h2 className="text-sm font-black text-white leading-none tracking-wide">{locationName}</h2>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-8">
              Experts at your doorstep in <br/>
              <span className="text-amber-400 underline decoration-amber-400/30 underline-offset-8">{currentCity}</span>
          </h1>
          <div className="relative z-30"> 
              <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl bg-white z-50">
                <Search className="absolute left-5 top-5 text-slate-400" size={22} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search in ${currentCity}...`} 
                  className="w-full p-5 pl-14 pr-14 rounded-2xl bg-white text-slate-900 font-bold text-lg focus:ring-4 focus:ring-amber-400/50 outline-none"
                />
                <button onClick={handleVoiceSearch} className={`absolute right-4 top-3.5 p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-teal-700 bg-teal-50 hover:bg-teal-100'}`}>
                  <Mic size={22} />
                </button>
              </div>
          </div>
        </div>
      </div>

      {/* --- CATEGORIES --- */}
      <div className="mt-8 px-6 max-w-4xl mx-auto">
          <h2 className="font-bold text-slate-900 text-lg mb-4">Categories</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {defaultCategories.map((cat, i) => (
                  <div key={i} onClick={() => navigate(`/services/${cat.name.toLowerCase().replace(' ', '-')}`)} className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group active:scale-90 transition-transform">
                      <div className={`w-16 h-16 ${getColorByIndex(i)} border rounded-2xl flex items-center justify-center text-2xl bg-white shadow-sm group-hover:shadow-md transition-all`}>
                          {cat.icon}
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">{cat.name}</span>
                  </div>
              ))}
          </div>
      </div>

      {/* --- POPULAR SERVICES (DB LINKED) --- */}
      <div className="mt-6 px-6 max-w-4xl mx-auto">
          <h2 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
            <Tag size={20} className="text-pink-500" /> Popular Services
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
             {services.length > 0 ? services.map((service, i) => (
                 <div key={i} className="min-w-[160px] bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-2xl group-hover:scale-110 transition-transform">⚡</span>
                        <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-200">
                          ₹{service.base_price || service.price}
                        </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{service.name}</h3>
                    <p className="text-[10px] text-slate-400">{service.category}</p>
                 </div>
             )) : (
                 <div className="text-xs text-slate-400 italic p-4 border border-dashed rounded-xl w-full text-center">
                    Services are being updated...
                 </div>
             )}
          </div>
      </div>

      {/* --- SPOTLIGHT OFFERS --- */}
      <div className="mt-6 px-6 max-w-4xl mx-auto">
          <h2 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2"><Gift size={20} className="text-amber-500" /> In Spotlight</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {offers.length > 0 ? offers.map((item) => (
                  <div key={item.id} className={`min-w-[260px] h-36 rounded-3xl relative overflow-hidden shadow-lg bg-gradient-to-r ${item.gradient_color || 'from-teal-600 to-teal-800'} cursor-pointer`}>
                      <div className="absolute top-4 left-4 z-10 text-white">
                          <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-white/20 backdrop-blur-sm">Offer</span>
                          <h3 className="font-black text-xl mt-2 w-2/3 leading-tight drop-shadow-md">{item.title}</h3>
                          <p className="font-bold text-sm mt-1 text-white/90">{item.discount_text}</p>
                      </div>
                      <img src={item.image_url} onError={(e) => e.target.style.display = 'none'} className="absolute right-0 bottom-0 w-32 h-32 object-contain translate-x-4 translate-y-4" alt="" />
                  </div>
              )) : (
                 <div className="text-xs text-slate-400 italic w-full text-center">No active offers.</div>
              )}
          </div>
      </div>

      {/* --- EXPERTS LIST --- */}
      <div className="mt-6 px-6 mb-4 max-w-4xl mx-auto">
          <h2 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <TrendingUp size={20} className={accentColor} /> Top Experts in {currentCity}
          </h2>
          {loading ? (
            <p className="text-center text-gray-400 py-10 font-bold animate-pulse">Finding best experts nearby...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {experts.map((expert) => (
                    <ExpertCard key={expert.id} expert={expert} />
                ))}
            </div>
          )}
          {!loading && experts.length === 0 && (
             <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-300 mx-auto">
                <p className="text-gray-500 font-bold">No experts found in {currentCity} yet.</p>
             </div>
          )}
      </div>

      <Footer />
      
      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 max-w-md mx-auto left-0 right-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className={`flex flex-col items-center gap-1 ${accentColor}`}>
            <HomeIcon size={24} /> <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => navigate('/bookings')} className="flex flex-col items-center gap-1 text-slate-400">
            <Calendar size={24} /> <span className="text-[10px] font-bold">Bookings</span>
        </button>
        <div className="relative -top-6">
            <button className={`p-4 rounded-full shadow-2xl ring-4 ring-white bg-teal-600 text-white active:scale-90 transition-transform`}> 
               <Zap size={24} fill="white" />
            </button>
        </div>
        <button onClick={() => alert("No Alerts")} className="flex flex-col items-center gap-1 text-slate-400">
            <Bell size={24} /> <span className="text-[10px] font-bold">Alerts</span>
        </button>
        <button onClick={() => navigate('/admin')} className="flex flex-col items-center gap-1 text-slate-400">
            <User size={24} /> <span className="text-[10px] font-bold">Admin</span>
        </button>
      </div>
    </div>
  );
}