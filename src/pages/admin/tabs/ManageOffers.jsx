import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Megaphone, Trash2, Plus, Save, Eye, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function ManageOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    discount_text: '',
    image_url: '/assets/banner/ac-service.jpg',
    gradient_color: 'from-blue-600 to-blue-800',
    is_active: true
  });

  const fetchOffers = async () => {
    const { data } = await supabase.from('spotlight_offers').select('*').order('created_at', { ascending: false });
    if (data) setOffers(data);
  };

  useEffect(() => { fetchOffers(); }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('spotlight_offers').insert([form]);
    if (error) {
      alert("Error: " + error.message);
    } else {
      setForm({ ...form, title: '', discount_text: '' });
      fetchOffers();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("🛑 Delete this offer?")) {
      await supabase.from('spotlight_offers').delete().eq('id', id);
      fetchOffers();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3"><Megaphone className="text-teal-500" /> Spotlight Controller</h2>
            <p className="text-slate-400 text-xs mt-1">Manage Homepage Banners & Deals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORM */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2"><Plus size={16} className="text-teal-500"/> Create New Campaign</h3>
            <form onSubmit={handlePublish} className="space-y-5">
                <input type="text" placeholder="Offer Title (e.g. Monsoon Sale)" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Discount (e.g. 50% OFF)" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold" value={form.discount_text} onChange={e => setForm({...form, discount_text: e.target.value})} required />
                    <select className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white" value={form.gradient_color} onChange={e => setForm({...form, gradient_color: e.target.value})}>
                        <option value="from-blue-600 to-blue-800">❄️ Blue</option>
                        <option value="from-teal-600 to-teal-800">🧹 Teal</option>
                        <option value="from-amber-500 to-orange-600">⚡ Orange</option>
                        <option value="from-purple-600 to-indigo-800">🎁 Purple</option>
                        <option value="from-red-600 to-rose-800">🔥 Red</option>
                    </select>
                </div>
                <input type="text" placeholder="Image Path (e.g. /assets/banner/ac.jpg)" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-300 font-mono text-xs" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} required />
                <button disabled={loading} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-teal-900/50 mt-4">{loading ? 'Publishing...' : 'Launch Offer'}</button>
            </form>
        </div>

        {/* PREVIEW */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Eye size={14}/> Mobile Preview</h3>
            <div className={`h-36 rounded-3xl relative overflow-hidden shadow-lg bg-gradient-to-r ${form.gradient_color} max-w-sm mx-auto`}>
                <div className="absolute top-4 left-4 z-10 text-white">
                    <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-black uppercase backdrop-blur-sm">Offer</span>
                    <h3 className="font-black text-xl mt-2 w-2/3 leading-tight drop-shadow-md">{form.title || "Title"}</h3>
                    <p className="font-bold text-sm mt-1 text-white/90 drop-shadow-sm">{form.discount_text || "Discount"}</p>
                </div>
                {form.image_url && <img src={form.image_url} onError={(e) => e.target.style.display = 'none'} onLoad={(e) => e.target.style.display = 'block'} className="absolute right-0 bottom-0 w-32 h-32 object-contain translate-x-4 translate-y-4 filter drop-shadow-xl" alt="Preview" />}
            </div>
            
            {/* LIST */}
            <div className="mt-8 space-y-2 max-h-40 overflow-y-auto">
                {offers.map(offer => (
                    <div key={offer.id} className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800">
                        <span className="text-xs text-white font-bold">{offer.title}</span>
                        <button onClick={() => handleDelete(offer.id)} className="text-red-400 p-1"><Trash2 size={14}/></button>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}