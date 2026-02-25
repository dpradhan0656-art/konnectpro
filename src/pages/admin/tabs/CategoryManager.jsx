import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, Edit, Save, Grid, Eye, EyeOff, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

// 🎨 1. Smart Icon Renderer (Emoji or URL)
const SmartIcon = ({ iconValue }) => {
  if (!iconValue) return <span className="text-5xl drop-shadow-md">🔧</span>;
  // Agar URL (link) hai to image dikhao
  if (iconValue.startsWith('http')) {
      return <img src={iconValue} alt="Category Icon" className="w-12 h-12 object-contain drop-shadow-lg" />;
  }
  // Warna normal Emoji dikhao (Apple style bada size)
  return <span className="text-5xl drop-shadow-md">{iconValue}</span>;
};

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ name: '', icon: '🔧' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', icon: '' });
  
  // 🧠 Smart Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // --- Fetch Data ---
  const fetchCats = async () => {
    // Note: Assuming 'icon' column based on your original DB schema
    const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
    if (data) setCategories(data);
  };
  useEffect(() => { fetchCats(); }, []);

  // --- 🪄 AI Auto-Suggest Icon Logic ---
  const handleAiSuggest = () => {
      if(!newCat.name) return alert("Pehle Category Name likhiye, fir AI icon dhundega!");
      setIsAiThinking(true);
      
      setTimeout(() => {
          const text = newCat.name.toLowerCase();
          let suggestedIcon = '🔧'; // default
          
          if(text.includes('ac') || text.includes('cool')) suggestedIcon = '❄️';
          else if(text.includes('plumb') || text.includes('water') || text.includes('ro')) suggestedIcon = '💧';
          else if(text.includes('electric') || text.includes('light') || text.includes('wire')) suggestedIcon = '⚡';
          else if(text.includes('clean') || text.includes('sweep') || text.includes('wash')) suggestedIcon = '🧹';
          else if(text.includes('paint') || text.includes('color')) suggestedIcon = '🎨';
          else if(text.includes('salon') || text.includes('beauty') || text.includes('hair') || text.includes('makeup')) suggestedIcon = '✂️';
          else if(text.includes('car') || text.includes('bike') || text.includes('mechanic') || text.includes('auto')) suggestedIcon = '🚗';
          else if(text.includes('wood') || text.includes('carpent') || text.includes('furniture')) suggestedIcon = '🪚';
          else if(text.includes('appliance') || text.includes('tv') || text.includes('fridge') || text.includes('machine')) suggestedIcon = '📺';
          else if(text.includes('massage') || text.includes('spa')) suggestedIcon = '💆‍♀️';
          else if(text.includes('pest') || text.includes('bug')) suggestedIcon = '🐜';
          
          setNewCat({ ...newCat, icon: suggestedIcon });
          setIsAiThinking(false);
      }, 600); // 0.6s magic delay
  };

  // --- Add Category ---
  const addCategory = async (e) => {
    e.preventDefault();
    if(!newCat.name) return;
    setIsSaving(true);
    
    // Auto-Slug Generation (e.g., "Car Wash" -> "car-wash")
    const generatedSlug = newCat.name.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');

    const { error } = await supabase.from('categories').insert([{
        name: newCat.name,
        icon: newCat.icon, // DB column 'icon'
        slug: generatedSlug,
        is_active: true // By default Live
    }]);

    setIsSaving(false);
    if(!error) {
        setNewCat({ name: '', icon: '🔧' });
        fetchCats();
    } else {
        alert("Error saving category: " + error.message);
    }
  };

  // --- Delete Category ---
  const deleteCategory = async (id) => {
    if(window.confirm("🛑 WARNING: Are you sure? Services linked to this category might break!")) {
        setLoadingId(id);
        await supabase.from('categories').delete().eq('id', id);
        setLoadingId(null);
        fetchCats();
    }
  };

  // --- Update Category (Full Control) ---
  const updateCategory = async (id) => {
      setLoadingId(id);
      await supabase.from('categories').update({ 
          name: editData.name,
          icon: editData.icon 
      }).eq('id', id);
      setEditingId(null);
      setLoadingId(null);
      fetchCats();
  };

  // --- Toggle Live/Hidden ---
  const toggleStatus = async (cat) => {
      setLoadingId(cat.id);
      await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id);
      setLoadingId(null);
      fetchCats();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-sans">
      <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl shadow-lg shadow-teal-500/10">
              <Grid size={28} />
          </div>
          <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-widest">Category Master</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Unlimited Custom Icons & AI Suggestions</p>
          </div>
      </div>

      {/* 🚀 ADD NEW PANEL (Smart Version) */}
      <div className="bg-slate-900/80 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>
          
          <div className="flex flex-col md:flex-row gap-6 items-end">
              {/* Category Name Input */}
              <div className="flex-1 w-full">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">1. Category Name</label>
                <input type="text" placeholder="e.g. Car Wash" required className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-teal-500 font-bold placeholder:text-slate-700 transition-all" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} />
              </div>

              {/* Icon Input & AI Button */}
              <div className="w-full md:w-1/3">
                <div className="flex justify-between items-end mb-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">2. Icon (Emoji / URL)</label>
                    <button onClick={handleAiSuggest} disabled={isAiThinking} className="text-[10px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 bg-teal-500/10 px-2 py-0.5 rounded-full transition-all active:scale-95">
                        {isAiThinking ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>} Auto Suggest
                    </button>
                </div>
                <div className="flex gap-2">
                    <div className="w-14 flex-shrink-0 bg-slate-950 border border-slate-700 rounded-xl flex items-center justify-center p-1">
                        <SmartIcon iconValue={newCat.icon} />
                    </div>
                    <input type="text" placeholder="Emoji or https://..." className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-teal-500 font-bold placeholder:text-slate-700" value={newCat.icon} onChange={e => setNewCat({...newCat, icon: e.target.value})} />
                </div>
              </div>

              {/* Create Button */}
              <button onClick={addCategory} disabled={isSaving || !newCat.name} className="w-full md:w-auto bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-teal-900/40 active:scale-95 transition-all">
                 {isSaving ? <><Loader2 className="animate-spin" size={18}/> Saving...</> : <><Plus size={18}/> Create</>}
              </button>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-4 ml-1 flex items-center gap-1"><ImageIcon size={12}/> Tip: Paste a direct image link (.png) or type any emoji from your keyboard.</p>
      </div>

      {/* 📡 LIVE LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map(cat => (
              <div key={cat.id} className={`bg-slate-900 p-6 rounded-[2rem] border transition-all duration-300 shadow-xl relative group flex flex-col items-center text-center ${cat.is_active ? 'border-slate-700 hover:border-teal-500/50' : 'border-red-900/30 opacity-60 grayscale hover:grayscale-0'}`}>
                  
                  {/* --- Live/Hidden Toggle --- */}
                  <div className="absolute top-4 left-4 z-10">
                      <button onClick={() => toggleStatus(cat)} title={cat.is_active ? "Hide from website" : "Make Live"} className={`p-2 rounded-full transition-colors ${cat.is_active ? 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
                          {loadingId === cat.id ? <Loader2 size={16} className="animate-spin"/> : cat.is_active ? <Eye size={16}/> : <EyeOff size={16}/>}
                      </button>
                  </div>

                  {/* --- Smart Icon Renderer --- */}
                  <div className={`mt-4 mb-4 flex items-center justify-center w-20 h-20 rounded-full ${cat.is_active ? 'bg-slate-800/50 group-hover:scale-110 group-hover:bg-slate-800' : 'bg-slate-950 opacity-50'} transition-all duration-300`}>
                      <SmartIcon iconValue={cat.icon} />
                  </div>
                  
                  {/* --- Inline Editor --- */}
                  {editingId === cat.id ? (
                      <div className="w-full space-y-2 bg-slate-950 p-3 rounded-xl border border-teal-500/50 z-10 relative">
                          <input placeholder="Emoji or Image URL" className="w-full bg-slate-900 text-xs text-white p-2 rounded outline-none border border-slate-700 focus:border-teal-500" value={editData.icon} onChange={e=>setEditData({...editData, icon: e.target.value})}/>
                          <input placeholder="Category Name" className="w-full bg-slate-900 text-white font-bold text-sm p-2 rounded border border-slate-700 outline-none focus:border-teal-500" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} autoFocus/>
                          <button onClick={() => updateCategory(cat.id)} className="w-full bg-teal-600 text-white text-xs font-bold py-2 rounded flex justify-center items-center gap-1 hover:bg-teal-500"><Save size={14}/> Save Changes</button>
                      </div>
                  ) : (
                      <>
                        <h3 className="font-black text-white text-lg tracking-wide mt-2">{cat.name}</h3>
                        <span className={`text-[10px] font-mono mt-2 px-2 py-0.5 rounded uppercase tracking-widest ${cat.is_active ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}`}>
                            {cat.is_active ? '🟢 LIVE' : '🔴 HIDDEN'}
                        </span>
                      </>
                  )}

                  {/* --- Hover Actions (Edit & Delete) --- */}
                  <div className="absolute top-4 right-4 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button onClick={() => {setEditingId(cat.id); setEditData({name: cat.name, icon: cat.icon})}} className="text-blue-400 p-2 bg-slate-950 border border-slate-800 rounded-lg hover:border-blue-500 transition-all"><Edit size={14}/></button>
                      <button onClick={() => deleteCategory(cat.id)} disabled={loadingId === cat.id} className="text-red-400 p-2 bg-slate-950 border border-slate-800 rounded-lg hover:border-red-500 transition-all"><Trash2 size={14}/></button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}