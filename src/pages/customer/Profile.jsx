import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { User, LogOut, Camera, Edit2, ShieldCheck, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    full_name: 'Deepak Pradhan',
    phone: '+91 98765 43210',
    city: 'Jabalpur, MP',
    avatar_url: 'https://i.pravatar.cc/150?img=12' // Default Photo
  });
  const [isEditing, setIsEditing] = useState(false);

  // Logout Function
  const handleLogout = async () => {
    if(confirm("Are you sure you want to logout?")) {
      navigate('/login');
    }
  };

  // Save Function (Sirf local state update karega abhi)
  const handleSave = () => {
    setIsEditing(false);
    alert("Profile Updated Successfully! ✅");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      
      {/* 🟢 HEADER BACKGROUND */}
      <div className="h-48 bg-gradient-to-r from-primary to-blue-600 rounded-b-[40px] relative shadow-lg">
        <div className="absolute top-6 right-6">
          <button onClick={handleLogout} className="bg-white/20 p-2 rounded-full text-white hover:bg-white/30 backdrop-blur-sm transition">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* 👤 PROFILE CARD */}
      <div className="px-6 -mt-16">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col items-center relative">
          
          {/* Avatar (Photo) */}
          <div className="relative -mt-20 mb-4">
            <img 
              src={profile.avatar_url} 
              alt="Profile" 
              className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
            />
            <button className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition">
              <Camera size={16} />
            </button>
          </div>

          {/* Name & Role */}
          {isEditing ? (
            <input 
              type="text" 
              value={profile.full_name} 
              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              className="text-xl font-bold text-center border-b-2 border-primary outline-none mb-2"
            />
          ) : (
            <h2 className="text-2xl font-bold text-gray-800">{profile.full_name}</h2>
          )}
          
          <div className="flex items-center gap-1 text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full mt-2">
            <ShieldCheck size={14} className="text-green-600" /> Verified Customer
          </div>

          {/* Edit Button */}
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="absolute top-6 right-6 text-gray-400 hover:text-primary transition">
              <Edit2 size={20} />
            </button>
          )}
        </div>

        {/* 📋 DETAILS SECTION */}
        <div className="mt-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4">Personal Information</h3>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Phone size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium">Phone Number</p>
              {isEditing ? (
                <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="font-bold text-gray-800 w-full outline-none border-b border-gray-200" />
              ) : (
                <p className="font-bold text-gray-800">{profile.phone}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <MapPin size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium">City</p>
              {isEditing ? (
                <input type="text" value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} className="font-bold text-gray-800 w-full outline-none border-b border-gray-200" />
              ) : (
                <p className="font-bold text-gray-800">{profile.city}</p>
              )}
            </div>
          </div>
        </div>

        {/* Save Button (Only in Edit Mode) */}
        {isEditing && (
          <button onClick={handleSave} className="w-full mt-6 bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition">
            Save Changes
          </button>
        )}

        {/* Support Link */}
        <div className="mt-8 text-center">
          <button className="text-sm font-bold text-gray-400 hover:text-primary transition">Need Help?</button>
          <p className="text-[10px] text-gray-300 mt-2">App Version 1.0.0</p>
        </div>

      </div>
    </div>
  );
}
