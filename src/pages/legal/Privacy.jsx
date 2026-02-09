import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();
  return (
    <div className="p-8 max-w-4xl mx-auto font-sans text-gray-700">
      <button onClick={() => navigate('/')} className="mb-4 flex items-center gap-2 text-blue-600 font-bold"><ArrowLeft size={20}/> Back to Home</button>
      <h1 className="text-3xl font-bold mb-4 text-slate-900">Privacy Policy</h1>
      <p className="mb-4">Last updated: February 09, 2026</p>
      <p className="mb-4">At Apna Hunar, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information.</p>
      <h2 className="text-xl font-bold mt-6 mb-2">1. Information We Collect</h2>
      <p className="mb-2">We collect information you provide directly to us, such as your name, phone number, and address when you book a service.</p>
      <h2 className="text-xl font-bold mt-6 mb-2">2. How We Use Your Information</h2>
      <p className="mb-2">We use your data to provide home services, process payments via Razorpay, and communicate with you regarding your bookings.</p>
      <h2 className="text-xl font-bold mt-6 mb-2">3. Contact Us</h2>
      <p className="mt-4 font-bold">If you have any questions, please contact us:</p>
      <ul className="list-disc ml-6 mt-2">
        <li><strong>Business Name:</strong> APNA HUNAR</li>
        <li><strong>Address:</strong> H-36, Mastana Road, Ranjhi, Jabalpur, MP - 482005</li>
        <li><strong>Email:</strong> apnahunars@gmail.com</li>
        <li><strong>Phone:</strong> +91-9425451382</li>
      </ul>
    </div>
  );
}
