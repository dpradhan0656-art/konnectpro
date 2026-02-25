import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BRAND } from '../../config/brandConfig';
import { User, LogOut, Camera, Edit2, ShieldCheck, Phone, MapPin, ArrowLeft, Loader2, Save, Package, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); 
  
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    city: '',
    email: '',
    avatar_url: '' 
  });
  
  const [isEditing, setIsEditing] = useState(false);

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

      const user = session.user;
      
      setProfile({
        full_name: user.user_metadata?.full_name || 'Konnect User',
        phone: user.user_metadata?.phone || user.email, 
        city: user.user_metadata?.city || 'Jabalpur, MP', 
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url || ''
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!profile.full_name.trim()) return alert("Name cannot be empty!");
    
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
            full_name: profile.full_name,
            city: profile.city 
        }
      });

      if (error) throw error;

      setIsEditing(false);
      alert("Profile Updated Successfully! ✅");
    } catch (error) {
      alert("Error updating profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if(window.confirm("Are you sure you want to logout?")) {
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-teal-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      
      {/* 🟢 HEADER BACKGROUND */}
      <div className="h-48 bg-gradient-to-br from-teal-900 via-teal-700 to-teal-600 rounded-b-[3rem] relative shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="absolute top-6 left-6 z-10">
           <button onClick={() => navigate('/')} className="bg-black/20 p-2.5 rounded-full text-white hover:bg-black/30 backdrop-blur-md transition active:scale-90">
             <ArrowLeft size={20} />
           </button>
        </div>
        
        <div className="absolute top-6 right-6 z-10">
          <button onClick={handleLogout} className="bg-black/20 p-2.5 rounded-full text-white hover:bg-red-500/80 hover:text-white backdrop-blur-md transition active:scale-90">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* 👤 PROFILE CARD */}
      <div className="px-6 -mt-20 relative z-10 max-w-md mx-auto">
        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 flex flex-col items-center relative">
          
          <div className="relative -mt-20 mb-4 group">
            <div className="w-32 h-32 rounded-full border-[6px] border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={50} className="text-slate-300" />
              )}
            </div>
            <button className="absolute bottom-1 right-1 bg-amber-500 text-white p-2.5 rounded-full shadow-lg hover:bg-amber-600 transition transform active:scale-90 border-2 border-white">
              <Camera size={16} />
            </button>
          </div>

          <div className="w-full text-center">
            {isEditing ? (
                <div className="mb-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Full Name</label>
                    <input 
                        type="text" 
                        value={profile.full_name} 
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                        className="text-xl font-black text-center text-slate-800 border-b-2 border-teal-500 outline-none bg-teal-50/50 rounded px-4 py-1 w-full"
                        autoFocus
                    />
                </div>
            ) : (
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{profile.full_name}</h2>
            )}
            
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full mt-1 border border-teal-100">
                <ShieldCheck size={12} /> Verified Customer
            </div>
          </div>

          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="absolute top-6 right-6 text-slate-400 hover:text-teal-600 transition bg-slate-50 p-2.5 rounded-xl hover:bg-teal-50">
              <Edit2 size={18} />
            </button>
          )}
        </div>

        {/* 📦 NEW: MY BOOKINGS & TRACKING BUTTON */}
        {!isEditing && (
            <button 
                onClick={() => navigate('/bookings')}
                className="mt-6 w-full bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md hover:border-teal-200 transition-all active:scale-95 group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300 shadow-inner">
                        <Package size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-base font-black text-slate-900">My Bookings</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Live Tracking & History</p>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                    <ChevronRight size={18} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                </div>
            </button>
        )}

        {/* 📋 DETAILS SECTION */}
        <div className="mt-4 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-2 ml-1">Contact Information</h3>
          
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-teal-600 shadow-sm">
              <Phone size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Registered Mobile</p>
              <p className="font-bold text-slate-800 text-sm">{profile.phone || "Not Provided"}</p>
            </div>
            {isEditing && <span className="text-[10px] text-slate-400 font-bold bg-white px-2 py-1 rounded">Locked</span>}
          </div>

          <div className={`flex items-center gap-4 p-3 rounded-2xl border ${isEditing ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
            <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${isEditing ? 'text-amber-600' : 'text-amber-500'}`}>
              <MapPin size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Current City</p>
              {isEditing ? (
                <input 
                    type="text" 
                    value={profile.city} 
                    onChange={(e) => setProfile({...profile, city: e.target.value})} 
                    className="font-bold text-slate-800 w-full outline-none bg-transparent border-b border-amber-300 placeholder-amber-700/50" 
                    placeholder="Enter City"
                />
              ) : (
                <p className="font-bold text-slate-800 text-sm">{profile.city}</p>
              )}
            </div>
            {isEditing && <Edit2 size={14} className="text-amber-400" />}
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-6 animate-in slide-in-from-bottom-4 fade-in">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition flex justify-center items-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20}/> SAVE CHANGES</>}
              </button>
              <button 
                onClick={() => setIsEditing(false)} 
                disabled={saving}
                className="w-full mt-3 text-slate-400 font-bold text-xs py-2 hover:text-red-500 transition"
              >
                Cancel
              </button>
          </div>
        )}

        {/* Footer Info */}
        {!isEditing && (
            <div className="mt-8 text-center pb-8 opacity-60">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {BRAND.name} App v1.2
                </p>
            </div>
        )}

      </div>
    </div>
  );
}