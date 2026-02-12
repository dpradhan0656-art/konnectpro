import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BRAND } from '../../config/brandConfig';
import Navbar from '../../components/common/Navbar';
import { ArrowLeft, Star, ShieldCheck, Clock, Zap } from 'lucide-react';

export default function CategoryView() {
  const { categoryName } = useParams(); // URL se name lega (e.g., ac-repair)
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  // Formatted Name (e.g., "ac-repair" to "AC Repair")
  const displayTitle = categoryName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  useEffect(() => {
    document.title = `${displayTitle} | ${BRAND.name}`;
    
    // Yahan hum aage Supabase se real data fetch karenge
    // Abhi ke liye Mock Data taaki page responsive lage
    setServices([
      { id: 101, name: `Standard ${displayTitle}`, price: 499, rating: 4.8, time: "45 min" },
      { id: 102, name: `Premium ${displayTitle}`, price: 899, rating: 4.9, time: "90 min" },
    ]);
  }, [categoryName]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      {/* --- Header Section --- */}
      <div className="bg-teal-800 text-white p-6 pt-10 rounded-b-[2rem] shadow-lg">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-teal-200 font-bold text-sm">
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-3xl font-black">{displayTitle}</h1>
        <p className="text-teal-200 text-xs mt-2 font-medium">Verified Experts Available in Jabalpur</p>
      </div>

      {/* --- Service List --- */}
      <div className="p-6 space-y-4">
        <h2 className="text-slate-900 font-bold text-lg flex items-center gap-2">
            <Zap size={18} className="text-amber-500 fill-amber-500" /> Available Packages
        </h2>
        
        {services.map(service => (
          <div key={service.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group active:scale-95 transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-900">{service.name}</h3>
                <ShieldCheck size={14} className="text-teal-600" />
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-amber-500"><Star size={12} fill="currentColor" /> {service.rating}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {service.time}</span>
              </div>
              <p className="mt-3 text-teal-700 font-black text-lg">₹{service.price}</p>
            </div>
            
            <button className="bg-teal-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-teal-700/20">
              Select
            </button>
          </div>
        ))}
      </div>

      {/* --- Trust Note --- */}
      <div className="px-6 mt-4">
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
            <div className="bg-amber-500 text-white p-1 rounded-full"><ShieldCheck size={16} /></div>
            <div>
                <p className="text-xs font-black text-amber-900">KonnectPro Safety Promise</p>
                <p className="text-[10px] text-amber-700 font-medium mt-1 leading-relaxed">
                    Every expert is background verified. Pay only after you are 100% satisfied with the work.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}