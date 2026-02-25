import React from 'react';
import { Mail, Briefcase, MapPin, ArrowRight, Star } from 'lucide-react';

export default function Careers() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20">
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-16">
        <span className="bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-teal-200">
           We are Hiring
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-4">
           Build the Future with <span className="text-teal-600">Apna Hunar</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
           Join the team behind <span className="font-bold text-slate-700">Kshatr.com</span>. We are on a mission to organize the unorganized home service sector in India.
        </p>
      </div>

      {/* Why Join Us */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
         {[
            {icon: <Star className="text-amber-500"/>, title: "Impact", desc: "Change lives of local experts."},
            {icon: <Briefcase className="text-blue-500"/>, title: "Growth", desc: "Work directly with founders."},
            {icon: <MapPin className="text-red-500"/>, title: "Culture", desc: "Rooted in Jabalpur, aiming Global."}
         ].map((item, i) => (
             <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
                <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">{item.icon}</div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
             </div>
         ))}
      </div>

      {/* Open Positions & Email CTA */}
      <div className="max-w-3xl mx-auto px-6">
         <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             
             <h2 className="text-2xl font-black mb-4">Don't see a role for you?</h2>
             <p className="text-slate-300 mb-8 max-w-md mx-auto">
                We are always looking for talented developers, designers, and operation managers. Send your CV directly to our HR team.
             </p>
             
             <a href="mailto:apnahunars@gmail.com" className="inline-flex items-center gap-3 bg-white text-slate-900 px-6 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-teal-50 transition-all active:scale-95">
                <Mail size={20} className="text-teal-600"/>
                apnahunars@gmail.com
             </a>
             
             <p className="text-[10px] text-slate-500 mt-6 uppercase tracking-widest">
                A Venture of Apna Hunar Group
             </p>
         </div>
      </div>

    </div>
  );
}