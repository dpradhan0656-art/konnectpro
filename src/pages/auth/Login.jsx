import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Invalid Email or Password");
    else navigate('/'); 
    setLoading(false);
  };

  // ✅ MAGIC: Google Login Function
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) setError("Google Login Failed!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
        
        <div className="text-center mb-8">
            <div className="flex justify-center mb-4"><div className="p-3 bg-blue-50 text-blue-600 rounded-full"><ShieldCheck size={32} /></div></div>
            <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
            <p className="text-sm text-slate-500 mt-1">Login to access your account</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl text-center">{error}</div>}

        {/* ✅ GOOGLE LOGIN BUTTON */}
        <button onClick={handleGoogleLogin} className="w-full mb-6 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-bold flex justify-center items-center gap-3 transition-all active:scale-95 shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
        </button>

        <div className="relative flex items-center justify-center mb-6">
            <div className="absolute border-t border-slate-200 w-full"></div>
            <span className="bg-white px-4 text-xs text-slate-400 font-bold uppercase tracking-widest relative z-10">Or use email</span>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500" placeholder="Email Address" />
            </div>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500" placeholder="Password" />
            </div>
            <button type="submit" disabled={loading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50">
                {loading ? 'Logging in...' : <>Login securely <ArrowRight size={16}/></>}
            </button>
        </form>
      </div>
    </div>
  );
}
