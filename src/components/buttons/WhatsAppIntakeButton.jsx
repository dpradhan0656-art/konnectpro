import React from 'react';

export const WHATSAPP_EXPERT_INTAKE_TEMPLATE = `Kshatr Expert Onboarding

Name:
Phone:
Email:
Skill:
City:
Experience:

Please attach:
1. Profile photo/selfie
2. Aadhaar scan/photo

Note: Share only correct details. Aadhaar documents are used only for KYC verification.`;

function WhatsAppIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" fill="currentColor">
      <path d="M16.04 3C8.88 3 3.06 8.82 3.06 15.98c0 2.29.6 4.53 1.73 6.5L3 29l6.68-1.75a12.9 12.9 0 0 0 6.36 1.62h.01c7.16 0 12.98-5.82 12.98-12.98C29.03 8.82 23.2 3 16.04 3Zm0 23.67h-.01c-1.9 0-3.76-.51-5.38-1.47l-.39-.23-3.96 1.04 1.06-3.86-.25-.4a10.72 10.72 0 0 1-1.65-5.77c0-5.84 4.75-10.59 10.6-10.59 2.83 0 5.49 1.1 7.5 3.1a10.52 10.52 0 0 1 3.1 7.49c0 5.84-4.76 10.59-10.62 10.59Zm5.82-7.93c-.32-.16-1.88-.93-2.17-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.87-1.76-2.19-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.71-.97-2.35-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.55.08-.84.4-.29.32-1.1 1.07-1.1 2.61 0 1.54 1.13 3.03 1.29 3.24.16.21 2.22 3.39 5.37 4.75.75.32 1.34.52 1.8.66.76.24 1.45.21 1.99.13.61-.09 1.88-.77 2.15-1.52.26-.75.26-1.39.18-1.52-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

export default function WhatsAppIntakeButton({
  label = 'Send Intake Form',
  className = '',
  template = WHATSAPP_EXPERT_INTAKE_TEMPLATE,
}) {
  const openWhatsApp = () => {
    const encodedTemplate = encodeURIComponent(template);
    window.open(`https://wa.me/?text=${encodedTemplate}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={openWhatsApp}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-950 shadow-lg shadow-emerald-950/20 transition-all hover:bg-[#20bd5a] active:scale-95 ${className}`}
    >
      <WhatsAppIcon />
      {label}
    </button>
  );
}
