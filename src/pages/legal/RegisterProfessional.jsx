import React from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function RegisterProfessional() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-black mb-6">Register as a KonnectPro Expert</h1>
        <p className="mb-8">Earn more with India's most honest service platform.</p>
        <button className="bg-teal-600 text-white px-8 py-3 rounded-full font-bold">Start Application</button>
      </div>
      <Footer />
    </div>
  );
}