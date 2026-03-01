import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
// 🚀 NEW: Supabase import for dynamic fetching
import { supabase } from '../../lib/supabase';

export default function Footer() {
  // 🚀 NEW: State to hold dynamic contact info (with your real defaults)
  const [contactInfo, setContactInfo] = useState({
    phone: '+91 9589634799', // Aapka naya asli number
    email: 'apnahunars@gmail.com',
    address: 'Jabalpur, Madhya Pradesh,\nIndia - 482001'
  });

  // 🚀 NEW: Fetch settings from Supabase on load
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['company_phone', 'company_email', 'company_address']);

      if (data && !error) {
        const info = { ...contactInfo };
        data.forEach(item => {
          // Agar database me value hai, toh default ko overwrite kar do
          if (item.setting_key === 'company_phone') info.phone = item.setting_value;
          if (item.setting_key === 'company_email') info.email = item.setting_value;
          if (item.setting_key === 'company_address') info.address = item.setting_value;
        });
        setContactInfo(info);
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 md:pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-1 group">
               <ShieldCheck size={28} className="text-teal-500 group-hover:scale-110 transition-transform"/>
               <span className="text-2xl font-black text-white tracking-tighter uppercase">
                 KSHATR<span className="text-teal-500">.COM</span>
               </span>
            </Link>
            
            <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mb-4">
               Powered by Apna Hunar
            </p>

            <p className="text-sm leading-relaxed opacity-70 mb-6">
              India's most trusted home service partner. We shield your home with verified experts and transparent pricing.
            </p>
            
            <div className="flex gap-4">
               <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-all"><Facebook size={18}/></a>
               <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-pink-600 hover:text-white transition-all"><Instagram size={18}/></a>
               <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-sky-500 hover:text-white transition-all"><Twitter size={18}/></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Company</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-teal-400 transition-colors">Careers @ Apna Hunar</Link></li>
              <li><Link to="/register-expert" className="hover:text-teal-400 transition-colors font-bold text-teal-200">Join as Partner</Link></li>
              <li><Link to="/expert/login" className="hover:text-teal-400 transition-colors opacity-80 hover:opacity-100 font-bold">Partner Login</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Legal</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/terms" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-teal-400 transition-colors">Refund Policy</Link></li>
              <li><Link to="/anti-discrimination" className="hover:text-teal-400 transition-colors">Anti Discrimination</Link></li>
            </ul>
          </div>

          {/* Contact (🚀 NOW DYNAMIC) */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-teal-500 shrink-0 mt-0.5"/>
                {/* whitespace-pre-wrap ensures that line breaks (\n) in address show up correctly */}
                <span className="whitespace-pre-wrap">{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-teal-500 shrink-0"/>
                <a href={`mailto:${contactInfo.email}`} className="hover:text-white">{contactInfo.email}</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-teal-500 shrink-0"/>
                <span>{contactInfo.phone}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-50">
           <p>© 2026 Apna Hunar. All rights reserved.</p>
           <p>Made with <span className="text-red-500">❤</span> in Jabalpur.</p>
        </div>
      </div>
    </footer>
  );
}