import React, { useState, useEffect } from 'react';
import { X, Save, UploadCloud } from 'lucide-react';

export default function ExpertFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    city: 'Jabalpur',
    service_category: 'Electrician',
    experience_years: 0,
    profile_photo_url: ''
  });

  // Jab Edit ke liye open ho, purana data bhar do
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ // Reset for New Entry
        name: '', mobile: '', city: 'Jabalpur', 
        service_category: 'Electrician', experience_years: 0, profile_photo_url: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Edit Expert Profile' : 'Add New Expert'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-teal-500 uppercase">Full Name</label>
            <input 
              className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-white mt-1 focus:border-teal-500 outline-none font-bold"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-teal-500 uppercase">Mobile</label>
              <input 
                className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-white mt-1 focus:border-teal-500 outline-none"
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                placeholder="98........"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-teal-500 uppercase">City</label>
              <select 
                className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-white mt-1 focus:border-teal-500 outline-none"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              >
                <option>Jabalpur</option>
                <option>Sagar</option>
                <option>Bhopal</option>
                <option>Indore</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-teal-500 uppercase">Service Category</label>
              <select 
                className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-white mt-1 focus:border-teal-500 outline-none"
                value={formData.service_category}
                onChange={(e) => setFormData({...formData, service_category: e.target.value})}
              >
                <option>Electrician</option>
                <option>Plumber</option>
                <option>Carpenter</option>
                <option>AC Repair</option>
                <option>Cleaning</option>
              </select>
            </div>
            <div>
               <label className="text-xs font-bold text-teal-500 uppercase">Experience (Yrs)</label>
               <input 
                  type="number"
                  className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-white mt-1 focus:border-teal-500 outline-none"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                />
            </div>
          </div>
          
          {/* Image URL Input (Simulated Upload) */}
          <div>
            <label className="text-xs font-bold text-teal-500 uppercase">Profile Photo URL</label>
            <div className="flex gap-2">
                <input 
                  className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-slate-400 mt-1 text-xs font-mono"
                  value={formData.profile_photo_url}
                  onChange={(e) => setFormData({...formData, profile_photo_url: e.target.value})}
                  placeholder="Paste image link or use local asset path"
                />
                <button className="bg-slate-800 p-3 rounded-lg mt-1 text-slate-400 hover:text-white">
                    <UploadCloud size={20}/>
                </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition">Cancel</button>
          <button 
            onClick={() => onSubmit(formData)}
            className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-900/50 flex items-center justify-center gap-2"
          >
            <Save size={18} /> {initialData ? 'Update Expert' : 'Add Expert'}
          </button>
        </div>

      </div>
    </div>
  );
}