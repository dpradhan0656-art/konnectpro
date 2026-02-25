import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const ThemeContext = createContext();

// 🔮 KUNDALI COLORS (Based on 1 Aug 1978, Libra Ascendant)
// Primary: Royal Blue (Shani - Career & Success)
// Accent: Gold (Sun - Leadership & Gains)
// Bg: Deep Slate (Rahu - Technology)

const THEMES = {
  default: { 
    name: 'Kundali Bhagya (Royal)', 
    primary: '#2563eb', // Royal Blue (Shani Dev ka Color for Libra Lagna)
    bg: '#0f172a',      // Deep Slate (Tech/Stability)
    text: '#f8fafc'     // White/Silver (Venus - Luxury)
  },
  diwali: { 
    name: 'Diwali Gold', 
    primary: '#f59e0b', 
    bg: '#450a0a', 
    text: '#fffbeb' 
  },
  holi: { 
    name: 'Holi Vibrant', 
    primary: '#d946ef', 
    bg: '#4c1d95', 
    text: '#fae8ff' 
  },
  republic: { 
    name: 'Desh Bhakti', 
    primary: '#ea580c', 
    bg: '#1e3a8a', 
    text: '#ffffff'
  },
  nature: { 
    name: 'Eco Green', 
    primary: '#16a34a', 
    bg: '#064e3b', 
    text: '#dcfce7'
  },
  royal: { 
    name: 'Luxury Gold', 
    primary: '#ca8a04', 
    bg: '#000000', 
    text: '#fef08a'
  },
  ocean: { 
    name: 'Cool Ocean', 
    primary: '#0ea5e9', 
    bg: '#0c4a6e', 
    text: '#e0f2fe'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    // 1. Load Theme
    const fetchTheme = async () => {
      const { data } = await supabase.from('admin_settings').select('setting_value').eq('setting_key', 'site_theme').single();
      if (data) applyTheme(data.setting_value);
      else applyTheme('default'); // Default ab Kundali wala hai
    };
    fetchTheme();

    // 2. Real-time Listener
    const channel = supabase.channel('theme_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'admin_settings', filter: "setting_key=eq.site_theme" }, 
      (payload) => {
        applyTheme(payload.new.setting_value);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const applyTheme = (themeKey) => {
    const theme = THEMES[themeKey] || THEMES.default;
    setCurrentTheme(themeKey);

    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-bg', theme.bg);
    
    // Inject Dynamic Style (Tailwind Override)
    const styleId = 'dynamic-theme-style';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }
    
    styleTag.innerHTML = `
      .bg-teal-600, .bg-teal-500, .bg-blue-600 { background-color: ${theme.primary} !important; }
      .text-teal-400, .text-teal-500, .text-blue-500 { color: ${theme.primary} !important; }
      .bg-slate-900, .bg-slate-950 { background-color: ${theme.bg} !important; }
      .border-teal-500 { border-color: ${theme.primary} !important; }
      /* Gold Accents for Royal Feel */
      .text-amber-400, .text-yellow-500 { color: #f59e0b !important; }
    `;
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);