import React, { useEffect, useState } from 'react';
import { Search, MapPin, Star, ShieldCheck, Loader } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase'; // Connection file import ki

const categories = [
  { id: 1, name: "Electrician", icon: "⚡", color: "bg-yellow-100" },
  { id: 2, name: "Plumber", icon: "🔧", color: "bg-blue-100" },
  { id: 3, name: "Cleaning", icon: "🧹", color: "bg-green-100" },
  { id: 4, name: "Carpenter", icon: "🔨", color: "bg-orange-100" },
];

export default function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]); // Khali bucket data ke liye
  const [loading, setLoading] = useState(true); // Loading spinner

  // Page khulte hi data lao
  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      setLoading(true);
      // Supabase se data maango
      const { data, error } = await supabase.from('services').select('*');
      
      if (error) throw error;
      
      setServices(data); // Bucket bhar do
    } catch (error) {
      alert("Error fetching services: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h1 className="text-2xl font-bold">Apna Hunar</h1>
            <p className="text-slate-400 text-sm flex items-center gap-1"><MapPin size={14} /> Jabalpur, MP</p>
          </div>
          <button onClick={() => navigate('/login')} className="bg-white/10 p-2 rounded-full hover:bg-white/20">
            <ShieldCheck size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-3 flex items-center shadow-lg relative z-10">
          <Search className="text-gray-400 ml-2" size={20} />
          <input 
            type="text" 
            placeholder="Search for services..." 
            className="w-full ml-3 outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800 text-lg">Categories</h2>
          <span className="text-blue-600 text-sm font-bold">See All</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center gap-2">
              <div className={`${cat.color} w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
                {cat.icon}
              </div>
              <span className="text-xs font-medium text-gray-600">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
{/* 👷 Join as Expert Banner */}
<div className="mx-6 mt-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
  <div className="relative z-10">
    <h2 className="text-xl font-bold mb-1">Join as Expert</h2>
    <p className="text-slate-300 text-xs mb-3">Earn more with Apna Hunar</p>
    <button 
      onClick={() => navigate('/register-expert')}
      className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-gray-100 transition"
    >
      Register Now
    </button>
  </div>
  {/* Decor Circle */}
  <div className="absolute -right-6 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
  <div className="text-5xl">👷‍♂️</div>
</div>

      {/* Popular Services (REAL DATA FROM SUPABASE) */}
      <div className="px-6 mt-8 mb-8">
        <h2 className="font-bold text-gray-800 text-lg mb-4">Popular Services</h2>
        
        {loading ? (
          <div className="flex justify-center p-10"><Loader className="animate-spin text-blue-600"/></div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} onClick={() => navigate('/service/' + service.id)} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition cursor-pointer">
                <img src={service.image} alt={service.name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 py-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800">{service.name}</h3>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">₹{service.price}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-yellow-500 text-sm font-bold">
                    <Star size={14} fill="currentColor" /> {service.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Legal Section */}
      <div className="mt-12 bg-gray-200 py-8 px-6 text-center">
        <h3 className="font-bold text-gray-600 mb-4">APNA HUNAR</h3>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 font-medium">
          <Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-blue-600">Terms & Conditions</Link>
          <Link to="/refund" className="hover:text-blue-600">Refund Policy</Link>
        </div>
        <div className="mt-4 text-[10px] text-gray-400">
          <p>H-36, Mastana Road</p>
          <p>Ranjhi, Jabalpur, MP - 482005</p>
          <p className="mt-1">© 2026 Apna Hunar. All rights reserved.</p>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 py-3 px-6 flex justify-between items-center z-50">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-blue-600">
          <div className="bg-blue-50 p-1.5 rounded-xl"><MapPin size={20} /></div>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => navigate('/bookings')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
          <div className="p-1.5"><ShieldCheck size={20} /></div>
          <span className="text-[10px] font-medium">Bookings</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
          <div className="p-1.5"><Star size={20} /></div>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
}