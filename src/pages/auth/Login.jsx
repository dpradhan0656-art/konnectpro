import React, { useState } from 'react';
// ✅ FIX 1: Correct path to the lib folder
import { supabase } from '../../lib/supabase'; 
import { useNavigate } from 'react-router-dom';
// ✅ FIX 2: Brand config for astrology-aligned colors
import { BRAND } from '../../config/brandConfig'; 
import { ShieldCheck, Mail, Lock, Loader, Smartphone } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ FIX 3: Rebranding logic - using @konnectpro.in instead of old domain
    let loginEmail = email; 
    
    // Check if it's a mobile number (digits only)
    if (/^\d+$/.test(email)) {
       loginEmail = `${email}@konnectpro.in`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: password,
    });

    setLoading(false);

    if (error) {
      alert("🔐 Access Denied: " + error.message);
    } else {
      // ✅ REDIRECT LOGIC
      // 1. Admin (Deepak HQ)
      if (loginEmail.includes('admin')) {
        localStorage.setItem('adminAuth', 'true');
        navigate('/admin/dashboard');
      } 
      // 2. Expert/Partner
      else if (loginEmail.includes('@konnectpro.in')) {
        navigate('/expert');
      } 
      // 3. Customer
      else {
        navigate('/');
      }
    }
  };

  return (
    // Mercury/Venus Clean background
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6 text-slate-800 font-sans">
      
      {/* Decorative Brand Background Element */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-teal-700 -skew-y-3 -mt-20"></div>

      <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 relative z-10">
        
        {/* Brand Icon (Mercury/Teal) */}
        <div className="flex justify-center mb-6">
          <div className="bg-teal-700 p-4 rounded-2xl shadow-lg shadow-teal-200">
            <ShieldCheck size={40} className="text-white"/>
          </div>
        </div>

        <h1 className="text-3xl font-black text-center text-slate-900 tracking-tight">
          Konnect<span className="text-teal-700">Pro</span>
        </h1>
        <p className="text-slate-500 text-center text-xs font-bold uppercase tracking-widest mt-2 mb-8">
          Partner & Admin Secure Access
        </p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-teal-700 uppercase ml-1 tracking-tighter">
              Email or Mobile Number
            </label>
            <div className="flex items-center bg-gray-50 rounded-xl mt-2 p-3 border-2 border-transparent focus-within:border-teal-700 transition-all">
              <Smartphone size={18} className="text-slate-400 mr-3"/>
              <input 
                type="text" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="9876543210 or email" 
                className="bg-transparent w-full outline-none text-slate-800 font-medium placeholder-slate-300" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-teal-700 uppercase ml-1 tracking-tighter">
              Secret Passcode
            </label>
            <div className="flex items-center bg-gray-50 rounded-xl mt-2 p-3 border-2 border-transparent focus-within:border-teal-700 transition-all">
              <Lock size={18} className="text-slate-400 mr-3"/>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="bg-transparent w-full outline-none text-slate-800 font-medium" 
                required 
              />
            </div>
          </div>

          {/* Action Button (Sun/Amber Energy) */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-amber-100 transition-all transform active:scale-95 flex justify-center items-center gap-2"
          >
            {loading ? <Loader className="animate-spin" size={20}/> : "AUTHENTICATE"}
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400 mt-8 font-bold">
          © 2026 KONNECTPRO INDIA • ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
}