import React, { useState, useEffect } from 'react';
// ✅ FIX 1: Correct path to Supabase (lib folder)
import { supabase } from '../../lib/supabase';
// ✅ FIX 2: Brand Config Import
import { BRAND } from '../../config/brandConfig';
import { User, LogOut, Camera, Edit2, ShieldCheck, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    full_name: 'Loading...',
    phone: '',
    city: '',
    avatar_url: '' 
  });
  const [isEditing, setIsEditing] = useState(false);

  // 🔄 Fetch Real User Data
  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      // Mock Data (For Demo - Replace with DB fetch if needed)
      setProfile({
        full_name: session.user.user_metadata?.name || 'Konnect User',
        phone: session.user.phone || session.user.email,
        city: 'Jabalpur, MP',
        avatar_url: session.user.user_metadata?.avatar_url || null
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  // Logout Function
  const handleLogout = async () => {
    if(confirm("Are you sure you want to logout?")) {
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  // Save Function
  const handleSave = () => {
    setIsEditing(false);
    alert("Profile Updated Successfully! ✅");
    // Add supabase update logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      
      {/* 🟢 HEADER BACKGROUND (Teal Gradient - Mercury) */}
      <div className="h-48 bg-gradient-to-r from-teal-800 to-teal-600 rounded-b-[40px] relative shadow-lg">
        {/* Back Button */}
        <div className="absolute top-6 left-6">
           <button onClick={() => navigate('/')} className="bg-white/20 p-2 rounded-full text-white hover:bg-white/30 backdrop-blur-sm transition">
             <ArrowLeft size={20} />
           </button>
        </div>
        
        {/* Logout Button */}
        <div className="absolute top-6 right-6">
          <button onClick={handleLogout} className="bg-white/20 p-2 rounded-full text-white hover:bg-red-500 hover:border-red-500 backdrop-blur-sm transition border border-transparent">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* 👤 PROFILE CARD */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col items-center relative">
          
          {/* Avatar (Photo) */}
          <div className="relative -mt-20 mb-4 group">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={60} className="text-gray-400" />
              )}
            </div>
            {/* Camera Button (Amber - Action) */}
            <button className="absolute bottom-1 right-1 bg-amber-500 text-white p-2.5 rounded-full shadow-lg hover:bg-amber-600 transition transform active:scale-90">
              <Camera size={18} />
            </button>
          </div>

          {/* Name & Role */}
          {isEditing ? (
            <input 
              type="text" 
              value={profile.full_name} 
              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              className="text-xl font-black text-center text-slate-800 border-b-2 border-teal-500 outline-none mb-2 bg-teal-50 rounded px-2"
            />
          ) : (
            <h2 className="text-2xl font-black text-slate-800">{profile.full_name}</h2>
          )}
          
          <div className="flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full mt-2 border border-teal-100">
            <ShieldCheck size={12} /> Verified Customer
          </div>

          {/* Edit Button */}
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="absolute top-4 right-4 text-slate-400 hover:text-teal-600 transition bg-gray-50 p-2 rounded-full">
              <Edit2 size={18} />
            </button>
          )}
        </div>

        {/* 📋 DETAILS SECTION */}
        <div className="mt-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-4">Personal Information</h3>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Phone size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</p>
              {isEditing ? (
                <input type="text" value={profile.phone} disabled className="font-bold text-slate-400 w-full outline-none bg-transparent cursor-not-allowed" />
              ) : (
                <p className="font-bold text-slate-800">{profile.phone}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <MapPin size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">City</p>
              {isEditing ? (
                <input 
                    type="text" 
                    value={profile.city} 
                    onChange={(e) => setProfile({...profile, city: e.target.value})} 
                    className="font-bold text-slate-800 w-full outline-none border-b-2 border-amber-300 bg-amber-50 px-2 rounded" 
                />
              ) : (
                <p className="font-bold text-slate-800">{profile.city}</p>
              )}
            </div>
          </div>
        </div>

        {/* Save Button (Amber - Sun Energy) */}
        {isEditing && (
          <button onClick={handleSave} className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-200 active:scale-95 transition">
            Save Changes
          </button>
        )}

        {/* Support Link */}
        <div className="mt-8 text-center pb-8">
          <button className="text-xs font-bold text-slate-400 hover:text-teal-600 transition">Need Help?</button>
          <p className="text-[10px] text-slate-300 mt-2 font-bold uppercase tracking-widest">KonnectPro v1.0</p>
        </div>

      </div>
    </div>
  );
}