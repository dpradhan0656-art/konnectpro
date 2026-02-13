import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { BRAND } from '../../config/brandConfig';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import SOSButton from '../../components/common/SOSButton';
import ExpertCard from '../../components/ExpertCard'; // ✅ Imported our Modular Component
import { 
  Search, Mic, ShieldCheck, Zap, Star, 
  MapPin, Wallet, ArrowRight,
  Home as HomeIcon, Calendar, Bell, User,
  Gift, TrendingUp
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [locationName, setLocationName] = useState('Detecting...');
  const [currentCity, setCurrentCity] = useState('Jabalpur'); // Default City
  const [cityStatus, setCityStatus] = useState({ active: true, message: "Serving In" });
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // ✅ State for Real Experts from Supabase
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- CATEGORIES ---
  const categories = [
    { name: "AC Repair", icon: "❄️", color: "bg-blue-50 border-blue-100" },
    { name: "Cleaning", icon: "🧹", color: "bg-green-50 border-green-100" },
    { name: "Electrician", icon: "⚡", color: "bg-amber-50 border-amber-100" },
    { name: "Plumber", icon: "🚰", color: "bg-cyan-50 border-cyan-100" },
    { name: "Carpenter", icon: "🪑", color: "bg-orange-50 border-orange-100" },
  ];

  // Replace this part in your Home.jsx inside the component
const spotlights = [
    { 
      id: 1, 
      title: "AC Service", 
      discount: "Starts @ ₹499", 
      color: "from-blue-600 to-blue-800", 
      // ✅ Reliable Professional Image
      img: "https://cdn.pixabay.com/photo/2016/11/29/01/22/air-conditioner-1866504_1280.jpg" 
    },
    { 
      id: 2, 
      title: "Deep Cleaning", 
      discount: "Flat 20% OFF", 
      color: "from-teal-600 to-teal-800", 
      // ✅ High Quality Cleaning Image
      img: "https://cdn.pixabay.com/photo/2014/02/17/14/28/vacuum-cleaner-268179_1280.jpg" 
    },
];
  // --- HELPER: Format Location Name ---
  const formatLocationDisplay = (loc) => {
    if (!loc.includes(',')) return loc;
    const parts = loc.split(',');
    const area = parts[0].trim();
    const city = parts[1].trim();
    return area === city ? area : `${area} | ${city}`;
  };

  // --- FETCH EXPERTS BASED ON CITY ---
  const fetchExpertsByCity = async (city) => {
    setLoading(true);
    try {
        // ✅ Supabase Query: Sirf us city ke verified experts lao
        const { data, error } = await supabase
            .from('experts')
            .select('*')
            .ilike('city', `%${city}%`) // Flexible Match (e.g. "Sagar" matches "Sagar, MP")
            .eq('is_verified', true)
            .limit(10);

        if (error) {
            console.error("Error fetching experts:", error);
        } else if (data && data.length > 0) {
            setExperts(data);
        } else {
            // Fallback: Agar DB khali hai, toh Demo Experts dikhao taaki site khali na lage
            setExperts([
                { id: 99, name: "KonnectPro Expert", specialization: "General Service", rating: "4.9", experience_years: 5, city: city, area: "Main Market", image_url: "" }
            ]);
        }
    } catch (err) {
        console.error("System Error:", err);
    }
    setLoading(false);
  };

  // --- LOGIC: Lifecycle & GPS ---
  useEffect(() => {
    document.title = `${BRAND.name} | India's Trusted Home Services`;
    
    // 1. User Session
    const getUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    };
    getUser();

    // 2. 🛰️ SMART GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const addr = data.address;
          
          const localArea = addr.suburb || addr.neighbourhood || addr.village || "";
          const city = addr.city || addr.town || addr.district || "Jabalpur";
          
          setLocationName(localArea ? `${localArea}, ${city}` : city);
          setCurrentCity(city);
          
          // Trigger Data Fetch for this City
          fetchExpertsByCity(city);

        } catch (err) {
          setLocationName("Jabalpur, MP");
          fetchExpertsByCity("Jabalpur");
        }
      }, () => {
          setLocationName("Jabalpur (Default)");
          fetchExpertsByCity("Jabalpur");
      }, { enableHighAccuracy: true });
    } else {
        // GPS not supported
        fetchExpertsByCity("Jabalpur");
    }
  }, []);

  // Voice Search Handler
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
      <Navbar user={user} />
      <SOSButton />

      {/* --- HERO SECTION --- */}
      <div className={`relative pt-6 pb-24 px-6 rounded-b-[2.5rem] shadow-2xl overflow-hidden transition-colors duration-500 ${cityStatus.active ? 'bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600' : 'bg-slate-800'}`}>
    
    {/* Add this Decorative Pattern inside the div */}
    <div className="absolute inset-0 opacity-10 pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)', backgroundSize: '20px 20px' }}>
    </div>
    
    {/* ... baaki code waisa hi rahega ... */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* 📍 Location Header */}
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
              Experts at your doorstep in <br/>
              <span className="text-amber-400 underline decoration-amber-400/30 underline-offset-8">
                {currentCity}
              </span>
          </h1>

          {/* --- SEARCH BAR --- */}
          <div className="relative z-30"> 
              <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl bg-white z-50 group-focus-within:scale-[1.02]">
                <Search className="absolute left-5 top-5 text-slate-400" size={22} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search in ${currentCity}...`} 
                  className="w-full p-5 pl-14 pr-14 rounded-2xl bg-white text-slate-900 font-bold text-lg focus:ring-4 focus:ring-amber-400/50 outline-none transition-all placeholder:text-slate-300"
                />
                <button onClick={handleVoiceSearch} className={`absolute right-4 top-3.5 p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-teal-700 bg-teal-50 hover:bg-teal-100'}`}>
                  <Mic size={22} />
                </button>
              </div>
          </div>
        </div>
      </div>

      {/* --- TRUST BADGES --- */}
      <div className="px-6 -mt-10 relative z-20 max-w-4xl mx-auto">
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
                  <span className="text-[10px] font-bold text-slate-600">Affordable</span>
              </div>
          </div>
      </div>

      {/* --- CATEGORIES --- */}
      <div className="mt-8 px-6 max-w-4xl mx-auto">
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
{/* --- HOW IT WORKS SECTION (New) --- */}
<div className="mt-8 px-6 max-w-4xl mx-auto">
    <h2 className="font-bold text-slate-900 text-lg mb-4">How it Works</h2>
    <div className="flex justify-between gap-2">
        {/* Step 1 */}
        <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center mx-auto text-lg">📍</div>
            <p className="text-xs font-bold text-slate-700 mt-2">Select Location</p>
        </div>
        {/* Arrow */}
        <div className="flex items-center text-slate-300">→</div>
        {/* Step 2 */}
        <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center mx-auto text-lg">👨‍🔧</div>
            <p className="text-xs font-bold text-slate-700 mt-2">Choose Expert</p>
        </div>
        {/* Arrow */}
        <div className="flex items-center text-slate-300">→</div>
        {/* Step 3 */}
        <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center mx-auto text-lg">✅</div>
            <p className="text-xs font-bold text-slate-700 mt-2">Book Service</p>
        </div>
    </div>
</div>
      {/* --- SPOTLIGHT OFFERS --- */}
      <div className="mt-4 px-6 max-w-4xl mx-auto">
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

      {/* --- REAL EXPERTS LIST (City Wise) --- */}
      <div className="mt-6 px-6 mb-4 max-w-4xl mx-auto">
          <h2 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-teal-600" /> Top Experts in {currentCity}
          </h2>
          
          {loading ? (
            <p className="text-center text-gray-400 py-10">Finding best experts nearby...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {experts.map((expert) => (
                    // ✅ Using the Modular ExpertCard Component
                    <ExpertCard key={expert.id} expert={expert} />
                ))}
            </div>
          )}
          
          {/* Empty State */}
          {!loading && experts.length === 0 && (
             <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No experts found in {currentCity} yet.</p>
                <p className="text-sm text-teal-600 mt-2">Be the first to join KonnectPro here!</p>
             </div>
          )}
      </div>

      <Footer />

      {/* --- BOTTOM NAV --- */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 pb-safe max-w-md mx-auto left-0 right-0">
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
    </div>
  );
}