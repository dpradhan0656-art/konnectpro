import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Map, Loader2 } from 'lucide-react';

export default function AreaHeadLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (authError) {
        setError("Invalid Email or Password!");
        setLoading(false); return;
    }
    checkHeadStatus(data.user.id);
  };

  const checkHeadStatus = async (userId) => {
      const { data: headData } = await supabase.from('area_heads').select('status').eq('user_id', userId).single();
      if (headData && headData.status === 'active') {
          navigate('/area-head/dashboard');
      } else {
          setError("Access Denied! You are not an active Kshatr Area Head.");
          await supabase.auth.signOut();
      }
      setLoading(false);
  }

  // ✅ MAGIC: Google Login (Kshatr Configured)
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/area-head/dashboard` }
    });
    if (error) setError("Google Login Failed!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden">
      {/* 🛡️ Kshatr Background Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-inner">
                <Map size={32} className="text-teal-500"/>
            </div>
            <p className="text-[10px] text-teal-500 font-black uppercase tracking-widest mb-1">Kshatr.com Official</p>
            <h1 className="text-3xl font-black text-white tracking-tight">City Command</h1>
            <p className="text-slate-400 text-sm mt-2">Area Head Login Portal</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2">
                <Shield size={16} /> {error}
            </div>
        )}

        {/* ✅ GOOGLE BUTTON (Premium Light Theme) */}
        <button type="button" onClick={handleGoogleLogin} className="w-full mb-6 bg-white hover:bg-slate-200 text-slate-900 py-3.5 rounded-xl font-bold flex justify-center items-center gap-3 transition-all active:scale-95 shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
        </button>

        <div className="relative flex items-center justify-center mb-6">
            <div className="absolute border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest relative z-10">Or use official email</span>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-500 transition-colors" size={18} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-teal-500/50 transition-all font-medium" placeholder="commander@kshatr.com" />
            </div>
            <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-500 transition-colors" size={18} />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-teal-500/50 transition-all font-medium" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} className="w-full mt-6 bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 shadow-lg shadow-teal-900/50 disabled:opacity-50 transition-all active:scale-95">
                {loading ? <Loader2 size={16} className="animate-spin"/> : <>Access HQ Command <ArrowRight size={16}/></>}
            </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                <Shield size={10}/> Protected by Kshatr Security
            </p>
        </div>
      </div>
    </div>
  );
}