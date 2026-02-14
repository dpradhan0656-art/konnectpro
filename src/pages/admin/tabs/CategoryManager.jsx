import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, Edit, Save, Grid } from 'lucide-react';

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ name: '', icon: '🔧' }); // Icon can be Emoji or URL
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // Fetch
  const fetchCats = async () => {
    const { data } = await supabase.from('categories').select('*').order('id');
    if (data) setCategories(data);
  };
  useEffect(() => { fetchCats(); }, []);

  // Add
  const addCategory = async () => {
    if(!newCat.name) return alert("Name required");
    await supabase.from('categories').insert([newCat]);
    setNewCat({ name: '', icon: '🔧' });
    fetchCats();
  };

  // Delete
  const deleteCategory = async (id) => {
    if(confirm("Delete category? Sub-services might get affected.")) {
        await supabase.from('categories').delete().eq('id', id);
        fetchCats();
    }
  };

  // Update
  const updateCategory = async (id) => {
      await supabase.from('categories').update({ name: editName }).eq('id', id);
      setEditingId(null);
      fetchCats();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Grid className="text-purple-500" /> Category Master
      </h2>

      {/* Add New */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex gap-4">
          <input 
            type="text" placeholder="Emoji (e.g. 🧹)" 
            className="w-16 bg-slate-950 border border-slate-700 rounded-xl p-3 text-center text-2xl outline-none"
            value={newCat.icon} onChange={e => setNewCat({...newCat, icon: e.target.value})}
          />
          <input 
            type="text" placeholder="Category Name (e.g. Cleaning)" 
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none"
            value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})}
          />
          <button onClick={addCategory} className="bg-purple-600 hover:bg-purple-500 text-white px-6 rounded-xl font-bold">Add</button>
      </div>

      {/* List */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(cat => (
              <div key={cat.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center text-center group relative">
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  
                  {editingId === cat.id ? (
                      <div className="flex gap-1 w-full">
                          <input className="bg-slate-800 text-white text-xs p-1 w-full rounded" value={editName} onChange={e=>setEditName(e.target.value)}/>
                          <button onClick={() => updateCategory(cat.id)} className="text-green-500"><Save size={14}/></button>
                      </div>
                  ) : (
                      <h3 className="font-bold text-white">{cat.name}</h3>
                  )}

                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => {setEditingId(cat.id); setEditName(cat.name)}} className="text-blue-400 p-1 bg-slate-800 rounded"><Edit size={12}/></button>
                      <button onClick={() => deleteCategory(cat.id)} className="text-red-400 p-1 bg-slate-800 rounded"><Trash2 size={12}/></button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}