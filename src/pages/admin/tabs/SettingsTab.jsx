import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Lock, Palette, RefreshCw } from 'lucide-react';

export default function SettingsTab() {
  const [passcode, setPasscode] = useState('');
  const [theme, setTheme] = useState('teal');
  const [loading, setLoading] = useState(false);

  // Fetch Current Settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('admin_settings').select('*');
      if (data) {
        const pass = data.find(x => x.setting_key === 'admin_passcode');
        const th = data.find(x => x.setting_key === 'theme_color');
        if (pass) setPasscode(pass.setting_value);
        if (th) setTheme(th.setting_value);
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    // Upsert Passcode
    await supabase.from('admin_settings').upsert({ setting_key: 'admin_passcode', setting_value: passcode }, { onConflict: 'setting_key' });
    // Upsert Theme
    await supabase.from('admin_settings').upsert({ setting_key: 'theme_color', setting_value: theme }, { onConflict: 'setting_key' });
    
    alert("Settings Updated! Reload to see changes.");
    setLoading(false);
  };

  const resetUserPassword = async () => {
      const email = prompt("Enter User Email to send Reset Link:");
      if(email) {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: 'https://konnectpro.vercel.app/update-password',
          });
          if(error) alert("Error: " + error.message);
          else alert("Reset Email Sent Successfully! 📧");
      }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. SECURITY SETTINGS */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="text-red-500"/> Security Control
        </h2>
        
        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Founder Passcode (For Login)</label>
                <input 
                    type="text" 
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full bg-black p-3 rounded-lg border border-slate-700 text-white font-mono tracking-widest mt-2 focus:border-red-500 outline-none"
                    placeholder="Enter new passcode"
                />
            </div>
            
            <div className="pt-4 border-t border-slate-800">
                <button onClick={resetUserPassword} className="text-sm text-blue-400 hover:text-white flex items-center gap-2 hover:underline">
                    <RefreshCw size={14}/> Send Password Reset Link to a User
                </button>
            </div>
        </div>
      </div>

      {/* 2. THEME SETTINGS */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Palette className="text-teal-500"/> Interface Theme
        </h2>
        
        <div className="grid grid-cols-4 gap-4">
            {['teal', 'blue', 'rose', 'violet'].map(c => (
                <button
                    key={c}
                    onClick={() => setTheme(c)}
                    className={`h-16 rounded-xl border-2 transition-all ${theme === c ? 'border-white scale-105' : 'border-transparent opacity-50'}`}
                    style={{ backgroundColor: c === 'teal' ? '#0d9488' : c === 'blue' ? '#2563eb' : c === 'rose' ? '#e11d48' : '#7c3aed' }}
                >
                    {theme === c && <div className="text-white font-bold text-xs text-center mt-5">Active</div>}
                </button>
            ))}
        </div>
    
      </div>

      {/* SAVE BUTTON */}
      <button 
        onClick={saveSettings}
        disabled={loading}
        className="w-full bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-teal-900/50"
      >
        {loading ? 'Saving Changes...' : 'Save Configuration'}
      </button>

    </div>
  );
}