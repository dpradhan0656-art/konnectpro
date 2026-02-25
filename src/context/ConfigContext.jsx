import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BRAND } from '../config/brandConfig'; // Fallback ke liye

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  // Default Settings (Agar net na chale to ye dikhega)
  const [settings, setSettings] = useState({
    app_name: BRAND.name,
    commission_rate: 20,
    support_phone: '9876543210',
    ticker_text: '',
    theme_color: 'teal'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('admin_settings').select('*');
      
      if (data) {
        const newSettings = {};
        data.forEach(item => {
          newSettings[item.setting_key] = item.setting_value;
        });
        // Purane settings ke upar naye settings overlap karein
        setSettings(prev => ({ ...prev, ...newSettings }));
      }
    } catch (error) {
      console.error("Config Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    
    // Real-time Update (Jadu! ✨)
    // Jaise hi DeepakHQ se change hoga, yahan apne aap badal jayega
    const channel = supabase
      .channel('public:admin_settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'admin_settings' }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <ConfigContext.Provider value={{ settings, fetchSettings, loading }}>
      {children}
    </ConfigContext.Provider>
  );
};
