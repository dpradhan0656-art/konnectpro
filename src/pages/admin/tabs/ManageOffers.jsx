import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
// ✅ Import 'Edit' and 'XCircle' icon
import { Megaphone, Trash2, Plus, Save, Eye, Sparkles, Image as ImageIcon, Edit, XCircle } from 'lucide-react';

export default function ManageOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  // ✅ New State to track which offer is being edited (null means creating new)
  const [editingId, setEditingId] = useState(null);
  
  const initialFormState = {
    title: '',
    discount_text: '',
    image_url: '/assets/banners/ac-service.jpg', // Default example path (corrected 'banners')
    gradient_color: 'from-blue-600 to-blue-800',
    is_active: true
  };

  const [form, setForm] = useState(initialFormState);

  // --- 1. Fetch Live Offers ---
  const fetchOffers = async () => {
    const { data } = await supabase
      .from('spotlight_offers')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOffers(data);
  };

  useEffect(() => { fetchOffers(); }, []);

  // --- ✅ HELPER: Reset Form ---
  const resetForm = () => {
      setForm(initialFormState);
      setEditingId(null); // Exit edit mode
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
  };

  // --- ✅ HELPER: Start Editing ---
  const startEditing = (offer) => {
      setEditingId(offer.id);
      // Populate form with existing offer data
      setForm({
          title: offer.title,
          discount_text: offer.discount_text,
          image_url: offer.image_url,
          gradient_color: offer.gradient_color,
          is_active: offer.is_active !== undefined ? offer.is_active : true
      });
       window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  // --- 2. Publish/Update Logic (SMART SAVE) ---
  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);

    let error;

    if (editingId) {
        // 👉 UPDATE MODE: Agar editingId hai, to purana update karo
        console.log("Updating offer:", editingId);
        const { error: updateError } = await supabase
            .from('spotlight_offers')
            .update(form) // Update with current form data
            .eq('id', editingId);
        error = updateError;
    } else {
        // 👉 CREATE MODE: Agar nahi hai, to naya banao
        console.log("Creating new offer");
        const { error: insertError } = await supabase
            .from('spotlight_offers')
            .insert([form]);
        error = insertError;
    }

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert(editingId ? "Offer Updated Successfully! ♻️" : "Offer Published Successfully! 🚀");
      resetForm(); // Clear form and exit edit mode
      fetchOffers(); // Refresh List
    }
    setLoading(false);
  };

  // --- 3. Delete Logic ---
  const handleDelete = async (id) => {
    if (window.confirm("🛑 WARNING: Are you sure you want to delete this offer?")) {
      await supabase.from('spotlight_offers').delete().eq('id', id);
      fetchOffers();
      // If deleting the currently edited item, reset form
      if(id === editingId) resetForm(); 
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Megaphone className="text-teal-500" /> Spotlight Controller
            </h2>
            <p className="text-slate-400 text-xs mt-1">Manage Homepage Banners & Deals</p>
        </div>
        <div className="hidden md:block">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest border border-teal-500/30 px-3 py-1 rounded-full bg-teal-900/20 flex items-center gap-2">
                <Sparkles size={12}/> Live System
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- LEFT: CONTROL PANEL (The Form) --- */}
        <div className={`p-6 rounded-3xl border shadow-2xl relative overflow-hidden transition-colors duration-300 ${editingId ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-900 border-slate-800'}`}>
            {/* Background Glow - Changes color based on mode */}
            <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none ${editingId ? 'bg-blue-500/10' : 'bg-teal-500/5'}`}></div>

            {/* ✅ Dynamic Header: Shows "Edit" or "Create" */}
            <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${editingId ? 'text-blue-400' : 'text-slate-400'}`}>
                    {editingId ? <><Edit size={16} className="text-blue-500"/> Editing Offer</> : <><Plus size={16} className="text-teal-500"/> Create New Campaign</>}
                </h3>
                {/* ✅ Cancel Button (only visible when editing) */}
                {editingId && (
                    <button onClick={resetForm} className="text-slate-400 hover:text-red-400 text-xs flex items-center gap-1">
                        <XCircle size={14}/> Cancel Edit
                    </button>
                )}
            </div>

            <form onSubmit={handlePublish} className="space-y-5 relative z-10">
                <div>
                    <label className={`text-[10px] font-bold uppercase ml-1 ${editingId ? 'text-blue-400' : 'text-teal-500'}`}>Offer Title</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Monsoon Sale" 
                        className={`w-full bg-slate-950 border rounded-xl p-3 text-white outline-none transition-all font-bold mt-1 placeholder:text-slate-600 ${editingId ? 'focus:border-blue-500 border-slate-700' : 'focus:border-teal-500 border-slate-700'}`}
                        value={form.title}
                        onChange={e => setForm({...form, title: e.target.value})}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={`text-[10px] font-bold uppercase ml-1 ${editingId ? 'text-blue-400' : 'text-teal-500'}`}>Discount Text</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Flat 50% OFF" 
                            className={`w-full bg-slate-950 border rounded-xl p-3 text-white outline-none font-bold mt-1 placeholder:text-slate-600 ${editingId ? 'focus:border-blue-500 border-slate-700' : 'focus:border-teal-500 border-slate-700'}`}
                            value={form.discount_text}
                            onChange={e => setForm({...form, discount_text: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className={`text-[10px] font-bold uppercase ml-1 ${editingId ? 'text-blue-400' : 'text-teal-500'}`}>Color Theme</label>
                        <select 
                            className={`w-full bg-slate-950 border rounded-xl p-3 text-white outline-none font-medium mt-1 cursor-pointer ${editingId ? 'focus:border-blue-500 border-slate-700' : 'focus:border-teal-500 border-slate-700'}`}
                            value={form.gradient_color}
                            onChange={e => setForm({...form, gradient_color: e.target.value})}
                        >
                            <option value="from-blue-600 to-blue-800">❄️ Blue (Cooling)</option>
                            <option value="from-teal-600 to-teal-800">🧹 Teal (Cleaning)</option>
                            <option value="from-amber-500 to-orange-600">⚡ Orange (Power)</option>
                            <option value="from-purple-600 to-indigo-800">🎁 Purple (Special)</option>
                            <option value="from-red-600 to-rose-800">🔥 Red (Hot Deal)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className={`text-[10px] font-bold uppercase ml-1 ${editingId ? 'text-blue-400' : 'text-teal-500'}`}>Image Path (Local)</label>
                    <div className="relative">
                        <ImageIcon size={16} className="absolute left-3 top-3.5 text-slate-500"/>
                        <input 
                            type="text" 
                            placeholder="/assets/banners/your-image.jpg" 
                            className={`w-full bg-slate-950 border rounded-xl p-3 pl-10 text-slate-300 outline-none font-mono text-xs mt-1 placeholder:text-slate-600 ${editingId ? 'focus:border-blue-500 border-slate-700' : 'focus:border-teal-500 border-slate-700'}`}
                            value={form.image_url}
                            onChange={e => setForm({...form, image_url: e.target.value})}
                            required
                        />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 ml-1 flex items-center gap-1">
                        ℹ️ Image must be in <code className="bg-slate-800 px-1 rounded text-teal-400">public/assets/banners</code>
                    </p>
                </div>

                {/* ✅ Dynamic Submit Button Text & Color */}
                <button 
                    disabled={loading}
                    className={`w-full text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex justify-center items-center gap-2 mt-4 ${editingId ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/50' : 'bg-teal-600 hover:bg-teal-500 shadow-teal-900/50'}`}
                >
                    {loading ? (editingId ? 'Updating...' : 'Publishing...') : (
                        editingId ? <><Save size={18}/> Update Offer</> : <><Plus size={18}/> Launch Offer</>
                    )}
                </button>
            </form>
        </div>

        {/* --- RIGHT: LIVE PREVIEW & HISTORY --- */}
        <div className="space-y-6">
            
            {/* Mobile Preview Card */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Eye size={14} className="text-teal-400"/> Mobile Preview
                </h3>
                
                {/* PREVIEW CONTAINER */}
                <div className="bg-gray-100 p-4 rounded-[2rem] border-4 border-slate-950 max-w-sm mx-auto shadow-2xl">
                    <div className={`h-36 rounded-3xl relative overflow-hidden shadow-lg bg-gradient-to-r ${form.gradient_color} transition-all duration-500`}>
                        <div className="absolute top-4 left-4 z-10 text-white">
                            <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-white/20 backdrop-blur-sm shadow-sm">Offer</span>
                            <h3 className="font-black text-xl mt-2 w-2/3 leading-tight drop-shadow-md">{form.title || "Offer Title"}</h3>
                            <p className="font-bold text-sm mt-1 text-white/90 drop-shadow-sm">{form.discount_text || "Discount Details"}</p>
                        </div>
                        {form.image_url && (
                             <img 
                                src={form.image_url} 
                                onError={(e) => e.target.style.display = 'none'}
                                onLoad={(e) => e.target.style.display = 'block'}
                                className="absolute right-0 bottom-0 w-32 h-32 object-contain translate-x-4 translate-y-4 filter drop-shadow-xl transition-transform hover:scale-105 duration-300" 
                                alt="Preview" 
                            />
                        )}
                    </div>
                </div>
                <p className="text-center text-[10px] text-slate-600 mt-4 italic">
                    {editingId ? "Previewing edits..." : "Changes update here in real-time."}
                </p>
            </div>

            {/* Active List */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider">Active Campaigns</h3>
                    <span className="bg-teal-900 text-teal-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{offers.length}</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-800 custom-scrollbar">
                    {offers.map((offer) => (
                        <div key={offer.id} className={`p-4 flex justify-between items-center transition-colors group ${editingId === offer.id ? 'bg-blue-900/20' : 'hover:bg-slate-800/50'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${offer.gradient_color} flex-shrink-0`}></div>
                                <div>
                                    <h4 className="font-bold text-slate-200 text-sm">{offer.title}</h4>
                                    <p className="text-xs text-slate-500">{offer.discount_text}</p>
                                </div>
                            </div>
                            
                            {/* ✅ Action Buttons (Edit & Delete) */}
                            <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => startEditing(offer)}
                                    className="text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 p-2 rounded-lg transition-all"
                                    title="Edit Campaign"
                                    disabled={loading}
                                >
                                    <Edit size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(offer.id)}
                                    className="text-slate-600 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                                    title="Delete Campaign"
                                    disabled={loading}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {offers.length === 0 && (
                        <div className="p-8 text-center text-slate-600 text-xs">No active offers running.</div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}