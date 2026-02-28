import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, Lock, Smartphone, Loader, AlertTriangle } from 'lucide-react';

export default function ExpertAuth({ onLoginSuccess }) {
  const [input, setInput] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 🛠️ Mobile Number ko Email banana (Internal Logic)
  const getEmail = (val) => {
     if (/^\d+$/.test(val)) return `${val}@kshatr.com`; // UPDATE: Changed to .com as per your previous login logic
     return val;
  };

  const handleExpertLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const loginEmail = getEmail(input);

    try {
      // 1. Basic Auth Check
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (authError) throw authError;

      if (user) {
        // 🚀 2. SAFETY CHECK: Ab hum 'experts' table me check karenge (profiles me nahi)
        const { data: expertData, error: dbError } = await supabase
          .from('experts')
          .select('status')
          // Hum user ki ID se dhundh rahe hain (Google aur normal dono ke liye kaam karega)
          .eq('user_id', user.id) 
          .single();

        if (dbError || !expertData) {
           await supabase.auth.signOut(); 
           throw new Error("⛔ Access Denied. You are not registered as an expert.");
        }

        if (expertData.status !== 'approved') {
           await supabase.auth.signOut();
           throw new Error("⏳ Account Pending: Wait for Admin verification.");
        }

        // 3. Sab sahi hai -> Entry do
        onLoginSuccess(user);
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-700 relative overflow-hidden">
        
        {/* Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-slate-900 rounded-2xl mb-4 border border-slate-700 shadow-lg">
            <ShieldCheck size={40} className="text-teal-400" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">KSHATR <span className="text-teal-500">PARTNER</span></h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Authorized Access Only</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
            <AlertTriangle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleExpertLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-teal-500 uppercase ml-1">Mobile or Email</label>
            <div className="flex items-center bg-slate-900 rounded-xl mt-1 p-3 border border-slate-700 focus-within:border-teal-500 transition-colors">
              <Smartphone size={18} className="text-slate-500 mr-3"/>
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="9876543210" 
                className="bg-transparent w-full outline-none font-bold text-white placeholder-slate-600" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-teal-500 uppercase ml-1">Password / PIN</label>
            <div className="flex items-center bg-slate-900 rounded-xl mt-1 p-3 border border-slate-700 focus-within:border-teal-500 transition-colors">
              <Lock size={18} className="text-slate-500 mr-3"/>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••" 
                className="bg-transparent w-full outline-none font-bold text-white placeholder-slate-600" 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-xl font-black shadow-lg shadow-teal-900/50 transition-all active:scale-95 flex justify-center items-center gap-2 mt-4 uppercase tracking-wider"
          >
            {loading ? <Loader className="animate-spin" size={20}/> : "LOGIN TO DASHBOARD"}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-500 mt-6">
          Problem logging in? Call <span className="text-teal-400 font-bold">Support</span>
        </p>
      </div>
    </div>
  );
}