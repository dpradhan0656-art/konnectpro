import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ अब रास्ता बिल्कुल साफ़ है: दो कदम पीछे फिर lib फोल्डर के अंदर
import { supabase } from '../../lib/supabase';
import SOSButton from '../../components/common/SOSButton';
import BookingModal from '../../components/customer/BookingModal';
import { Search, MapPin, User, LogOut, LogIn, Mic } from 'lucide-react';

// Categories Data
const categories = [
  { name: "AC Service", icon: "❄️", color: "bg-blue-100" },
  { name: "Cleaning", icon: "🧹", color: "bg-green-100" },
  { name: "Electrician", icon: "⚡", color: "bg-yellow-100" },
  { name: "Plumber", icon: "🚰", color: "bg-cyan-100" },
  { name: "Carpenter", icon: "🪑", color: "bg-orange-100" },
  { name: "Painter", icon: "🎨", color: "bg-purple-100" },
];

const popularServices = [
  { id: 1, name: "AC Service", price: 599, rating: 4.8, eta: '15 mins', image: "https://images.unsplash.com/photo-1581094794329-cd56b5095bb4?auto=format&fit=crop&q=80&w=1000" },
  { id: 2, name: "Bathroom Cleaning", price: 399, rating: 4.7, eta: '25 mins', image: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000" },
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
    checkUser();
    detectLocation();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  }

  // 1. Live GPS Logic (Blinkit Style)
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Simulation for now
          setLocation('Jabalpur, Madhya Pradesh');
          setAddress('Wright Town, Near Stadium');
        },
        (error) => {
          setLocation('Select Location');
          setAddress('Enable GPS for better service');
        }
      );
    } else {
      setLocation('GPS Not Supported');
    }
  };

  // 1.1 Voice Search Logic
  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
      };
      recognition.start();
    } else {
      alert("Voice search not supported in this browser.");
    }
  };

  const handleBookingConfirm = (mode) => {
    alert(`Booking Confirmed! Payment Mode: ${mode === 'online' ? 'Secure Vault' : 'Pay After Service'}. Tracking started.`);
    setSelectedService(null);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await supabase.auth.signOut();
      setUser(null);
      window.location.reload();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24 font-sans text-slate-800">
      <SOSButton />

      {/* HEADER SECTION (Deep Teal Theme) */}
      <div className="bg-teal-700 pt-6 pb-8 px-5 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>

        {/* Top Bar: Location & Auth */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <div className="flex items-center text-teal-100 text-xs font-bold uppercase tracking-wider mb-1 cursor-pointer" onClick={detectLocation}>
              <MapPin size={12} className="mr-1" /> Your Location
            </div>
            <h1 className="text-lg font-extrabold text-white leading-tight cursor-pointer" onClick={detectLocation}>
              {location}
            </h1>
            <p className="text-teal-200 text-xs truncate max-w-[200px]">{address}</p>
          </div>

          {user ? (
            <button onClick={handleLogout} className="bg-teal-800 p-2 rounded-full border border-teal-600 shadow-lg text-white">
              <LogOut size={18} />
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="bg-amber-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:bg-amber-600 transition flex items-center gap-1">
              <LogIn size={14} /> Login
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative z-10">
          <div className="relative">
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search "AC Repair" or Speak...'
              className="w-full p-4 pl-12 pr-12 rounded-2xl bg-white shadow-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all"
            />
            <button 
              onClick={startVoiceSearch}
              className={`absolute right-2 top-2 p-2 rounded-xl transition-all ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
              }`}
            >
              <Mic size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Scroll */}
      <div className="mt-6 pl-5 overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex gap-4 w-max pr-5">
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

      {/* Popular Services */}
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Most Popular</h2>
          <span className="text-teal-600 font-bold text-sm bg-teal-50 px-2 py-1 rounded">View All</span>
        </div>

        <div className="grid gap-4">
          {popularServices.map((service) => (
            <div key={service.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition active:scale-95 cursor-pointer">
              <img src={service.image} className="w-24 h-24 object-cover rounded-xl" alt={service.name} />
              <div className="flex-1 py-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800">{service.name}</h3>
                    <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-lg text-xs font-bold">₹{service.price}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-amber-500 text-xs">★ {service.rating}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-bold text-green-600">{service.eta} ETA</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedService(service)}
                  className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg w-full mt-2 hover:bg-slate-800 transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
          onConfirm={handleBookingConfirm}
        />
      )}
    </div>
  );
}