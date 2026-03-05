import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { BRAND } from '../../config/brandConfig';

const SECTIONS = [
  {
    title: '1. Data Controller',
    // Previous text (kept for audit - No-Delete Rule)
    // content: `${BRAND.legalName} (operating as ${BRAND.name}) is the data controller for the personal data we collect through our platform. We comply with the Digital Personal Data Protection Act, 2023 (DPDP Act) in India and applicable international standards including GDPR where relevant.`,
    content:
      'APNA HUNAR INDIA (operating via our mobile app and website www.kshatr.com) is the data controller for the personal data we collect through our platform. We comply with the Digital Personal Data Protection Act, 2023 (DPDP Act) in India and applicable international standards including GDPR where relevant.',
  },
  { title: '2. Information We Collect', content: 'We collect: (a) Account data: name, phone number, email, address when you register or book a service; (b) Payment data: processed securely by Razorpay—we do not store card details; (c) Usage data: device info, IP address, and interaction logs for security and analytics; (d) Expert data: KYC, skills, and service history for partner verification.' },
  { title: '3. Legal Basis & Purpose', content: 'We process your data based on consent, contract performance, and legitimate interests. We use it to: provide and improve our services, process payments, communicate about bookings, ensure platform safety, comply with legal obligations, and send service-related notifications. We do not sell your personal data.' },
  { title: '4. Data Retention', content: 'We retain your data for as long as your account is active or as needed to provide services, resolve disputes, and comply with legal obligations. You may request deletion of your data subject to applicable retention requirements.' },
  { title: '5. Your Rights', content: 'Under the DPDP Act and similar laws, you have the right to: access your data, correct inaccuracies, request deletion (where permitted), withdraw consent, and lodge a complaint with the Data Protection Board of India. Contact us to exercise these rights.' },
  { title: '6. Data Security', content: 'We use industry-standard security measures including encryption, secure connections (HTTPS), and access controls. Payment processing is handled by PCI-compliant partners. We do not store sensitive payment credentials.' },
  { title: '7. Third-Party Sharing', content: 'We may share data with: service providers (hosting, payment, analytics), experts assigned to your bookings, and authorities when required by law. We ensure appropriate contracts and safeguards for such sharing.' },
  { title: '8. Cookies & Tracking', content: 'We use essential cookies for authentication and session management. We may use analytics cookies to improve our service. You can manage cookie preferences in your browser settings.' },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Privacy Policy</h1>
          <p className="text-slate-500 mt-2">DPDP Act & GDPR-aligned data handling</p>
          <div className="w-20 h-1 bg-teal-500 mx-auto mt-4 rounded-full" />
        </div>

        <div className="bg-white p-6 md:p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8 text-slate-600 leading-relaxed">
          <p className="text-slate-500 text-sm">Last updated: March 2026</p>
          {/* Previous intro (kept for audit - No-Delete Rule)
          <p className="text-slate-700">
            At <span className="font-bold text-teal-600">{BRAND.legalName}</span>, we take your privacy seriously. This policy explains how we collect, use, and protect your personal data in compliance with the Digital Personal Data Protection Act, 2023 (India) and applicable international standards.
          </p>
          */}
          <p className="text-slate-700">
            At <span className="font-bold text-teal-600">APNA HUNAR INDIA</span>, operating via our mobile app and website{' '}
            <span className="font-mono text-teal-700">www.kshatr.com</span>, we take your privacy seriously. This policy explains how we collect, use, and protect your personal data in compliance with the Digital Personal Data Protection Act, 2023 (India) and applicable international standards.
          </p>

          {SECTIONS.map((s, i) => (
            <div key={i}>
              <h2 className="text-lg font-black text-slate-900 mb-3">{s.title}</h2>
              <p>{s.content}</p>
            </div>
          ))}

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
            <Shield className="text-teal-600 shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Contact Us</h3>
              {/* Previous contact details (kept for audit - No-Delete Rule)
              <p className="text-sm"><strong>Data Controller:</strong> {BRAND.legalName}</p>
              <p className="text-sm"><strong>Email:</strong> {BRAND.contact.email}</p>
              <p className="text-sm"><strong>Phone:</strong> {BRAND.contact.phone}</p>
              <p className="text-sm"><strong>Address:</strong> {BRAND.contact.address}</p>
              */}
              <p className="text-sm">
                <strong>Data Controller:</strong> APNA HUNAR INDIA
              </p>
              <p className="text-sm">
                <strong>Company:</strong> APNA HUNAR INDIA
              </p>
              <p className="text-sm">
                <strong>Website:</strong> www.kshatr.com
              </p>
              <p className="text-sm">
                <strong>Email:</strong> apnahunars@gmail.com
              </p>
              <p className="text-sm">
                <strong>Phone:</strong> +91-9589634799
              </p>
              <p className="text-sm">
                <strong>Address:</strong> H-36, Mastana Road, Ranjhi, Jabalpur, MP - 482005
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm">
          <Link to="/contact-support" className="hover:text-slate-700">Contact Support</Link>
          <span className="mx-2">·</span>
          <Link to="/terms" className="hover:text-slate-700">Terms</Link>
          <span className="mx-2">·</span>
          <Link to="/refund-policy" className="hover:text-slate-700">Refund Policy</Link>
        </div>
      </div>
    </div>
  );
}
