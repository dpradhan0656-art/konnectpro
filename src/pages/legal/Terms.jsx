import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { BRAND } from '../../config/brandConfig';

const SECTIONS = [
  { title: '1. Acceptance of Terms', content: `By accessing or using ${BRAND.name} (operated by ${BRAND.legalName}), you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.` },
  { title: '2. Description of Service', content: `${BRAND.name} is a service marketplace that connects customers with verified local experts (electricians, plumbers, cleaners, etc.) for home and commercial services. We act as an intermediary platform and do not directly employ the experts.` },
  { title: '3. Customer Obligations', content: 'You agree to: provide accurate contact and address details for service delivery; pay the agreed price for services; treat experts with respect; and not misuse the platform for illegal or fraudulent purposes.' },
  { title: '4. Expert/Partner Obligations', content: 'Experts registered on our platform agree to: provide services in a professional and timely manner; maintain accurate KYC and skill information; comply with safety and quality standards; and follow our partner guidelines and commission structure.' },
  { title: '5. Booking & Payments', content: 'Bookings are confirmed upon payment or selection of Cash After Service. Payments are processed securely via Razorpay. Prices displayed are inclusive of applicable taxes unless stated otherwise. We reserve the right to modify pricing with notice.' },
  { title: '6. Cancellation & Refunds', content: 'Our Cancellation & Refund Policy applies to all bookings. Please refer to the Refund Policy page for detailed terms.' },
  { title: '7. Limitation of Liability', content: 'To the extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from use of our platform or services. Our liability is limited to the amount paid for the specific service in question.' },
  { title: '8. Intellectual Property', content: 'All content, logos, and materials on our platform are owned by us or our licensors. You may not copy, modify, or distribute them without our written consent.' },
  { title: '9. Termination', content: 'We may suspend or terminate your access for violation of these terms, fraud, or at our discretion. You may close your account at any time by contacting us.' },
  { title: '10. Governing Law', content: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Jabalpur, Madhya Pradesh.' },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Terms of Service</h1>
          <p className="text-slate-500 mt-2">Terms for customers and experts</p>
          <div className="w-20 h-1 bg-teal-500 mx-auto mt-4 rounded-full" />
        </div>

        <div className="bg-white p-6 md:p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8 text-slate-600 leading-relaxed">
          <p className="text-slate-500 text-sm">Last updated: March 2026</p>
          <p className="text-slate-700">
            Welcome to <span className="font-bold text-teal-600">{BRAND.name}</span>. These Terms of Service govern your use of our platform, whether you are a customer or a service partner (expert).
          </p>

          {SECTIONS.map((s, i) => (
            <div key={i}>
              <h2 className="text-lg font-black text-slate-900 mb-3">{s.title}</h2>
              <p>{s.content}</p>
            </div>
          ))}

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
            <FileText className="text-teal-600 shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Contact Us</h3>
              <p className="text-sm"><strong>{BRAND.legalName}</strong></p>
              <p className="text-sm"><strong>Email:</strong> {BRAND.contact.email}</p>
              <p className="text-sm"><strong>Phone:</strong> {BRAND.contact.phone}</p>
              <p className="text-sm"><strong>Address:</strong> {BRAND.contact.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm">
          <Link to="/contact-support" className="hover:text-slate-700">Contact Support</Link>
          <span className="mx-2">·</span>
          <Link to="/privacy" className="hover:text-slate-700">Privacy</Link>
          <span className="mx-2">·</span>
          <Link to="/refund-policy" className="hover:text-slate-700">Refund Policy</Link>
        </div>
      </div>
    </div>
  );
}
