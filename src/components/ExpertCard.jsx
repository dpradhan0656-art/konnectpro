import React, { useState } from 'react';
import { MapPin, Star, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
// Note: BookingModal ko hata diya hai kyonki ab hum direct DB entry kar rahe hain
// Agar aapko Modal wapas chahiye form bharne ke liye, to hum use baad me jod sakte hain.
// Abhi ke liye hum browser ka 'prompt' use kar rahe hain taaki code simple rahe.

export default function ExpertCard({ expert }) {
  const [loading, setLoading] = useState(false);

  // 🛠️ CONFIGURATION: City Head WhatsApp Numbers
  const getCityHeadNumber = (city) => {
    const cityHeads = {
      'Sagar': '918989092325',      // Rishabh Pradhan (Vinay)
      'Jhansi': '919319414129',     // Sanju Ale
      'Nagpur': '919970814191',     // Shri Babloo Pandey
      'Jabalpur': '917503323131',   // Vimla Pradhan
    };
    return cityHeads[city] || '919589634799'; // Default Admin (Preeti Ji)
  };

  const handleBook = async () => {
    // 1. Get Customer Details (Simple Prompt for now)
    const customerName = prompt("Please enter your Name:");
    if (!customerName) return;
    
    const customerPhone = prompt("Please enter your Phone Number:");
    if (!customerPhone) return;

    const address = prompt("Please enter your Address:");
    if (!address) return;

    setLoading(true);
    
    // 2. Generate Random OTPs
    const startOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const endOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // 3. Create Booking in Supabase (For Expert App)
    const { error } = await supabase.from('bookings').insert([{
        service_name: expert.service_category || 'General Service',
        expert_id: expert.id,
        expert_name: expert.name,
        expert_phone: expert.phone, // Assuming 'phone' column exists in experts
        customer_name: customerName,
        customer_phone: customerPhone,
        address: address,
        price: 499, // Standard rate example (Admin can change later)
        status: 'assigned', // Direct assign
        start_otp: startOtp, 
        end_otp: endOtp
    }]);

    if(error) {
        alert("System Error: " + error.message);
        // Fallback to WhatsApp if DB fails
        window.open(`https://wa.me/${getCityHeadNumber(expert.city)}?text=Booking Failed for ${expert.name}. Cust: ${customerName} (${customerPhone})`, '_blank');
    } else {
        alert(`🎉 Booking Confirmed! \n\nYour OTP is: ${startOtp}\n(Please share this with expert when they arrive)`);
        
        // Optional: Also send WhatsApp to City Head for record
        const msg = `New Booking Alert! 🚨\nExpert: ${expert.name}\nCustomer: ${customerName}\nPhone: ${customerPhone}\nAddress: ${address}`;
        // window.open(`https://wa.me/${getCityHeadNumber(expert.city)}?text=${encodeURIComponent(msg)}`, '_blank');
    }
    setLoading(false);
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
                    <span>{expert.experience_years || "1"} Year Experience</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-teal-500"/>
                    <span>{expert.city || "Jabalpur"}, {expert.location || "Main City"}</span>
                </div>
             </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-gray-100 mt-auto">
             <button 
                onClick={handleBook}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-teal-900/20 flex justify-center items-center gap-2 transform active:scale-95"
             >
                {loading ? 'Processing...' : 'Book Now'}
             </button>
             <p className="text-[10px] text-center text-gray-400 mt-2">Managed by: {expert.city ? expert.city + ' Head' : 'HQ'}</p>
        </div>
    </div>
  );
}