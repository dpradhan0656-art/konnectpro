import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';

export default function Navbar() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [user, setUser] = useState(null);
  const [ticker, setTicker] = useState("Loading updates...");

  useEffect(() => {
    const fetchTicker = async () => {
        const { data } = await supabase.from('admin_settings').select('setting_value').eq('setting_key', 'ticker_text').single();
        if (data) setTicker(data.setting_value);
    };
    fetchTicker();

    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      {/* ????? YELLOW RUNNING PATTI */}
      <div className="bg-amber-400 text-slate-900 py-1 overflow-hidden whitespace-nowrap border-b border-amber-500 shadow-sm">
        <div className="animate-marquee inline-block font-black text-[10px] uppercase tracking-[0.2em]">
           {ticker} &nbsp;&nbsp;&nbsp;&nbsp; ?? {ticker} &nbsp;&nbsp;&nbsp;&nbsp; ?? {ticker}
        </div>
      </div>

      {/* ?? MAIN NAVBAR */}
      <nav className="bg-slate-900 text-white h-16 flex items-center shadow-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
             {/* ? LOGO.PNG IS BACK HERE */}
             <div className="h-10 w-10 flex items-center justify-center bg-white/10 rounded-xl border border-white/10 overflow-hidden p-1">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="h-full w-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} 
                />
                <ShieldCheck size={24} className="text-teal-400 hidden" />
             </div>
             <div className="flex flex-col">
                 <span className="text-xl font-black tracking-tighter uppercase leading-none">KSHATR<span className="text-teal-400">.COM</span></span>
                 <span className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em]">Partner of Apna Hunar</span>
             </div>
          </Link>

          <div className="flex items-center gap-4">
             <Link to="/cart" className="relative p-2 hover:bg-white/5 rounded-full transition-all">
                <ShoppingCart size={20} className="text-slate-300" />
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{cart.length}</span>}
             </Link>
             {user ? (
               <button onClick={() => navigate('/profile')} className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center font-bold text-xs uppercase text-slate-900 shadow-lg shadow-teal-500/20">
                  {user.email?.charAt(0)}
               </button>
             ) : (
               <button onClick={() => navigate('/login')} className="bg-white text-slate-900 px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider">Login</button>
             )}
          </div>
        </div>
      </nav>
    </div>
  );
}
