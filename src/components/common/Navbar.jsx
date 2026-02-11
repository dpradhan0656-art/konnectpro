import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center shadow-sm">
      {/* BRAND LOGO */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="bg-teal-600 p-1.5 rounded-lg">
            <Shield size={22} className="text-white" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">
            Konnect<span className="text-teal-600">Pro</span>
          </h1>
          <p className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">Premium Services</p>
        </div>
      </div>

      {/* PROFILE BUTTON */}
      <button onClick={() => navigate('/profile')} className="bg-gray-100 p-2 rounded-full text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition">
        <User size={20} />
      </button>
    </nav>
  );
}