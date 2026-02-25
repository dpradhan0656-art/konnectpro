import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Megaphone, Save, Bell, RefreshCw } from 'lucide-react';

export default function MarketingTab() {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Fetch Current Ticker
  useEffect(() => {
    fetchTicker();
  }, []);

  const fetchTicker = async () => {
    const { data } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'ticker_text')
        .single();
    
    if (data) setTicker(data.setting_value);
  };

  // 2. Save Ticker to DB
  const saveTicker = async () => {
    setLoading(true);
    // Upsert logic (Update if exists, Insert if new)
    const { error } = await supabase.from('admin_settings').upsert({ 
        setting_key: 'ticker_text', 
        setting_value: ticker 
    }, { onConflict: 'setting_key' });

    if (error) alert("Error: " + error.message);
    else alert("✅ Ticker Updated Successfully!");
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Megaphone className="text-amber-500" /> Marketing Center
      </h2>
      <p className="text-slate-400 text-xs">Website ke top par chalne wali patti ko yahan se control karein.</p>

      {/* --- TICKER CONTROL --- */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-300 flex items-center gap-2"><Bell size={16}/> Live Announcement Bar (Ticker)</h3>
              <div className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-[10px] font-bold uppercase">Live on Website</div>
          </div>

          <div className="space-y-4">
              <input 
                 type="text" 
                 placeholder="e.g. ⚡ BIG DIWALI SALE: Get 20% OFF on Cleaning! Use Code: DIWALI20 ⚡"
                 className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-amber-400 font-bold focus:border-amber-500 outline-none"
                 value={ticker}
                 onChange={(e) => setTicker(e.target.value)}
              />
              
              <div className="flex justify-end">
                  <button 
                    onClick={saveTicker} 
                    disabled={loading}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-3 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-900/20 active:scale-95 transition-all"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18}/>}
                    {loading ? 'Publishing...' : 'Update Ticker'}
                  </button>
              </div>
          </div>
      </div>
      
      {/* (Bhavishya me yahan Ads aur Notifications bhi aa sakte hain) */}
    </div>
  );
}