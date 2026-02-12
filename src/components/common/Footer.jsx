import React from 'react';
import { BRAND } from '../../config/brandConfig';
import { Facebook, Twitter, Instagram, Linkedin, Download } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-6 pb-32">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Column 1: Company Logo & About */}
        <div>
          <h2 className="text-2xl font-black text-white mb-4">
            Konnect<span className="text-teal-500">Pro</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            India's most trusted home services platform. Quality work, verified experts, and peace of mind.
          </p>
          <p className="text-xs text-slate-500">© 2026 {BRAND.legalName}</p>
        </div>

        {/* Column 2: Company Links */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Company</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer transition">About Us</li>
            <li className="hover:text-white cursor-pointer transition">Terms & Conditions</li>
            <li className="hover:text-white cursor-pointer transition">Privacy Policy</li>
            <li className="hover:text-white cursor-pointer transition">Anti-discrimination Policy</li>
            <li className="hover:text-white cursor-pointer transition">Careers</li>
          </ul>
        </div>

        {/* Column 3: For Customers & Partners */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">For Customers</h3>
          <ul className="space-y-2 text-sm mb-6">
            <li className="hover:text-white cursor-pointer transition">User Reviews</li>
            <li className="hover:text-white cursor-pointer transition">Categories Near You</li>
            <li className="hover:text-white cursor-pointer transition">Contact Support</li>
          </ul>

          <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">For Partners</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-teal-400 cursor-pointer transition font-bold">Register as a Professional</li>
          </ul>
        </div>

        {/* Column 4: Social & App Links */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Social Links</h3>
          <div className="flex gap-4 mb-6">
            <div className="bg-slate-800 p-2 rounded-full hover:bg-teal-600 transition cursor-pointer"><Twitter size={18} /></div>
            <div className="bg-slate-800 p-2 rounded-full hover:bg-teal-600 transition cursor-pointer"><Facebook size={18} /></div>
            <div className="bg-slate-800 p-2 rounded-full hover:bg-teal-600 transition cursor-pointer"><Instagram size={18} /></div>
            <div className="bg-slate-800 p-2 rounded-full hover:bg-teal-600 transition cursor-pointer"><Linkedin size={18} /></div>
          </div>

          <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Download App</h3>
          <div className="flex flex-col gap-2">
            <button className="bg-slate-800 flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 transition">
                <Download size={20} className="text-teal-500"/>
                <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Get it on</p>
                    <p className="text-sm font-bold text-white">Google Play</p>
                </div>
            </button>
            <button className="bg-slate-800 flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 transition">
                <div className="text-teal-500 font-bold text-xl"></div>
                <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Download on the</p>
                    <p className="text-sm font-bold text-white">App Store</p>
                </div>
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-800 text-center">
         <p className="text-xs text-slate-500"> CIN: U74140DL2015PTC281719 • {BRAND.address}</p>
      </div>
    </footer>
  );
}