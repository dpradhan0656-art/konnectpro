import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; 
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, User, Phone, Mail, Lock, ArrowRight, CheckCircle, Edit3 } from 'lucide-react';

export default function RegisterExpert() {
  const navigate = useNavigate();
  // 🌟 Old State preserved
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', category: '' });
  
  // 🌟 Smart Category States
  const [categories, setCategories] = useState([]);
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 🚀 NEW: State to track if user came from Google
  const [googleSession, setGoogleSession] = useState(null);

  // 🔄 Fetch LIVE categories & Check Google Session
  useEffect(() => {
      const fetchCategories = async () => {
          const { data } = await supabase.from('categories').select('name').eq('is_active', true);
          if (data && data.length > 0) {
              setCategories(data);
              setFormData(prev => ({...prev, category: data[0].name}));
          }
      };
      fetchCategories();

      // 🚀 NEW: Check if user just logged in via Google
      supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
              // User Google se aa gaya hai, ab uska naam auto-fill kar do
              setGoogleSession(session);
              setFormData(prev => ({
                  ...prev, 
                  email: session.user.email,
                  name: session.user.user_metadata.full_name || ''
              }));
          }
      });
  }, []);

  const handleCategoryChange = (e) => {
      const val = e.target.value;
      if (val === 'Other') {
          setIsOtherCategory(true);
          setFormData({ ...formData, category: 'Other' });
      } else {
          setIsOtherCategory(false);
          setFormData({ ...formData, category: val });
      }
  };

  // 🚀 NEW: Google Signup Trigger
  const handleGoogleSignUp = async () => {
      const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
              redirectTo: window.location.href // Wapas isi page par aayega
          }
      });
      if (error) setError("Google Sign Up Failed: " + error.message);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');

    const finalCategory = isOtherCategory ? customCategory : formData.category;

    if (!finalCategory || finalCategory.trim() === '') {
        setError("Please select or type your service category.");
        setLoading(false); return;
    }

    let currentUserId = null;

    // Agar Google se nahi aaya, toh normal Email/Pass se Auth karo (Old logic preserved)
    if (!googleSession) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false); return;
        }
        currentUserId = authData.user?.id;
    } else {
        // Google se aaya hai, toh Auth ID pehle se hai
        currentUserId = googleSession.user.id;
    }

    // 2. Database Insert (Common for both)
    if (currentUserId) {
        const { error: dbError } = await supabase.from('experts').insert([{
            user_id: currentUserId,
            name: formData.name,
            phone: formData.phone,
            service_category: finalCategory, 
            status: 'pending' 
        }]);

        if (dbError) {
            setError("Database Error: " + dbError.message);
        } else {
            setSuccess(true);
        }
    }
    setLoading(false);
  };

  if (success) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans text-center">
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-teal-500/30 shadow-2xl max-w-md w-full">
                  <CheckCircle size={60} className="text-teal-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-black text-white mb-2">Application Received!</h2>
                  <p className="text-slate-400 text-sm mb-6">Your expert profile has been created successfully. Apna Hunar admin team is reviewing your application.</p>
                  <Link to="/expert/login" className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold inline-block shadow-lg hover:bg-teal-500 transition-all">Go to Login</Link>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-[2rem] border border-teal-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
            <div className="text-center mb-8">
                <p className="text-[10px] text-teal-500 font-bold uppercase tracking-widest mb-1">Join Apna Hunar</p>
                <h1 className="text-2xl font-black text-white">Expert Registration</h1>
            </div>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-xs font-bold rounded-xl text-center">{error}</div>}

            {/* 🚀 NEW: Google Sign Up Button (Only show if not already authenticated via Google) */}
            {!googleSession && (
                <>
                    <button 
                        type="button" 
                        onClick={handleGoogleSignUp}
                        className="w-full mb-4 bg-white hover:bg-slate-100 text-slate-950 py-3 rounded-xl font-black flex justify-center items-center gap-3 transition-all active:scale-95 shadow-xl text-sm"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5"/>
                        SIGN UP WITH GOOGLE
                    </button>
                    
                    <div className="relative flex items-center justify-center mb-6 mt-2">
                        <div className="absolute border-t border-slate-800 w-full"></div>
                        <span className="bg-slate-900 px-4 text-[10px] text-slate-500 font-black uppercase tracking-widest relative z-10">Or register manually</span>
                    </div>
                </>
            )}

            {/* 🚀 NEW: Helper Text if Google is successful */}
            {googleSession && (
                 <div className="mb-6 p-3 bg-teal-500/10 border border-teal-500/50 text-teal-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2">
                     <CheckCircle size={16} /> Google Auth Success! Please complete your profile.
                 </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="text" required placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-500/50" />
                </div>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="tel" required placeholder="Mobile Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-500/50" />
                </div>
                
                {/* 🌟 SMART CATEGORY DROPDOWN */}
                <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <select value={formData.category} onChange={handleCategoryChange} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-500/50 appearance-none">
                        <option value="" disabled>Select your profession...</option>
                        {categories.map((cat, idx) => (
                            <option key={idx} value={cat.name}>{cat.name}</option>
                        ))}
                        <option value="Other" className="font-bold text-teal-400">Other (Type Manually)</option>
                    </select>
                </div>

                {isOtherCategory && (
                    <div className="relative animate-in slide-in-from-top-2 fade-in">
                        <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500" size={18} />
                        <input 
                            type="text" 
                            required 
                            placeholder="Type your profession (e.g. RO Repair)" 
                            value={customCategory} 
                            onChange={e => setCustomCategory(e.target.value)} 
                            className="w-full bg-teal-950/30 border border-teal-500/50 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-400" 
                        />
                    </div>
                )}

                {/* 🚀 Hide Email/Password if Google is used */}
                {!googleSession && (
                    <>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input type="email" required placeholder="Email Address (Login ID)" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-500/50" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input type="password" required placeholder="Create Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-500/50" />
                        </div>
                    </>
                )}

                <button type="submit" disabled={loading} className="w-full mt-4 bg-teal-600 hover:bg-teal-500 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm flex justify-center items-center gap-2 shadow-lg shadow-teal-900/50 disabled:opacity-50 transition-all active:scale-95">
                    {loading ? 'Processing...' : <>Complete Registration <ArrowRight size={16}/></>}
                </button>
            </form>
            <div className="mt-6 text-center text-xs text-slate-500">
                Already registered? <Link to="/expert/login" className="text-teal-400 font-bold hover:underline">Login here</Link>
            </div>
        </div>
      </div>
    </div>
  );
}
