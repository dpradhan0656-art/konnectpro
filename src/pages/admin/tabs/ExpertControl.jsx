import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Check, X, Search, Shield, MapPin, Phone, Trash2, Edit, Plus, FileText, Filter } from 'lucide-react';
import ExpertFormModal from '../components/ExpertFormModal'; // ✅ Importing the component we just made

export default function ExpertControl() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState(null);

  // --- 1. FETCH EXPERTS ---
  const fetchExperts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('experts')
      .select('*')
      .order('created_at', { ascending: false }); // Newest first
    
    if (error) console.error('Error fetching experts:', error);
    else setExperts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchExperts(); }, []);

  // --- 2. ADD / UPDATE EXPERT ---
  const handleSaveExpert = async (formData) => {
    let error;
    
    if (editingExpert) {
        // UPDATE Existing
        const { error: updateError } = await supabase
            .from('experts')
            .update(formData)
            .eq('id', editingExpert.id);
        error = updateError;
    } else {
        // INSERT New
        const { error: insertError } = await supabase
            .from('experts')
            .insert([{ ...formData, is_verified: false }]); // New experts are unverified by default
        error = insertError;
    }

    if (error) {
        alert("Error: " + error.message);
    } else {
        setIsModalOpen(false);
        setEditingExpert(null);
        fetchExperts(); // Refresh List
    }
  };

  // --- 3. DELETE EXPERT ---
  const handleDelete = async (id) => {
    if (window.confirm("⚠️ ARE YOU SURE? This will permanently remove the expert.")) {
        const { error } = await supabase.from('experts').delete().eq('id', id);
        if (!error) fetchExperts();
    }
  };

  // --- 4. VERIFY TOGGLE ---
  const handleStatusUpdate = async (id, status) => {
    // Optimistic Update
    setExperts(experts.map(e => e.id === id ? { ...e, is_verified: status } : e));
    await supabase.from('experts').update({ is_verified: status }).eq('id', id);
  };

  // --- 5. FILTER LOGIC ---
  const filteredExperts = experts.filter(e => 
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- TOP BAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
        <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Shield className="text-teal-500" /> Expert Army Control
            </h2>
            <p className="text-slate-400 text-xs mt-1">Total {experts.length} Experts Registered</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search Name, City..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-teal-500 outline-none transition-all"
                />
            </div>
            <button 
                onClick={() => { setEditingExpert(null); setIsModalOpen(true); }}
                className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-teal-900/50 transition-all active:scale-95"
            >
                <Plus size={18} /> <span className="hidden sm:inline">Add New</span>
            </button>
        </div>
      </div>

      {/* --- EXPERT LIST GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredExperts.map((expert) => (
            <div key={expert.id} className={`group relative p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${expert.is_verified ? 'bg-slate-900/50 border-teal-500/30 shadow-teal-900/10' : 'bg-slate-900 border-slate-700'}`}>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    {expert.is_verified ? (
                        <span className="bg-teal-950 text-teal-400 text-[10px] px-2 py-1 rounded-full border border-teal-500/30 font-black uppercase flex items-center gap-1">
                            <Check size={10} strokeWidth={4} /> Verified
                        </span>
                    ) : (
                        <span className="bg-amber-950 text-amber-500 text-[10px] px-2 py-1 rounded-full border border-amber-500/30 font-black uppercase flex items-center gap-1 animate-pulse">
                            ⏳ Pending
                        </span>
                    )}
                </div>

                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                        <img 
                            src={expert.profile_photo_url || `https://ui-avatars.com/api/?name=${expert.name}&background=0f172a&color=fff`} 
                            alt={expert.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg leading-tight">{expert.name}</h3>
                        <p className="text-xs text-teal-500 font-bold uppercase tracking-wider mt-0.5">{expert.service_category}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 bg-black/20 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin size={12} className="text-teal-600"/> {expert.city}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Phone size={12} className="text-teal-600"/> {expert.mobile}
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-xs text-slate-400 border-t border-slate-800 pt-2 mt-1">
                        <FileText size={12} className="text-slate-500"/> Docs: {expert.id_proof_url ? <span className="text-green-400">Uploaded</span> : <span className="text-red-400">Missing</span>}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {/* Approve/Revoke Button */}
                    <button 
                        onClick={() => handleStatusUpdate(expert.id, !expert.is_verified)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            expert.is_verified 
                            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white' 
                            : 'bg-teal-600 text-white hover:bg-teal-500 shadow-lg shadow-teal-900/50'
                        }`}
                    >
                        {expert.is_verified ? <><X size={14}/> Revoke</> : <><Check size={14}/> Verify</>}
                    </button>

                    {/* Edit Button */}
                    <button 
                        onClick={() => { setEditingExpert(expert); setIsModalOpen(true); }}
                        className="p-2.5 bg-slate-800 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-colors"
                        title="Edit Profile"
                    >
                        <Edit size={16} />
                    </button>

                    {/* Delete Button */}
                    <button 
                        onClick={() => handleDelete(expert.id)}
                        className="p-2.5 bg-slate-800 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                        title="Delete Expert"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        ))}
      </div>
      
      {/* Empty State */}
      {filteredExperts.length === 0 && !loading && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
              <Shield size={48} className="mx-auto text-slate-700 mb-4" />
              <p className="text-slate-500 font-bold">No experts found matching your search.</p>
              <button onClick={() => { setEditingExpert(null); setIsModalOpen(true); }} className="text-teal-500 text-sm font-bold mt-2 hover:underline">Add New Expert manually</button>
          </div>
      )}

      {/* --- MODAL (Imported Component) --- */}
      <ExpertFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSaveExpert}
        initialData={editingExpert}
      />

    </div>
  );
}