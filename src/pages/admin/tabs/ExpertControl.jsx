import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { 
    Users, Star, Shield, Trash2, Phone, AlertTriangle, 
    Plus, Search, Edit, X, MapPin, CheckCircle, Lock 
} from 'lucide-react';

export default function ExpertControl() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null means adding new
  const [formData, setFormData] = useState({
      name: '', phone: '', service_category: 'Plumber', city: 'Jabalpur', password: ''
  });

  // --- 1. FETCH DATA ---
  const fetchExperts = async () => {
    setLoading(true);
    const { data } = await supabase.from('experts').select('*').order('id', { ascending: false });
    if(data) setExperts(data);
    setLoading(false);
  };

  useEffect(() => { fetchExperts(); }, []);

  // --- 2. HANDLE FORM SUBMIT (Add or Edit) ---
  const handleSave = async (e) => {
      e.preventDefault();
      if(!formData.name || !formData.phone) return alert("Name & Phone required!");

      setLoading(true);
      
      if (editingId) {
          // 👉 UPDATE EXISTING
          const { error } = await supabase
            .from('experts')
            .update(formData)
            .eq('id', editingId);
          
          if(!error) alert("✅ Expert Updated!");
          else alert("Error: " + error.message);

      } else {
          // 👉 ADD NEW
          const { error } = await supabase
            .from('experts')
            .insert([{ ...formData, rating: 5.0, is_verified: true, is_online: false }]); // Default values

          if(!error) alert("✅ New Expert Added!");
          else alert("Error: " + error.message);
      }

      setLoading(false);
      setIsModalOpen(false);
      fetchExperts();
  };

  // --- 3. ACTIONS ---
  const openAddModal = () => {
      setEditingId(null);
      setFormData({ name: '', phone: '', service_category: 'Plumber', city: 'Jabalpur', password: '' });
      setIsModalOpen(true);
  };

  const openEditModal = (expert) => {
      setEditingId(expert.id);
      setFormData({ 
          name: expert.name, 
          phone: expert.phone, 
          service_category: expert.service_category, 
          city: expert.city || '', 
          password: expert.password || '' 
      });
      setIsModalOpen(true);
  };

  const deleteExpert = async (id) => {
      if(confirm("🛑 DANGER: Delete this expert permanently?")) {
          await supabase.from('experts').delete().eq('id', id);
          fetchExperts();
      }
  };

  const toggleVerify = async (id, currentStatus) => {
      await supabase.from('experts').update({ is_verified: !currentStatus }).eq('id', id);
      fetchExperts();
  };

  // --- 4. FILTER ---
  const filteredExperts = experts.filter(e => 
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone?.includes(searchTerm) ||
      e.service_category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
        <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Shield className="text-teal-500" /> Command Center
            </h2>
            <p className="text-slate-400 text-xs mt-1">Manage Team, Verification & Quality</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                <input 
                    type="text" placeholder="Search Expert..." 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-teal-500 outline-none"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={openAddModal} className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95">
                <Plus size={18}/> <span className="hidden sm:inline">Add New</span>
            </button>
        </div>
      </div>

      {/* EXPERT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExperts.map(exp => (
              <div key={exp.id} className={`relative p-5 rounded-2xl border transition-all hover:shadow-2xl ${exp.rating < 3.0 ? 'bg-red-900/10 border-red-500/50' : 'bg-slate-900 border-slate-800'}`}>
                  
                  {/* Quality Badge */}
                  {exp.rating < 3.0 && (
                      <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                          <AlertTriangle size={12}/> LOW RATING
                      </div>
                  )}

                  {/* Header: Image & Name */}
                  <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center">
                          {/* Fallback to UI Avatar if no image */}
                          <img 
                            src={exp.profile_url || `https://ui-avatars.com/api/?name=${exp.name}&background=0d9488&color=fff`} 
                            alt={exp.name} className="w-full h-full object-cover" 
                          />
                      </div>
                      <div>
                          <h3 className="font-bold text-lg text-white leading-tight">{exp.name}</h3>
                          <p className="text-teal-500 text-xs font-bold uppercase">{exp.service_category}</p>
                      </div>
                  </div>

                  {/* Status Pills */}
                  <div className="flex gap-2 mb-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${exp.is_online ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                          {exp.is_online ? '● Online' : '○ Offline'}
                      </span>
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                          <Star size={10} fill="currentColor"/> {exp.rating || 5.0}
                      </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm text-slate-400 bg-black/20 p-3 rounded-xl border border-slate-800/50 mb-4">
                      <div className="flex items-center gap-2"><Phone size={14} className="text-slate-500"/> {exp.phone}</div>
                      <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-500"/> {exp.city || 'No City'}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-slate-800 pt-3">
                      <button 
                        onClick={() => toggleVerify(exp.id, exp.is_verified)}
                        className={`flex-1 py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1 ${exp.is_verified ? 'bg-slate-800 text-green-400' : 'bg-green-600 text-white'}`}
                      >
                          {exp.is_verified ? <><CheckCircle size={14}/> Verified</> : 'Approve'}
                      </button>
                      
                      <button onClick={() => openEditModal(exp)} className="p-2 bg-slate-800 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition">
                          <Edit size={16}/>
                      </button>
                      
                      <button onClick={() => deleteExpert(exp.id)} className="p-2 bg-slate-800 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition">
                          <Trash2 size={16}/>
                      </button>
                  </div>
              </div>
          ))}
      </div>

      {/* --- POPUP MODAL (Add / Edit) --- */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
                  
                  {/* Modal Header */}
                  <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
                      <h3 className="font-bold text-white flex items-center gap-2">
                          {editingId ? <Edit size={18} className="text-blue-500"/> : <Plus size={18} className="text-teal-500"/>}
                          {editingId ? 'Edit Expert Profile' : 'Add New Expert'}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                  </div>

                  {/* Modal Form */}
                  <form onSubmit={handleSave} className="p-6 space-y-4">
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Full Name</label>
                          <input type="text" placeholder="e.g. Rahul Sharma" required
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
                              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Mobile Number</label>
                              <input type="number" placeholder="9876543210" required
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
                                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">City</label>
                              <input type="text" placeholder="Jabalpur" 
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
                                  value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                              />
                          </div>
                      </div>

                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Service Category</label>
                          <select 
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
                              value={formData.service_category} onChange={e => setFormData({...formData, service_category: e.target.value})}
                          >
                              <option>AC Repair</option>
                              <option>Cleaning</option>
                              <option>Electrician</option>
                              <option>Plumber</option>
                              <option>Carpenter</option>
                          </select>
                      </div>

                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1"><Lock size={10}/> Login Password</label>
                          <input type="text" placeholder="Set a password for expert" 
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
                              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                          />
                      </div>

                      <button disabled={loading} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg mt-4 transition-transform active:scale-95">
                          {loading ? 'Saving...' : (editingId ? 'Update Profile' : 'Create Account')}
                      </button>
                  </form>

              </div>
          </div>
      )}

    </div>
  );
}