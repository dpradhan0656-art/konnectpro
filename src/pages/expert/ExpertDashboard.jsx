import React, { useState, useEffect } from 'react';
import { Power, Wallet, MapPin, CheckCircle, XCircle, Bell, LogOut, User } from 'lucide-react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';

const notificationSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");

export default function ExpertDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]); 
  const [isOnline, setIsOnline] = useState(true);
  const [expertName, setExpertName] = useState('Expert');

  useEffect(() => {
    checkUser();
    fetchBookings();

    const channel = supabase
      .channel('realtime-bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        console.log('New Booking!', payload.new);
        notificationSound.play().catch(e => console.log("Audio error", e));
        setBookings((prev) => [payload.new, ...prev]);
        alert(`🔔 New Job Alert!\nService: ${payload.new.service_name}`);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login'); // Agar login nahi hai, to bhaga do
    } else {
      setExpertName(session.user.phone || 'Expert');
    }
  }

  const handleLogout = async () => {
    if(confirm("Logout from Dashboard?")) {
        await supabase.auth.signOut();
        navigate('/login');
    }
  }

  async function fetchBookings() {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'Pending')
      .order('created_at', { ascending: false });
    
    if (data) setBookings(data);
  }

  const handleAccept = async (id) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'Accepted', expert_id: 1 })
      .eq('id', id);

    if (!error) {
      alert("Job Accepted! ✅");
      setBookings(bookings.filter(b => b.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20">
      
      {/* HEADER */}
      <div className="bg-slate-900 text-white p-6 rounded-b-[30px] shadow-lg">
        
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
            <div className="flex items-center gap-2 text-slate-300">
                <User size={18} />
                <span className="text-sm font-bold">{expertName}</span>
            </div>
            <button 
                onClick={handleLogout}
                className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-600 hover:text-white transition flex items-center gap-1"
            >
                <LogOut size={12}/> Logout
            </button>
        </div>

        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold">Dashboard ⚡</h1>
            <p className="text-slate-400 text-sm">Waiting for new jobs...</p>
          </div>
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition ${isOnline ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            <Power size={18} /> {isOnline ? "ONLINE" : "OFFLINE"}
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="p-6">
        <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Bell className="text-blue-600"/> Live Requests ({bookings.length})
        </h2>
        
        {bookings.length === 0 ? (
          <div className="text-center py-10 opacity-50">
             <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell size={24} className="text-gray-400"/>
             </div>
             <p>No jobs right now.</p>
          </div>
        ) : (
          bookings.map((job) => (
            <div key={job.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-4 animate-pulse-once">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{job.service_name}</h3>
                  <p className="text-gray-500 text-xs">Customer: {job.customer_name}</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">₹{job.price}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                <MapPin size={16} className="text-blue-500"/>
                <span>{job.customer_address}</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleAccept(job.id)}
                  className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 flex justify-center items-center gap-2"
                >
                  <CheckCircle size={18}/> Accept
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
