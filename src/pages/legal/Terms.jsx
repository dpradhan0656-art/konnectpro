import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="p-8 max-w-4xl mx-auto font-sans text-gray-700">
      <button onClick={() => navigate('/')} className="mb-4 flex items-center gap-2 text-blue-600 font-bold"><ArrowLeft size={20}/> Back to Home</button>
      <h1 className="text-3xl font-bold mb-4 text-slate-900">Terms & Conditions</h1>
      <p className="mb-4">Welcome to Apna Hunar!</p>
      <h2 className="text-xl font-bold mt-6 mb-2">1. Services</h2>
      <p className="mb-2">Apna Hunar connects customers with local experts for home services. We act as an intermediary platform.</p>
      <h2 className="text-xl font-bold mt-6 mb-2">2. Booking & Payments</h2>
      <p className="mb-2">You agree to pay the listed price for services. Payments are processed securely via Razorpay.</p>
      <h2 className="text-xl font-bold mt-6 mb-2">3. User Responsibilities</h2>
      <p className="mb-2">You agree to provide accurate location and contact details for service delivery.</p>
      <h2 className="text-xl font-bold mt-6 mb-2">4. Contact Us</h2>
      <p className="mt-4">
        <strong>APNA HUNAR</strong><br/>
        H-36, Mastana Road, Ranjhi, Jabalpur, MP - 482005<br/>
        Email: apnahunars@gmail.com
      </p>
    </div>
  );
}
