import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Shield, Menu, X, LogOut, LayoutGrid, Users, Briefcase, Settings, 
  Megaphone, Navigation, CreditCard, UserCheck, User, Grid, Zap, TrendingUp 
} from 'lucide-react';

// ✅ 1. Import All Modular Tabs (ALL INCLUDED)
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
import RevenueTab from './tabs/RevenueTab'; // ✅ NEW: Added Missing Import
import LegalManager from './LegalManager'; // Import करें

export default function DeepakHQ() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [dbPasscode, setDbPasscode] = useState('Founder2026'); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- LOGIN CHECK ---
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') setIsAuthenticated(true);

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

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
            <div className="bg-slate-900 p-8 rounded-2xl border border-teal-500/30 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="flex justify-center mb-6"><div className="p-4 bg-teal-900/50 rounded-full text-teal-400 border border-teal-500 shadow-lg shadow-teal-500/20"><Shield size={40} /></div></div>
                <h2 className="text-3xl font-black mb-1 uppercase tracking-widest">Deepak<span className="text-teal-500">HQ</span></h2>
                <p className="text-xs text-slate-500 mb-8 uppercase tracking-widest">Command Center Access</p>
                <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                    <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Enter Founder Code" className="w-full p-4 bg-black rounded-xl border border-slate-700 text-center text-xl font-bold text-white tracking-[0.5em] focus:border-teal-500 outline-none transition-all" autoFocus />
                    <button className="w-full bg-teal-600 hover:bg-teal-500 py-3 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-teal-900/50 transition-all active:scale-95">Unlock System</button>
                </form>
            </div>
        </div>
    );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex overflow-hidden">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h1 className="text-xl font-black tracking-widest">HQ<span className="text-teal-500">.</span></h1>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X /></button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            <NavBtn icon={<LayoutGrid size={18}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            
            <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Operations</div>
            <NavBtn icon={<Navigation size={18}/>} label="Dispatch Center" active={activeTab === 'dispatch'} onClick={() => setActiveTab('dispatch')} badge="LIVE" />
            <NavBtn icon={<UserCheck size={18}/>} label="Expert Army" active={activeTab === 'experts'} onClick={() => setActiveTab('experts')} />
            <NavBtn icon={<Grid size={18}/>} label="Categories" active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} /> 
            <NavBtn icon={<Briefcase size={18}/>} label="Services & Rates" active={activeTab === 'services'} onClick={() => setActiveTab('services')} />
            
            <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Growth & Finance</div>
            <NavBtn icon={<User size={18}/>} label="Customer CRM" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} badge="NEW" />
            <NavBtn icon={<CreditCard size={18}/>} label="Wallet Manager" active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} />
            <NavBtn icon={<Megaphone size={18}/>} label="Marketing & Offers" active={activeTab === 'offers'} onClick={() => setActiveTab('offers')} />
            <NavBtn icon={<Zap size={18}/>} label="Ticker Text" active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} /> 
            
            <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-wider">System</div>
            <NavBtn icon={<Settings size={18}/>} label="HQ Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            <NavBtn icon={<TrendingUp size={18}/>} label="Revenue & Accounts" active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')} badge="₹" />
        </nav>
        
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
            <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:bg-red-900/20 w-full p-3 rounded-xl transition-all font-bold text-sm justify-center border border-red-900/30 hover:border-red-500/50">
                <LogOut size={16} /> Secure Logout
            </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center md:hidden z-40">
            <h2 className="font-bold text-teal-400">KonnectPro HQ</h2>
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-white"><Menu /></button>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0a0f16] scroll-smooth">
            <div className="max-w-7xl mx-auto">
                {activeTab === 'dashboard' && <DashboardTab />}
                {activeTab === 'dispatch' && <DispatchTab />}
                {activeTab === 'services' && <ServiceManager />}
                {activeTab === 'experts' && <ExpertControl />}
                
                {/* ✅ ALL TABS CONNECTED */}
                {activeTab === 'categories' && <CategoryManager />} 
                {activeTab === 'customers' && <CustomerCRM />} 
                {activeTab === 'wallet' && <WalletManager />}
                {activeTab === 'marketing' && <MarketingTab />}
                {activeTab === 'revenue' && <RevenueTab />} {/* ✅ NEW: Added Revenue Display */}
                
                {activeTab === 'offers' && <ManageOffers />}
                {activeTab === 'settings' && <SettingsTab />}
                {activeTab === 'legal' && <LegalManager />}
            </div>
        </main>
      </div>
    </div>
  );
}

// Helper Component for Sidebar Buttons
const NavBtn = ({ icon, label, active, onClick, badge }) => (
    <button onClick={() => { onClick(); window.scrollTo({top:0, behavior:'smooth'}); }} 
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm mb-1 group ${active ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        <div className="flex items-center gap-3">
            <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span> 
            <span>{label}</span>
        </div>
        {badge && <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${active ? 'bg-white text-teal-700' : 'bg-teal-900 text-teal-400'}`}>{badge}</span>}
    </button>
);