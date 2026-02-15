import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit2, Save, Trash2, X } from 'lucide-react';

export default function LegalManager() {
  const [pages, setPages] = useState([]);
  const [editingPage, setEditingPage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Pages from DB
  const fetchPages = async () => {
    const { data } = await supabase.from('legal_pages').select('*').order('id');
    if (data) setPages(data);
  };

  useEffect(() => { fetchPages(); }, []);

  // 2. Save/Update Page
  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('legal_pages')
      .update({ 
        title: editingPage.title, 
        content: editingPage.content,
        updated_at: new Date() 
      })
      .eq('id', editingPage.id);

    if (!error) {
      alert("Page Updated Successfully!");
      setEditingPage(null);
      fetchPages();
    }
    setLoading(false);
  };

  // 3. Delete Page Logic (Optional but requested)
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This will remove the page link from the app.")) {
      await supabase.from('legal_pages').delete().eq('id', id);
      fetchPages();
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-black mb-6 flex items-center gap-2">
        📄 Content Manager <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full uppercase">Legal & Info</span>
      </h2>

      {editingPage ? (
        /* --- EDIT FORM --- */
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
            <h3 className="font-bold text-slate-700">Editing: {editingPage.slug}</h3>
            <button onClick={() => setEditingPage(null)} className="text-slate-400"><X size={20}/></button>
          </div>
          <input 
            className="w-full p-3 border rounded-xl font-bold"
            value={editingPage.title}
            onChange={(e) => setEditingPage({...editingPage, title: e.target.value})}
          />
          <textarea 
            className="w-full h-64 p-4 border rounded-xl font-medium text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none"
            value={editingPage.content}
            onChange={(e) => setEditingPage({...editingPage, content: e.target.value})}
          />
          <button 
            disabled={loading}
            onClick={handleSave}
            className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-teal-700 transition-all"
          >
            <Save size={20}/> {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      ) : (
        /* --- LIST VIEW --- */
        <div className="grid grid-cols-1 gap-4">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center justify-between p-4 bg-slate-50 border rounded-2xl hover:border-teal-200 transition-all">
              <div>
                <p className="font-black text-slate-800">{page.title}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">URL: /{page.slug}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingPage(page)} className="p-2 bg-white text-blue-600 rounded-lg shadow-sm"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(page.id)} className="p-2 bg-white text-rose-500 rounded-lg shadow-sm"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}