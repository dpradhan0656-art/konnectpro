import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/common/Navbar';
import { Calendar, Clock, MapPin, User, CheckCircle, Shield, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Bookings() {
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- 1. Fetch Data ---
  const fetchBookings = async () => {
    setLoading(true);
    // Note: Real App me .eq('customer_phone', userPhone) lagana padega
    const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if(data) setMyBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();

    // --- 2. 🔄 REAL-TIME UPDATES (Jadoo) ---
    // Jaise hi Expert status badlega, Customer ki screen apne aap update hogi
    const channel = supabase
      .channel('customer-bookings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, (payload) => {
          console.log("Status Changed!", payload.new);
          // Sirf ussi booking ko update karo jo change hui hai
          setMyBookings(prev => prev.map(b => b.id === payload.new.id ? payload.new : b));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
        <Navbar />
        
        {/* Header */}
        <div className="bg-teal-700 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-xl mb-[-3rem] relative z-10">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">My Bookings</h1>
                    <p className="text-teal-200 text-sm font-medium mt-1">Track live status & OTPs</p>
                </div>
                <button onClick={fetchBookings} className="bg-teal-600 p-2 rounded-full hover:bg-teal-500 transition-colors">
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""}/>
                </button>
            </div>
        </div>

        <div className="px-4 pt-16">
            
            {/* Loading State */}
            {loading && myBookings.length === 0 && (
                <p className="text-center text-gray-400 mt-10">Loading your bookings...</p>
            )}

            {/* Empty State */}
            {!loading && myBookings.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-3xl bg-white mt-4">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4"/>
                    <p className="text-gray-500 font-bold text-lg">No bookings found</p>
                    <button onClick={() => navigate('/')} className="mt-4 text-teal-600 font-bold text-sm hover:underline">Book a service now</button>
                </div>
            )}

            {/* Booking Cards */}
            {myBookings.map(item => (
                <div key={item.id} className="bg-white p-5 rounded-3xl shadow-lg shadow-gray-200/50 border border-slate-100 mb-6 relative overflow-hidden group">
                    
                    {/* Status Color Strip */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500 ${
                        item.status === 'completed' ? 'bg-green-500' : 
                        item.status === 'in_progress' ? 'bg-blue-600' : 
                        item.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
                    }`}></div>

                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 pl-3">
                        <div>
                            <h3 className="font-black text-xl text-slate-800 leading-tight">{item.service_name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Order #{item.id.slice(0,8)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                             item.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 
                             item.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                             'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                            {item.status.replace(/_/g, ' ')}
                        </span>
                    </div>

                    {/* --- OTP SECTION (Only when needed) --- */}
                    {(item.status === 'assigned' || item.status === 'accepted' || item.status === 'on_the_way' || item.status === 'arrived') && (
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-5 flex justify-between items-center ml-3 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-100 rounded-full blur-xl"></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Share Start OTP</p>
                                <p className="text-3xl font-black text-amber-600 tracking-[0.2em] font-mono">{item.start_otp}</p>
                            </div>
                            <Shield size={28} className="text-amber-400 relative z-10"/>
                        </div>
                    )}
                    
                    {item.status === 'in_progress' && (
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-5 flex justify-between items-center ml-3 relative overflow-hidden">
                             <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-100 rounded-full blur-xl"></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">Share End OTP</p>
                                <p className="text-3xl font-black text-blue-600 tracking-[0.2em] font-mono">{item.end_otp}</p>
                            </div>
                            <CheckCircle size={28} className="text-blue-400 relative z-10"/>
                        </div>
                    )}

                    {/* Info Grid */}
                    <div className="space-y-3 text-sm text-slate-500 ml-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Expert</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1"><User size={14}/> {item.expert_name || 'Finding Expert...'}</span>
                        </div>
                        <div className="w-full h-[1px] bg-gray-200"></div>
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase mt-0.5">Location</span>
                            <span className="font-medium text-slate-700 text-right w-2/3 flex items-start justify-end gap-1"><MapPin size={14} className="mt-0.5 shrink-0"/> {item.address}</span>
                        </div>
                        <div className="w-full h-[1px] bg-gray-200"></div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Date</span>
                            <span className="font-medium text-slate-700 flex items-center gap-1"><Clock size={14}/> {new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Call Button */}
                    {item.expert_phone && (
                        <a href={`tel:${item.expert_phone}`} className="mt-4 ml-3 block text-center bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-teal-700 transition-all active:scale-95">
                            📞 Call Expert
                        </a>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
}