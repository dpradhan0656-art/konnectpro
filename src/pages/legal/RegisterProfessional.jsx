import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar'; 
import Footer from '../../components/common/Footer';

export default function RegisterProfessional() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-black mb-6">Register as a Kshatr Expert</h1>
        <p className="mb-8 text-slate-600">Earn more with India's most honest service platform.</p>
        
        {/* 🌟 PERFECT LINK: Matches App.jsx route exactly */}
        <button 
            onClick={() => navigate('/register-expert')} 
            className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-teal-900/20 transition-all active:scale-95"
        >
            Start Application
        </button>
        
      </div>
      <Footer />
    </div>
  );
}