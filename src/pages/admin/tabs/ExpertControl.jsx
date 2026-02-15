import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { 
  UserCheck, UserX, Search, Phone, MapPin, Plus, Edit, Trash2, X,
  CreditCard, ShieldAlert, CheckCircle2, AlertTriangle, Star, Lock
} from 'lucide-react';

export default function ExpertControl() {
  // --- STATE ---
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending'); // Tabs: pending, approved, rejected

  // --- MODAL STATE (From Old Code) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
      name: '', phone: '', service_category: 'Plumber', city: 'Jabalpur', password: ''
  });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    fetchExperts();
  }, [filterStatus]);

  const fetchExperts = async () => {
    setLoading(true);
    // Hum wahi experts layenge jo selected tab (status) ke hain
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
        fetchExperts(); // Refresh list
    } else {
        alert("Error updating status");
    }
  };

  // --- 3. CRUD ACTIONS (Add/Edit/Delete from Old Code) ---
  const deleteExpert = async (id) => {
      if(confirm("🛑 DANGER: Delete this expert permanently?")) {
          await supabase.from('experts').delete().eq('id', id);
          fetchExperts();
      }
  };

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
          password: '' // Security: Password field blank rakhenge
      });
      setIsModalOpen(true);
  };

  const handleSave = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // Empty password mat bhejo

      if (editingId) {
          // UPDATE
          const { error } = await supabase.from('experts').update(payload).eq('id', editingId);
          if(error) alert("Error: " + error.message);
      } else {
          // INSERT NEW
          const { error } = await supabase.from('experts').insert([{ 
              ...payload, 
              status: 'approved', // Admin add kar raha hai to direct approve
              is_verified: true,
              rating: 5.0 
          }]);
          if(error) alert("Error: " + error.message);
      }

      setLoading(false);
      setIsModalOpen(false);
      fetchExperts();
  };

  // --- 4. FILTER ---
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
            {/* Tabs */}
            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                {['pending', 'approved', 'rejected'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${filterStatus === s ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                        {s}
                    </button>
                ))}
            </div>
            {/* Add Button */}
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
          placeholder="Search by name or phone..." 
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
            
            {/* Top Right Actions (Edit/Delete) - FROM OLD CODE */}
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
                        <p className="text-teal-600 text-xs font-bold uppercase tracking-wider">{exp.service_category}</p>
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

            {/* KYC & BANKING (Important for Verification) - FROM NEW CODE */}
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

            {/* APPROVE / REJECT BUTTONS (Only for Pending) */}
            {filterStatus === 'pending' && (
                <div className="flex gap-3">
                    <button onClick={() => handleStatusUpdate(exp.id, 'approved')} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold text-xs flex justify-center items-center gap-2 shadow-lg shadow-green-900/20">
                        <CheckCircle2 size={16}/> Approve Expert
                    </button>
                    <button onClick={() => handleStatusUpdate(exp.id, 'rejected')} className="px-4 bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 py-3 rounded-xl font-bold text-xs border border-slate-700">
                        <UserX size={16}/> Block
                    </button>
                </div>
            )}
            
            {/* IF BLOCKED - Show Unblock Option */}
            {filterStatus === 'rejected' && (
                 <button onClick={() => handleStatusUpdate(exp.id, 'pending')} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-xs border border-slate-700">
                    Restore to Pending
                </button>
            )}

          </div>
        ))}
      </div>

      {/* --- ADD / EDIT MODAL (From Old Code) --- */}
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
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Category</label>
                          <select className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
                              value={formData.service_category} onChange={e => setFormData({...formData, service_category: e.target.value})}>
                              <option>Electrician</option><option>Plumber</option><option>AC Repair</option><option>Cleaning</option><option>Carpenter</option>
                          </select>
                      </div>
                      <button disabled={loading} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg mt-4">
                          {loading ? 'Saving...' : (editingId ? 'Update Profile' : 'Create & Approve')}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}