import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, ShieldCheck, Home } from 'lucide-react';
import Navbar from '../../components/common/Navbar';

export default function BookingSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center max-w-lg mx-auto">
        <div className="bg-green-500 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-xl mb-6 animate-bounce">
           <CheckCircle size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Booking Done!</h1>
        <p className="text-slate-500 mb-8 font-medium">Your expert will arrive at the scheduled time. 🛡️</p>
        
        <div className="w-full space-y-3">
           <button onClick={() => navigate('/bookings')} className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
             <Calendar size={18} /> View My Bookings
           </button>
           <button onClick={() => navigate('/')} className="w-full bg-white text-slate-600 border py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
             <Home size={18} /> Back to Home
           </button>
        </div>
      </div>
    </div>
  );
}