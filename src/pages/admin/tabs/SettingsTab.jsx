import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Settings, Save, Lock, Smartphone, Palette, Check, Star } from 'lucide-react';

// 🔮 UPDATED THEME LIST
const THEMES = [
    { id: 'default', name: 'Kundali Bhagya (Libra)', color: '#2563eb' }, // Astro Color
    { id: 'diwali', name: 'Diwali Gold', color: '#f59e0b' },
    { id: 'holi', name: 'Holi Vibrant', color: '#d946ef' },
    { id: 'republic', name: 'Desh Bhakti', color: '#ea580c' },
    { id: 'nature', name: 'Eco Green', color: '#16a34a' },
    { id: 'royal', name: 'Luxury Gold', color: '#ca8a04' },
    { id: 'ocean', name: 'Ocean Blue', color: '#0ea5e9' },
];

export default function SettingsTab() {
  const [config, setConfig] = useState({
    app_name: '', admin_passcode: '', site_theme: 'default'
  });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('admin_settings').select('*');
    if(data) {
        const newConfig = {};
        data.forEach(item => newConfig[item.setting_key] = item.setting_value);
        setConfig(prev => ({ ...prev, ...newConfig }));
    }
  };

  const saveSetting = async (key, value) => {
    const { error } = await supabase.from('admin_settings').upsert({ 
        setting_key: key, setting_value: value 
    }, { onConflict: 'setting_key' });
    
    if(!error) {
        setConfig({...config, [key]: value});
        // Feedback message
        if(key === 'site_theme') alert(`🎨 Theme Updated: ${THEMES.find(t=>t.id===value)?.name}`);
        else alert(`✅ ${key} Updated!`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="text-slate-400" /> System Settings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* THEME ENGINE */}
          <div className="md:col-span-2 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-4">
                  <Palette size={14} className="text-purple-500"/> Website Theme (Astro & Festivals)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {THEMES.map(theme => (
                      <button 
                        key={theme.id}
                        onClick={() => saveSetting('site_theme', theme.id)}
                        className={`group relative p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${config.site_theme === theme.id ? 'border-white bg-slate-800 ring-2 ring-offset-2 ring-offset-slate-900 ring-white' : 'border-slate-700 hover:bg-slate-800'}`}
                      >
                          <div className="w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-[10px]" style={{backgroundColor: theme.color}}>
                             {theme.id === 'default' && <Star size={12} fill="white"/>}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase text-center">{theme.name}</span>
                          {config.site_theme === theme.id && <div className="absolute top-2 right-2 text-green-400"><Check size={12}/></div>}
                      </button>
                  ))}
              </div>
          </div>

          {/* APP NAME */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2"><Smartphone size={14}/> App Name</label>
              <div className="flex gap-2">
                  <input className="flex-1 bg-slate-950 border border-slate-700 p-3 rounded-xl text-white font-bold" value={config.app_name} onChange={e => setConfig({...config, app_name: e.target.value})}/>
                  <button onClick={() => saveSetting('app_name', config.app_name)} className="bg-teal-600 p-3 rounded-xl text-white"><Save size={18}/></button>
              </div>
          </div>

          {/* ADMIN PASSCODE */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2"><Lock size={14}/> Admin Passcode</label>
              <div className="flex gap-2">
                  <input className="flex-1 bg-slate-950 border border-slate-700 p-3 rounded-xl text-white font-bold tracking-widest" value={config.admin_passcode} onChange={e => setConfig({...config, admin_passcode: e.target.value})}/>
                  <button onClick={() => saveSetting('admin_passcode', config.admin_passcode)} className="bg-teal-600 p-3 rounded-xl text-white"><Save size={18}/></button>
              </div>
          </div>
          
      </div>
    </div>
  );
}