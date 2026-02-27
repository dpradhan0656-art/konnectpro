import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function ExpertLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // 1. Supabase Auth se login karna
    const { data, error: authError } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password 
    });
    
    if (authError) {
        setError("Email ya Password galat hai!");
        setLoading(false);
        return;
    }

    if (data.user) {
        checkExpertStatus(data.user.id);
    }
  };

  const checkExpertStatus = async (userId) => {
      // 2. Experts table me check karna ki kya ye approved expert hai
      const { data: expertData, error: dbError } = await supabase
        .from('experts')
        .select('status, id')
        .eq('id', userId) // Primary Key yahan 'id' hi honi chahiye
        .single();

      if (dbError) {
        console.error("Database Error:", dbError);
        setError("Account mil gaya par Expert list me nahi hai.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (expertData && expertData.status === 'approved') {
          // ✅ SUCCESS: Dashboard par bhejen
          navigate('/expert-dashboard');
      } else {
          setError("Aapka account abhi Approved nahi hai. Admin se baat karen.");
          await supabase.auth.signOut();
      }
      setLoading(false);
  };

  // ✅ Google Login Magic
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/expert-dashboard` }
    });
    if (error) setError("Google Login Failed!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans text-white">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-[2.5rem] border border-teal-500/30 shadow-2xl relative overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <div className="relative z-10">
            <div className="flex justify-center mb-6">
                <div className="p-4 bg-slate-950 rounded-full text-teal-500 border border-slate-800 shadow-lg">
                    <Wrench size={40} />
                </div>
            </div>

            <div className="text-center mb-8">
                <p className="text-[10px] text-teal-500 font-black uppercase tracking-[0.2em] mb-1">Partner Portal</p>
                <h1 className="text-3xl font-black tracking-tight">EXPERT LOGIN</h1>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Google Button */}
            <button 
                type="button" 
                onClick={handleGoogleLogin} 
                className="w-full mb-6 bg-white hover:bg-slate-100 text-slate-950 py-4 rounded-2xl font-black flex justify-center items-center gap-3 transition-all active:scale-95 shadow-xl text-sm"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5"/>
                SIGN IN WITH GOOGLE
            </button>

            <div className="relative flex items-center justify-center mb-8">
                <div className="absolute border-t border-slate-800 w-full"></div>
                <span className="bg-slate-900 px-4 text-[10px] text-slate-500 font-black uppercase tracking-widest relative z-10">Or workspace email</span>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-teal-500 transition-colors" size={18} />
                    <input 
                        type="tel" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 outline-none focus:border-teal-500/50 transition-all font-medium" 
                        placeholder="Enter Mobile Number"
                    />
                </div>
                <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-teal-500 transition-colors" size={18} />
                    <input 
                        type="password" 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 outline-none focus:border-teal-500/50 transition-all font-medium" 
                        placeholder="••••••••" 
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full mt-4 bg-teal-500 hover:bg-teal-400 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 shadow-lg shadow-teal-500/10 disabled:opacity-50 transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <>Start Duty <ArrowRight size={18}/></>}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    Not a partner? <Link to="/register-expert" className="text-teal-500 hover:underline">Apply Now</Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}