import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Megaphone, Save } from 'lucide-react';

export default function MarketingTab() {
  const [tickerText, setTickerText] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch current ticker
  useEffect(() => {
    const fetchSettings = async () => {
        // Assume 'admin_settings' table has a key 'ticker_text'
        const { data } = await supabase.from('admin_settings').select('setting_value').eq('setting_key', 'ticker_text').single();
        if(data) setTickerText(data.setting_value);
    };
    fetchSettings();
  }, []);

  // Update ticker
  const handleUpdate = async () => {
      setLoading(true);
      // Check if row exists, if not insert, else update (Upsert logic)
      const { error } = await supabase.from('admin_settings').upsert({ 
          setting_key: 'ticker_text', 
          setting_value: tickerText 
      }, { onConflict: 'setting_key' });

      if(!error) alert("🎉 Marketing Ticker Updated!");
      else alert("Error: " + error.message);
      setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Megaphone className="text-pink-500" /> Marketing Runner
        </h2>
        
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
            <label className="text-pink-400 font-bold uppercase text-xs mb-2 block">Running Patti Text (Ticker)</label>
            <div className="flex gap-4">
                <input 
                    type="text" 
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-lg outline-none focus:border-pink-500"
                    placeholder="e.g. 50% OFF on First Booking! Use Code: WELCOME50"
                    value={tickerText}
                    onChange={(e) => setTickerText(e.target.value)}
                />
                <button 
                    onClick={handleUpdate}
                    disabled={loading}
                    className="bg-pink-600 hover:bg-pink-500 text-white px-8 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-pink-900/50"
                >
                    <Save size={20}/> Publish
                </button>
            </div>
            
            {/* Live Preview */}
            <div className="mt-8">
                <p className="text-slate-500 text-xs mb-2 text-center">Live Preview</p>
                <div className="bg-teal-700 text-white p-2 rounded overflow-hidden whitespace-nowrap">
                    <div className="animate-marquee inline-block font-bold">
                        {tickerText || "Your text will run here like this..."}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}