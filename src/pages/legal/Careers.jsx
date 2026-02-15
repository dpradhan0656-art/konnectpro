import React from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function Careers() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-black text-slate-900 mb-8">Work with <span className="text-teal-600">KonnectPro</span></h1>
        <p className="text-lg text-slate-600">We are expanding from Jabalpur to Pan-India. Join our mission!</p>
        <div className="mt-10 p-6 bg-teal-50 rounded-xl">
           <p className="font-bold">Email your resume to: careers@konnectpro.in</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}