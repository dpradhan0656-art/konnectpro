import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { BRAND } from '../../config/brandConfig';

const SECTIONS = [
  { title: '1. Cancellation by Customer', content: 'You may cancel a booking up to 2 hours before the scheduled service time for a full refund. Cancellations made within 2 hours of the scheduled time may be subject to a partial deduction as per our service policy.' },
  { title: '2. Cancellation by Expert or Platform', content: 'If a service is cancelled by the expert or cannot be fulfilled due to platform or operational reasons, a full refund will be initiated to your original payment method within 5–7 business days.' },
  { title: '3. No-Show by Expert', content: 'If the assigned expert does not show up at the scheduled time and place, please contact us immediately. We will reschedule your service at no extra cost or process a full refund.' },
  { title: '4. Service Quality Disputes', content: 'For any service quality issues, please contact us within 24 hours of service completion. We will investigate and may offer a partial refund, re-service, or credit based on the circumstances.' },
  { title: '5. Refund Processing', content: 'Refunds are processed to the original payment method. For online payments (cards, UPI, net banking), refunds typically reflect within 5–10 business days depending on your bank. Cash payments will be refunded via bank transfer or store credit.' },
  { title: '6. Non-Refundable Situations', content: 'Services that have been completed and accepted by the customer are generally non-refundable. Any misuse, fraud, or violation of our Terms of Service may result in forfeiture of refund eligibility.' },
];

export default function Refund() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Cancellation & Refund Policy</h1>
          <p className="text-slate-500 mt-2">Fair and transparent refund rules for our service marketplace</p>
          <div className="w-20 h-1 bg-teal-500 mx-auto mt-4 rounded-full" />
        </div>

        <div className="bg-white p-6 md:p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8 text-slate-600 leading-relaxed">
          <p className="text-slate-700">
            At <span className="font-bold text-teal-600">{BRAND.legalName}</span> (operating as {BRAND.name}), we aim to provide a seamless experience. This policy outlines our cancellation and refund rules for customers and experts.
          </p>

          {SECTIONS.map((s, i) => (
            <div key={i}>
              <h2 className="text-lg font-black text-slate-900 mb-3">{s.title}</h2>
              <p>{s.content}</p>
            </div>
          ))}

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
            <ShieldCheck className="text-teal-600 shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Contact Us for Refunds</h3>
              <p className="text-sm"><strong>Email:</strong> {BRAND.contact.email}</p>
              <p className="text-sm"><strong>Phone:</strong> {BRAND.contact.phone}</p>
              <p className="text-sm"><strong>Address:</strong> {BRAND.contact.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm">
          <Link to="/contact-support" className="hover:text-slate-700">Contact Support</Link>
          <span className="mx-2">·</span>
          <Link to="/terms" className="hover:text-slate-700">Terms</Link>
          <span className="mx-2">·</span>
          <Link to="/privacy" className="hover:text-slate-700">Privacy</Link>
        </div>
      </div>
    </div>
  );
}
