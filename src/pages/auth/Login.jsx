import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) {
      setError("Google Login Failed!");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20" />

        <div className="relative z-10 text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="p-4 bg-slate-950 rounded-2xl text-teal-400 border border-slate-800 shadow-inner">
              <ShieldCheck size={34} />
            </div>
          </div>
          <p className="text-[10px] text-teal-400 font-black uppercase tracking-[0.2em] mb-2">
            Kshatr.com Official
          </p>
          <h1 className="text-3xl font-black text-white tracking-tight">Customer Login</h1>
          <p className="text-sm text-slate-400 mt-2">
            Continue with Google to access bookings and profile.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold rounded-2xl text-center">
            {error}
          </div>
        )}

        {/* ✅ GOOGLE ONLY (Minimalist OAuth) */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white py-4 rounded-2xl font-black flex justify-center items-center gap-3 transition-all active:scale-95 shadow-xl shadow-teal-900/40"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Powered by Kshatryx Technologies
        </p>

        {/* Legacy Auth (Deprecated) */}
        {/*
          import { useNavigate, Link } from 'react-router-dom';
          import { Mail, Lock, ArrowRight, ShieldCheck, User, Loader2 } from 'lucide-react';

          const navigate = useNavigate();
          const [isSignUp, setIsSignUp] = useState(false);
          const [name, setName] = useState('');
          const [email, setEmail] = useState('');
          const [password, setPassword] = useState('');
          const [loading, setLoading] = useState(false);
          const [successMsg, setSuccessMsg] = useState('');

          const handleEmailLogin = async (e) => {
            e.preventDefault();
            setLoading(true); setError('');
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError("Invalid Email or Password");
            else navigate('/');
            setLoading(false);
          };

          const handleSignUp = async (e) => {
            e.preventDefault();
            if (!name.trim()) { setError("Please enter your name."); return; }
            if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
            setLoading(true); setError(''); setSuccessMsg('');
            const { data, error } = await supabase.auth.signUp({
              email: email.trim(),
              password,
              options: { data: { full_name: name.trim() } }
            });
            if (error) {
              setError(error.message?.includes('already registered') ? "This email is already registered. Try logging in." : error.message);
              setLoading(false);
              return;
            }
            if (data?.user?.identities?.length === 0) {
              setError("This email is already registered. Try logging in.");
              setLoading(false);
              return;
            }
            setSuccessMsg("Account created! Check your email to confirm, or login directly.");
            setIsSignUp(false);
            setLoading(false);
          };

          {successMsg && <div className="mb-4 p-3 bg-teal-50 text-teal-700 text-xs font-bold rounded-xl text-center">{successMsg}</div>}
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute border-t border-slate-200 w-full"></div>
            <span className="bg-white px-4 text-xs text-slate-400 font-bold uppercase tracking-widest relative z-10">Or use email</span>
          </div>
          <form onSubmit={isSignUp ? handleSignUp : handleEmailLogin} className="space-y-4">
            ...
          </form>
        */}

        <div className="mt-7 text-center">
          <Link to="/register-expert" className="text-teal-400 hover:text-teal-300 text-xs font-bold uppercase tracking-widest">
            Register as Expert
          </Link>
        </div>
      </div>
    </div>
  );
}
