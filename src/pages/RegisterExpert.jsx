import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  User, Phone, MapPin, Briefcase, ChevronRight, CheckCircle, 
  Navigation, ArrowLeft, Building, CreditCard, ShieldCheck, Globe 
} from 'lucide-react';

export default function RegisterExpert() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [localLang, setLocalLang] = useState('hindi'); // Default Hindi

  // --- 1. LANGUAGE DICTIONARY (State Wise) ---
  const labels = {
    english: {
      name: "Full Name", phone: "Mobile Number", category: "Service Category",
      area: "Work Area", address: "Home Address", aadhar: "Aadhaar Number",
      pan: "PAN Number (Optional)", bank: "Bank Account No.", ifsc: "IFSC Code",
      next: "Next Step", submit: "Submit Application", back: "Back"
    },
    hindi: { // MP, UP, Bihar, Delhi
      name: "पूरा नाम", phone: "मोबाइल नंबर", category: "काम की श्रेणी",
      area: "काम का इलाका", address: "घर का पता", aadhar: "आधार नंबर",
      pan: "पैन नंबर (वैकल्पिक)", bank: "बैंक खाता संख्या", ifsc: "IFSC कोड",
      next: "अगला कदम", submit: "जमा करें", back: "पीछे"
    },
    marathi: { // Maharashtra
      name: "पूर्ण नाव", phone: "मोबाईल नंबर", category: "कामाचा प्रकार",
      area: "कामाचे क्षेत्र", address: "घरचा पत्ता", aadhar: "आधार क्रमांक",
      pan: "पॅन नंबर", bank: "बँक खाते क्रमांक", ifsc: "IFSC कोड",
      next: "पुढील", submit: "सादर करा", back: "मागे"
    },
    tamil: { // Tamil Nadu
      name: "முழு பெயர்", phone: "அலைபேசி எண்", category: "சேவை வகை",
      area: "வேலை பகுதி", address: "வீட்டு முகவரி", aadhar: "ஆதார் எண்",
      pan: "பான் எண்", bank: "வங்கி கணக்கு எண்", ifsc: "IFSC குறியீடு",
      next: "அடுத்து", submit: "சமர்ப்பிக்கவும்", back: "பின்னால்"
    },
    bengali: { // West Bengal
      name: "পুরো নাম", phone: "মোবাইল নম্বর", category: "কাজের ধরণ",
      area: "কাজের এলাকা", address: "বাড়ির ঠিকানা", aadhar: "আধার নম্বর",
      pan: "প্যান নম্বর", bank: "ব্যাঙ্ক অ্যাকাউন্ট নম্বর", ifsc: "IFSC কোড",
      next: "পরবর্তী", submit: "জমা দিন", back: "ফিরে যান"
    }
  };

  const [formData, setFormData] = useState({
    name: '', mobile: '', service_category: 'Electrician',
    city: 'Jabalpur', state: 'Madhya Pradesh', working_area: '', address: '',
    aadhar_no: '', pan_no: '', bank_account: '', ifsc_code: ''
  });

  // --- 2. SMART LANGUAGE DETECTOR ---
  const detectLanguageByState = (stateName) => {
    const s = stateName.toLowerCase();
    if (s.includes('maharashtra')) return 'marathi';
    if (s.includes('tamil')) return 'tamil';
    if (s.includes('bengal')) return 'bengali';
    if (s.includes('gujarat')) return 'gujarati';
    if (s.includes('karnataka')) return 'kannada';
    // Default Hindi for MP, UP, Delhi, etc.
    return 'hindi';
  };

// --- 2. GPS LOGIC (Corrected Version) ---
  const detectLocation = () => {
    setLocLoading(true);
    if (!navigator.geolocation) { 
      alert("GPS not supported"); 
      setLocLoading(false); 
      return; 
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        
        // ✅ Yahan humne variable ka naam 'cleanAddr' rakha hai
        const cleanAddr = data.display_name ? data.display_name.replace(/[^\x00-\x7F]/g, "").trim() : ""; 
        const city = data.address.city || data.address.town || "Jabalpur";
        const state = data.address.state || "Madhya Pradesh";

        // Auto-Set Language based on State
        const detectedLang = detectLanguageByState(state);
        setLocalLang(detectedLang);

        setFormData(prev => ({ 
          ...prev, 
          address: cleanAddr, // ✅ Fix: Ab 'cleanAddr' hi use ho raha hai
          city: city, 
          state: state 
        }));
      } catch (err) { 
        console.error("Location Error:", err);
        alert("Location failed. Fill manually."); 
      }
      setLocLoading(false);
    }, () => { 
      alert("Please enable GPS"); 
      setLocLoading(false); 
    });
  };

  // --- 4. SUBMIT FORM (Master Logic) ---
  const handleSubmit = async () => {
    setLoading(true);
    const phoneValue = formData.mobile ? String(formData.mobile).trim() : "";
    
    if (!phoneValue || phoneValue.length < 10) { alert("Invalid Mobile Number"); setLoading(false); return; }
    if (!formData.aadhar_no || formData.aadhar_no.length < 12) { alert("Invalid Aadhaar Number"); setLoading(false); return; }

    try {
        // Check Duplicate
        const { data: existing } = await supabase.from('experts').select('phone').eq('phone', phoneValue).maybeSingle();
        if (existing) { alert("Mobile Number already registered!"); setLoading(false); return; }

        // Master Data Object
        const masterData = {
            name: formData.name,
            phone: phoneValue,
            service_category: formData.service_category,
            city: formData.city,
            state: formData.state,
            working_area: formData.working_area,
            address: formData.address,
            
            // Security & Bank
            aadhar_no: formData.aadhar_no,
            pan_no: formData.pan_no,
            account_no: formData.bank_account,
            ifsc_code: formData.ifsc_code,

            is_verified: false,
            status: 'pending'
        };

        const { error } = await supabase.from('experts').insert([masterData]);
        if (error) throw error;
        setStep(4); // Success
    } catch (err) { alert("Error: " + err.message); } 
    finally { setLoading(false); }
  };

  // Helper to Render Label (English + Local)
  const Label = ({ field }) => (
    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
      {labels['english'][field]} <span className="text-teal-600">/ {labels[localLang]?.[field] || labels['hindi'][field]}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      
      {step < 4 && (
        <button onClick={() => step > 1 ? setStep(step-1) : navigate('/')} className="absolute top-6 left-6 p-3 bg-white rounded-full shadow-sm text-slate-500 hover:bg-slate-100">
          <ArrowLeft size={20}/>
        </button>
      )}

      <div className="w-full max-w-lg bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 relative">
        
        {/* Progress Bar */}
        <div className="flex justify-between mb-8 px-2">
           {[1, 2, 3, 4].map(s => (
             <div key={s} className={`h-1.5 flex-1 mx-1 rounded-full transition-all ${step >= s ? 'bg-teal-600' : 'bg-slate-200'}`}></div>
           ))}
        </div>

        {/* Header */}
        <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900">Partner <span className="text-teal-600">Registration</span></h2>
            <p className="text-slate-500 text-xs flex items-center gap-1">
                <Globe size={12}/> Form Language: <span className="font-bold uppercase text-teal-700">{localLang}</span> + English
            </p>
        </div>

        {/* --- STEP 1: PERSONAL --- */}
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-8">
             <div><Label field="name"/><input type="text" className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} /></div>
             <div><Label field="phone"/><input type="number" className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200" value={formData.mobile} onChange={e=>setFormData({...formData, mobile:e.target.value})} /></div>
             <div><Label field="category"/>
                <select className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200" value={formData.service_category} onChange={e=>setFormData({...formData, service_category:e.target.value})}>
                    <option>Electrician</option><option>Plumber</option><option>AC Repair</option><option>Cleaning</option><option>Carpenter</option>
                </select>
             </div>
             <button onClick={()=>setStep(2)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-4">
                {labels['english']['next']} / {labels[localLang]?.['next']}
             </button>
          </div>
        )}

        {/* --- STEP 2: LOCATION (The Magic Step) --- */}
        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-8">
             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-xs">
                ℹ️ Click 'Auto-Detect' to set your State & Form Language.
             </div>
             <button onClick={detectLocation} className="w-full bg-teal-50 text-teal-700 py-4 rounded-xl font-black flex justify-center gap-2 border border-teal-100">
                {locLoading ? "Detecting..." : <><Navigation size={18}/> Auto-Detect Location</>}
             </button>
             <div><Label field="area"/><input type="text" className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200" value={formData.working_area} onChange={e=>setFormData({...formData, working_area:e.target.value})} /></div>
             <div><Label field="address"/><textarea className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200 h-24" value={formData.address} readOnly></textarea></div>
             <button onClick={()=>setStep(3)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-4">Next Step</button>
          </div>
        )}

        {/* --- STEP 3: KYC & BANK (Financials) --- */}
        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right-8">
             <div className="grid grid-cols-2 gap-4">
                <div><Label field="aadhar"/><input type="number" className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200" value={formData.aadhar_no} onChange={e=>setFormData({...formData, aadhar_no:e.target.value})} /></div>
                <div><Label field="pan"/><input type="text" className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200" value={formData.pan_no} onChange={e=>setFormData({...formData, pan_no:e.target.value})} /></div>
             </div>
             <hr className="border-slate-100 my-2"/>
             <div><Label field="bank"/><input type="number" className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200" value={formData.bank_account} onChange={e=>setFormData({...formData, bank_account:e.target.value})} /></div>
             <div><Label field="ifsc"/><input type="text" className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200 uppercase" value={formData.ifsc_code} onChange={e=>setFormData({...formData, ifsc_code:e.target.value})} /></div>
             
             <button onClick={handleSubmit} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold mt-4 shadow-lg shadow-green-200">
                {loading ? "Processing..." : `${labels['english']['submit']} / ${labels[localLang]?.['submit']}`}
             </button>
          </div>
        )}

        {/* --- STEP 4: SUCCESS --- */}
        {step === 4 && (
          <div className="text-center py-8 animate-in zoom-in-95">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
               <CheckCircle size={40} strokeWidth={3}/>
             </div>
             <h2 className="text-2xl font-black text-slate-900">Welcome Partner!</h2>
             <p className="text-slate-500 text-sm mt-2">Your application is under review.</p>
             <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold mt-6">Back to Home</button>
          </div>
        )}

      </div>
    </div>
  );
}