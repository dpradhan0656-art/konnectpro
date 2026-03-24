import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
// 🚀 NEW: Supabase import for dynamic fetching
import { supabase } from '../../lib/supabase';
import ExpertRegistrationForm from '../forms/ExpertRegistrationForm';

export default function Footer() {
  // 🚀 NEW: State to hold dynamic contact info (with your real defaults)
  const [contactInfo, setContactInfo] = useState({
    phone: '+91 9589634799', // Aapka naya asli number
    email: 'apnahunars@gmail.com',
    address: 'Jabalpur, Madhya Pradesh,\nIndia - 482005'
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
    <footer
      className={
        /* OLD: pt-16 pb-24 md:pb-8 — more padding */
        'bg-slate-900 text-slate-300 py-6 md:py-8 md:pt-12 md:pb-8 border-t border-slate-800 w-full max-w-[100vw] overflow-hidden'
      }
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full min-w-0">
        {/* OLD: single column on mobile — NEW: 2-col sidewise on mobile, 4-col on md; boxed sections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10 mb-4 md:mb-10">
          {/* Brand Section — full width on mobile */}
          <div className="col-span-2 md:col-span-1 mb-2 md:mb-0">
            <Link to="/" className="flex items-center gap-2 mb-0.5 md:mb-1 group">
              <span className="inline-block scale-90 md:scale-100 origin-left">
                <ShieldCheck size={24} className="text-teal-500 group-hover:scale-110 transition-transform" />
              </span>
              <span className="text-lg md:text-2xl font-black text-white tracking-tighter uppercase">
                KSHATR<span className="text-teal-500">.COM</span>
              </span>
            </Link>
            <p className="text-[9px] md:text-[10px] text-teal-400 font-bold uppercase tracking-widest mb-2 md:mb-4">
              Powered by Kshatryx Technologies
            </p>
            <p className="text-xs md:text-sm leading-snug md:leading-relaxed opacity-70 mb-4 md:mb-6">
              India's most trusted home service partner. We shield your home with verified experts and transparent pricing.
            </p>
            <div className="flex gap-2 md:gap-4">
              <a
                href="https://www.facebook.com/kshatrapp"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 p-1.5 md:p-2 rounded-full hover:bg-blue-600 hover:text-white transition-all [&>svg]:scale-90 md:[&>svg]:scale-100 [&>svg]:origin-center"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/kshatrapp"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 p-1.5 md:p-2 rounded-full hover:bg-pink-600 hover:text-white transition-all [&>svg]:scale-90 md:[&>svg]:scale-100 [&>svg]:origin-center"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <Link
                to="/contact-support"
                className="bg-slate-800 p-1.5 md:p-2 rounded-full hover:bg-sky-500 hover:text-white transition-all [&>svg]:scale-90 md:[&>svg]:scale-100 [&>svg]:origin-center"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </Link>
            </div>
          </div>

          {/* Company — boxed on mobile */}
          <div className="col-span-1 rounded-xl border border-slate-700/80 bg-slate-800/40 p-3 md:p-0 md:bg-transparent md:border-0 md:rounded-none">
            <h3 className="text-white font-bold uppercase tracking-widest text-[10px] md:text-xs mb-2 md:mb-6">
              Company
            </h3>
            <ul className="space-y-1.5 md:space-y-4 text-xs md:text-sm">
              <li><Link to="/about" className="hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-teal-400 transition-colors">Careers @ Kshatryx Technologies</Link></li>
              <li><Link to="/register-expert" className="hover:text-teal-400 transition-colors font-bold text-teal-200">Join as Partner</Link></li>
              <li><Link to="/expert/login" className="hover:text-teal-400 transition-colors opacity-80 hover:opacity-100 font-bold">Partner Login</Link></li>
            </ul>
          </div>

          {/* Legal — boxed on mobile */}
          <div className="col-span-1 rounded-xl border border-slate-700/80 bg-slate-800/40 p-3 md:p-0 md:bg-transparent md:border-0 md:rounded-none">
            <h3 className="text-white font-bold uppercase tracking-widest text-[10px] md:text-xs mb-2 md:mb-6">
              Legal
            </h3>
            <ul className="space-y-1.5 md:space-y-4 text-xs md:text-sm">
              <li><Link to="/terms" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-teal-400 transition-colors">Refund Policy</Link></li>
              <li><Link to="/anti-discrimination" className="hover:text-teal-400 transition-colors">Anti Discrimination</Link></li>
              <li><Link to="/contact-support" className="hover:text-teal-400 transition-colors font-bold text-teal-200">Contact Support</Link></li>
            </ul>
          </div>

          {/* Contact Us — full-width box at bottom on mobile; single column on desktop so it stays inline */}
          <div className="col-span-2 md:col-span-1 mt-2 md:mt-0 rounded-xl border border-slate-700/80 bg-slate-800/40 p-3 md:p-0 md:bg-transparent md:border-0 md:rounded-none">
            <h3 className="text-white font-bold uppercase tracking-widest text-[10px] md:text-xs mb-2 md:mb-6">
              Contact Us
            </h3>
            <ul className="space-y-1.5 md:space-y-4 text-xs md:text-sm">
              <li className="flex items-start gap-2 md:gap-3">
                <span className="shrink-0 mt-0.5 [&>svg]:scale-90 md:[&>svg]:scale-100 [&>svg]:origin-center text-teal-500"><MapPin size={18} /></span>
                <span className="whitespace-pre-wrap">{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <span className="shrink-0 [&>svg]:scale-90 md:[&>svg]:scale-100 text-teal-500"><Mail size={18} /></span>
                <a href={`mailto:${contactInfo.email}`} className="hover:text-white truncate">{contactInfo.email}</a>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <span className="shrink-0 [&>svg]:scale-90 md:[&>svg]:scale-100 text-teal-500"><Phone size={18} /></span>
                <span>{contactInfo.phone}</span>
              </li>
            </ul>
          </div>
        </div>

        {/*
          Old Inconsistent Form: footer had no partner intake — only a “Join as Partner” link to /register-expert.
          Pros of shared ExpertRegistrationForm: one schema (pending + same columns), fewer divergent bugs.
          Cons: footer relies on new public RLS policy + migration; slightly heavier bundle on every page with Footer.
        */}
        <div className="max-w-xl mx-auto mt-6 md:mt-8 border-t border-slate-800 pt-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 text-center md:text-left">
            Quick partner application
          </p>
          <ExpertRegistrationForm variant="footer" compact />
          <p className="text-[10px] text-slate-600 mt-3 text-center">
            Prefer the full flow?{' '}
            <Link to="/register-expert" className="text-teal-400 font-bold hover:underline">
              Register with account
            </Link>
          </p>
        </div>

        {/* Bottom Bar — more slender on mobile */}
        <div
          className={
            /* OLD: pt-8 ... gap-4 — thicker bottom bar */
            'border-t border-slate-800 pt-4 pb-1 md:pt-8 md:pb-0 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 text-[10px] md:text-xs opacity-50'
          }
        >
          <p className="text-center md:text-left">© 2026 Kshatryx Technologies. All rights reserved.</p>
          <p className="text-center md:text-right">Made with <span className="text-red-500">❤</span> in Jabalpur.</p>
        </div>
      </div>
    </footer>
  );
}