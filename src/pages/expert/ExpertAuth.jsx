import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, Lock, Smartphone, Loader, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ExpertAuth({ onLoginSuccess }) {
  const [input, setInput] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // 🚀 NEW: Forgot Password States
  const [isResetMode, setIsResetMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 🛠️ Mobile Number ko Email banana
  const getEmail = (val) => {
     if (/^\d+$/.test(val)) return `${val}@kshatr.com`; 
     return val;
  };

  const handleExpertLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const loginEmail = getEmail(input);

    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (authError) throw authError;

      if (user) {
        const { data: expertData, error: dbError } = await supabase
          .from('experts')
          .select('status')
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

        onLoginSuccess(user);
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 NEW: Password Reset Function
  const handlePasswordReset = async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const resetEmail = getEmail(input);

      try {
          // Supabase magic: Sends password reset email
          const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
              redirectTo: window.location.origin + '/expert/dashboard', // Wapas yahi aayega
          });

          if (error) throw error;
          
          setSuccessMsg("✅ Password reset link has been sent to your registered Email!");
      } catch (error) {
          setErrorMsg(error.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-700 relative overflow-hidden">
        
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

        {/* 🚀 NEW: Success Message UI */}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center gap-2 text-green-400 text-xs font-bold">
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {/* 🚀 SMART FORM: Toggle between Login and Reset Mode */}
        <form onSubmit={isResetMode ? handlePasswordReset : handleExpertLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-teal-500 uppercase ml-1">Mobile or Email</label>
            <div className="flex items-center bg-slate-900 rounded-xl mt-1 p-3 border border-slate-700 focus-within:border-teal-500 transition-colors">
              <Smartphone size={18} className="text-slate-500 mr-3"/>
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="9876543210 or email" 
                className="bg-transparent w-full outline-none font-bold text-white placeholder-slate-600 text-sm" 
                required 
              />
            </div>
          </div>

          {!isResetMode && (
              <div>
                <label className="text-[10px] font-bold text-teal-500 uppercase ml-1">Password / PIN</label>
                <div className="flex items-center bg-slate-900 rounded-xl mt-1 p-3 border border-slate-700 focus-within:border-teal-500 transition-colors">
                  <Lock size={18} className="text-slate-500 mr-3"/>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••" 
                    className="bg-transparent w-full outline-none font-bold text-white placeholder-slate-600 text-sm" 
                    required={!isResetMode} 
                  />
                </div>
                
                {/* Forgot Password Link */}
                <div className="flex justify-end mt-2">
                    <button type="button" onClick={() => {setIsResetMode(true); setErrorMsg(''); setSuccessMsg('');}} className="text-[10px] text-teal-500 font-bold hover:text-teal-400 transition-colors">
                        Forgot Password?
                    </button>
                </div>
              </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-xl font-black shadow-lg shadow-teal-900/50 transition-all active:scale-95 flex justify-center items-center gap-2 mt-4 uppercase tracking-wider text-xs"
          >
            {loading ? <Loader className="animate-spin" size={20}/> : (isResetMode ? "SEND RESET LINK" : "LOGIN TO DASHBOARD")}
          </button>

          {/* Back to Login Button */}
          {isResetMode && (
              <button 
                  type="button" 
                  onClick={() => {setIsResetMode(false); setErrorMsg(''); setSuccessMsg('');}} 
                  className="w-full mt-2 text-slate-400 text-xs font-bold hover:text-white flex justify-center items-center gap-1 transition-colors"
              >
                  <ArrowLeft size={14}/> Back to Login
              </button>
          )}
        </form>

      </div>
    </div>
  );
}