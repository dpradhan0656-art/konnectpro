import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Shield, Users, DollarSign, Settings, Check, X, Key, 
  MapPin, Save, Activity, Calendar, Wallet, 
  Megaphone, AlertTriangle, UserPlus, LogOut, Trash2, Menu, 
  Search, Download, FileText, Clock, Phone, Edit, Eye, EyeOff, Percent, RefreshCw, BarChart3
} from 'lucide-react';

// 🇮🇳 ALL INDIAN STATES LIST
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli", "Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function DeepakHQ() {
  const navigate = useNavigate();
  
  // --- STATES ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 🔥 MOCK DATA WITH CITIES FOR REVENUE TRACKING
  const [bookings, setBookings] = useState([
      { id: 101, customer_name: 'Amit Jain', customer_city: 'Jabalpur', service_name: 'AC Repair', price: '500', status: 'Confirmed', created_at: new Date().toISOString() }, // Today
      { id: 102, customer_name: 'Priya Sharma', customer_city: 'Bhopal', service_name: 'Salon', price: '1200', status: 'Completed', created_at: new Date().toISOString() }, // Today
      { id: 103, customer_name: 'Rahul Verma', customer_city: 'Jabalpur', service_name: 'Plumbing', price: '300', status: 'Completed', created_at: '2023-10-01' }, // Old date example
      { id: 104, customer_name: 'Sneha Gupta', customer_city: 'Indore', service_name: 'Cleaning', price: '800', status: 'Confirmed', created_at: new Date().toISOString() } // Today
  ]);

  const [experts, setExperts] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]); 
  
  const [salaryRules, setSalaryRules] = useState([
      { id: 1, city: 'Jabalpur', state: 'Madhya Pradesh', commission_percentage: '50' },
      { id: 2, city: 'Nagpur', state: 'Maharashtra', commission_percentage: '25' },
      { id: 3, city: 'Sagar', state: 'Madhya Pradesh', commission_percentage: '50' }
  ]); 
  const [payroll, setPayroll] = useState([]); 
  
  // STAFF STATE
  const [staff, setStaff] = useState([
    { 
        id: 1, name: 'Ravi Kumar', role: 'Area Head', mobile: '9876543210', password: 'Ravi@123', 
        area: 'Jabalpur North', paymentType: 'Percent', paymentValue: '15' 
    },
    { 
        id: 2, name: 'Suresh Singh', role: 'Support', mobile: '9123456789', password: 'Support@2026', 
        area: 'HQ Desk', paymentType: 'Fixed', paymentValue: '15000' 
    }
  ]);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Forms
  const [newRule, setNewRule] = useState({ state: '', city: '', percentage: '' });
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [themeColor, setThemeColor] = useState('teal'); 

  // --- LOGIC: CITY REVENUE CALCULATION ---
  const getCityStats = () => {
      const stats = {};
      
      bookings.forEach(booking => {
          const city = booking.customer_city || 'Unknown';
          const price = Number(booking.price) || 0;
          const date = new Date(booking.created_at);
          const today = new Date();

          if (!stats[city]) stats[city] = { today: 0, month: 0 };

          // Calculate Today's Income
          if (date.toDateString() === today.toDateString()) {
              stats[city].today += price;
          }

          // Calculate Monthly Income
          if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
              stats[city].month += price;
          }
      });

      // Convert to array and sort by Monthly Income (High to Low)
      return Object.entries(stats).map(([city, data]) => ({ city, ...data })).sort((a, b) => b.month - a.month);
  };
  
  const cityStats = getCityStats();

  // --- INITIAL CHECK & DATA FETCHING ---
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
        setIsAuthenticated(true);
        fetchData(); 
        setupRealtimeListener();
        addLog('System', 'Admin logged in');
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
        const { data: bData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if(bData) setBookings(bData);

        const { data: eData } = await supabase.from('experts').select('*').order('created_at', { ascending: false });
        setExperts(eData || []);

        if(eData) {
            const mockPayroll = eData.map(exp => ({
                id: exp.id, name: exp.name, phone: exp.phone,
                totalJobs: Math.floor(Math.random() * 20), 
                earnings: Math.floor(Math.random() * 15000),
                status: 'Unpaid'
            }));
            setPayroll(mockPayroll);
        }
    } catch (error) {
        console.error("Data Fetch Error:", error);
    }
  };

  const setupRealtimeListener = () => {
    const sub = supabase.channel('bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, payload => {
        setBookings(curr => [payload.new, ...curr]);
        addLog('System', `New Order Received: ${payload.new.customer_name}`);
        alert("🔔 Tring Tring! New Order Received!");
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); }
  };

  const addLog = (user, action) => {
      const newLog = { id: Date.now(), user, action, time: new Date().toLocaleTimeString() };
      setRecentLogs(prev => [newLog, ...prev].slice(0, 10));
  };

  const handleExport = (data, filename) => {
      const csvContent = "data:text/csv;charset=utf-8," + 
          Object.keys(data[0]).join(",") + "\n" +
          data.map(row => Object.values(row).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      addLog('Admin', `Exported ${filename}`);
  };

  // --- ACTIONS ---

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === 'Founder2026') { 
        localStorage.setItem('adminAuth', 'true');
        setIsAuthenticated(true);
    } else {
        setError('⛔ Incorrect Password!');
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('adminAuth');
      setIsAuthenticated(false);
      setPasscode('');
      navigate('/'); 
  };

  const handleExpertAction = async (id, type) => {
    if(type === 'verify') { await supabase.from('experts').update({ kyc_status: 'verified' }).eq('id', id); addLog('Admin', `Verified Expert ${id}`); }
    if(type === 'reject') { await supabase.from('experts').update({ kyc_status: 'rejected' }).eq('id', id); addLog('Admin', `Rejected Expert ${id}`); }
    if(type === 'reset_pass') alert(`🔐 New Password sent to Expert via SMS`);
    fetchData(); 
  };

  const handleSaveRule = async () => {
      if(!newRule.state || !newRule.city || !newRule.percentage) return alert("Fill all fields");

      if (editingRuleId) {
          setSalaryRules(salaryRules.map(rule => 
              rule.id === editingRuleId 
              ? { ...rule, state: newRule.state, city: newRule.city, commission_percentage: newRule.percentage }
              : rule
          ));
          addLog('Admin', `Updated Rule for: ${newRule.city}`);
      } else {
          const newId = Date.now(); 
          setSalaryRules([...salaryRules, { id: newId, state: newRule.state, city: newRule.city, commission_percentage: newRule.percentage }]);
          addLog('Admin', `Added Commission Rule: ${newRule.city}`);
      }
      setNewRule({ state: '', city: '', percentage: '' });
      setEditingRuleId(null);
  };

  const handleEditRuleClick = (rule) => {
      setNewRule({ state: rule.state, city: rule.city, percentage: rule.commission_percentage });
      setEditingRuleId(rule.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRule = (id) => {
      if(window.confirm("Delete this rule?")) {
        setSalaryRules(salaryRules.filter(r => r.id !== id));
        addLog('Admin', `Deleted Rule ID: ${id}`);
      }
  };

  const handleSaveStaff = (e) => {
    e.preventDefault();
    if(!editingStaff.name || !editingStaff.mobile || !editingStaff.password || !editingStaff.paymentValue) return alert("All fields are required!");
    
    if (editingStaff.id) {
        setStaff(staff.map(s => s.id === editingStaff.id ? editingStaff : s));
        addLog('Admin', `Updated Staff: ${editingStaff.name}`);
    } else {
        setStaff([...staff, { ...editingStaff, id: Date.now() }]);
        addLog('Admin', `Added New Staff: ${editingStaff.name}`);
    }
    setEditingStaff(null);
  };

  const handleBroadcast = () => {
    if(!broadcastMsg) return;
    alert(`📢 Broadcast Sent!`);
    addLog('Admin', 'Sent Global Broadcast');
    setBroadcastMsg('');
  };

  const handlePaySalary = (id) => {
    alert(`💸 Salary Transferred`);
    setPayroll(payroll.map(p => p.id === id ? {...p, status: 'Paid'} : p));
    addLog('Admin', `Paid Salary to ID: ${id}`);
  };

  const onNavClick = (tabName) => {
    setActiveTab(tabName);
    setIsMobileMenuOpen(false);
    setSearchTerm('');
  };

  const filterData = (data) => {
      if (!searchTerm) return data;
      return data.filter(item => 
          Object.values(item).some(val => 
              String(val).toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
  };

  // --- 🛑 LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-teal-500/50 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-amber-500"></div>
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-black rounded-full border border-teal-500 text-teal-500 shadow-lg shadow-teal-500/20"><Shield size={40} /></div>
                </div>
                <h2 className="text-2xl font-black mb-2 tracking-widest uppercase">Deepak<span className="text-teal-500">HQ</span></h2>
                <p className="text-xs text-slate-400 mb-6 uppercase tracking-wider">Top Secret Clearance Required</p>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Founder Access Code" className="w-full p-3 bg-black rounded-xl border border-slate-700 text-center text-xl tracking-[0.3em] font-bold text-teal-400 focus:outline-none focus:border-teal-500" autoFocus />
                    {error && <p className="text-red-500 text-xs font-bold bg-red-900/20 p-2 rounded border border-red-500/20 animate-pulse">{error}</p>}
                    <button className="w-full bg-teal-600 hover:bg-teal-500 py-3 rounded-xl font-bold shadow-lg shadow-teal-900/50 uppercase transition-all tracking-widest">Unlock System</button>
                </form>
            </div>
        </div>
    );
  }

  // --- 🟢 DASHBOARD ---
  return (
    <div className={`min-h-screen bg-slate-900 text-white font-sans theme-${themeColor} flex flex-col`}>
      
      {/* HEADER */}
      <div className="bg-black border-b border-gray-800 p-4 sticky top-0 z-40 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-300 hover:text-white">
                {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
            <div className={`p-2 rounded-lg bg-${themeColor}-600`}> <Shield size={24} /> </div>
            <div>
                <h1 className="text-xl font-black tracking-widest uppercase hidden md:block">Konnect<span className={`text-${themeColor}-500`}>Pro</span> HQ</h1>
                <h1 className="text-lg font-black tracking-widest uppercase md:hidden">HQ</h1>
            </div>
        </div>
        
        {/* GLOBAL SEARCH BAR */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
             <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
             <input type="text" placeholder="Search Experts, Orders, Staff..." className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-all">
            <LogOut size={14}/> <span className="hidden md:inline">LOGOUT</span>
        </button>
      </div>

      <div className="flex flex-1 relative">
        {/* MOBILE MENU & SIDEBAR */}
        {isMobileMenuOpen && (<div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>)}
        <div className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-black border-r border-gray-800 p-2 transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:block ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex justify-between items-center p-4 md:hidden mb-4 border-b border-gray-800"><span className="font-bold text-teal-500 text-lg">MENU</span><button onClick={() => setIsMobileMenuOpen(false)}><X size={24}/></button></div>
            <div className="space-y-1 md:sticky md:top-24">
                <NavBtn icon={<Activity/>} label="Command Center" active={activeTab==='dashboard'} onClick={()=>onNavClick('dashboard')}/>
                <NavBtn icon={<Users/>} label="Expert Army" active={activeTab==='experts'} onClick={()=>onNavClick('experts')}/>
                <NavBtn icon={<Wallet/>} label="Payroll System" active={activeTab==='payroll'} onClick={()=>onNavClick('payroll')}/>
                <NavBtn icon={<DollarSign/>} label="Commission Logic" active={activeTab==='salary'} onClick={()=>onNavClick('salary')}/>
                <NavBtn icon={<UserPlus/>} label="Area Heads & Staff" active={activeTab==='staff'} onClick={()=>onNavClick('staff')}/>
                <NavBtn icon={<Megaphone/>} label="Broadcast" active={activeTab==='broadcast'} onClick={()=>onNavClick('broadcast')}/>
                <NavBtn icon={<Settings/>} label="Settings & Theme" active={activeTab==='settings'} onClick={()=>onNavClick('settings')}/>
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-4 md:p-6 bg-slate-900 min-h-screen w-full overflow-hidden">
            
            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <h2 className="text-2xl font-bold flex items-center gap-2">🇮🇳 Live Operations</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard title="Orders" value={bookings.length} color="blue" icon={<Calendar/>}/>
                        <StatCard title="Revenue" value={`₹${bookings.reduce((a,b)=>a+(Number(b.price)||0),0)}`} color="green" icon={<Wallet/>}/>
                        <StatCard title="Experts" value={experts.length} color="purple" icon={<Users/>}/>
                        <StatCard title="System Health" value="100%" color="teal" icon={<Activity/>}/>
                    </div>
                    
                    {/* 🔥 NEW FEATURE: CITY WISE PERFORMANCE REPORT 🔥 */}
                    <div className="bg-slate-800 rounded-xl overflow-hidden border border-teal-500/50 shadow-lg shadow-teal-900/20 mt-6">
                        <div className="p-4 bg-teal-900/20 border-b border-teal-500/30 flex justify-between items-center">
                            <span className="font-bold text-sm uppercase text-teal-400 flex items-center gap-2"><BarChart3 size={16}/> City-Wise Income Report</span>
                            <span className="text-[10px] bg-teal-900 text-teal-400 px-2 py-1 rounded">LIVE TRACKING</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-black text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="p-4">City</th>
                                        <th className="p-4 text-right">Today's Income</th>
                                        <th className="p-4 text-right">This Month</th>
                                        <th className="p-4 text-center">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {cityStats.length > 0 ? cityStats.map((stat, index) => (
                                        <tr key={index} className="hover:bg-slate-700/50 transition-colors">
                                            <td className="p-4 font-bold text-white">{stat.city}</td>
                                            <td className="p-4 text-right font-mono text-green-400">₹{stat.today}</td>
                                            <td className="p-4 text-right font-mono text-amber-400 font-bold">₹{stat.month}</td>
                                            <td className="p-4 text-center">
                                                {stat.month > 1000 ? <span className="text-green-500 text-xs">▲ High</span> : <span className="text-gray-500 text-xs">● Stable</span>}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="p-4 text-center text-gray-500">No Revenue Data Yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Orders & Logs */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                            <div className="p-4 bg-black/50 border-b border-slate-700 flex justify-between items-center">
                                <span className="font-bold text-xs uppercase text-slate-400">Incoming Orders</span>
                                <button onClick={() => handleExport(bookings, 'orders')} className="text-teal-400 hover:text-teal-300 flex items-center gap-1 text-xs font-bold"><Download size={12}/> EXPORT CSV</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-black text-gray-400 uppercase text-xs"><tr><th className="p-4">Customer (City)</th><th className="p-4">Service</th><th className="p-4">Status</th></tr></thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {filterData(bookings).slice(0, 5).map(b => (
                                            <tr key={b.id} className="hover:bg-slate-700/50">
                                                <td className="p-4">
                                                    <div className="font-bold">{b.customer_name}</div>
                                                    <div className="text-xs text-gray-400">{b.customer_city}</div>
                                                </td>
                                                <td className="p-4">{b.service_name}</td>
                                                <td className="p-4 text-green-400">{b.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                             <h3 className="font-bold text-xs uppercase text-slate-400 mb-4 flex items-center gap-2"><Clock size={14}/> Recent Activity</h3>
                             <div className="space-y-4">
                                {recentLogs.length === 0 && <p className="text-gray-500 text-sm">No activity yet.</p>}
                                {recentLogs.map(log => (
                                    <div key={log.id} className="flex gap-3 items-start border-l-2 border-slate-600 pl-3">
                                        <div><p className="text-sm font-bold text-white">{log.action}</p><p className="text-[10px] text-gray-400">{log.user} • {log.time}</p></div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: EXPERTS */}
            {activeTab === 'experts' && (
                <div className="animate-in fade-in duration-500">
                      <div className="flex justify-between items-center mb-4">
                          <h2 className="text-2xl font-bold">👮 Expert Control</h2>
                          <div className="flex gap-2">
                             <input type="text" placeholder="Search..." className="bg-slate-800 p-2 rounded text-sm md:hidden w-32" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
                             <button onClick={() => handleExport(experts, 'experts_list')} className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-xs font-bold flex items-center gap-2 border border-slate-600"><FileText size={14}/> Export</button>
                          </div>
                      </div>
                      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-black text-gray-400 uppercase text-xs">
                                    <tr><th className="p-4">Expert</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filterData(experts).map(e => (
                                        <tr key={e.id} className="hover:bg-slate-700/50">
                                            <td className="p-4 font-bold">{e.name}<div className="text-xs text-gray-400">{e.phone}</div></td>
                                            <td className="p-4"><Badge status={e.kyc_status}/></td>
                                            <td className="p-4 flex gap-2">
                                                <button onClick={()=>handleExpertAction(e.id, 'verify')} className="bg-green-600 p-1.5 rounded hover:bg-green-500"><Check size={14}/></button>
                                                <button onClick={()=>handleExpertAction(e.id, 'reject')} className="bg-red-600 p-1.5 rounded hover:bg-red-500"><X size={14}/></button>
                                                <button onClick={()=>handleExpertAction(e.id, 'reset_pass')} className="bg-blue-600 p-1.5 rounded hover:bg-blue-500" title="Reset Pass"><Key size={14}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: COMMISSION (WITH EDIT OPTION) */}
            {activeTab === 'salary' && (
                <div className="animate-in fade-in duration-500">
                    <h2 className="text-2xl font-bold mb-6">💰 Dynamic Salary</h2>
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
                        <h3 className="font-bold text-teal-400 text-xs uppercase mb-4">{editingRuleId ? 'Edit Existing Rule' : 'Set New Rule'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div><label className="text-xs text-slate-400 mb-1 block">State</label><input list="indian-states" className="bg-slate-900 border border-slate-600 rounded p-2 w-full text-sm" value={newRule.state} onChange={(e) => setNewRule({...newRule, state: e.target.value})} /><datalist id="indian-states">{INDIAN_STATES.map(s => <option key={s} value={s} />)}</datalist></div>
                            <div><label className="text-xs text-slate-400 mb-1 block">City</label><input type="text" className="bg-slate-900 border border-slate-600 rounded p-2 w-full text-sm" value={newRule.city} onChange={(e) => setNewRule({...newRule, city: e.target.value})} /></div>
                            <div><label className="text-xs text-slate-400 mb-1 block">Comm %</label><input type="number" className="bg-slate-900 border border-slate-600 rounded p-2 w-full text-sm" value={newRule.percentage} onChange={(e) => setNewRule({...newRule, percentage: e.target.value})} /></div>
                            <div className="flex gap-2">
                                <button onClick={handleSaveRule} className={`${editingRuleId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-teal-600 hover:bg-teal-500'} p-2 rounded font-bold text-sm flex items-center justify-center gap-2 flex-1`}>
                                    {editingRuleId ? <RefreshCw size={16}/> : <Save size={16}/>} {editingRuleId ? 'Update Rule' : 'Save'}
                                </button>
                                {editingRuleId && (
                                    <button onClick={() => {setEditingRuleId(null); setNewRule({ state: '', city: '', percentage: '' });}} className="bg-gray-700 p-2 rounded hover:bg-gray-600">
                                        <X size={16}/>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {salaryRules.map(rule => (
                            <div key={rule.id} className={`bg-slate-800 p-4 rounded-xl border ${editingRuleId === rule.id ? 'border-amber-500 shadow-lg shadow-amber-500/10' : 'border-slate-600'} flex justify-between items-center relative group`}>
                                <div><p className="font-bold text-white">{rule.city}</p><p className="text-xs text-slate-400">{rule.state}</p></div>
                                <div className="text-2xl font-black text-amber-500">{rule.commission_percentage}%</div>
                                <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditRuleClick(rule)} className="text-blue-400 hover:bg-slate-700 p-1 rounded"><Edit size={14}/></button>
                                    <button onClick={() => handleDeleteRule(rule.id)} className="text-red-500 hover:bg-slate-700 p-1 rounded"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 4: PAYROLL */}
            {activeTab === 'payroll' && (
                <div className="animate-in fade-in duration-500">
                    <h2 className="text-2xl font-bold mb-6">💸 Payroll</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filterData(payroll).map(p => (
                            <div key={p.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col gap-3">
                                <div className="flex justify-between items-start"><div><h3 className="font-bold text-lg">{p.name}</h3><p className="text-xs text-slate-400">{p.phone}</p></div><div className="bg-slate-700 px-2 py-1 rounded text-xs font-bold text-slate-300">{p.totalJobs} Jobs</div></div>
                                <div className="border-t border-slate-700 pt-3 flex justify-between items-center"><p className="text-2xl font-black text-white">₹{p.earnings}</p>{p.status === 'Paid' ? <span className="text-xs bg-green-900/50 text-green-400 border border-green-500/50 px-2 py-1 rounded font-bold">PAID ✅</span> : <button onClick={()=>handlePaySalary(p.id)} className="bg-teal-600 hover:bg-teal-500 px-3 py-1 rounded text-xs font-bold shadow-lg shadow-teal-900/50">PAY</button>}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 5: STAFF */}
            {activeTab === 'staff' && (
                <div className="animate-in fade-in duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">👥 Team <span className="hidden md:inline text-gray-500 text-sm font-normal">| Area Heads</span></h2>
                        {!editingStaff && (
                            <button onClick={()=>setEditingStaff({ id: null, name: '', role: 'Area Head', mobile: '', password: '', area: '', paymentType: 'Fixed', paymentValue: '' })} className="bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded font-bold text-sm flex gap-2 items-center shadow-lg shadow-teal-900/50"><UserPlus size={16}/> Add New</button>
                        )}
                    </div>

                    {editingStaff ? (
                        <div className="bg-slate-800 p-6 rounded-xl border border-teal-500/30 max-w-2xl mx-auto shadow-2xl">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4"><h3 className="font-bold text-xl text-teal-400">{editingStaff.id ? '✏️ Edit Profile' : '➕ Add New Profile'}</h3><button onClick={() => setEditingStaff(null)} className="text-gray-400 hover:text-white"><X size={24}/></button></div>
                            <form onSubmit={handleSaveStaff} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Full Name</label><input required type="text" value={editingStaff.name} onChange={(e)=>setEditingStaff({...editingStaff, name: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-teal-500 outline-none" /></div>
                                    <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Mobile (Login ID)</label><input required type="tel" value={editingStaff.mobile} onChange={(e)=>setEditingStaff({...editingStaff, mobile: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-teal-500 outline-none" /></div>
                                    
                                    {/* PASSWORD FIELD (MANUAL) */}
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Set Password (Manual)</label>
                                        <div className="relative">
                                            <input required type={showPassword ? "text" : "password"} value={editingStaff.password} onChange={(e)=>setEditingStaff({...editingStaff, password: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-teal-500 outline-none" placeholder="Create Password" />
                                            <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-white">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                                        </div>
                                    </div>
                                    <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Role</label><select value={editingStaff.role} onChange={(e)=>setEditingStaff({...editingStaff, role: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-teal-500 outline-none"><option value="Area Head">Area Head</option><option value="Support">Support Staff</option><option value="Admin">Admin</option></select></div>
                                </div>
                                
                                {/* PAYMENT MODEL SELECTOR */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-700/30 p-4 rounded-xl border border-slate-600">
                                     <div className="md:col-span-2 text-xs font-bold text-teal-400 uppercase mb-2">Payment & Compensation Model</div>
                                     <div>
                                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Payment Mode</label>
                                        <select value={editingStaff.paymentType} onChange={(e)=>setEditingStaff({...editingStaff, paymentType: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-teal-500 outline-none">
                                            <option value="Fixed">Fixed Salary (Monthly)</option>
                                            <option value="Percent">Profit Share (%)</option>
                                        </select>
                                     </div>
                                     <div>
                                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">{editingStaff.paymentType === 'Fixed' ? 'Amount (₹)' : 'Percentage (%)'}</label>
                                        <div className="relative">
                                            <input required type="number" value={editingStaff.paymentValue} onChange={(e)=>setEditingStaff({...editingStaff, paymentValue: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-teal-500 outline-none" placeholder={editingStaff.paymentType === 'Fixed' ? '25000' : '15'} />
                                            <div className="absolute right-3 top-3 text-gray-400 font-bold">{editingStaff.paymentType === 'Fixed' ? '₹' : '%'}</div>
                                        </div>
                                     </div>
                                </div>

                                <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Assigned Area</label><input type="text" value={editingStaff.area} onChange={(e)=>setEditingStaff({...editingStaff, area: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-teal-500 outline-none" /></div>
                                
                                <div className="flex gap-3 pt-4"><button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-500 py-3 rounded font-bold text-sm shadow-lg shadow-teal-900/50 flex justify-center items-center gap-2"><Save size={18}/> Save Profile</button><button type="button" onClick={() => setEditingStaff(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded font-bold text-sm">Cancel</button></div>
                            </form>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filterData(staff).map(s => (
                                <div key={s.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col gap-4 group hover:border-teal-500/50 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${s.role==='Area Head' ? 'bg-purple-900 text-purple-300' : 'bg-slate-700 text-gray-300'}`}>{s.name.charAt(0)}</div>
                                            <div><p className="font-bold text-lg">{s.name}</p><p className="text-xs text-teal-400 font-bold uppercase tracking-wider bg-teal-900/30 px-2 py-0.5 rounded w-fit">{s.role}</p></div>
                                        </div>
                                        <div className="flex gap-2">
                                             <button onClick={() => setEditingStaff({...s})} className="p-2 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"><Edit size={16}/></button>
                                             <button onClick={() => {if(window.confirm("Remove staff?")) setStaff(staff.filter(st=>st.id!==s.id))}} className="p-2 rounded bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 border-t border-gray-700 pt-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-300"><MapPin size={14} className="text-gray-500"/> <span className="truncate">{s.area || 'No Area Assigned'}</span></div>
                                        <div className="flex items-center gap-2 text-sm text-gray-300"><Phone size={14} className="text-gray-500"/> <span>{s.mobile || 'No Mobile'}</span></div>
                                        {/* Dynamic Payment Display */}
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            {s.paymentType === 'Fixed' ? <Wallet size={14} className="text-green-500"/> : <Percent size={14} className="text-amber-500"/>} 
                                            <span className={s.paymentType === 'Percent' ? 'text-amber-400 font-bold' : ''}>
                                                {s.paymentType === 'Fixed' ? `₹${s.paymentValue} / mo` : `${s.paymentValue}% Profit Share`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-300"><Key size={14} className="text-gray-500"/> <span>Pass: {s.password}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 6: BROADCAST */}
            {activeTab === 'broadcast' && (
                <div className="animate-in fade-in duration-500">
                    <h2 className="text-2xl font-bold mb-6">📢 Broadcast</h2>
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-2xl">
                        <textarea value={broadcastMsg} onChange={(e)=>setBroadcastMsg(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white h-32 focus:border-teal-500 focus:outline-none" placeholder="Type announcement..."></textarea>
                        <button onClick={handleBroadcast} className="mt-4 bg-teal-600 hover:bg-teal-500 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-900/50"><Megaphone size={18}/> Send</button>
                    </div>
                </div>
            )}

            {/* TAB 7: SETTINGS */}
            {activeTab === 'settings' && (
                <div className="animate-in fade-in duration-500">
                      <h2 className="text-2xl font-bold mb-4">⚙️ Theme</h2>
                      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <div className="flex gap-4">{['teal', 'blue', 'purple', 'red'].map(c => (<button key={c} onClick={()=>setThemeColor(c)} className={`w-10 h-10 rounded-full bg-${c}-600 border-2 ${themeColor===c?'border-white scale-110':'border-transparent'}`}></button>))}</div>
                      </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}

// COMPONENTS
const NavBtn = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:bg-black hover:text-white'}`}>
        {icon} <span className="font-bold text-sm">{label}</span>
    </button>
);
const StatCard = ({ title, value, color, icon }) => (
    <div className={`bg-slate-800 p-5 rounded-xl border-b-4 border-${color}-500 shadow-lg hover:shadow-${color}-500/20 transition-shadow`}>
        <div className="flex justify-between items-start">
            <div><p className="text-gray-400 text-xs font-bold uppercase">{title}</p><h3 className="text-2xl font-black mt-1">{value}</h3></div>
            <div className={`p-2 rounded bg-${color}-900/30 text-${color}-500`}>{icon}</div>
        </div>
    </div>
);
const Badge = ({status}) => (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${status==='verified'?'bg-green-900 text-green-400':'bg-amber-900 text-amber-400'}`}>{status}</span>
);