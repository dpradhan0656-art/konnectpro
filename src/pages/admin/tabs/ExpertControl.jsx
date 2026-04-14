import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { adminResetPassword } from '../../../lib/authAdmin';
import { 
  UserCheck, Search, Phone, MapPin, Plus, Edit, Trash2, X,
  Lock, Briefcase, Loader2, ShieldCheck, Power, PowerOff, Mail
} from 'lucide-react';
import ExpertRegistrationForm from '../../../components/forms/ExpertRegistrationForm';

export default function ExpertControl() {
  const [experts, setExperts] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ Dynamic Categories from DB
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Active roster only — pending / rejected review lives in KYC Verifications tab
  // Legacy Duplicate Approval Flow — status filter toggles (pending | approved | rejected)
  // const [filterStatus, setFilterStatus] = useState('approved');
  const ROSTER_STATUS = 'approved';
  const SHOW_INSTANT_ADD = false;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
      name: '', phone: '', email: '', service_category: '', city: 'Jabalpur', password: ''
  });
  const [pwModal, setPwModal] = useState(null);
  const [pwValue, setPwValue] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetchData();
    // Legacy Duplicate Approval Flow — refetch when filterStatus changed
    // }, [filterStatus]);
  }, []);

  // --- 1. FETCH DATA (Experts + Categories) ---
  const fetchData = async () => {
    setLoading(true);
    
    // A. Fetch Experts (approved active roster only)
    // Legacy Duplicate Approval Flow — .eq('status', filterStatus) when multi-status filters were enabled
    const { data: expData } = await supabase
        .from('experts')
        .select('*')
        .eq('status', ROSTER_STATUS)
        .order('created_at', { ascending: false });
    if (expData) setExperts(expData);

    // B. Fetch Dynamic Categories from Category Master
    const { data: catData } = await supabase.from('categories').select('name').eq('is_active', true);
    if (catData) {
        setCategories(catData);
        if (!formData.service_category && catData.length > 0) {
            setFormData(prev => ({ ...prev, service_category: catData[0].name }));
        }
    }
    setLoading(false);
  };

  // --- 2. UPDATE STATUS (Approve/Block) ---
  // Legacy Duplicate Approval Flow — pending/reject from Expert Army; use KYC Verifications tab instead
  /*
  const handleStatusUpdate = async (id, newStatus) => {
    if(!window.confirm(`Are you sure you want to ${newStatus === 'approved' ? 'Approve' : 'Block'} this expert?`)) return;
    await supabase.from('experts').update({
        status: newStatus,
        is_verified: newStatus === 'approved'
    }).eq('id', id);
    fetchData();
  };
  */

  // --- 3. TOGGLE DUTY (Live/Off-Duty) ---
  const toggleDuty = async (expert) => {
      const { error } = await supabase.from('experts').update({ 
          is_active: !expert.is_active 
      }).eq('id', expert.id);
      if(!error) fetchData();
  };

  // --- 4. SAVE EXPERT ---
  const handleSave = async (e) => {
      e.preventDefault();
      setIsSaving(true);
      const emailTrim = formData.email?.trim().toLowerCase() ?? '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
          alert('Please enter a valid email (required for Expert app Google sign-in).');
          setIsSaving(false);
          return;
      }
      const phoneDigits = String(formData.phone).replace(/\D/g, '').slice(0, 10);
      if (phoneDigits.length !== 10) {
          alert('Phone must be exactly 10 digits.');
          setIsSaving(false);
          return;
      }
      const payload = { 
          name: formData.name.trim(), 
          phone: phoneDigits, 
          email: emailTrim,
          service_category: formData.service_category, 
          city: formData.city.trim() || 'Jabalpur',
      };

      try {
          if (editingId) {
              const { error: upErr } = await supabase.from('experts').update(payload).eq('id', editingId);
              if (upErr) throw upErr;
              if (formData.password?.trim()) {
                  const expert = experts.find(e => e.id === editingId);
                  if (expert?.user_id) {
                      await adminResetPassword(expert.user_id, formData.password);
                  }
              }
          } else {
              const { error: insErr } = await supabase.from('experts').insert([{ 
                  ...payload, 
                  user_id: null,
                  status: 'approved', 
                  is_verified: true,
                  is_active: true // Default Online
              }]);
              if (insErr) throw insErr;
          }
          setIsModalOpen(false); 
          fetchData();
      } catch (err) { alert(err.message || String(err)); } 
      finally { setIsSaving(false); }
  };

  const q = searchTerm.toLowerCase().trim();
  const filteredExperts = experts.filter(exp => 
    !q ||
    exp.name?.toLowerCase().includes(q) || 
    exp.phone?.includes(searchTerm.trim()) ||
    exp.email?.toLowerCase().includes(q)
  );

  const handleQuickPasswordChange = async () => {
    if (!pwModal?.user_id || !pwValue || pwValue.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    setPwLoading(true);
    try {
      await adminResetPassword(pwModal.user_id, pwValue);
      alert('✅ Password changed successfully!');
      setPwModal(null);
      setPwValue('');
    } catch (e) {
      alert('Error: ' + (e?.message || e));
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 font-sans">

      {/*
        Shared pending registration (DeepakHQ → Expert Army tab).
        Pros: same fields/Rules as footer & area head; single insert path with status=pending.
        Cons: separate from “Manual Add” modal which still enlists instantly approved experts for ops.
      */}
      <div className="max-w-xl">
        <ExpertRegistrationForm variant="admin" onSuccess={fetchData} />
      </div>
      
      {/* 🛡️ TOP HEADER PANEL */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl gap-4">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-500">
                <UserCheck size={32} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Expert Army</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active roster · {experts.length} approved</p>
            </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-2">
            {/* Legacy Duplicate Approval Flow — pending / approved / rejected filter chips */}
            {/*
            {['pending', 'approved', 'rejected'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40' : 'text-slate-500 bg-slate-950 hover:bg-slate-800'}`}>
                    {s}
                </button>
            ))}
            */}
            <span className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-teal-600/20 text-teal-400 border border-teal-700/40">
              Approved only
            </span>
            {/*
              Old Inconsistent Form — header “Manual Add” (modal enlisted fewer fields + auto-approved).
              Kept for history; re-enable by changing false → true if you need instant-approved roster adds.
            */}
            {SHOW_INSTANT_ADD ? (
              <button
                type="button"
                onClick={() => { setEditingId(null); setFormData({name:'', phone:'', email:'', service_category: categories[0]?.name || '', city:'Jabalpur', password:''}); setIsModalOpen(true); }}
                className="bg-slate-800 text-teal-300 border border-teal-700/50 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-700 transition-colors"
              >
                <Plus size={14}/> Instant add (approved)
              </button>
            ) : null}
        </div>
      </div>

      {/* 🔍 SEARCH BOX */}
      <div className="relative group">
          <Search className="absolute left-4 top-4 text-slate-500 group-focus-within:text-teal-500 transition-colors" size={20}/>
          <input type="text" placeholder="Search by name, phone, or email..." className="w-full bg-slate-900 border border-slate-800 p-4 pl-12 rounded-2xl text-white outline-none focus:border-teal-500/50 transition-all font-medium placeholder:text-slate-700 shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
      </div>

      {/* 💂‍♂️ EXPERTS GRID */}
      {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-500" size={40}/></div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredExperts.map((exp) => (
              <div key={exp.id} className={`bg-slate-900 border ${exp.is_active ? 'border-slate-800' : 'border-red-900/30 opacity-70'} rounded-[2.5rem] p-6 relative hover:border-teal-500/40 transition-all group overflow-hidden`}>
                
                {/* Status Badge */}
                <div className="absolute top-6 right-6 flex gap-2">
                    <button onClick={() => toggleDuty(exp)} title={exp.is_active ? "Mark Offline" : "Mark Online"} className={`p-2 rounded-lg transition-all ${exp.is_active ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}`}>
                        {exp.is_active ? <Power size={16}/> : <PowerOff size={16}/>}
                    </button>
                </div>

                <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${exp.is_active ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-800 text-slate-500'}`}>
                        {exp.name[0]}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                            {exp.name} 
                            {exp.is_verified && <ShieldCheck size={16} className="text-teal-500" />}
                        </h3>
                        <p className="text-teal-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mt-1">
                            <Briefcase size={12}/> {exp.service_category}
                        </p>
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold bg-slate-950 p-2.5 rounded-xl border border-slate-800/50">
                        <Mail size={14} className="text-slate-600 shrink-0"/> 
                        <span className="truncate" title={exp.email || ''}>{exp.email || '— No email —'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold bg-slate-950 p-2.5 rounded-xl border border-slate-800/50">
                        <Phone size={14} className="text-slate-600"/> {exp.phone}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold p-2.5">
                        <MapPin size={14} className="text-slate-600"/> {exp.city}
                    </div>
                </div>

                {/* 🛠️ ACTIONS — active roster (approved) */}
                <div className="flex gap-2 mt-6">
                    {/* Legacy Duplicate Approval Flow — Approve / Reject when filterStatus === 'pending' */}
                    {/*
                    {filterStatus === 'pending' ? (
                        <>
                            <button onClick={() => handleStatusUpdate(exp.id, 'approved')} className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Approve Force</button>
                            <button onClick={() => handleStatusUpdate(exp.id, 'rejected')} className="px-4 bg-slate-800 text-red-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10">Reject</button>
                        </>
                    ) : (
                    */}
                        <>
                            {exp.user_id && (
                                <button onClick={() => { setPwModal({ name: exp.name, user_id: exp.user_id }); setPwValue(''); }} className="p-3 bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 rounded-xl transition-all" title="Change Password">
                                    <Lock size={16}/>
                                </button>
                            )}
                            <button onClick={() => { setEditingId(exp.id); setFormData({name: exp.name, phone: exp.phone, email: exp.email || '', service_category: exp.service_category, city: exp.city, password: ''}); setIsModalOpen(true); }} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                                <Edit size={14}/> Edit Profile
                            </button>
                            <button onClick={async () => { if(window.confirm("Permanently remove this expert?")) { const { error } = await supabase.from('experts').delete().eq('id', exp.id); if (error) alert("Delete failed: " + error.message); else fetchData(); } }} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                                <Trash2 size={16}/>
                            </button>
                        </>
                    {/*
                    )}
                    */}
                </div>
              </div>
            ))}
          </div>
      )}

      {/* Change Password Modal */}
      {pwModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
              <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border border-slate-800 p-6">
                  <h3 className="font-black text-white uppercase tracking-tight text-xl mb-2 flex items-center gap-2"><Lock className="text-amber-500"/> Change Password</h3>
                  <p className="text-slate-400 text-xs mb-4">Set new password for {pwModal.name}</p>
                  <input type="password" placeholder="New password (min 6 chars)" value={pwValue} onChange={e => setPwValue(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white mb-4 outline-none focus:border-amber-500" minLength={6} />
                  <div className="flex gap-2">
                      <button onClick={() => { setPwModal(null); setPwValue(''); }} className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold">Cancel</button>
                      <button onClick={handleQuickPasswordChange} disabled={pwLoading || pwValue.length < 6} className="flex-1 bg-amber-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">{pwLoading ? 'Updating...' : 'Update'}</button>
                  </div>
              </div>
          </div>
      )}

      {/* 📝 ADD/EDIT MODAL */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
              <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-800 shadow-2xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
                  <div className="flex justify-between items-start gap-3 mb-6">
                      <div>
                        <h3 className="font-black text-white uppercase tracking-tight text-xl">{editingId ? 'Edit Profile' : 'Enlist Expert'}</h3>
                        {editingId ? (
                          <p className="text-[10px] text-teal-400/90 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                            Login email (Expert app) — edit below and save
                          </p>
                        ) : null}
                      </div>
                      <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors shrink-0"><X className="text-slate-500"/></button>
                  </div>

                  <form onSubmit={handleSave} className="space-y-5">
                      <div className="space-y-1 rounded-2xl border border-teal-500/40 bg-teal-950/20 p-4">
                          <label className="text-[10px] font-bold text-teal-400 uppercase ml-0.5 flex items-center gap-1.5 tracking-wide">
                            <Mail size={14} className="shrink-0" />
                            Email address <span className="text-slate-500 font-semibold normal-case tracking-normal">(required — same as Google on phone)</span>
                          </label>
                          <input
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            className="w-full bg-slate-950 border border-teal-600/50 rounded-xl p-3.5 text-white font-bold focus:border-teal-400 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                            placeholder="name@gmail.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                      </div>

                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Full Name</label>
                          <input className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold focus:border-teal-500 outline-none transition-all" placeholder="Enter name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required/>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Mobile Number</label>
                            <input className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold focus:border-teal-500 outline-none transition-all" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required/>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Work City</label>
                            <input className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold focus:border-teal-500 outline-none transition-all" placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}/>
                        </div>
                      </div>

                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Primary Skill / Category</label>
                          <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-black appearance-none outline-none focus:border-teal-500 transition-all cursor-pointer" value={formData.service_category} onChange={e => setFormData({...formData, service_category: e.target.value})}>
                              {categories.map(cat => <option key={cat.name} value={cat.name} className="font-bold">{cat.name}</option>)}
                          </select>
                      </div>

                      <div className="pt-4 border-t border-slate-800">
                          <label className="text-[10px] font-bold text-teal-500 uppercase flex items-center gap-1 mb-2"><Lock size={12}/> {editingId ? 'Reset Password (Leave blank to keep same)' : 'Set Password'}</label>
                          <input className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-black tracking-widest outline-none focus:border-teal-500" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingId}/>
                      </div>

                      <button disabled={isSaving} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-teal-900/40 uppercase tracking-widest text-xs mt-4 active:scale-95 transition-all">
                        {isSaving ? <Loader2 className="animate-spin mx-auto" size={20}/> : editingId ? 'Update Force Member' : 'Deploy to Army'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}