import React, { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Phone, Briefcase, MapPin, UserPlus, Loader2, CheckCircle } from 'lucide-react';

const PRESET_CATEGORIES = ['Plumber', 'Electrician', 'Beautician', 'Carpenter', 'Salon'];
const OTHER_VALUE = 'Other';

const initialForm = {
  fullName: '',
  phone: '',
  categoryKey: PRESET_CATEGORIES[0],
  customCategory: '',
};

/**
 * Isolated onboarding form for Area Head dashboard only.
 * Inserts into `experts` (same table as homepage RegisterExpert) with status pending.
 */
export default function OnboardExpertForm({ manager }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const assignedCity = manager?.assigned_area?.trim() || '';

  const isOther = form.categoryKey === OTHER_VALUE;

  const resetForm = useCallback(() => {
    setForm(initialForm);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const name = form.fullName.trim();
    const digits = form.phone.replace(/\D/g, '');
    const finalCategory = isOther ? form.customCategory.trim() : form.categoryKey;

    if (name.length < 2) {
      setError('Please enter the expert’s full name.');
      return;
    }
    if (digits.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }
    if (!finalCategory) {
      setError('Please select a category or enter a custom one.');
      return;
    }
    if (!manager?.id) {
      setError('Session error. Please refresh and try again.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('experts').insert([
        {
          name,
          phone: digits,
          service_category: finalCategory,
          city: assignedCity || null,
          area_head_id: manager.id,
          status: 'pending',
          user_id: null,
        },
      ]);

      if (insertError) throw insertError;

      setSuccess(true);
      resetForm();
    } catch (err) {
      setError(err.message || 'Could not save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-teal-500/25 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <UserPlus className="text-teal-400 shrink-0" size={22} />
          <h2 className="text-lg font-black text-white tracking-tight">Karigar jode</h2>
        </div>
        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-5">
          Onboard expert — sent to admin for verification
        </p>

        {success && (
          <div
            className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-3 text-emerald-300 text-sm font-semibold"
            role="status"
          >
            <CheckCircle className="shrink-0 mt-0.5 text-emerald-400" size={18} />
            <span>Expert added successfully! Sent to Admin for verification.</span>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-300 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              required
              autoComplete="name"
              placeholder="Expert full name"
              value={form.fullName}
              onChange={(ev) => {
                setSuccess(false);
                setForm((f) => ({ ...f, fullName: ev.target.value }));
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
              value={form.phone}
              onChange={(ev) => {
                setSuccess(false);
                setForm((f) => ({ ...f, phone: ev.target.value.replace(/\D/g, '').slice(0, 10) }));
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-500/50"
            />
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            <select
              value={form.categoryKey}
              onChange={(ev) => {
                setSuccess(false);
                setForm((f) => ({ ...f, categoryKey: ev.target.value }));
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-500/50 appearance-none cursor-pointer"
            >
              {PRESET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={OTHER_VALUE}>Other</option>
            </select>
          </div>

          {isOther && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <input
                type="text"
                required={isOther}
                placeholder="Custom category name"
                value={form.customCategory}
                onChange={(ev) => {
                  setSuccess(false);
                  setForm((f) => ({ ...f, customCategory: ev.target.value }));
                }}
                className="w-full bg-teal-950/20 border border-teal-500/40 text-white rounded-xl py-3 px-3 text-sm outline-none focus:border-teal-400"
              />
            </div>
          )}

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500/80 pointer-events-none" size={16} />
            <input
              type="text"
              readOnly
              tabIndex={-1}
              value={assignedCity || '—'}
              title="From your assigned territory"
              className="w-full bg-slate-900/80 border border-slate-700 text-slate-400 rounded-xl py-3 pl-10 pr-3 text-sm cursor-not-allowed"
            />
            <p className="mt-1 text-[10px] text-slate-600 font-bold uppercase tracking-wider">City (your assigned area)</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 shadow-lg shadow-teal-900/40 transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Submitting…
              </>
            ) : (
              <>
                <UserPlus size={16} /> Submit expert
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
