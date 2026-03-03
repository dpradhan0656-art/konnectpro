import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Calendar, Bell, User, ShoppingCart } from 'lucide-react';

export default function BottomNav({ cartCount }) {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-100 px-4 sm:px-6 py-2.5 flex justify-between items-center z-50 max-w-md mx-auto left-0 right-0 md:hidden pb-safe min-h-[56px]" aria-label="Main navigation">
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-1 text-teal-600 transition-all duration-300 active:scale-90 touch-manipulation" aria-label="Home">
        <HomeIcon size={22} />
        <span className="text-[10px] font-black">Home</span>
      </button>
      <button type="button" onClick={() => navigate('/bookings')} className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-1 text-slate-400 hover:text-teal-600 transition-all duration-300 active:scale-90 touch-manipulation" aria-label="Bookings">
        <Calendar size={22} />
        <span className="text-[10px] font-bold">Bookings</span>
      </button>

      <div className="relative -top-6 flex items-center justify-center">
        <button type="button" onClick={() => navigate('/cart')} className="min-h-[44px] min-w-[44px] p-3 rounded-full shadow-[0_10px_25px_-5px_rgba(20,184,166,0.5)] ring-4 ring-white bg-slate-900 text-white transition-all duration-300 active:scale-90 relative flex items-center justify-center" aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}>
          <ShoppingCart size={22} className="text-teal-400" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <button type="button" onClick={() => alert('No new alerts')} className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-1 text-slate-400 hover:text-teal-600 transition-all duration-300 active:scale-90 touch-manipulation" aria-label="Alerts">
        <Bell size={22} />
        <span className="text-[10px] font-bold">Alerts</span>
      </button>
      <button type="button" onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-1 text-slate-400 hover:text-teal-600 transition-all duration-300 active:scale-90 touch-manipulation" aria-label="Profile">
        <User size={22} />
        <span className="text-[10px] font-bold">Profile</span>
      </button>
    </nav>
  );
}
