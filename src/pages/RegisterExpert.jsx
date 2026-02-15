import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  User, Phone, MapPin, Briefcase, ChevronRight, 
  CheckCircle, ShieldCheck, Navigation, ArrowLeft, Building 
} from 'lucide-react';

export default function RegisterExpert() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    service_category: 'Electrician',
    city: 'Jabalpur',
    working_area: '', // Specific Area (e.g. Napier Town)
    address: '',      // Full Home Address via GPS
    is_verified: false
  });

  // --- 1. GPS LOGIC (Auto Address) ---
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
        
        const detectedCity = data.address.city || data.address.town || "Jabalpur";
        setFormData(prev => ({ 
          ...prev, 
          address: data.display_name, 
          city: detectedCity 
        }));
      } catch (err) { alert("Location fetch failed. Type manually."); }
      setLocLoading(false);
    }, () => { alert("Please enable GPS"); setLocLoading(false); });
  };

  // --- 2. SUBMIT FORM ---
  const handleSubmit = async () => {
    setLoading(true);
    
    // Check if user already exists
    const { data: existing } = await supabase.from('experts').select('mobile').eq('mobile', formData.mobile).single();
    if (existing) {
        alert("This mobile number is already registered!");
        setLoading(false);
        return;
    }

    const { error } = await supabase.from('experts').insert([{
        name: formData.name,
        mobile: formData.mobile,
        service_category: formData.service_category,
        city: formData.city,
        working_area: formData.working_area,
        address: formData.address,
        is_verified: false // Admin verification required
    }]);

    if (error) alert("Error: " + error.message);
    else setStep(3); // Success Screen
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      
      {/* Back Button */}
      {step === 1 && (
        <button onClick={() => navigate('/')} className="absolute top-6 left-6 p-3 bg-white rounded-full shadow-sm text-slate-500">
          <ArrowLeft size={20}/>
        </button>
      )}

      <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 relative overflow-hidden">
        
        {/* Step Indicator */}
        <div className="flex justify-between mb-8 px-4">
           {[1, 2, 3].map(s => (
             <div key={s} className={`h-1.5 flex-1 mx-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-teal-600' : 'bg-slate-200'}`}></div>
           ))}
        </div>

        {/* --- STEP 1: BASIC INFO --- */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Expert <span className="text-teal-600">Registration</span></h2>
              <p className="text-slate-500 text-sm mt-1">Join the Verified Expert Army.</p>
            </div>
            
            <div className="space-y-4">
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                  <User size={20} className="text-slate-400"/>
                  <input type="text" placeholder="Full Name" className="bg-transparent w-full font-bold outline-none text-slate-700"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                  <Phone size={20} className="text-slate-400"/>
                  <input type="number" placeholder="Mobile Number" className="bg-transparent w-full font-bold outline-none text-slate-700"
                    value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
               </div>
               <button disabled={!formData.name || !formData.mobile} onClick={() => setStep(2)} className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg hover:bg-teal-700 transition-all disabled:opacity-50">
                  Next Step <ChevronRight size={18}/>
               </button>
            </div>
          </div>
        )}

        {/* --- STEP 2: WORK DETAILS --- */}
        {step === 2 && (
          <div className="space-y-5 animate-in slide-in-from-right-8">
            <div>
              <h2 className="text-xl font-black text-slate-900">Work <span className="text-teal-600">Profile</span></h2>
              <p className="text-slate-500 text-xs">Where & What do you work?</p>
            </div>

            <div className="space-y-3">
               {/* Category */}
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                  <Briefcase size={20} className="text-slate-400"/>
                  <select className="bg-transparent w-full font-bold outline-none text-slate-700"
                    value={formData.service_category} onChange={e => setFormData({...formData, service_category: e.target.value})}>
                    <option>Electrician</option><option>Plumber</option><option>AC Repair</option>
                    <option>Cleaning</option><option>Carpenter</option><option>Painter</option>
                  </select>
               </div>

               {/* Working Area */}
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                  <Building size={20} className="text-slate-400"/>
                  <input type="text" placeholder="Work Area (e.g. Vijay Nagar)" className="bg-transparent w-full font-bold outline-none text-slate-700"
                    value={formData.working_area} onChange={e => setFormData({...formData, working_area: e.target.value})} />
               </div>

               {/* GPS Address */}
               <div className="pt-2">
                  <button type="button" onClick={detectLocation} className="w-full bg-teal-50 text-teal-700 py-3 rounded-xl text-xs font-black flex justify-center items-center gap-2 border border-teal-100 mb-2 hover:bg-teal-100 transition-colors">
                     {locLoading ? "Locating..." : <><Navigation size={14}/> Auto-Detect Home Address</>}
                  </button>
                  <textarea placeholder="Address will appear here..." readOnly className="w-full bg-slate-50 p-3 rounded-xl text-xs font-medium text-slate-600 h-20 resize-none outline-none border border-slate-100" value={formData.address}></textarea>
               </div>

               <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-bold text-sm">Back</button>
                  <button onClick={handleSubmit} disabled={loading} className="flex-[2] bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2">
                     {loading ? "Sending..." : "Submit"}
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: SUCCESS --- */}
        {step === 3 && (
          <div className="text-center py-8 animate-in zoom-in-95">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle size={40} strokeWidth={3}/>
             </div>
             <h2 className="text-2xl font-black text-slate-900">Request Sent!</h2>
             <p className="text-slate-500 text-sm mt-2 px-4">
                Thank you <b>{formData.name}</b>.<br/>
                We will verify your details and activate your account within 24 hours.
             </p>
             <div className="mt-6 bg-amber-50 p-4 rounded-xl border border-amber-100 text-left">
                <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Login Info</p>
                <p className="text-xs text-slate-700">
                   <b>Login ID:</b> {formData.mobile} <br/>
                   <b>Password:</b> Will be sent via SMS after verification.
                </p>
             </div>
             <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold mt-6">Back to Home</button>
          </div>
        )}

      </div>
    </div>
  );
}