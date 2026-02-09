import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; 
import { Search, MapPin, Star, LogIn, LogOut, User } from 'lucide-react';

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
  { id: 1, name: "AC Service", price: 599, rating: 4.8, image: "https://images.unsplash.com/photo-1581094794329-cd56b5095bb4?auto=format&fit=crop&q=80&w=1000" },
  { id: 2, name: "Bathroom Cleaning", price: 399, rating: 4.7, image: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000" },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  }

  const handleLogout = async () => {
    // FIX: window.confirm use kiya hai taki error na aaye
    if (window.confirm("Are you sure you want to logout?")) {
      await supabase.auth.signOut();
      setUser(null);
      window.location.reload();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      
      {/* HEADER */}
      <header className="bg-white p-5 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div>
           {/* TEST SABOOT: Iska color Red kar diya hai */}
           <h1 className="text-2xl font-extrabold text-red-600 tracking-tight">Apna<span className="text-slate-800">Hunar</span></h1>
           
           {user ? (
             <p className="text-xs text-green-600 font-bold flex items-center gap-1">
               <User size={10}/> Verified User
             </p>
           ) : (
             <p className="text-xs text-slate-400">Book Expert Services</p>
           )}
        </div>

        {user ? (
          <button 
            onClick={handleLogout}
            className="bg-red-50 text-red-500 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-red-100 transition"
          >
            <LogOut size={14}/> Logout
          </button>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-slate-800 transition flex items-center gap-2"
          >
            <LogIn size={14}/> Login
          </button>
        )}
      </header>

      {/* Search Bar */}
      <div className="p-5">
        <div className="bg-white p-3 rounded-2xl shadow-sm flex items-center gap-3 border border-gray-100">
          <Search className="text-gray-400" />
          <input type="text" placeholder="Search for 'AC Repair'..." className="flex-1 outline-none text-gray-700 font-medium" />
        </div>
      </div>

      {/* Categories */}
      <div className="pl-5 overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex gap-4 w-max pr-5">
          {categories.map((cat, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
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
          <h2 className="text-xl font-bold text-gray-800">Most Popular</h2>
          <span className="text-blue-600 font-bold text-sm">See All</span>
        </div>

        <div className="grid gap-4">
          {popularServices.map((service) => (
            <div 
              key={service.id} 
              onClick={() => navigate(`/service/${service.id}`)}
              className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition active:scale-95 cursor-pointer"
            >
              <img src={service.image} className="w-24 h-24 object-cover rounded-xl" />
              <div className="flex-1 py-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800">{service.name}</h3>
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold">₹{service.price}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 mb-2">
                  <Star size={14} className="text-yellow-400 fill-current" />
                  <span className="text-xs font-bold text-gray-500">{service.rating} (42 reviews)</span>
                </div>
                <button className="text-blue-600 text-xs font-bold border border-blue-100 px-3 py-1.5 rounded-lg w-full mt-1">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
