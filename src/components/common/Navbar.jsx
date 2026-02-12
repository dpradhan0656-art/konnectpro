import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
// 👇 IMPORT ADDED: Nayi location se logo lana
import logoImg from '../../assets/logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center shadow-sm">
      {/* BRAND LOGO SECTION */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        
        {/* 👇 IMAGE SOURCE CHANGED: Variable use kiya */}
        <div className="bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
            <img 
              src={logoImg} 
              alt="KonnectPro" 
              className="w-10 h-10 object-contain" 
            />
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