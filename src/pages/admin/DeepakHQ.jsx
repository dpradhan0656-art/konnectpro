import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Shield, Menu, X, LogOut, LayoutGrid, Users, Briefcase, Settings, 
  Megaphone, Navigation // ✅ New Icons
} from 'lucide-react';

// ✅ Import All Modular Tabs
import DashboardTab from './tabs/DashboardTab'; 
import ExpertControl from './tabs/ExpertControl';
import ServiceManager from './tabs/ServiceManager';
import ManageOffers from './tabs/ManageOffers'; // Note: File name matches
import DispatchTab from './tabs/DispatchTab';   // ✅ NEW
import SettingsTab from './tabs/SettingsTab';   // ✅ NEW

export default function DeepakHQ() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [dbPasscode, setDbPasscode] = useState('Founder2026'); // Default Fallback
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- LOGIN & SETTINGS CHECK ---
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') setIsAuthenticated(true);

    // Fetch Custom Password from DB
    const fetchConfig = async () => {
        const { data } = await supabase.from('admin_settings').select('*').eq('setting_key', 'admin_passcode').single();
        if (data) setDbPasscode(data.setting_value);
    };
    fetchConfig();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === dbPasscode) { // Check against DB
        localStorage.setItem('adminAuth', 'true');
        setIsAuthenticated(true);
    } else {
        alert('⛔ Access Denied! Wrong Code.');
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('adminAuth');
      setIsAuthenticated(false);
      navigate('/'); 
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
            <div className="bg-slate-900 p-8 rounded-2xl border border-teal-500/30 w-full max-w-sm text-center shadow-2xl">
                <div className="flex justify-center mb-6"><div className="p-4 bg-teal-900/50 rounded-full text-teal-400 border border-teal-500"><Shield size={40} /></div></div>
                <h2 className="text-3xl font-black mb-1 uppercase tracking-widest">Deepak<span className="text-teal-500">HQ</span></h2>
                <p className="text-xs text-slate-500 mb-8 uppercase tracking-widest">Command Center Access</p>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Enter Founder Code" className="w-full p-4 bg-black rounded-xl border border-slate-700 text-center text-xl font-bold text-white tracking-[0.5em] focus:border-teal-500 outline-none transition-all" autoFocus />
                    <button className="w-full bg-teal-600 hover:bg-teal-500 py-3 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-teal-900/50 transition-all">Unlock</button>
                </form>
            </div>
        </div>
    );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex">
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h1 className="text-xl font-black tracking-widest">HQ<span className="text-teal-500">.</span></h1>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X /></button>
        </div>
        <nav className="p-4 space-y-2">
            <NavBtn icon={<LayoutGrid size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavBtn icon={<Navigation size={20}/>} label="Dispatch Center" active={activeTab === 'dispatch'} onClick={() => setActiveTab('dispatch')} badge="NEW" />
            <NavBtn icon={<Briefcase size={20}/>} label="Services" active={activeTab === 'services'} onClick={() => setActiveTab('services')} />
            <NavBtn icon={<Users size={20}/>} label="Expert Army" active={activeTab === 'experts'} onClick={() => setActiveTab('experts')} />
            <NavBtn icon={<Megaphone size={20}/>} label="Spotlight Offers" active={activeTab === 'offers'} onClick={() => setActiveTab('offers')} />
            
            <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-600 uppercase">System</div>
            <NavBtn icon={<Settings size={20}/>} label="HQ Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
        <div className="absolute bottom-0 w-full p-4">
            <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:bg-red-900/20 w-full p-3 rounded-xl transition-all font-bold text-sm"><LogOut size={18} /> Secure Logout</button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center md:hidden">
            <h2 className="font-bold">KonnectPro Admin</h2>
            <button onClick={() => setIsMobileMenuOpen(true)}><Menu /></button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-[#0a0f16]">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'services' && <ServiceManager />}
            {activeTab === 'experts' && <ExpertControl />}
            {activeTab === 'offers' && <ManageOffers />}   {/* ✅ Name Fixed */}
            {activeTab === 'dispatch' && <DispatchTab />}   {/* ✅ Manual Assignment */}
            {activeTab === 'settings' && <SettingsTab />}   {/* ✅ Settings */}
        </main>
      </div>
    </div>
  );
}

// Helper Component for Sidebar
const NavBtn = ({ icon, label, active, onClick, badge }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium ${active ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        <div className="flex items-center gap-3">{icon} <span>{label}</span></div>
        {badge && <span className="text-[9px] bg-red-500 text-white px-1.5 rounded font-bold">{badge}</span>}
    </button>
);