import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { 
  UserCheck, UserX, Search, Phone, MapPin, Plus, Edit, Trash2, X,
  CreditCard, ShieldAlert, CheckCircle2, AlertTriangle, Star, Lock, Briefcase
} from 'lucide-react';

// ✅ Category List (Taaki spelling mismatch na ho)
const CATEGORIES = [
  "Electrician",
  "Plumber",
  "AC Repair",
  "Cleaning",
  "Carpenter",
  "Painter",
  "Pest Control"
];

export default function ExpertControl() {
  // --- STATE ---
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending'); // Tabs: pending, approved, rejected

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // ✅ Default State
  const [formData, setFormData] = useState({
      name: '', 
      phone: '', 
      service_category: 'Electrician', // Default
      city: 'Jabalpur', 
      password: ''
  });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    fetchExperts();
  }, [filterStatus]);

  const fetchExperts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('experts')
      .select('*')
      .eq('status', filterStatus)
      .order('created_at', { ascending: false });

    if (data) setExperts(data);
    setLoading(false);
  };

  // --- 2. ACTIONS (Approve/Block) ---
  const handleStatusUpdate = async (id, newStatus) => {
    if(!confirm(`Are you sure you want to ${newStatus} this expert?`)) return;

    const { error } = await supabase
      .from('experts')
      .update({ status: newStatus, is_verified: newStatus === 'approved' })
      .eq('id', id);

    if (!error) {
        fetchExperts(); 
    } else {
        alert("Error updating status");
    }
  };

  const deleteExpert = async (id) => {
      if(confirm("🛑 DANGER: Delete this expert permanently?")) {
          await supabase.from('experts').delete().eq('id', id);
          fetchExperts();
      }
  };

  // --- 3. MODAL ACTIONS (Open/Close) ---
  const openAddModal = () => {
      setEditingId(null);
      setFormData({ name: '', phone: '', service_category: 'Electrician', city: 'Jabalpur', password: '' });
      setIsModalOpen(true);
  };

  const openEditModal = (expert) => {
      setEditingId(expert.id);
      // ✅ Data Populate karte waqt dhyaan dein
      setFormData({ 
          name: expert.name || '', 
          phone: expert.phone || '', 
          service_category: expert.service_category || 'Electrician', // Fallback
          city: expert.city || '', 
          password: '' 
      });
      setIsModalOpen(true);
  };

  // --- 4. SAVE / UPDATE LOGIC (The Fix) ---
  const handleSave = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      // ✅ Payload ko clean banayein
      const payload = {
          name: formData.name,
          phone: formData.phone,
          service_category: formData.service_category, // 👈 Ye ab sahi value lega
          city: formData.city
      };

      // Password tabhi bheje jab bhara gaya ho
      if (formData.password && formData.password.trim() !== "") {
          payload.password = formData.password;
      }

      console.log("Saving Data:", payload); // Debugging ke liye check karein console me

      if (editingId) {
          // 👉 UPDATE EXISTING
          const { error } = await supabase
              .from('experts')
              .update(payload)
              .eq('id', editingId);
          
          if(error) alert("Error: " + error.message);
          else alert("✅ Profile Updated Successfully!");

      } else {
          // 👉 ADD NEW
          const { error } = await supabase
              .from('experts')
              .insert([{ 
                  ...payload, 
                  status: 'approved', 
                  is_verified: true,
                  rating: 5.0 
              }]);
          
          if(error) alert("Error: " + error.message);
          else alert("✅ New Expert Added!");
      }

      setLoading(false);
      setIsModalOpen(false);
      fetchExperts();
  };

  // --- 5. FILTER ---
  const filteredExperts = experts.filter(exp => 
    exp.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    exp.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <UserCheck className="text-teal-500" /> Expert Army
          </h2>
          <p className="text-slate-500 text-xs mt-1">Manage, Verify & Edit Profiles</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                {['pending', 'approved', 'rejected'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${filterStatus === s ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                        {s}
                    </button>
                ))}
            </div>
            <button onClick={openAddModal} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 border border-slate-700">
                <Plus size={16}/> <span className="hidden sm:inline">Add Manual</span>
            </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-500 transition-colors" size={18}/>
        <input 
          type="text" 
          placeholder="Search by name, phone..." 
          className="w-full bg-slate-900 border border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-teal-500 transition-all font-bold text-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* EXPERTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
            <div className="col-span-full py-20 text-center text-slate-500 font-bold animate-pulse">Loading Data...</div>
        ) : filteredExperts.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-slate-900 rounded-[2rem] border border-dashed border-slate-800 text-slate-500 italic">No experts found in '{filterStatus}' list.</div>
        ) : filteredExperts.map((exp) => (
          <div key={exp.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 hover:border-teal-500/50 transition-all group relative overflow-hidden">
            
            {/* Top Right Actions */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => openEditModal(exp)} className="p-2 bg-slate-800 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition"><Edit size={14}/></button>
                <button onClick={() => deleteExpert(exp.id)} className="p-2 bg-slate-800 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition"><Trash2 size={14}/></button>
            </div>

            <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl font-black text-teal-500 uppercase border border-slate-700">
                    {exp.name?.[0] || 'U'}
                </div>
                <div>
                    <h3 className="text-lg font-black text-white group-hover:text-teal-400 transition-colors">{exp.name}</h3>
                    <div className="flex items-center gap-2">
                        <p className="text-teal-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Briefcase size={10}/> {exp.service_category}</p>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                             <Star size={8} fill="currentColor"/> {exp.rating || 5.0}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                        <a href={`tel:${exp.phone}`} className="flex items-center gap-1 text-slate-400 hover:text-white text-xs font-bold bg-slate-950 px-2 py-1 rounded-md border border-slate-800"><Phone size={12}/> {exp.phone}</a>
                        <span className="flex items-center gap-1 text-slate-400 text-xs font-bold"><MapPin size={12}/> {exp.city}</span>
                    </div>
                </div>
            </div>

            <hr className="my-5 border-slate-800" />

            {/* KYC Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aadhaar</p>
                    <div className="flex items-center gap-2 text-slate-300 text-xs font-mono bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <ShieldAlert size={14} className="text-amber-500"/> {exp.aadhar_no || 'N/A'}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bank Acct</p>
                    <div className="flex items-center gap-2 text-slate-300 text-xs font-mono bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <CreditCard size={14} className="text-blue-500"/> {exp.account_no || 'N/A'}
                    </div>
                </div>
            </div>

            {/* Verify Buttons */}
            {filterStatus === 'pending' && (
                <div className="flex gap-3">
                    <button onClick={() => handleStatusUpdate(exp.id, 'approved')} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold text-xs flex justify-center items-center gap-2 shadow-lg shadow-green-900/20">
                        <CheckCircle2 size={16}/> Approve
                    </button>
                    <button onClick={() => handleStatusUpdate(exp.id, 'rejected')} className="px-4 bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 py-3 rounded-xl font-bold text-xs border border-slate-700">
                        <UserX size={16}/> Block
                    </button>
                </div>
            )}
            
            {/* Unblock Option */}
            {filterStatus === 'rejected' && (
                 <button onClick={() => handleStatusUpdate(exp.id, 'pending')} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-xs border border-slate-700">
                    Restore to Pending
                </button>
            )}

          </div>
        ))}
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
                  <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
                      <h3 className="font-bold text-white flex items-center gap-2">
                          {editingId ? <Edit size={18} className="text-blue-500"/> : <Plus size={18} className="text-teal-500"/>}
                          {editingId ? 'Edit Expert Profile' : 'Add Manual Expert'}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-4">
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Full Name</label>
                          <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
                              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Mobile</label>
                              <input type="number" required className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
                                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">City</label>
                              <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
                                  value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                          </div>
                      </div>
                      
                      {/* ✅ FIXED CATEGORY SELECTOR */}
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Service Category</label>
                          <select 
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
                              value={formData.service_category} 
                              onChange={e => setFormData({...formData, service_category: e.target.value})}
                          >
                              {CATEGORIES.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                              ))}
                          </select>
                      </div>

                      {/* Password Field */}
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1"><Lock size={10}/> Login Password</label>
                          <input type="text" placeholder={editingId ? "Leave blank to keep same" : "Set password"}
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
                              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                          />
                      </div>

                      <button disabled={loading} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg mt-4 transition-transform active:scale-95">
                          {loading ? 'Saving...' : (editingId ? 'Update Profile' : 'Create & Approve')}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}