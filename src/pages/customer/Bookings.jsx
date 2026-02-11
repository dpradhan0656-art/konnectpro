import React, { useState, useEffect } from 'react';
// ✅ FIX 1: Correct path to Supabase
import { supabase } from '../../lib/supabase';
// ✅ FIX 2: Brand Config
import { BRAND } from '../../config/brandConfig';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, ArrowLeft, FileText, Navigation } from 'lucide-react';

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();

    // 📡 Real-time Magic: Auto-update when expert accepts job
    const channel = supabase
      .channel('my_bookings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, () => {
        fetchMyBookings();
        // Optional: Play sound or vibrate here
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchMyBookings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Asli App Logic: Filter by User ID
    // const { data } = await supabase.from('bookings').select('*').eq('user_id', session?.user?.id);
    
    // 👇 DEMO LOGIC (Mock Data agar DB khali hai)
    const mockData = [
      { id: 101, service_details: "AC Repair (Split)", scheduled_date: "Today, 4:00 PM", address: "Wright Town, Jabalpur", status: 'accepted', total_amount: 599 },
      { id: 102, service_details: "Kitchen Cleaning", scheduled_date: "Yesterday", address: "Civic Center, Jabalpur", status: 'completed', total_amount: 399 },
      { id: 103, service_details: "Fan Repair", scheduled_date: "Pending", address: "Home", status: 'pending', total_amount: 150 }
    ];

    setBookings(mockData); 
    setLoading(false);
  };

  // Helper for Status Styles
  const getStatusStyles = (status) => {
    switch(status) {
      case 'completed': return { color: 'bg-green-100 text-green-700', border: 'border-green-500', icon: <CheckCircle size={12} /> };
      case 'accepted': return { color: 'bg-teal-100 text-teal-700', border: 'border-teal-500', icon: <Navigation size={12} /> };
      case 'cancelled': return { color: 'bg-red-100 text-red-700', border: 'border-red-500', icon: <XCircle size={12} /> };
      default: return { color: 'bg-amber-100 text-amber-700', border: 'border-amber-500', icon: <Clock size={12} /> };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      
      {/* 1. HEADER (KonnectPro Theme) */}
      <div className="bg-teal-700 p-6 rounded-b-[2rem] shadow-xl sticky top-0 z-10">
        <div className="flex items-center gap-4 text-white">
          <button 
            onClick={() => navigate('/')}
            className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition backdrop-blur-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">My Orders</h1>
            <p className="text-teal-200 text-xs font-bold tracking-widest">LIVE STATUS TRACKING</p>
          </div>
        </div>
      </div>

      {/* 2. BOOKING LIST */}
      <div className="p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-10 space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
            <p className="text-gray-400 text-sm">Syncing with satellite...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((order) => {
              const styles = getStatusStyles(order.status);
              
              return (
                <div key={order.id} className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 ${styles.border} relative overflow-hidden transition-all hover:shadow-lg active:scale-95`}>
                  
                  {/* Top Row: Service Name & Status */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{order.service_details}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">ORDER #{order.id}</p>
                    </div>
                    
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide flex items-center gap-1 ${styles.color}`}>
                      {styles.icon} {order.status}
                    </span>
                  </div>

                  {/* Middle Row: Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 p-2 rounded-lg">
                      <Calendar size={14} className="text-teal-600" />
                      <span>{order.scheduled_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 p-2 rounded-lg">
                      <MapPin size={14} className="text-teal-600" />
                      <span className="truncate">{order.address}</span>
                    </div>
                  </div>

                  {/* Bottom Row: Price & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xl font-black text-slate-800">₹{order.total_amount}</span>
                    
                    {/* Dynamic Action Buttons based on Status */}
                    {order.status === 'accepted' && (
                      <button className="flex items-center gap-1 text-xs bg-teal-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-teal-200 animate-pulse hover:bg-teal-700 transition">
                        <Navigation size={12} /> Track Expert
                      </button>
                    )}
                    
                    {order.status === 'completed' && (
                      <button className="flex items-center gap-1 text-xs border-2 border-slate-100 text-slate-500 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-50 transition">
                        <FileText size={12} /> Invoice
                      </button>
                    )}
                  </div>

                </div>
              );
            })}

            {/* Empty State */}
            {bookings.length === 0 && (
              <div className="text-center py-10 opacity-60">
                <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-slate-400" size={32} />
                </div>
                <p className="text-slate-500 font-bold">No active bookings.</p>
                <button onClick={() => navigate('/')} className="mt-4 text-teal-600 font-black text-sm uppercase tracking-wide border-b-2 border-teal-100 pb-1">
                  Book a Service
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}