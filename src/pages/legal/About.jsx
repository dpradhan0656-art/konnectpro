import React from 'react';
import { ShieldCheck, Users, Target } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20">
      
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">About Us</h1>
            <div className="w-20 h-1 bg-teal-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Content Card */}
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8 text-slate-600 leading-relaxed">
            
            <p className="text-lg font-medium text-slate-800">
               Welcome to <span className="font-black text-teal-600">KSHATR.COM</span>, Jabalpur's most trusted home service partner.
            </p>

            <p>
               We are not just an app; we are a movement. A movement to bring respect, fair wages, and dignity to local skilled experts (electricians, plumbers, cleaners) while providing a safe, standardized service to your home.
            </p>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
               <ShieldCheck className="text-teal-600 shrink-0 mt-1" size={24}/>
               <div>
                  <h3 className="font-bold text-slate-900 mb-1">Powered by Apna Hunar</h3>
                  <p className="text-sm">
                     Kshatr is a flagship venture of <strong>Apna Hunar</strong>, an enterprise dedicated to uplifting skilled professionals in India. Our Udyam Registration reflects our commitment to legitimate and transparent business practices.
                  </p>
               </div>
            </div>

            <h3 className="font-bold text-slate-900 text-xl flex items-center gap-2 mt-8">
               <Target className="text-pink-500"/> Our Mission
            </h3>
            <p>
               To organize the unorganized. To ensure that every expert gets paid fairly for their "Hunar" (Skill), and every customer gets a "Kshatr" (Shield) of trust regarding safety and quality.
            </p>
            
            <div className="pt-8 border-t border-slate-100 text-center">
               <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Headquartered in Jabalpur, MP
               </p>
            </div>
        </div>
      </div>
    </div>
  );
}