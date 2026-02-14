import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Menu, X, LogOut, LayoutGrid, Users, Briefcase, Settings, 
  Megaphone // ✅ NEW ICON IMPORT
} from 'lucide-react';

// Import Modular Tabs
import DashboardTab from './tabs/DashboardTab'; 
import ExpertControl from './tabs/ExpertControl';
import ServiceManager from './tabs/ServiceManager';
import OffersManager from './tabs/OffersManager'; // ✅ NEW TAB IMPORT

export default function DeepakHQ() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- LOGIN CHECK ---
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === 'Founder2026') { 
        localStorage.setItem('adminAuth', 'true');
        setIsAuthenticated(true);
    } else {
        alert('⛔ Access Denied!');
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
      {/* SIDEBAR (Desktop) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h1 className="text-xl font-black tracking-widest">HQ<span className="text-teal-500">.</span></h1>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X /></button>
        </div>
        <nav className="p-4 space-y-2">
            <NavBtn icon={<LayoutGrid size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavBtn icon={<Briefcase size={20}/>} label="Services & Prices" active={activeTab === 'services'} onClick={() => setActiveTab('services')} />
            <NavBtn icon={<Users size={20}/>} label="Expert Army" active={activeTab === 'experts'} onClick={() => setActiveTab('experts')} />
            
            {/* ✅ NEW BUTTON: SPOTLIGHT OFFERS */}
            <NavBtn icon={<Megaphone size={20}/>} label="Spotlight Offers" active={activeTab === 'offers'} onClick={() => setActiveTab('offers')} />
            
            <NavBtn icon={<Settings size={20}/>} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
        <div className="absolute bottom-0 w-full p-4">
            <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:bg-red-900/20 w-full p-3 rounded-xl transition-all font-bold text-sm"><LogOut size={18} /> Secure Logout</button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header (Mobile) */}
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center md:hidden">
            <h2 className="font-bold">KonnectPro Admin</h2>
            <button onClick={() => setIsMobileMenuOpen(true)}><Menu /></button>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0a0f16]"> {/* Darker bg for content */}
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'services' && <ServiceManager />}
            {activeTab === 'experts' && <ExpertControl />}
            
            {/* ✅ NEW CONTENT: OFFERS MANAGER */}
            {activeTab === 'offers' && <OffersManager />}
            
            {activeTab === 'settings' && <div className="text-center text-slate-500 mt-20">Settings Module Coming Soon</div>}
        </main>
      </div>
    </div>
  );
}

// Helper Component for Sidebar
const NavBtn = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        {icon} <span>{label}</span>
    </button>
);