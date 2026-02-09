import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Refund() {
  const navigate = useNavigate();
  return (
    <div className="p-8 max-w-4xl mx-auto font-sans text-gray-700">
      <button onClick={() => navigate('/')} className="mb-4 flex items-center gap-2 text-blue-600 font-bold"><ArrowLeft size={20}/> Back to Home</button>
      <h1 className="text-3xl font-bold mb-4 text-slate-900">Cancellation & Refund Policy</h1>
      <h2 className="text-xl font-bold mt-6 mb-2">1. Cancellation</h2>
      <p className="mb-2">You can cancel a booking up to 2 hours before the scheduled time for a full refund.</p>
      <h2 className="text-xl font-bold mt-6 mb-2">2. Refunds</h2>
      <p className="mb-2">If a service is cancelled by the expert or cannot be fulfilled, a full refund will be initiated to your original payment method within 5-7 business days.</p>
      <h2 className="text-xl font-bold mt-6 mb-2">3. Disputes</h2>
      <p className="mb-2">For any service quality issues, please contact us within 24 hours of service completion.</p>
      <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
        <h3 className="font-bold mb-2">Contact Us for Refunds:</h3>
        <p><strong>Email:</strong> apnahunars@gmail.com</p>
        <p><strong>Phone:</strong> +91-9425451382</p>
        <p><strong>Address:</strong> H-36, Mastana Road, Ranjhi, Jabalpur - 482005</p>
      </div>
    </div>
  );
}
