import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, ShieldCheck, Loader } from 'lucide-react';
import { supabase } from '../../supabase'; // Database connect kiya

// SERVICES DATA (Temporary until we fetch from DB too, keeping local for speed)
const services = [
  { id: 1, name: "AC Service", price: 599, rating: 4.8, image: "https://images.unsplash.com/photo-1581094794329-cd56b5095bb4?auto=format&fit=crop&q=80&w=1000", desc: "Complete AC cleaning and gas check." },
  { id: 2, name: "Bathroom Cleaning", price: 399, rating: 4.7, image: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000", desc: "Deep cleaning of tiles and sanitary ware." },
  { id: 3, name: "Sofa Cleaning", price: 799, rating: 4.6, image: "https://plus.unsplash.com/premium_photo-1663126298656-33616be83c32?auto=format&fit=crop&q=80&w=1000", desc: "Shampoo cleaning for 3-seater sofa." },
  { id: 4, name: "Carpenter", price: 299, rating: 4.5, image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1000", desc: "Furniture repair and assembly." },
  { id: 5, name: "Electrician", price: 299, rating: 4.9, image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1000", desc: "Switch repair, fan installation." },
  { id: 6, name: "Plumber", price: 349, rating: 4.7, image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=1000", desc: "Tap leakage, pipe fitting." }
];

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = services.find(s => s.id == id) || services[0];
  const [loading, setLoading] = useState(false);

  // REAL BOOKING FUNCTION
  const handleBook = async () => {
    try {
      setLoading(true);
      
      // 1. Supabase me data bhejo
      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            customer_name: "Deepak (Test User)", // Abhi ke liye hardcoded, baad me login se aayega
            customer_phone: "9999999999",
            customer_address: "Ranjhi, Jabalpur",
            service_name: service.name,
            price: service.price,
            status: "Pending"
          }
        ]);

      if (error) throw error;

      // 2. Success!
      alert(`🎉 Booking Confirmed! \n\nWe have received your request for ${service.name}. An expert will be assigned shortly.`);
      navigate('/bookings');

    } catch (error) {
      alert("Booking Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <div className="relative h-64">
        <img src={service.image} className="w-full h-full object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/30 p-2 rounded-full backdrop-blur-md text-white">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="p-6 -mt-10 relative bg-white rounded-t-[30px] shadow-xl min-h-[500px]">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
        
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-gray-800">{service.name}</h1>
          <span className="text-green-600 font-bold text-xl">₹{service.price}</span>
        </div>

        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <Star size={16} className="text-yellow-500 fill-current" /> {service.rating} (120 reviews)
        </div>

        <h3 className="font-bold text-gray-800 mb-2">Description</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-20">
          {service.desc} Expert will arrive at your location. Payment to be done after service.
        </p>

        {/* Action Button */}
        <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100">
          <button 
            onClick={handleBook}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-slate-800 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader className="animate-spin"/> : `Book Now (Pay After Service)`}
          </button>
        </div>
      </div>
    </div>
  );
}