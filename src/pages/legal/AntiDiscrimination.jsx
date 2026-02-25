import React from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function AntiDiscrimination() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">
          Anti-Discrimination <span className="text-teal-600">Policy</span>
        </h1>
        <div className="prose prose-slate text-slate-600 leading-relaxed text-lg space-y-6">
          <p className="font-bold text-slate-800 text-xl">Dignity and Respect for Everyone.</p>
          <p>At <b>Kshatr</b>, we strictly prohibit discrimination against any person based on race, religion, caste, national origin, disability, or gender.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}