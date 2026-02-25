import React from 'react';
// ✅ Yahan 'CheckCircle' jod diya hai
import { Star, MapPin, ShieldCheck, Briefcase, User, Clock, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext'; 
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ExpertCard({ expert }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // 🛠️ SMART BOOKING (No Forms, Just Action)
  const handleBook = async () => {
    // 1. Check Login
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      const confirmLogin = window.confirm("Booking karne ke liye Login zaroori hai. Kya aap Login karna chahenge?");
      if (confirmLogin) navigate('/login');
      return;
    }

    // 2. Add to Cart
    addToCart(expert);

    // 3. Go to Cart
    navigate('/cart');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full group">
        
        {/* Top Section: Image & Badge */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
             <img 
                src={expert.profile_photo_url || `https://ui-avatars.com/api/?name=${expert.name}&background=0d9488&color=fff`} 
                alt={expert.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${expert.name}&background=0d9488&color=fff`; }}
             />
             {/* ✅ Ab ye line error nahi degi */}
             <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-teal-700 shadow flex items-center gap-1">
                <CheckCircle size={14} /> Verified
             </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-col flex-grow">
             <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">{expert.name}</h3>
                    <p className="text-teal-600 font-medium text-sm mt-1">
                        {expert.service_category || "Service Expert"}
                    </p>
                </div>
                <div className="flex items-center bg-amber-100 px-2 py-1 rounded text-amber-700 text-xs font-bold">
                    <Star size={14} className="fill-current mr-1" />
                    {expert.rating || "New"}
                </div>
             </div>

             {/* Details */}
             <div className="space-y-2 text-gray-500 text-sm mt-3">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-teal-500"/>
                    <span>{expert.experience_years || "1"}+ Years Experience</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-teal-500"/>
                    <span>{expert.city || "Jabalpur"}, {expert.location || "City"}</span>
                </div>
             </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-gray-100 mt-auto flex justify-between items-center">
             <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Visiting Charge</p>
                <p className="text-lg font-black text-gray-900">₹{expert.visiting_charges || 199}</p>
             </div>
             
             <button 
                onClick={handleBook}
                className="bg-slate-900 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-teal-900/20 active:scale-95"
             >
                Book Now
             </button>
        </div>
    </div>
  );
}