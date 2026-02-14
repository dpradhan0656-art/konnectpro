import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, Edit, Save, X, Search, DollarSign, Tag } from 'lucide-react';

export default function ServiceManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Mode State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Add New Form State
  const [form, setForm] = useState({ 
    name: '', 
    category: 'AC Repair', 
    price: '', 
    city: 'Jabalpur' 
  });

  // --- 1. Fetch Real Data ---
  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('category', { ascending: true }); // Category wise sort
    if (!error) setServices(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  // --- 2. Add New Service ---
  const handleAdd = async () => {
    if (!form.name || !form.price) return alert("⚠️ Name and Price required!");
    
    setLoading(true);
    const { error } = await supabase.from('services').insert([form]);
    
    if (error) {
        alert("Error: " + error.message);
    } else {
        setForm({ ...form, name: '', price: '' }); // Reset fields but keep category/city
        fetchServices();
        alert("✅ Service Added Successfully!");
    }
    setLoading(false);
  };

  // --- 3. Delete Service ---
  const handleDelete = async (id) => {
    if (window.confirm('🛑 Are you sure you want to DELETE this service?')) {
        await supabase.from('services').delete().eq('id', id);
        fetchServices();
    }
  };

  // --- 4. Edit Logic ---
  const startEdit = (service) => {
      setEditingId(service.id);
      setEditForm(service);
  };

  const cancelEdit = () => {
      setEditingId(null);
      setEditForm({});
  };

  const saveEdit = async () => {
      if(!editForm.name || !editForm.price) return alert("Fields cannot be empty");
      
      const { error } = await supabase
        .from('services')
        .update({ 
            name: editForm.name, 
            price: editForm.price, 
            category: editForm.category 
        })
        .eq('id', editingId);

      if(!error) {
          setEditingId(null);
          fetchServices();
      } else {
          alert("Update Failed: " + error.message);
      }
  };

  // --- 5. Filtering Logic ---
  const filteredServices = services.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper for Category Colors
  const getCatColor = (cat) => {
      if(cat.includes('AC')) return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      if(cat.includes('Clean')) return 'bg-teal-500/20 text-teal-400 border-teal-500/50';
      if(cat.includes('Electric')) return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      return 'bg-slate-700 text-slate-300 border-slate-600';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Tag className="text-pink-500" /> Rate Card Manager
            </h2>
            <p className="text-slate-400 text-xs">Set prices for all your services here.</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 text-slate-500" size={16} />
            <input 
                type="text" 
                placeholder="Search services..." 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 text-sm text-white focus:border-pink-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
      </div>
      
      {/* --- ADD NEW FORM --- */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10">
            <Plus size={14} className="text-pink-500"/> Add New Service
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10">
            {/* Name */}
            <div className="md:col-span-5">
                <input 
                    type="text" 
                    placeholder="Service Name (e.g. Split AC Jet Service)" 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-pink-500 outline-none font-medium placeholder:text-slate-600"
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                />
            </div>
            
            {/* Category */}
            <div className="md:col-span-3">
                <select 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-pink-500 outline-none cursor-pointer"
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})}
                >
                    <option>AC Repair</option>
                    <option>Cleaning</option>
                    <option>Electrician</option>
                    <option>Plumber</option>
                    <option>Carpenter</option>
                    <option>RO Service</option>
                </select>
            </div>
            
            {/* Price */}
            <div className="md:col-span-2 relative">
                <span className="absolute left-3 top-3 text-slate-500">₹</span>
                <input 
                    type="number" 
                    placeholder="Price" 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pl-7 text-white focus:border-pink-500 outline-none font-bold placeholder:text-slate-600"
                    value={form.price} 
                    onChange={e => setForm({...form, price: e.target.value})} 
                />
            </div>
            
            {/* Button */}
            <div className="md:col-span-2">
                <button 
                    onClick={handleAdd} 
                    disabled={loading}
                    className="w-full h-full bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow-lg shadow-pink-900/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    {loading ? 'Adding...' : <><Plus size={18}/> Add</>}
                </button>
            </div>
        </div>
      </div>

      {/* --- SERVICE LIST (TABLE) --- */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <tr>
                        <th className="p-4 pl-6">Service Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Standard Price</th>
                        <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {filteredServices.map(s => (
                        <tr key={s.id} className={`group transition-colors ${editingId === s.id ? 'bg-blue-900/10' : 'hover:bg-slate-800/50'}`}>
                            
                            {/* 1. NAME */}
                            <td className="p-4 pl-6 font-medium text-white">
                                {editingId === s.id ? (
                                    <input 
                                        className="bg-slate-950 border border-blue-500 rounded p-2 text-white w-full outline-none" 
                                        value={editForm.name} 
                                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                                        autoFocus
                                    />
                                ) : (
                                    s.name
                                )}
                            </td>

                            {/* 2. CATEGORY */}
                            <td className="p-4">
                                {editingId === s.id ? (
                                    <select 
                                        className="bg-slate-950 border border-blue-500 rounded p-2 text-white outline-none" 
                                        value={editForm.category}
                                        onChange={e => setEditForm({...editForm, category: e.target.value})}
                                    >
                                        <option>AC Repair</option>
                                        <option>Cleaning</option>
                                        <option>Electrician</option>
                                        <option>Plumber</option>
                                        <option>Carpenter</option>
                                    </select>
                                ) : (
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getCatColor(s.category)}`}>
                                        {s.category}
                                    </span>
                                )}
                            </td>

                            {/* 3. PRICE */}
                            <td className="p-4">
                                {editingId === s.id ? (
                                    <div className="relative w-24">
                                        <span className="absolute left-2 top-2 text-slate-400">₹</span>
                                        <input 
                                            className="bg-slate-950 border border-blue-500 rounded p-2 pl-5 text-white w-full outline-none font-bold" 
                                            value={editForm.price} 
                                            type="number"
                                            onChange={e => setEditForm({...editForm, price: e.target.value})}
                                        />
                                    </div>
                                ) : (
                                    <span className="font-bold text-slate-200 flex items-center gap-1">
                                        <DollarSign size={14} className="text-green-500"/> ₹{s.price}
                                    </span>
                                )}
                            </td>

                            {/* 4. ACTIONS */}
                            <td className="p-4 text-right pr-6">
                                {editingId === s.id ? (
                                    <div className="flex justify-end gap-2">
                                        <button onClick={saveEdit} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg" title="Save">
                                            <Save size={16}/>
                                        </button>
                                        <button onClick={cancelEdit} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-lg" title="Cancel">
                                            <X size={16}/>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(s)} className="bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-400 p-2 rounded-lg border border-slate-700 transition-all" title="Edit Price">
                                            <Edit size={14}/>
                                        </button>
                                        <button onClick={() => handleDelete(s.id)} className="bg-slate-800 hover:bg-red-600 hover:text-white text-red-400 p-2 rounded-lg border border-slate-700 transition-all" title="Delete">
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    
                    {/* Empty State */}
                    {filteredServices.length === 0 && (
                        <tr>
                            <td colSpan="4" className="p-10 text-center text-slate-500 border-t border-slate-800">
                                <div className="flex flex-col items-center gap-2">
                                    <Tag size={32} className="opacity-20"/>
                                    <p>No services found matching your search.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}