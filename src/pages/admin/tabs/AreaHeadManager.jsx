import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Shield, MapPin, Briefcase, Plus, User, Mail, Lock, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AreaHeadManager() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🌟 New State for the 'Add Manager' Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
      name: '', email: '', password: '', city: 'Jabalpur', type: 'salary', compensation: 0
  });

  useEffect(() => { fetchManagers(); }, []);

  const fetchManagers = async () => {
    setLoading(true);
    const { data } = await supabase.from('area_heads').select('*').order('created_at', { ascending: false });
    if (data) setManagers(data);
    setLoading(false);
  };

  // 👑 CREATE NEW AREA HEAD FUNCTION
  const handleCreateManager = async (e) => {
      e.preventDefault();
      setFormLoading(true);
      
      try {
          // 1. Create Supabase Auth User
          const { data: authData, error: authError } = await supabase.auth.signUp({
              email: formData.email,
              password: formData.password,
          });

          if (authError) throw authError;

          if (authData.user) {
              // 2. Add to area_heads table
              const { error: dbError } = await supabase.from('area_heads').insert([{
                  user_id: authData.user.id,
                  name: formData.name,
                  assigned_area: formData.city,
                  employment_type: formData.type,
                  compensation_value: parseFloat(formData.compensation),
                  status: 'active'
              }]);

              if (dbError) throw dbError;

              alert(`Success! ${formData.name} is now the Commander for ${formData.city}.`);
              setShowAddForm(false);
              setFormData({ name: '', email: '', password: '', city: 'Jabalpur', type: 'salary', compensation: 0 });
              fetchManagers(); 
          }
      } catch (error) {
          alert("Error creating manager: " + error.message);
      } finally {
          setFormLoading(false);
      }
  };

  const updateStatus = async (id, newStatus) => {
    const isConfirmed = window.confirm(`Are you sure you want to mark this Area Head as ${newStatus}?`);
    if(!isConfirmed) return;
    
    await supabase.from('area_heads').update({ status: newStatus }).eq('id', id);
    fetchManagers();
  };

  const updateCompensation = async (id, type, val) => {
      const newVal = prompt(`Enter new ${type === 'salary' ? 'Salary Amount (₹)' : 'Commission Percentage (%)'}:`, val);
      if(!newVal || isNaN(newVal)) return;
      await supabase.from('area_heads').update({ compensation_value: parseFloat(newVal) }).eq('id', id);
      fetchManagers();
  }

  if (loading) return <div className="text-teal-500 flex justify-center py-20"><Loader2 className="animate-spin" size={40}/></div>;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      {/* 🛡️ HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-[2rem] border border-teal-500/30 gap-4 shadow-xl">
        <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2"><Shield className="text-teal-500"/> City Commanders</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Manage Area Heads & Payouts</p>
        </div>
        <div className="flex gap-3">
            <button onClick={fetchManagers} className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl text-slate-300 font-bold transition-colors">Refresh Radar</button>
            {!showAddForm && (
                <button onClick={() => setShowAddForm(true)} className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-teal-900/50">
                    <Plus size={16}/> Recruit New
                </button>
            )}
        </div>
      </div>

      {/* 📝 RECRUITMENT FORM (ADD NEW MANAGER) */}
      {showAddForm && (
          <div className="bg-slate-900 border border-teal-500/30 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                  <h2 className="text-xl font-black text-white">Appoint New Area Commander</h2>
                  <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-red-400 font-bold text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">Cancel</button>
              </div>

              <form onSubmit={handleCreateManager} className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input type="text" required placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-500/50" />
                  </div>
                  <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input type="text" required placeholder="Assigned City (e.g. Indore)" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-500/50" />
                  </div>
                  <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input type="email" required placeholder="Official Email (Login ID)" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-500/50" />
                  </div>
                  <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input type="password" required placeholder="Create Secure Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-500/50" />
                  </div>

                  {/* Pay Structure */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-4 mt-2 p-5 bg-slate-950/50 rounded-2xl border border-slate-800">
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Compensation Type</label>
                          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 outline-none focus:border-teal-500/50 appearance-none font-bold">
                              <option value="salary">Monthly Salary</option>
                              <option value="commission">Revenue Commission (%)</option>
                          </select>
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Amount / Percentage</label>
                          <div className="relative">
                              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                              <input type="number" required placeholder={formData.type === 'salary' ? "e.g. 15000" : "e.g. 5 (for 5%)"} value={formData.compensation} onChange={e => setFormData({...formData, compensation: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-500/50 font-black" />
                          </div>
                      </div>
                  </div>

                  <button type="submit" disabled={formLoading} className="md:col-span-2 w-full mt-4 bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 shadow-lg shadow-teal-900/50 disabled:opacity-50">
                      {formLoading ? <Loader2 size={16} className="animate-spin"/> : <Shield size={16}/>} 
                      {formLoading ? 'Appointing Commander...' : 'Confirm Appointment'}
                  </button>
              </form>
          </div>
      )}

      {/* 📋 MANAGERS LIST */}
      <div className="grid gap-4">
          {managers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 bg-slate-900 rounded-[2rem] border border-slate-800 font-bold uppercase tracking-widest text-xs">
                  No Area Commanders Recruited Yet.
              </div>
          ) : managers.map(mgr => (
              <div key={mgr.id} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col md:flex-row gap-6 relative overflow-hidden">
                  
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 w-1.5 h-full ${mgr.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>

                  <div className="flex-1 pl-2">
                      <div className="flex gap-3 mb-2">
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                              mgr.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                              {mgr.status}
                          </span>
                      </div>
                      <h3 className="text-xl font-black text-white">{mgr.name}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-2 flex gap-2 items-center uppercase tracking-widest">
                          <MapPin size={12} className="text-teal-500"/> Cmd: {mgr.assigned_area || 'Not Assigned'}
                      </p>
                  </div>

                  <div className="min-w-[220px] border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 text-right">
                      <div className="mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Payout Plan</p>
                          <p className="text-lg font-black text-white cursor-pointer hover:text-teal-400 transition-colors" title="Click to edit" onClick={() => updateCompensation(mgr.id, mgr.employment_type, mgr.compensation_value)}>
                              {mgr.employment_type === 'salary' ? `₹${mgr.compensation_value}/mo` : `${mgr.compensation_value}% Cut`} <span className="text-slate-600 text-[10px] ml-1">✏️</span>
                          </p>
                          <p className="text-[10px] text-teal-500 font-bold mt-1 uppercase">Wallet: ₹{mgr.wallet_balance || 0}</p>
                      </div>

                      <div className="flex justify-end">
                          {mgr.status !== 'active' ? (
                              <button onClick={() => updateStatus(mgr.id, 'active')} className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors w-full md:w-auto">Approve / Activate</button>
                          ) : (
                              <button onClick={() => updateStatus(mgr.id, 'blocked')} className="bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors w-full md:w-auto flex items-center justify-center gap-2"><XCircle size={14}/> Block Access</button>
                          )}
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}