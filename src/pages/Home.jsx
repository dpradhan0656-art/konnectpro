import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { BRAND } from '../../config/brandConfig';
import SOSButton from '../../components/common/SOSButton';
import BookingModal from '../../components/customer/BookingModal';
import Navbar from '../../components/common/Navbar';
import { Search, MapPin, LogOut, LogIn, Mic, ShieldCheck, Zap } from 'lucide-react';

const categories = [
  { name: "AC Service", icon: "❄️", color: "bg-blue-100" },
  { name: "Cleaning", icon: "🧹", color: "bg-green-100" },
  { name: "Electrician", icon: "⚡", color: "bg-yellow-100" },
  { name: "Plumber", icon: "🚰", color: "bg-cyan-100" },
  { name: "Carpenter", icon: "🪑", color: "bg-orange-100" },
  { name: "Painter", icon: "🎨", color: "bg-purple-100" },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState('Detecting Location...');
  const [address, setAddress] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    // 1. Browser Tab Title Update
    document.title = `${BRAND.name} - ${BRAND.tagline}`;
    checkUser();
    detectLocation();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  }

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation('Jabalpur, Madhya Pradesh');
          setAddress('Wright Town, Near Stadium');
        },
        (error) => {
          setLocation('Select Location');
          setAddress('Enable GPS for better service');
        }
      );
    }
  };

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        setSearchQuery(event.results[0][0].transcript);
      };
      recognition.start();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24 font-sans text-slate-800">
      <Navbar />
      <SOSButton />

      {/* HERO SECTION - Deep Teal (Mercury Energy) */}
      <div className="bg-teal-700 pt-6 pb-8 px-5 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <div className="flex items-center text-teal-100 text-xs font-bold uppercase tracking-wider mb-1 cursor-pointer" onClick={detectLocation}>
              <MapPin size={12} className="mr-1" /> Your Location
            </div>
            <h1 className="text-lg font-extrabold text-white leading-tight">{location}</h1>
            <p className="text-teal-200 text-xs truncate max-w-[200px]">{address}</p>
          </div>
        </div>

        {/* Search Bar with Amber Accent (Sun Energy) */}
        <div className="relative z-10">
          <div className="relative">
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${BRAND.name}...`}
              className="w-full p-4 pl-12 pr-12 rounded-2xl bg-white shadow-lg text-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all"
            />
            <button onClick={startVoiceSearch} className={`absolute right-2 top-2 p-2 rounded-xl ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-teal-50 text-teal-700'}`}>
              <Mic size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 🛡️ NEW: SAFETY GUARANTEE (Imandari wala Feature) */}
      <div className="px-5 mt-6">
        <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3 border border-green-100">
          <ShieldCheck className="text-green-600" size={24} />
          <div>
            <h4 className="font-bold text-green-800 text-sm">{BRAND.name} Safety Guarantee</h4>
            <p className="text-xs text-green-600">Verified Experts & Insurance Cover upto ₹5000.</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-8 px-5">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-amber-500 fill-amber-500" /> Categories
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {categories.map((cat, index) => (
            <div key={index} className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
              <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-100`}>
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-gray-600">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}
    </div>
  );
}
{/* 🚀 NEW: PARTNER & ADMIN SECTION (Link Here) */}
      <div className="mx-5 mt-8 mb-24"> {/* mb-24 taaki bottom nav se na chhipe */}
        
        {/* 1. Join Expert Army Card */}
        <div className="bg-slate-900 rounded-[2rem] p-6 relative overflow-hidden shadow-2xl mb-8">
           <div className="relative z-10">
              <h3 className="text-white font-black text-xl mb-2">Are you an Expert?</h3>
              <p className="text-slate-400 text-xs mb-6 w-3/4 leading-relaxed">
                Join our "Expert Army". Get verified leads and grow your income with {BRAND.name}.
              </p>
              <button 
                onClick={() => navigate('/register-expert')} 
                className="bg-teal-500 hover:bg-teal-400 text-white py-3 px-6 rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                Register Now <span className="bg-white/20 rounded-full p-1 text-[10px]">➜</span>
              </button>
           </div>
           {/* Decorative Glow */}
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-600 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
        </div>

        {/* 2. Quick Links (Admin Link) */}
        <div className="text-center space-y-4">
            <p 
              onClick={() => navigate('/admin')} 
              className="text-xs font-bold text-slate-300 hover:text-teal-600 cursor-pointer uppercase tracking-widest transition-colors"
            >
              👑 Founder Login (DeepakHQ)
            </p>
            <p className="text-[10px] text-slate-300">
              Made with ❤️ in Jabalpur<br/>
              © 2025 {BRAND.name}
            </p>
        </div>
      </div>