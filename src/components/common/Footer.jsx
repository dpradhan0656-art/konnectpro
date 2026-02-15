import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tighter">
            APNA <span className="text-teal-400">HUNAR</span>
          </h2>
          <p className="text-xs leading-relaxed text-slate-400">
            India's most transparent service marketplace. Empowering local experts and ensuring customer delight through honesty.
          </p>
          <div className="flex gap-4 pt-2">
            <Facebook size={18} className="cursor-pointer hover:text-teal-400" />
            <Instagram size={18} className="cursor-pointer hover:text-teal-400" />
            <Twitter size={18} className="cursor-pointer hover:text-teal-400" />
          </div>
        </div>

        {/* For Customers */}
        <div>
          <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">For Customers</h3>
          <ul className="space-y-2 text-xs">
            <li onClick={() => navigate('/reviews')} className="cursor-pointer hover:text-white">User Reviews</li>
            <li onClick={() => navigate('/categories')} className="cursor-pointer hover:text-white">Categories Near You</li>
            <li onClick={() => navigate('/safety')} className="cursor-pointer hover:text-white">Safety & Trust</li>
            <li onClick={() => navigate('/support')} className="cursor-pointer hover:text-white font-bold text-teal-400">Contact Support</li>
          </ul>
        </div>

        {/* For Partners (Expert Army) */}
        <div>
          <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">For Partners</h3>
          <ul className="space-y-2 text-xs">
            <li onClick={() => navigate('/register-expert')} className="cursor-pointer hover:text-teal-400 font-bold">Register as a Professional</li>
            <li onClick={() => navigate('/anti-discrimination')} className="cursor-pointer hover:text-white">Anti-discrimination Policy</li>
            <li onClick={() => navigate('/careers')} className="cursor-pointer hover:text-white">Careers</li>
          </ul>
        </div>

        {/* Legal & App */}
        <div>
          <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Company Info</h3>
          <ul className="space-y-2 text-xs">
            <li onClick={() => navigate('/about')} className="cursor-pointer hover:text-white">About Us</li>
            <li onClick={() => navigate('/terms')} className="cursor-pointer hover:text-white">Terms & Conditions</li>
            <li onClick={() => navigate('/privacy')} className="cursor-pointer hover:text-white">Privacy Policy</li>
          </ul>
          <div className="mt-6 flex gap-2">
             <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store" className="h-8 cursor-pointer" />
          </div>
        </div>
      </div>

      <hr className="my-8 border-slate-800" />

      {/* 🇮🇳 IMANDARI WALI DETAILS (Transparency Section) */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-slate-500 font-medium">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <p>© 2026 APNA HUNAR INDIA PRIVATE LIMITED. All rights reserved.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
           <ShieldCheck size={14} className="text-teal-500" />
           <span className="uppercase tracking-tighter">100% Secure & Honest Platform</span>
        </div>
      </div>
    </footer>
  );
}