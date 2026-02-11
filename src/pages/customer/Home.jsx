import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Modular Components Import
import Navbar from '../../components/common/Navbar';
import HeroSection from '../../components/customer/HeroSection';
import Footer from '../../components/common/Footer';
import BookingModal from '../../components/customer/BookingModal'; // ✅ New Import

// Icons
import { ShieldCheck, BadgeIndianRupeeIcon, ShieldAlert, Zap, Star, Clock, Home as HomeIcon, Calendar, Bell, User } from 'lucide-react';

// --- SMALL INTERNAL COMPONENTS ---
const CategoryCard = ({ icon, name, color, onClick }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group">
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/50 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <span className="text-xs font-bold text-slate-600 group-hover:text-teal-700">{name}</span>
  </div>
);

const ServiceCard = ({ service, onBook }) => (
  <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4 active:scale-95 transition-transform relative overflow-hidden">
    <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-[8px] font-bold px-2 py-1 rounded-bl-xl z-10">GST INCL.</div>
    <div className="relative w-24 h-24">
        <img src={service.image} className="w-full h-full object-cover rounded-2xl" alt={service.name} />
        <div className="absolute top-0 left-0 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-br-xl rounded-tl-xl text-[10px] font-bold text-teal-700 flex items-center gap-1"><ShieldCheck size={10} /> Verified</div>
    </div>
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-slate-800 text-sm">{service.name}</h3>
            <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-lg text-xs font-black">₹{service.price}</span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-amber-500"><Star size={10} fill="currentColor"/> {service.rating}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-green-600"><Clock size={10}/> {service.eta}</span>
        </div>
      </div>
      <button onClick={() => onBook(service)} className="w-full bg-slate-900 text-white text-xs font-bold py-2 rounded-xl mt-2 shadow-lg active:bg-teal-600 transition-colors">Book Now</button>
    </div>
  </div>
);

const TrustBadge = ({ icon, title, subtitle, color }) => (
    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm min-w-[180px]">
        <div className={`p-2 rounded-full ${color}`}>{icon}</div>
        <div>
            <h4 className="text-[10px] font-black text-slate-800 uppercase leading-none">{title}</h4>
            <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase">{subtitle}</p>
        </div>
    </div>
);

// --- MAIN PAGE LOGIC ---
export default function Home() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('Detecting Location...');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null); // ✅ User State
  const [selectedService, setSelectedService] = useState(null); // ✅ Modal State

  // Mock Data
  const categories = [
    { name: "AC Repair", icon: "❄️", color: "bg-blue-50" },
    { name: "Cleaning", icon: "🧹", color: "bg-green-50" },
    { name: "Electrician", icon: "⚡", color: "bg-amber-50" },
    { name: "Plumber", icon: "🚰", color: "bg-cyan-50" },
    { name: "Carpenter", icon: "🪑", color: "bg-orange-50" },
  ];
  const popularServices = [
    { id: 1, name: "Split AC Service", price: 599, rating: 4.8, eta: '15 mins', image: "https://images.unsplash.com/photo-1581094794329-cd56b5095bb4?auto=format&fit=crop&q=80&w=1000" },
    { id: 2, name: "Bathroom Cleaning", price: 399, rating: 4.7, eta: '25 mins', image: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000" },
  ];

  useEffect(() => {
    // 1. Get User Session
    const getUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    };
    getUser();

    // 2. Get Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocation('Wright Town, Jabalpur'),
        () => setLocation('Select Location')
      );
    }
  }, []);

  const handleBook = (service) => { 
      // ✅ Open Booking Modal
      setSelectedService(service);
  };
   
  const handleVoiceSearch = () => {
    alert("🎤 Listening... (Speak now in Hindi or English)");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans relative">
      
      {/* 1. SOS BUTTON (Floating Safety) */}
      <button 
        onClick={() => alert("🚨 SOS ALERT SENT TO POLICE & ADMIN!")}
        className="fixed right-4 bottom-24 z-50 bg-red-600 text-white p-3 rounded-full shadow-2xl animate-pulse border-4 border-red-200"
      >
        <ShieldAlert size={24} />
      </button>

      {/* 2. MODULAR HEADER */}
      <Navbar user={user} />
      <HeroSection 
        location={location} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onVoiceSearch={handleVoiceSearch} 
      />

      {/* 3. PROMO BANNER */}
      <div className="px-6 mt-4">
        <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
                <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-1 rounded">OFFER</span>
                <h2 className="text-2xl font-black mt-2">50% OFF <br/>First Booking</h2>
                <button className="mt-3 bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold">Book Now</button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-500 rounded-full blur-3xl opacity-20"></div>
        </div>
      </div>

      {/* 4. TRUST BADGES (Govt Compliance) */}
      <div className="mt-6 pl-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 pr-6 w-max">
            <TrustBadge icon={<ShieldCheck size={18}/>} title="100% Verified" subtitle="Aadhaar Check" color="bg-green-100 text-green-700"/>
            <TrustBadge icon={<BadgeIndianRupeeIcon size={18}/>} title="Secure Pay" subtitle="Razorpay / UPI" color="bg-blue-100 text-blue-700"/>
        </div>
      </div>

      {/* 5. CATEGORIES & SERVICES */}
      <div className="mt-8">
        <div className="flex justify-between px-6 mb-4">
            <h2 className="font-black text-slate-800">Categories</h2>
            <span className="text-teal-600 text-xs font-bold">View All</span>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 pb-2 no-scrollbar">
            {categories.map((cat, i) => <CategoryCard key={i} {...cat} onClick={() => setSearchQuery(cat.name)} />)}
        </div>
      </div>

      <div className="px-6 mt-6">
        <h2 className="font-black text-slate-800 mb-4 flex items-center gap-2"><Zap size={18} className="text-amber-500 fill-amber-500" /> Popular</h2>
        <div className="flex flex-col gap-4">
            {popularServices.map((service) => <ServiceCard key={service.id} service={service} onBook={handleBook} />)}
        </div>
      </div>

      {/* 6. FOOTER & BOTTOM NAV */}
      <Footer />
      
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 pb-safe">
        <NavIcon icon={<HomeIcon size={24}/>} label="Home" active onClick={() => window.scrollTo(0,0)} />
        <NavIcon icon={<Calendar size={24}/>} label="Bookings" onClick={() => navigate('/bookings')} />
        <div className="relative -top-6">
            <button className="bg-teal-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform">
                <Zap size={24} fill="white" />
            </button>
        </div>
        <NavIcon icon={<Bell size={24}/>} label="Alerts" onClick={() => alert("No notifications")} />
        <NavIcon icon={<User size={24}/>} label="Profile" onClick={() => navigate('/profile')} />
      </div>

      {/* ✅ REAL BOOKING MODAL */}
      {selectedService && (
        <BookingModal 
            service={selectedService}
            user={user}
            onClose={() => setSelectedService(null)}
        />
      )}

    </div>
  );
}

const NavIcon = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-teal-600' : 'text-slate-400'}`}>
        {icon} <span className="text-[10px] font-bold">{label}</span>
    </button>
);