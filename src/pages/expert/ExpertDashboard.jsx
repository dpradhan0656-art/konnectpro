import React, { useState, useEffect } from 'react';
// ✅ FIX 1: Correct path to Supabase
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
// ✅ FIX 2: Brand Colors Config
import { BRAND } from '../../config/brandConfig';
import { Power, Wallet, MapPin, CheckCircle, Bell, LogOut, User, DollarSign, Clock } from 'lucide-react';

const notificationSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");

export default function ExpertDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]); 
  const [isOnline, setIsOnline] = useState(false);
  const [expertProfile, setExpertProfile] = useState({ name: 'Partner', phone: '' });

  useEffect(() => {
    checkUser();
    fetchBookings();

    // 📡 Real-time Listener for New Jobs
    const channel = supabase
      .channel('realtime-bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        // Only alert if status is Pending
        if(payload.new.status === 'Pending') {
          console.log('New Job Alert!', payload.new);
          notificationSound.play().catch(e => console.log("Audio error", e));
          setBookings((prev) => [payload.new, ...prev]);
          alert(`🔔 NEW JOB ALERT: ${payload.new.service_name}`);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login'); 
    } else {
      setExpertProfile({
        name: session.user.user_metadata?.name || 'Partner',
        phone: session.user.phone || session.user.email
      });
    }
  }

  const handleLogout = async () => {
    if(confirm("Disconnect from KonnectPro Network?")) {
        await supabase.auth.signOut();
        navigate('/login');
    }
  }

  async function fetchBookings() {
    // Mock Data for UI testing if table is empty
    const mockData = [
      { id: 101, service_name: "AC Repair (Split)", customer_name: "Rahul Sharma", price: 599, customer_address: "Civic Center, Jabalpur", status: 'Pending', created_at: new Date().toISOString() },
      { id: 102, service_name: "Fan Installation", customer_name: "Priya Singh", price: 250, customer_address: "Sadar, Jabalpur", status: 'Pending', created_at: new Date().toISOString() }
    ];
    setBookings(mockData); 
    
    // Asli Data fetch logic (uncomment when table ready)
    /*
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'Pending')
      .order('created_at', { ascending: false });
    if (data && data.length > 0) setBookings(data);
    */
  }

  const handleAccept = async (id) => {
    if (!isOnline) {
      alert("⚠️ Please GO ONLINE first to accept jobs.");
      return;
    }

    // Mock Update
    alert("✅ Job Accepted! Navigate to location.");
    setBookings(bookings.filter(b => b.id !== id));

    // Real Update Logic
    /*
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'Accepted', expert_id: expertProfile.id })
      .eq('id', id);
    */
  };

  const toggleDuty = () => {
    setIsOnline(!isOnline);
    if (!isOnline) alert("🟢 YOU ARE NOW ONLINE");
    else alert("🔴 YOU ARE NOW OFFLINE");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      
      {/* 1. HEADER (KonnectPro Theme) */}
      <div className={`${isOnline ? 'bg-teal-700' : 'bg-slate-800'} text-white p-6 rounded-b-[2rem] shadow-xl transition-colors duration-500 relative overflow-hidden`}>
        
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-3">
               <div className="bg-white/20 p-2 rounded-full border border-white/30">
                  <User size={20} className="text-white" />
               </div>
               <div>
                  <h1 className="text-lg font-black tracking-tight uppercase">Konnect<span className="text-teal-300">Pro</span></h1>
                  <span className="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded text-teal-100 flex items-center gap-1 w-fit">
                    <CheckCircle size={10}/> Verified Partner
                  </span>
               </div>
            </div>
            <button 
                onClick={handleLogout}
                className="bg-white/10 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-red-500/80 transition flex items-center gap-1 backdrop-blur-sm"
            >
                <LogOut size={12}/> Disconnect
            </button>
        </div>

        {/* Dashboard Status Card */}
        <div className="flex justify-between items-end relative z-10">
          <div>
            <p className="text-teal-100 text-xs font-bold uppercase mb-1">Current Status</p>
            <h2 className="text-3xl font-black tracking-wide">{isOnline ? "ONLINE" : "OFFLINE"}</h2>
            <p className="text-xs opacity-80 mt-1">{isOnline ? "Searching for nearby jobs..." : "Go online to start earning."}</p>
          </div>
          
          {/* POWER SWITCH (Amber/Red) */}
          <button 
            onClick={toggleDuty}
            className={`w-16 h-16 rounded-full border-4 shadow-2xl flex items-center justify-center transform active:scale-95 transition-all ${isOnline ? 'bg-amber-500 border-amber-300 shadow-amber-500/50' : 'bg-red-500 border-red-400 shadow-red-500/50'}`}
          >
            <Power size={28} className="text-white animate-pulse-slow" />
          </button>
        </div>
      </div>

      {/* 2. JOB LIST */}
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Bell className={`text-teal-600 ${isOnline ? 'animate-bounce' : ''}`} size={20}/> 
            Job Radar
          </h2>
          <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-1 rounded-full border border-teal-100">
            {bookings.length} Nearby
          </span>
        </div>
        
        {bookings.length === 0 ? (
          <div className="text-center py-12 opacity-40">
             <div className="bg-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={32} className="text-gray-400"/>
             </div>
             <p className="font-bold text-gray-500">No jobs in your area.</p>
             <p className="text-xs text-gray-400 mt-1">Relax! We'll notify you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((job) => (
              <div key={job.id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-teal-500 relative overflow-hidden group">
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-black text-lg text-slate-800 leading-tight">{job.service_name}</h3>
                    <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-1">
                      <User size={10}/> {job.customer_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-xl text-teal-700">₹{job.price}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Est. Earning</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-600 text-xs font-bold bg-slate-50 p-2 rounded-lg mb-4">
                  <MapPin size={14} className="text-amber-500"/>
                  <span className="truncate">{job.customer_address}</span>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setBookings(bookings.filter(b => b.id !== job.id))}
                    className="flex-1 py-3 rounded-xl border-2 border-slate-100 text-slate-400 font-bold text-xs hover:bg-slate-50 hover:text-slate-600 transition"
                  >
                    IGNORE
                  </button>
                  <button 
                    onClick={() => handleAccept(job.id)}
                    className="flex-[2] bg-teal-600 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-teal-200 hover:bg-teal-700 flex justify-center items-center gap-2 transition transform active:scale-95"
                  >
                    <CheckCircle size={16}/> ACCEPT JOB
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Wallet Status (Bottom) */}
      <div className="fixed bottom-6 left-6 right-6">
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center border border-slate-700">
           <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg text-slate-900">
                 <Wallet size={20} />
              </div>
              <div>
                 <p className="text-[10px] text-slate-400 uppercase font-bold">Today's Earnings</p>
                 <p className="font-bold text-lg leading-none">₹ 0.00</p>
              </div>
           </div>
           <button className="text-xs font-bold text-amber-500 hover:text-amber-400">
              View History
           </button>
        </div>
      </div>

    </div>
  );
}