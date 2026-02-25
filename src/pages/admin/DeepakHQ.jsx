import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Shield, Menu, X, LogOut, LayoutGrid, Users, Briefcase, Settings, 
  Megaphone, Navigation, CreditCard, UserCheck, Grid, Zap, DollarSign 
} from 'lucide-react';

// Import All Tabs
import DashboardTab from './tabs/DashboardTab'; 
import ExpertControl from './tabs/ExpertControl';
import ServiceManager from './tabs/ServiceManager';
import ManageOffers from './tabs/ManageOffers';
import DispatchTab from './tabs/DispatchTab';
import SettingsTab from './tabs/SettingsTab';
import CustomerCRM from './tabs/CustomerCRM';  
import WalletManager from './tabs/WalletManager'; 
import CategoryManager from './tabs/CategoryManager';
import MarketingTab from './tabs/MarketingTab';       
import RevenueTab from './tabs/RevenueTab';
// ✅ NAYA TAB IMPORT KIYA (Area Head Control Room)
import AreaHeadManager from './tabs/AreaHeadManager'; 

export default function DeepakHQ() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [dbPasscode, setDbPasscode] = useState('Founder2026'); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- AUTH CHECK ---
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') setIsAuthenticated(true);
    
    // Fetch Real Passcode from DB
    const fetchConfig = async () => {
        const { data } = await supabase.from('admin_settings').select('*').eq('setting_key', 'admin_passcode').single();
        if (data) setDbPasscode(data.setting_value);
    };
    fetchConfig();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === dbPasscode) {
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

  const handleTabChange = (tabName) => {
      setActiveTab(tabName);
      setIsMobileMenuOpen(false); 
      window.scrollTo({top: 0, behavior: 'smooth'});
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
            <div className="bg-slate-900 p-8 rounded-[2rem] border border-teal-500/30 w-full max-w-sm text-center shadow-2xl relative">
                <div className="flex justify-center mb-6"><div className="p-4 bg-teal-900/50 rounded-full text-teal-400 border border-teal-500 shadow-lg shadow-teal-500/20"><Shield size={40} /></div></div>
                <h2 className="text-3xl font-black mb-1 uppercase tracking-widest">Deepak<span className="text-teal-500">HQ</span></h2>
                <p className="text-xs text-slate-500 mb-8 uppercase tracking-widest">Authorized Personnel Only</p>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Enter Passcode" className="w-full p-4 bg-black rounded-xl border border-slate-700 text-center text-xl font-bold text-white tracking-[0.5em] focus:border-teal-500 outline-none" autoFocus />
                    <button className="w-full bg-teal-600 hover:bg-teal-500 py-3 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-teal-900/50 transition-all active:scale-95">Enter</button>
                </form>
            </div>
        </div>
    );
  }

  // --- DASHBOARD LAYOUT ---
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex overflow-hidden">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h1 className="text-xl font-black tracking-widest">HQ<span className="text-teal-500">.</span></h1>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 p-2"><X /></button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            <NavBtn icon={<LayoutGrid size={18}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')} />
            
            <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Control Center</div>
            <NavBtn icon={<Grid size={18}/>} label="Category Master" active={activeTab === 'categories'} onClick={() => handleTabChange('categories')} badge="1st" /> 
            <NavBtn icon={<Briefcase size={18}/>} label="Rate List & Services" active={activeTab === 'services'} onClick={() => handleTabChange('services')} badge="2nd" />
            <NavBtn icon={<Navigation size={18}/>} label="Dispatch Ops" active={activeTab === 'dispatch'} onClick={() => handleTabChange('dispatch')} />
            <NavBtn icon={<UserCheck size={18}/>} label="Expert Army" active={activeTab === 'experts'} onClick={() => handleTabChange('experts')} />
            {/* ✅ NAYA BUTTON JODA (Area Commanders) */}
            <NavBtn icon={<Shield size={18}/>} label="Area Commanders" active={activeTab === 'area_heads'} onClick={() => handleTabChange('area_heads')} />
            
            <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Growth</div>
            <NavBtn icon={<Users size={18}/>} label="Customer CRM" active={activeTab === 'customers'} onClick={() => handleTabChange('customers')} />
            <NavBtn icon={<DollarSign size={18}/>} label="Revenue & Stats" active={activeTab === 'revenue'} onClick={() => handleTabChange('revenue')} />
            <NavBtn icon={<CreditCard size={18}/>} label="Wallet System" active={activeTab === 'wallet'} onClick={() => handleTabChange('wallet')} />
            <NavBtn icon={<Megaphone size={18}/>} label="Ads & Ticker" active={activeTab === 'marketing'} onClick={() => handleTabChange('marketing')} />
            
            <div className="mt-4 border-t border-slate-800 pt-4">
                 <NavBtn icon={<Settings size={18}/>} label="Admin Settings" active={activeTab === 'settings'} onClick={() => handleTabChange('settings')} />
            </div>
        </nav>
        
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 w-full p-3 rounded-xl transition-all font-bold text-sm justify-center border border-red-900/30 hover:bg-red-900/10">
                <LogOut size={16} /> Logout
            </button>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"></div>}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#0a0f16]">
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center md:hidden z-30 sticky top-0 shadow-lg">
            <h2 className="font-bold text-teal-400 flex items-center gap-2"><Shield size={16}/> DeepakHQ</h2>
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2 bg-slate-800 rounded-lg"><Menu size={20}/></button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-24">
            <div className="max-w-7xl mx-auto">
                {activeTab === 'dashboard' && <DashboardTab />}
                {activeTab === 'categories' && <CategoryManager />} 
                {activeTab === 'services' && <ServiceManager />}
                {activeTab === 'dispatch' && <DispatchTab />}
                {activeTab === 'experts' && <ExpertControl />}
                {/* ✅ NAYA TAB JODA (Area Head Panel Show Karega) */}
                {activeTab === 'area_heads' && <AreaHeadManager />}
                {activeTab === 'customers' && <CustomerCRM />} 
                {activeTab === 'wallet' && <WalletManager />}
                {activeTab === 'marketing' && <MarketingTab />}
                {activeTab === 'revenue' && <RevenueTab />} 
                {activeTab === 'offers' && <ManageOffers />}
                {activeTab === 'settings' && <SettingsTab />}
            </div>
        </main>
      </div>
    </div>
  );
}

const NavBtn = ({ icon, label, active, onClick, badge }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-medium text-sm mb-1 group ${active ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        <div className="flex items-center gap-3">
            <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span> 
            <span>{label}</span>
        </div>
        {badge && <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${active ? 'bg-white text-teal-700' : 'bg-teal-900 text-teal-400'}`}>{badge}</span>}
    </button>
);