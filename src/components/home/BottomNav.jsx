import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Calendar, Bell, User, ShoppingCart } from 'lucide-react';

export default function BottomNav({ cartCount }) {
  const navigate = useNavigate();

  // OLD: nav had overflow-hidden — clipped floating cart at top edge
  return (
    <nav
      className="fixed bottom-0 w-full bg-emerald-950/95 backdrop-blur-xl border-t border-white/10 px-4 sm:px-6 py-2.5 flex justify-between items-center z-50 max-w-md mx-auto left-0 right-0 md:hidden min-h-[56px] overflow-visible shadow-[0_-8px_32px_rgba(0,0,0,0.4)]"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
      aria-label="Main navigation"
    >
      {/* OLD: pb-safe (custom util) — NEW: explicit env(safe-area-inset-bottom) for system nav/notches */}
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-1 text-amber-400 transition-all duration-300 active:scale-90 touch-manipulation" aria-label="Home">
        <HomeIcon size={22} />
        <span className="text-[10px] font-bold">Home</span>
      </button>
      <button type="button" onClick={() => navigate('/bookings')} className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-1 text-slate-500 hover:text-amber-400 transition-all duration-300 active:scale-90 touch-manipulation" aria-label="Bookings">
        <Calendar size={22} />
        <span className="text-[10px] font-bold">Bookings</span>
      </button>

      <div className="relative -top-6 flex items-center justify-center">
        <button type="button" onClick={() => navigate('/cart')} className="min-h-[44px] min-w-[44px] p-3 rounded-full shadow-[0_12px_28px_-4px_rgba(5,150,105,0.55)] ring-4 ring-emerald-950 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white transition-all duration-300 active:scale-90 relative flex items-center justify-center border border-emerald-400/30" aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}>
          <ShoppingCart size={22} className="text-white" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <button type="button" onClick={() => alert('No new alerts')} className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-1 text-slate-500 hover:text-amber-400 transition-all duration-300 active:scale-90 touch-manipulation" aria-label="Alerts">
        <Bell size={22} />
        <span className="text-[10px] font-bold">Alerts</span>
      </button>
      <button type="button" onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-1 text-slate-500 hover:text-amber-400 transition-all duration-300 active:scale-90 touch-manipulation" aria-label="Profile">
        <User size={22} />
        <span className="text-[10px] font-bold">Profile</span>
      </button>
    </nav>
  );
}