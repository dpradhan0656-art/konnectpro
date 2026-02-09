import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Loader } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 👇 यहाँ से पुराना handleLogin हटाकर यह नया वाला डाला गया है
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // LOGIC: अगर यूजर ने नंबर डाला है, तो हम पीछे '@apnahunar.com' जोड़ देंगे
    let loginEmail = email; 
    
    // चेक करो क्या सिर्फ नंबर डाला है? (Regex for digits)
    if (/^\d+$/.test(email)) {
       loginEmail = `${email}@apnahunar.com`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: password,
    });

    setLoading(false);

    if (error) {
      alert("Login Error: " + error.message);
    } else {
      // 👑 REDIRECT LOGIC
      // 1. Check if Admin
      if (loginEmail.includes('admin')) {
        navigate('/deepakhq');
      } 
      // 2. Check if Expert (Mobile Login)
      else if (loginEmail.includes('@apnahunar.com')) {
        navigate('/expert');
      } 
      // 3. Customer
      else {
        navigate('/');
      }
    }
  };
  // 👆 यहाँ handleLogin खत्म हुआ

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-6 text-white font-sans">
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
            <ShieldCheck size={40} className="text-white"/>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Apna Hunar</h1>
        <p className="text-slate-400 text-center text-sm mb-8">Secure Partner & Admin Login</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            {/* 👇 Label बदला: Email / Mobile */}
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email or Mobile</label>
            <div className="flex items-center bg-slate-800 rounded-xl mt-2 p-3 border border-slate-700 focus-within:border-blue-500">
              <Mail size={18} className="text-slate-500 mr-3"/>
              {/* 👇 Type बदला: email -> text (ताकि नंबर भी डाल सकें) */}
              <input 
                type="text" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@apnahunar.com OR 9876543210" 
                className="bg-transparent w-full outline-none text-white" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
            <div className="flex items-center bg-slate-800 rounded-xl mt-2 p-3 border border-slate-700 focus-within:border-blue-500">
              <Lock size={18} className="text-slate-500 mr-3"/>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="bg-transparent w-full outline-none text-white" 
                required 
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition flex justify-center items-center gap-2">
            {loading ? <Loader className="animate-spin" size={20}/> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}