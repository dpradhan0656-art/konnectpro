import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, ShieldCheck, Home } from 'lucide-react';
import Navbar from '../../components/common/Navbar';

export default function BookingSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans w-full max-w-[100vw] overflow-x-hidden" style={{ paddingBottom: 'max(6rem, env(safe-area-inset-bottom, 0px) + 5rem)' }}>
      <Navbar />
      {/* OLD: min-h-[70vh] — NEW: centering & containment (Header+Nav ~120px) */}
      <div
        className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] w-full max-w-[100vw] px-6 text-center mx-auto py-8"
        style={{ minHeight: 'calc(100dvh - 120px)' }}
      >
        <div className="bg-green-500 text-white w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl mb-5 sm:mb-6 animate-bounce shrink-0">
          <CheckCircle size={32} className="sm:w-10 sm:h-10" aria-hidden />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Booking Done!</h1>
        <p className="text-slate-500 mb-6 sm:mb-8 font-medium text-sm sm:text-base">Your expert will arrive at the scheduled time. 🛡️</p>

        <div className="w-full max-w-sm space-y-3">
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