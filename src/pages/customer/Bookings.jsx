import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Calendar, MapPin, Clock, User, Phone, CheckCircle, AlertCircle, XCircle, Wrench, Loader2 } from 'lucide-react';

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchBookings();
    
    let channel;
    const setupRealtime = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        channel = supabase
            .channel('customer_bookings_tracker')
            .on('postgres_changes', {
                event: '*', 
                schema: 'public',
                table: 'bookings',
                filter: `user_id=eq.${user.id}`
            }, () => {
                fetchBookings(); 
            })
            .subscribe();
    };
    
    setupRealtime();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const fetchBookings = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login'); return; }

        // 🌟 SELECT में image_url हटा दिया है ताकि Error 400 न आए
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            experts ( name, phone ) 
          `) 
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
    } catch (err) {
        console.error('Fetch Error:', err);
        setErrorMsg("Unable to load bookings. Please check your database settings.");
    } finally {
        setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
      switch(status) {
          case 'pending': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-200 flex items-center gap-1"><Clock size={12}/> Finding Expert</span>;
          case 'assigned': 
          case 'accepted': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-200 flex items-center gap-1"><User size={12}/> Expert Assigned</span>;
          case 'in_progress': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-yellow-200 flex items-center gap-1"><Wrench size={12}/> Job Started</span>;
          case 'completed': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-200 flex items-center gap-1"><CheckCircle size={12}/> Completed</span>;
          case 'cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-200 flex items-center gap-1"><XCircle size={12}/> Cancelled</span>;
          default: return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{status}</span>;
      }
  };

  const renderTimeline = (status) => {
      if (status === 'cancelled' || status === 'completed') return null;
      
      const steps = [
          { id: 'pending', label: 'Requested', icon: Clock },
          { id: 'assigned', label: 'Assigned', icon: User },
          { id: 'in_progress', label: 'Started', icon: Wrench },
          { id: 'completed', label: 'Done', icon: CheckCircle },
      ];

      let currentIndex = 0;
      if (status === 'assigned' || status === 'accepted') currentIndex = 1;
      if (status === 'in_progress') currentIndex = 2;

      return (
          <div className="relative w-full mt-8 mb-8 px-2">
              <div className="absolute top-4 left-6 right-6 h-1 bg-slate-100 rounded-full z-0"></div>
              <div 
                className="absolute top-4 left-6 h-1 bg-teal-500 rounded-full z-0 transition-all duration-1000" 
                style={{ width: `calc(${(currentIndex / 3) * 100}% - 24px)` }}
              ></div>
              <div className="flex justify-between relative z-10">
                  {steps.map((step, index) => {
                      const isActive = index <= currentIndex;
                      const Icon = step.icon;
                      return (
                          <div key={step.id} className="flex flex-col items-center gap-2 w-16">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 ${isActive ? 'bg-teal-500 border-white text-white shadow-lg shadow-teal-500/40' : 'bg-slate-100 border-white text-slate-300'}`}>
                                  <Icon size={14} />
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-wider text-center ${isActive ? 'text-teal-700' : 'text-slate-400'}`}>{step.label}</span>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-slate-900 mb-2">My Bookings</h1>
        <p className="text-slate-400 text-sm mb-8">Live track your service requests.</p>

        {loading ? (
            <div className="text-center py-20">
                <Loader2 className="animate-spin w-8 h-8 text-teal-500 mx-auto mb-4" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Your Bookings...</p>
            </div>
        ) : errorMsg ? (
            <div className="p-6 bg-red-50 text-red-600 rounded-3xl text-center border border-red-100 font-bold text-sm">
                <AlertCircle size={24} className="mx-auto mb-2"/>
                {errorMsg}
            </div>
        ) : bookings.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-10 text-center shadow-sm border border-slate-100">
                <Calendar size={32} className="mx-auto mb-4 text-slate-300"/>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No bookings yet</h3>
                <p className="text-slate-400 text-sm mb-6">You haven't booked any service yet.</p>
                <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                    Book Now
                </button>
            </div>
        ) : (
            <div className="space-y-6">
                {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-6 rounded-[2rem] shadow-lg shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
                        
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">{booking.service_name}</h3>
                                {/* 🌟 ID CRASH FIX: Strong conversion to string before slice */}
                                <p className="text-xs text-slate-400 font-medium mt-1">ID: #{String(booking.id || '').slice(0,8)}</p>
                            </div>
                            {getStatusBadge(booking.status)}
                        </div>

                        {renderTimeline(booking.status)}

                        {booking.experts ? (
                            <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-black">
                                    {booking.experts.name?.charAt(0) || 'E'}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Expert Assigned</p>
                                    <h4 className="font-bold text-slate-900">{booking.experts.name}</h4>
                                </div>
                                <a href={`tel:${booking.experts.phone}`} className="ml-auto bg-teal-500 p-2.5 rounded-full text-white shadow-md">
                                    <Phone size={16}/>
                                </a>
                            </div>
                        ) : (
                            (booking.status !== 'completed' && booking.status !== 'cancelled') && (
                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center gap-3 mb-6 animate-pulse">
                                    <AlertCircle size={18} className="text-amber-500"/>
                                    <p className="text-xs font-bold text-amber-700">Connecting you to the best expert nearby...</p>
                                </div>
                            )
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[9px] text-slate-400 font-black uppercase mb-1 flex items-center gap-1"><Calendar size={10}/> Date</p>
                                <p className="text-xs font-bold text-slate-700">{booking.booking_date || 'ASAP'}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Total Amount</p>
                                <p className="text-xs font-bold text-slate-700">₹{booking.total_amount}</p>
                            </div>
                        </div>

                        <p className="text-[10px] text-slate-400 font-bold truncate flex items-center gap-1">
                            <MapPin size={10}/> {booking.address}
                        </p>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}