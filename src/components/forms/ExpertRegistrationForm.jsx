import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Phone, Mail, Briefcase, MapPin, Clock, CreditCard, Loader2, CheckCircle } from 'lucide-react';

const OTHER_VALUE = 'Other';

const CITY_OPTIONS = ['Jabalpur', 'Sagar', 'Bhopal', 'Indore', 'Jhansi'];

/**
 * Single source of truth for expert lead / registration inserts into `public.experts`.
 *
 * @param {object} props
 * @param {'footer' | 'areaHead' | 'admin'} props.variant
 * @param {string | null} [props.areaHeadId] — area_heads.id (UUID) when `variant === 'areaHead'`
 * @param {string} [props.defaultCity] — pre-filled city (e.g. area head assigned territory)
 * @param {boolean} [props.cityReadOnly] — lock city field (area head)
 * @param {boolean} [props.compact] — tighter layout (footer)
 * @param {() => void} [props.onSuccess] — called after successful insert (e.g. refresh admin list)
 * @param {string} [props.className]
 */
export default function ExpertRegistrationForm({
  variant = 'admin',
  areaHeadId = null,
  defaultCity = '',
  cityReadOnly = false,
  compact = false,
  onSuccess,
  className = '',
}) {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [categoryKey, setCategoryKey] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [city, setCity] = useState(() => defaultCity || (variant === 'footer' ? '' : 'Jabalpur'));
  const [experienceYears, setExperienceYears] = useState('');
  const [aadhar, setAadhar] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('categories').select('name').eq('is_active', true).order('name');
      if (cancelled || !data?.length) return;
      setCategories(data);
      setCategoryKey((prev) => prev || data[0].name);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (defaultCity) setCity(defaultCity);
  }, [defaultCity]);

  const isOther = categoryKey === OTHER_VALUE;
  const finalCategory = isOther ? customCategory.trim() : categoryKey;

  const resetLocal = useCallback(() => {
    setName('');
    setPhone('');
    setEmail('');
    setCustomCategory('');
    setExperienceYears('');
    setAadhar('');
    setSuccess(false);
    setError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const n = name.trim();
    const digits = phone.replace(/\D/g, '');
    if (n.length < 2) {
      setError('Please enter full name.');
      return;
    }
    if (digits.length !== 10) {
      setError('Phone must be exactly 10 digits.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email.');
      return;
    }
    if (!finalCategory) {
      setError('Select or enter a service category.');
      return;
    }
    const cityVal = (cityReadOnly ? defaultCity || city : city).trim();
    if (!cityVal) {
      setError('Please enter city.');
      return;
    }

    let expNum = parseInt(String(experienceYears).trim(), 10);
    if (String(experienceYears).trim() === '' || Number.isNaN(expNum)) expNum = 0;
    if (expNum < 0 || expNum > 60) {
      setError('Experience must be between 0 and 60 years.');
      return;
    }

    let aadharPayload = null;
    const aadharDigits = aadhar.replace(/\D/g, '');
    if (aadharDigits.length > 0) {
      if (aadharDigits.length !== 12) {
        setError('Aadhar must be 12 digits, or leave blank.');
        return;
      }
      aadharPayload = aadharDigits;
    }

    if (variant === 'areaHead' && !areaHeadId) {
      setError('Area head session missing. Refresh and try again.');
      return;
    }

    const payload = {
      name: n,
      phone: digits,
      email: email.trim().toLowerCase(),
      service_category: finalCategory,
      city: cityVal,
      experience_years: expNum,
      status: 'pending',
    };
    if (aadharPayload) payload.aadhar_number = aadharPayload;

    if (variant === 'areaHead') {
      payload.user_id = null;
      payload.area_head_id = areaHeadId;
    } else {
      payload.user_id = null;
      payload.area_head_id = null;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('experts').insert([payload]);
      if (insertError) throw insertError;
      setSuccess(true);
      resetLocal();
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Could not submit. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const shell = compact
    ? 'rounded-xl border border-slate-700/80 bg-slate-800/50 p-4'
    : 'rounded-2xl border border-teal-500/25 bg-slate-900 p-5 md:p-6 shadow-xl';

  return (
    <div className={`${shell} relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />
      <div className="relative z-10">
        <div className="mb-4">
          <h3 className={`font-black text-white tracking-tight ${compact ? 'text-sm' : 'text-lg'}`}>
            {variant === 'footer' && 'Partner application'}
            {variant === 'areaHead' && 'Onboard expert (Karigar)'}
            {variant === 'admin' && 'Register expert (pending review)'}
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Single registration form — status defaults to pending
          </p>
        </div>

        {success && (
          <div
            className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-3 text-emerald-300 text-sm font-semibold"
            role="status"
          >
            <CheckCircle className="shrink-0 mt-0.5 text-emerald-400" size={18} />
            <span>Application received. Our team will review shortly.</span>
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-300 text-xs font-bold">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              required
              autoComplete="name"
              placeholder="Full name"
              value={name}
              onChange={(ev) => {
                setSuccess(false);
                setName(ev.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-500/50"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="tel"
              required
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              placeholder="10-digit mobile"
              value={phone}
              onChange={(ev) => {
                setSuccess(false);
                setPhone(ev.target.value.replace(/\D/g, '').slice(0, 10));
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-500/50"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(ev) => {
                setSuccess(false);
                setEmail(ev.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-500/50"
            />
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            <select
              value={categoryKey}
              onChange={(ev) => {
                setSuccess(false);
                setCategoryKey(ev.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-500/50 appearance-none cursor-pointer"
            >
              {categories.length === 0 && <option value="">Loading categories…</option>}
              {categories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value={OTHER_VALUE}>Other (type below)</option>
            </select>
          </div>

          {isOther && (
            <input
              type="text"
              required
              placeholder="Custom category"
              value={customCategory}
              onChange={(ev) => {
                setSuccess(false);
                setCustomCategory(ev.target.value);
              }}
              className="w-full bg-teal-950/20 border border-teal-500/40 text-white rounded-xl py-3 px-3 text-sm outline-none focus:border-teal-400"
            />
          )}

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            {cityReadOnly ? (
              <input
                type="text"
                readOnly
                tabIndex={-1}
                value={defaultCity || city || '—'}
                className="w-full bg-slate-900/80 border border-slate-700 text-slate-400 rounded-xl py-3 pl-10 pr-3 text-sm cursor-not-allowed"
                title="Territory from area head profile"
              />
            ) : variant === 'admin' ? (
              <select
                value={city}
                onChange={(ev) => {
                  setSuccess(false);
                  setCity(ev.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-500/50 appearance-none cursor-pointer"
              >
                {CITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                placeholder="City"
                value={city}
                onChange={(ev) => {
                  setSuccess(false);
                  setCity(ev.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-500/50"
              />
            )}
          </div>

          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="number"
              min={0}
              max={60}
              placeholder="Experience (years)"
              value={experienceYears}
              onChange={(ev) => {
                setSuccess(false);
                setExperienceYears(ev.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-500/50"
            />
          </div>

          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              inputMode="numeric"
              maxLength={12}
              placeholder="Aadhar (optional, 12 digits)"
              value={aadhar}
              onChange={(ev) => {
                setSuccess(false);
                setAadhar(ev.target.value.replace(/\D/g, '').slice(0, 12));
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || categories.length === 0}
            className="w-full mt-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 shadow-lg shadow-teal-900/40 transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Submitting…
              </>
            ) : (
              'Submit application'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
