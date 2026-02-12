import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

export default function ServiceManager() {
  const [services, setServices] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'AC Repair', price: '', city: 'Jabalpur' });

  // 1. Fetch Real Data
  const fetchServices = async () => {
    const { data, error } = await supabase.from('services').select('*').order('id', { ascending: false });
    if (!error) setServices(data);
  };

  useEffect(() => { fetchServices(); }, []);

  // 2. Add New Service
  const handleAdd = async () => {
    if (!form.name || !form.price) return alert("Name and Price required");
    const { error } = await supabase.from('services').insert([form]);
    if (error) alert("Error adding service");
    else {
        setForm({ name: '', category: 'AC Repair', price: '', city: 'Jabalpur' });
        fetchServices();
    }
  };

  // 3. Delete Service
  const handleDelete = async (id) => {
    if (confirm('Delete this service?')) {
        await supabase.from('services').delete().eq('id', id);
        fetchServices();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">🛠️ Service Management</h2>
      
      {/* Add New Form */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h3 className="text-sm font-bold text-teal-400 uppercase mb-4">Add New Service</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input type="text" placeholder="Service Name (e.g. Split AC Service)" className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-white col-span-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <select className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option>AC Repair</option>
                <option>Cleaning</option>
                <option>Electrician</option>
                <option>Plumber</option>
            </select>
            <input type="number" placeholder="Price (₹)" className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
            <button onClick={handleAdd} className="bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg p-3 flex items-center justify-center gap-2"><Plus size={18}/> Add</button>
        </div>
      </div>

      {/* List */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs uppercase font-bold text-slate-500">
                <tr><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {services.map(s => (
                    <tr key={s.id} className="hover:bg-slate-700/50">
                        <td className="p-4 font-medium text-white">{s.name}</td>
                        <td className="p-4"><span className="bg-slate-700 px-2 py-1 rounded text-xs">{s.category}</span></td>
                        <td className="p-4 font-bold text-teal-400">₹{s.price}</td>
                        <td className="p-4 text-right">
                            <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:bg-red-900/30 p-2 rounded"><Trash2 size={16}/></button>
                        </td>
                    </tr>
                ))}
                {services.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500">No services added yet. Add one above!</td></tr>}
            </tbody>
        </table>
      </div>
    </div>
  );
}