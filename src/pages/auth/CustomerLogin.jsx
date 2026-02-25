import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Lock, User, Loader2, CheckCircle } from 'lucide-react';

export default function CustomerLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // States
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false); // Check karega ki naya hai ya purana

  // 🛠️ MAGIC LOGIC: Phone ko Email me badalna (Supabase ke liye)
  const getDummyEmail = (mobile) => `${mobile}@Kshatr.local`;

  // 1️⃣ Login / Signup Handle
  const handleLogin = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return alert("Please enter valid 10-digit mobile number!");
    if (pin.length < 4) return alert("PIN should be at least 4 digits!");

    setLoading(true);
    const dummyEmail = getDummyEmail(phone);

    // Pehle LOGIN try karein
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: pin,
    });

    if (!loginError && loginData.user) {
      // ✅ SUCCESS: Purana user tha, login ho gaya
      // alert("Welcome back!");
      navigate('/'); 
    } else {
      // ❌ FAIL: Matlab ye naya user hai (ya PIN galat hai)
      if (loginError.message.includes("Invalid login")) {
         // Agar login fail hua, to hum maante hain ki shayad naya user hai
         // User ko agle step par bhejo Profile banane ke liye
         setIsNewUser(true);
      } else {
        alert("Error: " + loginError.message);
      }
    }
    setLoading(false);
  };

  // 2️⃣ New User Registration
  const handleRegister = async () => {
    if (!name) return alert("Please enter your name!");
    setLoading(true);

    const dummyEmail = getDummyEmail(phone);

    // Signup karein
    const { data, error } = await supabase.auth.signUp({
      email: dummyEmail,
      password: pin, // Mobile number hi password ban gaya
      options: {
        data: { full_name: name, phone_number: phone }
      }
    });

    if (error) {
      alert("Registration Failed: " + error.message);
    } else {
      // Database me bhi save kar lete hain
      if (data.user) {
        await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: name,
            phone_number: phone,
            updated_at: new Date()
        });
      }
      alert("🎉 Account Created Successfully!");
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      
      <div className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-xl border border-slate-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
            Konnect<span className="text-blue-600">Pro</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">India's Trusted Home Services</p>
        </div>

        {!isNewUser ? (
          /* --- LOGIN FORM (Mobile + PIN) --- */
          <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">MOBILE NUMBER</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-slate-400" size={20} />
                <input 
                  type="tel" placeholder="98765 43210" required maxLength={10}
                  className="w-full bg-slate-50 border-2 border-slate-100 p-3 pl-10 rounded-xl outline-none focus:border-blue-600 font-black text-lg tracking-widest text-slate-700"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))} // Sirf number type hoga
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">SECRET PIN (4-Digits)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                <input 
                  type="password" placeholder="****" required maxLength={6}
                  className="w-full bg-slate-50 border-2 border-slate-100 p-3 pl-10 rounded-xl outline-none focus:border-blue-600 font-black text-lg tracking-widest text-slate-700"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-slate-400 text-right">Forgot PIN? Contact Support</p>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-black shadow-lg shadow-slate-300 flex justify-center items-center gap-2 active:scale-95 transition-all mt-4"
            >
              {loading ? <Loader2 className="animate-spin"/> : <>Login / Signup <ArrowRight size={18}/></>}
            </button>
            
            <div className="text-center mt-4">
               <p className="text-xs text-slate-400">First time? Just enter your mobile & create a PIN.</p>
            </div>
          </form>
        ) : (
          /* --- NEW USER REGISTRATION (Name Pucho) --- */
          <div className="space-y-4 animate-in zoom-in-95">
             <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-xl font-black text-slate-800">New Account!</h2>
                <p className="text-sm text-slate-500">Setting up for <b>{phone}</b></p>
             </div>

             <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">FULL NAME (आपका नाम)</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={20} />
                <input 
                  type="text" placeholder="Deepak Pradhan" required
                  className="w-full bg-slate-50 border-2 border-slate-100 p-3 pl-10 rounded-xl outline-none focus:border-blue-600 font-bold text-lg text-slate-700"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-black shadow-lg shadow-blue-300 flex justify-center items-center gap-2 active:scale-95 transition-all mt-4"
            >
              {loading ? <Loader2 className="animate-spin"/> : "Complete Setup 🚀"}
            </button>

            <button onClick={() => setIsNewUser(false)} className="w-full text-center text-xs font-bold text-slate-400 py-2">
                Cancel
            </button>
          </div>
        )}

      </div>
    </div>
  );
}