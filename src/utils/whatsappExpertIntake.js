export const EXPERT_WHATSAPP_INTAKE_TEMPLATE = `Kshatr Expert Onboarding

Basic details (required)
Name:
Phone:
Email:
Skill:
City:
Experience:

KYC documents (required)
1. Attach profile photo/selfie
2. Attach Aadhaar scan/photo

Payout details (optional now; required before withdrawal/manual bank transfer)
Account holder name:
Bank account number:
IFSC code:
PAN number:
Residential address:

Note: Share only correct details. Aadhaar documents are used only for KYC verification.`;

const FIELD_ALIASES = Object.freeze({
  name: ['name', 'naam', 'full name', 'expert name'],
  phone: ['phone', 'mobile', 'mobile number', 'contact', 'contact number'],
  email: ['email', 'email id', 'mail'],
  skill: ['skill', 'service', 'category', 'work', 'trade'],
  city: ['city', 'location', 'area'],
  experience: ['experience', 'experience years', 'exp', 'years'],
  aadhar_number: ['aadhar', 'aadhaar', 'aadhar number', 'aadhaar number'],
  bank_account_holder_name: ['account holder name', 'bank holder name', 'beneficiary name'],
  bank_account_number: ['bank account number', 'account number', 'ac number', 'a/c number'],
  ifsc_code: ['ifsc', 'ifsc code'],
  pan_number: ['pan', 'pan number'],
  residential_address: ['residential address', 'address', 'home address'],
});

const CITY_OPTIONS = ['Jabalpur', 'Sagar', 'Bhopal', 'Indore', 'Jhansi'];

function normalizeLabel(label) {
  return String(label || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalField(label) {
  const normalized = normalizeLabel(label);
  return Object.entries(FIELD_ALIASES).find(([, aliases]) => aliases.includes(normalized))?.[0] || null;
}

export function normalizeExpertIntakeCity(value, fallback = '') {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  const compact = normalizeLabel(raw);
  const exact = CITY_OPTIONS.find((city) => city.toLowerCase() === compact);
  if (exact) return exact;
  const contained = CITY_OPTIONS.find((city) => compact.includes(city.toLowerCase()));
  return contained || raw;
}

export function parseWhatsAppExpertIntake(rawText) {
  const raw = String(rawText || '').trim();
  const parsed = {};

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([^:=-]{2,40})\s*[:=-]\s*(.+?)\s*$/);
    if (!match) continue;
    const key = canonicalField(match[1]);
    if (!key) continue;
    parsed[key] = match[2].trim();
  }

  const phone = String(parsed.phone || '').replace(/\D/g, '').slice(-10);
  const experienceYears = Number.parseInt(String(parsed.experience || '').replace(/[^\d]/g, ''), 10);
  const aadharDigits = String(parsed.aadhar_number || '').replace(/\D/g, '');

  return {
    name: String(parsed.name || '').trim(),
    phone,
    email: String(parsed.email || '').trim().toLowerCase(),
    service_category: String(parsed.skill || '').trim(),
    city: normalizeExpertIntakeCity(parsed.city, ''),
    experience_years: Number.isFinite(experienceYears) ? experienceYears : '',
    aadhar_number: aadharDigits.length === 12 ? aadharDigits : '',
    bank_account_holder_name: String(parsed.bank_account_holder_name || '').trim(),
    bank_account_number: String(parsed.bank_account_number || '').replace(/\D/g, ''),
    ifsc_code: String(parsed.ifsc_code || '').trim().toUpperCase().replace(/\s/g, ''),
    pan_number: String(parsed.pan_number || '').trim().toUpperCase().replace(/\s/g, ''),
    residential_address: String(parsed.residential_address || '').trim(),
  };
}

export function validateParsedExpertIntake(data) {
  const errors = [];
  if (!data.name || data.name.length < 2) errors.push('Name is missing.');
  if (!/^\d{10}$/.test(data.phone || '')) errors.push('Phone must be 10 digits.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) errors.push('Valid email is missing.');
  if (!data.service_category) errors.push('Skill/category is missing.');
  if (!data.city) errors.push('City is missing.');
  return errors;
}
