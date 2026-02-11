import React, { useState } from 'react';
// ✅ पुराने "../../supabase" को बदलकर नया रास्ता दें
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Lock, CreditCard, ShieldCheck, Loader } from 'lucide-react';

export default function RegisterExpert() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    address: '',
    aadhar: '',
    service_type: 'Electrician' // Default
  });

  const services = ["Electrician", "Plumber", "Carpenter", "Cleaning", "Painter", "AC Service"];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Auth User (Trick: Mobile ko email format me bhejo)
      // Example: 9876543210 -> 9876543210@apnahunar.com
      const emailLogin = `${formData.mobile}@apnahunar.com`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailLogin,
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. Create Expert Profile in Database
      const { error: dbError } = await supabase
        .from('experts')
        .insert([
          {
            id: authData.user.id, // Auth ID aur Table ID same rahenge
            name: formData.name,
            phone: formData.mobile,
            service_type: formData.service_type,
            wallet_balance: 0,
            is_online: true,
            rating: 5.0,
            kyc_status: 'Pending' // Aadhar verify hone tak pending
          }
        ]);

      if (dbError) throw dbError;

      alert("Registration Successful! Welcome to Apna Hunar.");
      navigate('/expert'); // Seedha Dashboard par bhejo

    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Join as Expert</h1>
      
      <form onSubmit={handleRegister} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        
        {/* Name */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
          <div className="flex items-center bg-gray-50 rounded-xl mt-1 p-3 border border-gray-200">
            <User size={18} className="text-gray-400 mr-2"/>
            <input type="text" placeholder="Ramesh Kumar" className="bg-transparent w-full outline-none text-gray-700 font-bold"
              onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>
        </div>

        {/* Mobile (Login ID) */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Mobile Number (Login ID)</label>
          <div className="flex items-center bg-gray-50 rounded-xl mt-1 p-3 border border-gray-200">
            <Phone size={18} className="text-gray-400 mr-2"/>
            <input type="tel" placeholder="9876543210" maxLength={10} className="bg-transparent w-full outline-none text-gray-700 font-bold"
              onChange={(e) => setFormData({...formData, mobile: e.target.value})} required />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Create Password</label>
          <div className="flex items-center bg-gray-50 rounded-xl mt-1 p-3 border border-gray-200">
            <Lock size={18} className="text-gray-400 mr-2"/>
            <input type="password" placeholder="••••••" className="bg-transparent w-full outline-none text-gray-700 font-bold"
              onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
        </div>

        {/* Service Type */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Service Type</label>
          <select 
            className="w-full bg-gray-50 p-3 rounded-xl mt-1 outline-none border border-gray-200 font-bold text-gray-700"
            onChange={(e) => setFormData({...formData, service_type: e.target.value})}
          >
            {services.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Aadhar */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Aadhar Number</label>
          <div className="flex items-center bg-gray-50 rounded-xl mt-1 p-3 border border-gray-200">
            <CreditCard size={18} className="text-gray-400 mr-2"/>
            <input type="text" placeholder="1234 5678 9012" maxLength={12} className="bg-transparent w-full outline-none text-gray-700 font-bold"
              onChange={(e) => setFormData({...formData, aadhar: e.target.value})} required />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Work Location / Address</label>
          <div className="flex items-center bg-gray-50 rounded-xl mt-1 p-3 border border-gray-200">
            <MapPin size={18} className="text-gray-400 mr-2"/>
            <input type="text" placeholder="Ranjhi, Jabalpur" className="bg-transparent w-full outline-none text-gray-700 font-bold"
              onChange={(e) => setFormData({...formData, address: e.target.value})} required />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg mt-4 flex justify-center items-center gap-2">
           {loading ? <Loader className="animate-spin"/> : "Register & Login"}
        </button>

      </form>
    </div>
  );
}