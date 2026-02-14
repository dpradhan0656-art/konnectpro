import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // ✅ Database Added
import logoImg from '../../assets/logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const [themeColor, setThemeColor] = useState('text-teal-600'); // Default Color

  // ✅ NEW: Fetch Lucky Theme from Database
  useEffect(() => {
    const fetchTheme = async () => {
      const { data } = await supabase.from('admin_settings').select('*').eq('setting_key', 'theme_color').single();
      if (data) {
         // Map database value to Tailwind Text Class
         const colorMap = {
             'teal': 'text-teal-600',
             'blue': 'text-blue-600',
             'rose': 'text-rose-600',
             'violet': 'text-violet-600'
         };
         setThemeColor(colorMap[data.setting_value] || 'text-teal-600');
      }
    };
    fetchTheme();
  }, []);
  
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center shadow-sm">
      {/* BRAND LOGO SECTION */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        
        <div className="bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
            <img 
              src={logoImg} 
              alt="KonnectPro" 
              className="w-10 h-10 object-contain" 
            />
        </div>

        <div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">
            Konnect
            {/* 👇 DYNAMIC COLOR APPLIED HERE */}
            <span className={themeColor}>Pro</span>
          </h1>
          <p className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">Premium Services</p>
        </div>
      </div>

      {/* PROFILE BUTTON */}
      <button onClick={() => navigate('/bookings')} className="bg-gray-100 p-2 rounded-full text-slate-600 hover:bg-slate-200 transition">
        <User size={20} />
      </button>
    </nav>
  );
}