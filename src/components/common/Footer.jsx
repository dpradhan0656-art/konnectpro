import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 pb-24 mt-10 rounded-t-[2rem]">
      <div className="px-6">
        
        {/* 1. BRAND INFO */}
        <div className="mb-8">
            <h2 className="text-2xl font-black text-white tracking-tighter mb-2">
                Konnect<span className="text-teal-500">Pro</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
                India's most trusted home service platform. Verified Experts, Secure Payments, and 100% Satisfaction Guarantee.
            </p>
        </div>

        {/* 2. IMPORTANT LINKS (Razorpay & Govt Norms) */}
        <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
                <h3 className="text-white font-bold text-sm mb-3">Company</h3>
                <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-teal-400">About Us</a></li>
                    <li><a href="#" className="hover:text-teal-400">Careers</a></li>
                    <li><a href="#" className="hover:text-teal-400">Blog</a></li>
                </ul>
            </div>
            <div>
                <h3 className="text-white font-bold text-sm mb-3">Legal (Razorpay)</h3>
                <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-teal-400">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-teal-400">Terms & Conditions</a></li>
                    <li><a href="#" className="hover:text-teal-400">Refund & Cancellation</a></li>
                    <li><a href="#" className="hover:text-teal-400">Shipping Policy</a></li>
                </ul>
            </div>
        </div>

        {/* 3. CONTACT US (Mandatory for Trust) */}
        <div className="mb-8 border-t border-slate-800 pt-6">
            <h3 className="text-white font-bold text-sm mb-4">Contact Us</h3>
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-800 p-2 rounded-full"><Phone size={14} className="text-teal-500"/></div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500">Helpline</p>
                        <p className="text-xs font-bold text-white">+91 98765 43210</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-slate-800 p-2 rounded-full"><Mail size={14} className="text-teal-500"/></div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500">Email Support</p>
                        <p className="text-xs font-bold text-white">support@konnectpro.in</p>
                    </div>
                </div>
            </div>
        </div>

        {/* 4. SOCIAL & COPYRIGHT */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-6">
            <p className="text-[10px] text-slate-500">© 2026 KonnectPro India.</p>
            <div className="flex gap-4">
                <Facebook size={16} className="hover:text-blue-500 cursor-pointer"/>
                <Twitter size={16} className="hover:text-sky-500 cursor-pointer"/>
                <Instagram size={16} className="hover:text-pink-500 cursor-pointer"/>
            </div>
        </div>

      </div>
    </footer>
  );
}