import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
// 🚀 NEW: PhoneIcon ki jagah User icon laga diya taaki Email/Phone dono ke liye sahi lage
import { Wrench, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ExpertLogin() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState(''); // 🚀 Changed from 'phone' to 'loginId'
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🚀 Forgot Password States
  const [isResetMode, setIsResetMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // 💡 THE MAGIC: Mobile number ko email banayein, ya direct email use karein
    let loginEmail = loginId.trim();
    if (!loginEmail.includes('@')) {
        loginEmail = `${loginEmail}@kshatr.com`;
    }
    
    // 1. Supabase Auth se login karna
    const { data, error: authError } = await supabase.auth.signInWithPassword({ 
        email: loginEmail, 
        password: password 
    });
    
    if (authError) {
        setError("Login ID ya Password galat hai!");
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
        .eq('user_id', userId)
        .single();

      if (dbError || !expertData) {
        console.error("Database Error:", dbError);
        setError("Account mil gaya par Expert list me nahi hai.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (expertData.status === 'approved') {
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

  // 🚀 Password Reset Function
  const handlePasswordReset = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccessMsg('');

      let resetEmail = loginId.trim();
      if (!resetEmail.includes('@')) {
          resetEmail = `${resetEmail}@kshatr.com`;
      }

      try {
          const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
              redirectTo: `${window.location.origin}/expert-dashboard`, 
          });

          if (error) throw error;
          
          setSuccessMsg("✅ Password reset link SMS/Email par bhej di gayi hai!");
      } catch (err) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
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
                <h1 className="text-3xl font-black tracking-tight">{isResetMode ? "RESET PASSWORD" : "EXPERT LOGIN"}</h1>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" /> {error}
                </div>
            )}

            {successMsg && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold rounded-2xl flex items-center gap-2">
                    <CheckCircle size={16} className="shrink-0" /> {successMsg}
                </div>
            )}

            {/* Google Button & Divider (Hide in Reset Mode) */}
            {!isResetMode && (
                <>
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
                        {/* 🚀 Updated Label Text */}
                        <span className="bg-slate-900 px-4 text-[10px] text-slate-500 font-black uppercase tracking-widest relative z-10">Or use Email / Mobile</span>
                    </div>
                </>
            )}

            <form onSubmit={isResetMode ? handlePasswordReset : handleLogin} className="space-y-4">
                
                {/* 🚀 FIX: Removed maxLength, changed to text, updated placeholder */}
                <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-teal-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        required 
                        value={loginId} 
                        onChange={(e) => setLoginId(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 outline-none focus:border-teal-500/50 transition-all font-medium tracking-wide" 
                        placeholder="Email Address / Mobile No."
                    />
                </div>
                
                {/* Password Field (Hide in Reset Mode) */}
                {!isResetMode && (
                    <div>
                        <div className="relative group mt-4">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-teal-500 transition-colors" size={18} />
                            <input 
                                type="password" 
                                required={!isResetMode} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 outline-none focus:border-teal-500/50 transition-all font-medium" 
                                placeholder="••••••••" 
                            />
                        </div>
                        
                        {/* Forgot Password Link */}
                        <div className="flex justify-end mt-2">
                            <button 
                                type="button" 
                                onClick={() => {setIsResetMode(true); setError(''); setSuccessMsg('');}} 
                                className="text-[10px] text-teal-500 font-bold hover:text-teal-400 transition-colors tracking-wide"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full mt-4 bg-teal-500 hover:bg-teal-400 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 shadow-lg shadow-teal-500/10 disabled:opacity-50 transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" size={20}/> : (
                        isResetMode ? "SEND RESET LINK" : <>Start Duty <ArrowRight size={18}/></>
                    )}
                </button>

                {/* Back to Login Button */}
                {isResetMode && (
                    <button 
                        type="button" 
                        onClick={() => {setIsResetMode(false); setError(''); setSuccessMsg('');}} 
                        className="w-full mt-4 text-slate-400 text-[11px] font-bold hover:text-white flex justify-center items-center gap-1 transition-colors uppercase tracking-widest"
                    >
                        <ArrowLeft size={14}/> Back to Login
                    </button>
                )}
            </form>

            {/* Footer Text (Hide in Reset Mode to keep it clean) */}
            {!isResetMode && (
                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                        Not a partner? <Link to="/register-expert" className="text-teal-500 hover:underline">Apply Now</Link>
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}