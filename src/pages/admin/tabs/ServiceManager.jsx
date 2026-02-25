import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, Edit, Save, X, Search, Tag, RefreshCw, Sparkles, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function ServiceManager() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({ name: '', category: '', price: '', image_url: '', note: '' });

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    const { data: sData } = await supabase.from('services').select('*').order('category', { ascending: true });
    if (sData) setServices(sData);

    const { data: cData } = await supabase.from('categories').select('name').order('name');
    if (cData) {
        setCategories(cData);
        if (!form.category && cData.length > 0) setForm(prev => ({ ...prev, category: cData[0].name }));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. Add Service ---
  const handleAdd = async () => {
    if (!form.name || !form.price) return alert("⚠️ Name and Price required!");
    if (!form.category) return alert("⚠️ Please select a Category first!");
    
    setLoading(true);
    
    const { error } = await supabase.from('services').insert([{
        name: form.name,
        category: form.category,
        base_price: parseFloat(form.price), 
        image_url: form.image_url, 
        note: form.note, 
        is_active: true
    }]);
    
    if (error) {
        alert("Error: " + error.message);
    } else {
        setForm({ ...form, name: '', price: '', image_url: '', note: '' }); 
        fetchData(); 
    }
    setLoading(false);
  };

  // --- 3. Delete Service ---
  const handleDelete = async (id) => {
    if (window.confirm('🛑 Delete this service?')) {
        await supabase.from('services').delete().eq('id', id);
        fetchData();
    }
  };

  // --- 4. Edit Logic ---
  const startEdit = (service) => { 
      setEditingId(service.id); 
      setEditForm({ ...service, price: service.base_price || service.price || 0 }); 
  };
  
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
      try {
          // 1. Basic Checking
          if (!editForm.name || !editForm.price) {
              return alert("⚠️ Name and Price cannot be empty!");
          }

          // 2. Database Update (with .select() to catch silent errors)
          const { data, error } = await supabase.from('services').update({ 
                name: editForm.name, 
                base_price: parseFloat(editForm.price) || 0,
                category: editForm.category,
                image_url: editForm.image_url,
                note: editForm.note
          }).eq('id', editingId).select(); // ✅ .select() se confirm hoga ki DB me update hua ya nahi

          // 3. Result Checking
          if (error) {
              alert("❌ Error: " + error.message);
          } else if (!data || data.length === 0) {
              alert("⚠️ Save Failed! Supabase RLS is blocking the update. Please run the SQL command to disable RLS.");
          } else {
              // ✅ 100% Success
              setEditingId(null); 
              fetchData(); 
          }
      } catch (err) {
          alert("❌ Critical Error: " + err.message);
      }
  };

  const aiDictionary = [
      { keys: ['ro', 'water', 'purifier', 'filter'], name: 'RO Installation & Repair', price: '399', img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&q=80', note: 'Spare parts & filters cost extra.' },
      { keys: ['ac', 'cooling', 'air conditioner', 'split'], name: 'AC Deep Foam Cleaning', price: '599', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80', note: 'Gas charging is not included.' },
      { keys: ['light', 'fan', 'bijli', 'wire', 'switch'], name: 'Expert Electrician Visit', price: '199', img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80', note: 'Visiting charge. Final quote after inspection.' },
      { keys: ['pipe', 'nal', 'plumb', 'leakage', 'tank'], name: 'Plumbing Leakage Fix', price: '249', img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80', note: 'Material cost extra. ₹99 visiting fee if no work done.' },
      { keys: ['salon', 'hair', 'haircut', 'shave', 'men'], name: "Men's Haircut & Grooming", price: '299', img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&q=80', note: 'Includes premium styling products.' },
      { keys: ['makeup', 'beauty', 'women', 'threading'], name: "Women's Beauty & Styling", price: '599', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80', note: 'Branded non-toxic products used.' },
      { keys: ['spa', 'massage', 'therapy', 'facial'], name: 'Relaxing Full Body Spa', price: '1299', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&q=80', note: 'Disposable sheets and premium oils included.' },
      { keys: ['car', 'wash', 'polishing', 'detailing'], name: 'Car Deep Cleaning & Polish', price: '799', img: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=500&q=80', note: 'Interior vacuuming + Exterior foam wash.' },
      { keys: ['bike', 'mechanic', 'scooty', 'two wheeler'], name: 'Two-Wheeler General Service', price: '499', img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&q=80', note: 'Engine oil and parts cost extra.' },
      { keys: ['wood', 'carpent', 'furniture', 'bed', 'door'], name: 'Woodwork & Carpentry', price: '349', img: 'https://images.unsplash.com/photo-1622295023576-e41332a813d0?w=500&q=80', note: 'Wood, ply, and hardware cost extra.' },
      { keys: ['paint', 'color', 'wall', 'putty'], name: 'Wall Painting & Putty', price: '999', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&q=80', note: 'Base price per room. Paint cost extra.' },
      { keys: ['clean', 'home', 'safai', 'bathroom'], name: 'Full Home Deep Cleaning', price: '2499', img: 'https://images.unsplash.com/photo-1581578731117-e0a820379b73?w=500&q=80', note: 'For standard 2BHK. Chemicals included.' },
      { keys: ['fridge', 'washing machine', 'tv', 'appliance'], name: 'Appliance Repair & Service', price: '299', img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&q=80', note: 'Visiting charge. Parts extra.' },
      { keys: ['pest', 'bug', 'mosquito', 'termite'], name: 'Pest Control Service', price: '899', img: 'https://images.unsplash.com/photo-1540655037529-dec9815f5ea2?w=500&q=80', note: 'Odourless, pet-friendly chemicals used.' }
  ];

  const handleAIGenerate = () => {
    if(!aiPrompt) return;
    setIsAiThinking(true);
    
    setTimeout(() => {
        let suggestedName = "Custom Expert Service"; 
        let suggestedPrice = "499";
        let suggestedImage = "🔧"; // Default Emoji instead of blank
        let suggestedNote = "Inspection charge applicable if no service is availed."; 
        
        const text = aiPrompt.toLowerCase();
        
        for (let item of aiDictionary) {
            if (item.keys.some(key => text.includes(key))) {
                suggestedName = item.name;
                suggestedPrice = item.price;
                suggestedImage = item.img;
                suggestedNote = item.note || suggestedNote;
                break;
            }
        }

        setForm({ ...form, name: suggestedName, price: suggestedPrice, image_url: suggestedImage, note: suggestedNote });
        setIsAiThinking(false);
        setAiPrompt('');
    }, 800);
  };

  const filteredServices = services.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  // 🖼️ Smart Image/Emoji Renderer Helper
  const renderIcon = (value, isLarge = false) => {
      if (!value) return <div className={`${isLarge ? 'w-16 h-16 text-2xl' : 'w-8 h-8 text-sm'} rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500`}><ImageIcon size={isLarge ? 24 : 14}/></div>;
      
      if (value.startsWith('http')) {
          return <img src={value} alt="icon" className={`${isLarge ? 'w-16 h-16' : 'w-8 h-8'} rounded-lg object-cover border border-slate-700 shadow-sm`} />;
      }
      
      // If it's an emoji or text
      return <div className={`${isLarge ? 'w-16 h-16 text-3xl' : 'w-8 h-8 text-lg'} rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shadow-sm`}>{value}</div>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Tag className="text-teal-500" /> Rate Card Manager
            </h2>
            <p className="text-slate-400 text-xs">Manage Services, Images/Emojis & Customer Notes</p>
          </div>
          <button onClick={fetchData} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white transition-colors"><RefreshCw size={16}/></button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-teal-500/30 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl"></div>
                  <h3 className="text-teal-400 font-black uppercase tracking-widest text-xs flex items-center gap-2 mb-4"><Sparkles size={14}/> AI Rate Generator</h3>
                  <textarea rows="2" placeholder="e.g. Expert keh raha hai naya RO lagana hai..." className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:border-teal-500 resize-none mb-3" value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)}></textarea>
                  <button onClick={handleAIGenerate} disabled={isAiThinking || !aiPrompt} className="w-full bg-slate-800 hover:bg-slate-700 text-teal-400 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
                      {isAiThinking ? <><Loader2 className="animate-spin" size={16}/> Generating...</> : "Generate Rate Card"}
                  </button>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Plus size={14} className="text-teal-500"/> Add New Service
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1">Category</label>
                        <select className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none cursor-pointer" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                            {categories.length === 0 && <option>No Categories Found</option>}
                            {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                        </select>
                    </div>
                    
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1">Service Name</label>
                        <input type="text" placeholder="e.g. Split AC Service" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none font-medium" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1">Base Price (₹)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-500">₹</span>
                            <input type="number" placeholder="Price" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pl-7 text-white focus:border-teal-500 outline-none font-bold" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                        </div>
                    </div>

                    {/* ✅ SMART IMAGE / EMOJI INPUT */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1 flex items-center gap-1"><ImageIcon size={10}/> Image Link OR Emoji (Optional)</label>
                        <input type="text" placeholder="https://... OR ✂️" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none text-xs" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
                        {/* 🖼️ Smart Preview */}
                        <div className="mt-2">
                            {renderIcon(form.image_url, true)}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1 flex items-center gap-1"><AlertCircle size={10}/> Customer Note (Optional)</label>
                        <input type="text" placeholder="e.g. Spare parts cost extra" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-teal-100 focus:border-teal-500 outline-none text-xs" value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
                    </div>
                    
                    <button onClick={handleAdd} disabled={loading} className="w-full bg-teal-600 hover:bg-teal-500 text-white py-3.5 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 mt-2">
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <><Plus size={18}/> Add to Database</>}
                    </button>
                </div>
              </div>
          </div>

          <div className="lg:col-span-8 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg flex flex-col h-full min-h-[500px]">
            <div className="p-4 border-b border-slate-800 bg-slate-900">
                 <div className="relative">
                     <Search className="absolute left-3 top-3 text-slate-500" size={16}/>
                     <input type="text" placeholder="Search service list..." className="w-full bg-slate-950 p-2.5 pl-10 rounded-xl text-white border border-slate-800 outline-none focus:border-teal-500 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                 </div>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-500 sticky top-0 z-10">
                        <tr><th className="p-4 pl-6">Service</th><th className="p-4">Category</th><th className="p-4">Rate</th><th className="p-4 text-right pr-6">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {filteredServices.map(s => (
                            <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="p-4 pl-6 font-medium text-white flex items-center gap-3">
                                    {/* 🖼️ Smart List Icon rendering */}
                                    {renderIcon(s.image_url, false)}
                                    
                                    {editingId === s.id ? <input className="bg-slate-950 border border-teal-500 rounded p-1 w-full text-white outline-none" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}/> : 
                                      <div>
                                        {s.name}
                                        {s.note && <div className="text-[9px] text-teal-500 font-normal mt-0.5">{s.note}</div>}
                                      </div>
                                    }
                                </td>
                                <td className="p-4">
                                    {editingId === s.id ? (
                                        <select className="bg-slate-950 border border-teal-500 rounded p-1 text-white outline-none" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                                            {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                    ) : <span className="bg-slate-950 px-2 py-1 rounded-md text-[10px] font-bold uppercase text-teal-400 border border-teal-500/20">{s.category}</span>}
                                </td>
                                <td className="p-4 font-bold text-white">
                                    {editingId === s.id ? (
                                        <div className="relative">
                                            <span className="absolute left-1 top-1 text-slate-500 text-xs">₹</span>
                                            <input type="number" className="bg-slate-950 border border-teal-500 rounded p-1 pl-4 w-20 text-white outline-none" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})}/>
                                        </div>
                                    ) : `₹${s.base_price || s.price || 0}`} 
                                </td>
                                <td className="p-4 text-right pr-6">
                                    {editingId === s.id ? (
                                        <div className="flex flex-col gap-1 items-end">
                                            <input type="text" placeholder="URL or Emoji" className="bg-slate-950 border border-teal-500 rounded p-1 text-[10px] w-32 text-white outline-none mb-1" value={editForm.image_url || ''} onChange={e => setEditForm({...editForm, image_url: e.target.value})}/>
                                            <input type="text" placeholder="Customer Note" className="bg-slate-950 border border-teal-500 rounded p-1 text-[10px] w-32 text-white outline-none mb-1" value={editForm.note || ''} onChange={e => setEditForm({...editForm, note: e.target.value})}/>
                                            <div className="flex justify-end gap-2"><button onClick={saveEdit} className="text-green-400 bg-slate-950 border border-slate-700 p-1.5 rounded-lg hover:border-green-500 transition-all"><Save size={16}/></button><button onClick={cancelEdit} className="text-red-400 bg-slate-950 border border-slate-700 p-1.5 rounded-lg hover:border-red-500 transition-all"><X size={16}/></button></div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-2"><button onClick={() => startEdit(s)} className="text-blue-400 hover:text-blue-300 bg-slate-950 border border-slate-800 p-1.5 rounded-lg hover:border-blue-500/50 transition-all"><Edit size={14}/></button><button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300 bg-slate-950 border border-slate-800 p-1.5 rounded-lg hover:border-red-500/50 transition-all"><Trash2 size={14}/></button></div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>

      </div>
    </div>
  );
}