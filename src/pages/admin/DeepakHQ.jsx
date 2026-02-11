import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Shield, Users, DollarSign, Settings, Check, X, Key, Map, Save, Activity } from 'lucide-react';

export default function DeepakHQ() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, revenue: 0 });
  const [experts, setExperts] = useState([]);
  const [salaryRules, setSalaryRules] = useState([]);
  const [newRule, setNewRule] = useState({ state: '', city: '', percentage: 20 });
  
  // States and Cities Data (Dropdown ke liye)
  const locations = {
    "Madhya Pradesh": ["Jabalpur", "Bhopal", "Indore", "Sagar", "Rewa"],
    "Uttar Pradesh": ["Jhansi", "Lucknow", "Kanpur", "Varanasi"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur"]
  };

  useEffect(() => {
    checkAdmin();
    fetchData();
  }, []);

  const checkAdmin = () => {
    const isAdmin = localStorage.getItem('adminAuth');
    if (!isAdmin) navigate('/login');
  };

  const fetchData = async () => {
    // 1. Fetch Experts
    const { data: expData } = await supabase.from('experts').select('*').order('created_at', { ascending: false });
    setExperts(expData || []);
    
    // 2. Fetch Salary Rules
    const { data: ruleData } = await supabase.from('salary_rules').select('*');
    setSalaryRules(ruleData || []);

    // 3. Calc Stats
    if(expData) {
        setStats({
            total: expData.length,
            verified: expData.filter(e => e.kyc_status === 'verified').length,
            pending: expData.filter(e => e.kyc_status === 'pending').length,
            revenue: expData.reduce((acc, curr) => acc + (curr.wallet_balance || 0), 0)
        });
    }
  };

  // --- ACTIONS ---

  // 1. Approve/Reject Expert
  const handleExpertAction = async (id, status) => {
    const reason = status === 'rejected' ? prompt("Enter rejection reason:") : null;
    if (status === 'rejected' && !reason) return;

    const { error } = await supabase.from('experts').update({ kyc_status: status, rejected_reason: reason }).eq('id', id);
    if (!error) {
        alert(`Expert ${status.toUpperCase()} Successfully!`);
        fetchData();
    }
  };

  // 2. Reset Password (Simulation)
  const handleResetPass = (expertName) => {
    const newPass = Math.floor(100000 + Math.random() * 900000);
    alert(`🔐 NEW PASSWORD GENERATED\n\nUser: ${expertName}\nPass: ${newPass}\n\n(Send this via WhatsApp)`);
  };

  // 3. Add Salary Rule (Dynamic Logic)
  const handleAddRule = async () => {
    if (!newRule.state || !newRule.city) return alert("Select State and City");
    
    const { error } = await supabase.from('salary_rules').insert({
        state: newRule.state,
        city: newRule.city,
        commission_percentage: newRule.percentage
    });

    if (!error) {
        alert("Salary Rule Set Successfully!");
        setNewRule({ state: '', city: '', percentage: 20 });
        fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      
      {/* GOD MODE HEADER */}
      <div className="bg-black border-b border-teal-900 p-4 sticky top-0 z-50 flex justify-between items-center shadow-2xl shadow-teal-900/20">
        <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2 rounded-lg animate-pulse">
                <Shield size={24} className="text-white" />
            </div>
            <div>
                <h1 className="text-xl font-black tracking-widest uppercase">Konnect<span className="text-teal-500">Pro</span> HQ</h1>
                <p className="text-[10px] text-teal-400 font-bold tracking-[0.2em]">FOUNDER COMMAND CENTER</p>
            </div>
        </div>
        <button onClick={() => {localStorage.removeItem('adminAuth'); navigate('/login')}} className="bg-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700">EXIT GOD MODE</button>
      </div>

      <div className="flex">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-64 min-h-screen bg-slate-950 border-r border-slate-800 p-4 hidden md:block">
            <div className="space-y-2">
                <NavBtn icon={<Activity/>} label="Dashboard" active={activeTab==='dashboard'} onClick={()=>setActiveTab('dashboard')}/>
                <NavBtn icon={<Users/>} label="Expert Control" active={activeTab==='experts'} onClick={()=>setActiveTab('experts')}/>
                <NavBtn icon={<DollarSign/>} label="Salary Logic" active={activeTab==='salary'} onClick={()=>setActiveTab('salary')}/>
                <NavBtn icon={<Settings/>} label="App Settings" active={activeTab==='settings'} onClick={()=>setActiveTab('settings')}/>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 p-8 bg-slate-900">
            
            {/* VIEW 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">🇮🇳 Global Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard title="Total Army" value={stats.total} color="bg-blue-600" />
                        <StatCard title="Verified" value={stats.verified} color="bg-green-600" />
                        <StatCard title="Pending" value={stats.pending} color="bg-amber-600" />
                        <StatCard title="Wallet Balance" value={`₹${stats.revenue}`} color="bg-purple-600" />
                    </div>
                    {/* Heatmap Placeholder */}
                    <div className="bg-slate-800 h-96 rounded-2xl border border-slate-700 flex items-center justify-center">
                        <p className="text-slate-500 font-bold">🗺️ India Heatmap Loading...</p>
                    </div>
                </div>
            )}

            {/* VIEW 2: EXPERT CONTROL (Approvals & Passwords) */}
            {activeTab === 'experts' && (
                <div>
                    <h2 className="text-2xl font-bold mb-6">👮 Expert Approvals</h2>
                    <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="p-4">Name & ID</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {experts.map(expert => (
                                    <tr key={expert.id} className="hover:bg-slate-700/50">
                                        <td className="p-4">
                                            <div className="font-bold">{expert.name}</div>
                                            <div className="text-xs text-slate-400">{expert.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${expert.kyc_status === 'verified' ? 'bg-green-900 text-green-400' : 'bg-amber-900 text-amber-400'}`}>
                                                {expert.kyc_status}
                                            </span>
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            {expert.kyc_status === 'pending' && (
                                                <>
                                                    <button onClick={()=>handleExpertAction(expert.id, 'verified')} className="bg-green-600 p-2 rounded hover:bg-green-500" title="Approve"><Check size={16}/></button>
                                                    <button onClick={()=>handleExpertAction(expert.id, 'rejected')} className="bg-red-600 p-2 rounded hover:bg-red-500" title="Reject"><X size={16}/></button>
                                                </>
                                            )}
                                            <button onClick={()=>handleResetPass(expert.name)} className="bg-blue-600 p-2 rounded hover:bg-blue-500" title="Reset Password"><Key size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* VIEW 3: SALARY LOGIC (Dynamic Percentages) */}
            {activeTab === 'salary' && (
                <div>
                    <h2 className="text-2xl font-bold mb-6">💰 Dynamic Salary Configuration</h2>
                    
                    {/* Add Rule Form */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8">
                        <h3 className="font-bold text-teal-400 mb-4 uppercase text-sm">Set New Rule</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Select State</label>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm"
                                    onChange={(e) => setNewRule({...newRule, state: e.target.value, city: ''})}
                                >
                                    <option value="">-- State --</option>
                                    {Object.keys(locations).map(state => <option key={state} value={state}>{state}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Select City</label>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm"
                                    disabled={!newRule.state}
                                    onChange={(e) => setNewRule({...newRule, city: e.target.value})}
                                >
                                    <option value="">-- City --</option>
                                    {newRule.state && locations[newRule.state].map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Area Manager Commission %</label>
                                <input 
                                    type="number" 
                                    value={newRule.percentage}
                                    onChange={(e) => setNewRule({...newRule, percentage: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm"
                                />
                            </div>
                            <button onClick={handleAddRule} className="bg-teal-600 hover:bg-teal-500 text-white p-2 rounded font-bold flex justify-center items-center gap-2">
                                <Save size={16}/> Set Rule
                            </button>
                        </div>
                    </div>

                    {/* Active Rules List */}
                    <h3 className="font-bold text-slate-400 mb-4 uppercase text-sm">Active Rules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {salaryRules.map(rule => (
                            <div key={rule.id} className="bg-slate-800 p-4 rounded-xl border border-slate-600 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-white">{rule.city}, {rule.state}</p>
                                    <p className="text-xs text-slate-400">Fixed Salary Base + Commission</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-amber-500">{rule.commission_percentage}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* VIEW 4: SETTINGS (Theme Control) */}
            {activeTab === 'settings' && (
                <div>
                     <h2 className="text-2xl font-bold mb-6">⚙️ Global Settings</h2>
                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-white">App Color Theme</h3>
                                <p className="text-xs text-slate-400">Changes reflect on Customer App immediately.</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-full bg-teal-600 ring-2 ring-white"></button>
                                <button className="w-8 h-8 rounded-full bg-blue-600 opacity-50"></button>
                                <button className="w-8 h-8 rounded-full bg-purple-600 opacity-50"></button>
                            </div>
                        </div>
                     </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}

// Helper Components
const NavBtn = ({ icon, label, active, onClick }) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/50' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
    >
        {icon} <span className="font-bold text-sm">{label}</span>
    </button>
);

const StatCard = ({ title, value, color }) => (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{title}</h3>
        <p className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400`}>{value}</p>
        <div className={`h-1 w-full mt-4 rounded-full ${color}`}></div>
    </div>
);