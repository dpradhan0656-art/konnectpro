import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { BRAND } from '../../config/brandConfig';
import { supabase } from '../../lib/supabase';

const FAQ_ITEMS = [
  { q: 'How do I book a service?', a: 'Browse categories, add services to cart, and proceed to checkout. You can pay online or choose Cash After Service.' },
  { q: 'How can I cancel or reschedule?', a: 'Go to My Bookings, select the order, and cancel or contact support for rescheduling. Refunds follow our Refund Policy.' },
  { q: 'What if the expert doesn\'t show up?', a: 'Contact us immediately. We will reschedule or process a full refund as per our policy.' },
  { q: 'How do I become a service partner?', a: 'Visit "Join as Partner" in the footer and complete the registration. Our team will verify and onboard you.' },
  { q: 'Is my payment secure?', a: 'Yes. We use Razorpay for secure PCI-compliant payments. We never store your card details.' },
];

export default function ContactSupport() {
  const [contactInfo, setContactInfo] = useState({
    phone: BRAND.contact.phone,
    email: BRAND.contact.email,
    address: BRAND.contact.address
  });
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.from('admin_settings').select('setting_key, setting_value')
          .in('setting_key', ['company_phone', 'company_email', 'company_address']);
        if (cancelled || !data?.length) return;
        setContactInfo(prev => {
          const next = { ...prev };
          data.forEach((item) => {
            if (item.setting_key === 'company_phone') next.phone = item.setting_value;
            if (item.setting_key === 'company_email') next.email = item.setting_value;
            if (item.setting_key === 'company_address') next.address = item.setting_value;
          });
          return next;
        });
      } catch {
        // Fallback to BRAND defaults
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Contact & Support</h1>
          <p className="text-slate-500 mt-2">We're here to help. Reach us anytime.</p>
          <div className="w-20 h-1 bg-teal-500 mx-auto mt-4 rounded-full" />
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <MessageCircle size={22} className="text-teal-500" /> Get in Touch
            </h2>
            <div className="grid gap-6">
              <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-200 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <Mail size={22} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Email</p>
                  <p className="font-bold text-slate-900">{contactInfo.email}</p>
                </div>
              </a>
              <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-200 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <Phone size={22} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone</p>
                  <p className="font-bold text-slate-900">{contactInfo.phone}</p>
                </div>
              </a>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                  <MapPin size={22} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Address</p>
                  <p className="font-bold text-slate-900 whitespace-pre-wrap">{contactInfo.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-lg font-black text-slate-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-slate-900 pr-4">{item.q}</span>
                    {expandedFaq === i ? <ChevronUp size={20} className="text-teal-500 shrink-0" /> : <ChevronDown size={20} className="text-teal-500 shrink-0" />}
                  </button>
                  {expandedFaq === i && (
                    <div className="px-4 pb-4 text-slate-600 text-sm leading-relaxed">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm">
          <Link to="/terms" className="hover:text-slate-700">Terms</Link>
          <span className="mx-2">·</span>
          <Link to="/privacy" className="hover:text-slate-700">Privacy</Link>
          <span className="mx-2">·</span>
          <Link to="/refund-policy" className="hover:text-slate-700">Refund Policy</Link>
        </div>
      </div>
    </div>
  );
}
