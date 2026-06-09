import React, { useEffect, useMemo, useState } from 'react';
import { KeyRound, Loader2, MapPin, Phone, ShieldCheck, User, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { canAccessDeepakHQ } from '../../../lib/adminAccess';
import { writeAdminAuditLog } from '../../../utils/adminAuditTrail';

const emptyForm = {
  name: '',
  phone: '',
  city: '',
};

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizePhoneInput(value) {
  return String(value || '').replace(/[^\d+]/g, '').slice(0, 13);
}

function toIndianMobile10(value) {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (/^[6-9]\d{9}$/.test(digits)) return digits;
  if (/^\+91[6-9]\d{9}$/.test(raw) && digits.length === 12) return digits.slice(2);
  if (/^91[6-9]\d{9}$/.test(digits) && digits.length === 12) return digits.slice(2);
  return digits;
}

function getFriendlyRpcError(error) {
  const message = error?.message || 'Commander update failed. Please try again.';
  if (/permission|not authorized|unauthorized|admin|rls/i.test(message)) {
    return 'Aapke admin session ko is privileged update ki permission nahi mili. Dobara login karke try karein.';
  }
  if (/network|fetch/i.test(message)) {
    return 'Network issue ke karan update complete nahi hua. Connection check karke retry karein.';
  }
  return message;
}

export default function EditCommanderModal({ commander, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!commander) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: commander.name || '',
      phone: commander.phone || '',
      city: commander.assigned_area || '',
    });
    setLoading(false);
    setErrorMessage('');
    setSuccessMessage('');
  }, [commander]);

  const changes = useMemo(() => {
    if (!commander) return {};

    const nextName = normalizeText(form.name);
    const nextPhone = toIndianMobile10(form.phone);
    const nextCity = normalizeText(form.city);

    return {
      name: nextName !== normalizeText(commander.name) ? nextName : null,
      phone: nextPhone !== toIndianMobile10(commander.phone) ? nextPhone : null,
      city: nextCity !== normalizeText(commander.assigned_area) ? nextCity : null,
    };
  }, [commander, form]);

  if (!commander) return null;

  const validate = () => {
    const nextName = normalizeText(form.name);
    const nextPhone = toIndianMobile10(form.phone);
    const nextCity = normalizeText(form.city);

    if (!commander.user_id) return 'Commander auth user_id missing hai. Profile update safely possible nahi hai.';
    if (changes.name !== null && nextName.length < 2) return 'Full Name change kar rahe hain to kam se kam 2 characters hona chahiye.';
    if (changes.phone !== null && !/^[6-9]\d{9}$/.test(nextPhone)) {
      return 'Phone Number valid Indian mobile format me hona chahiye: 10 digits ya +91XXXXXXXXXX.';
    }
    if (changes.city !== null && nextCity.length < 2) return 'City change kar rahe hain to kam se kam 2 characters hona chahiye.';
    if (!changes.name && !changes.phone && !changes.city) {
      return 'Save karne ke liye kam se kam ek field change karein.';
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setErrorMessage('');
    setSuccessMessage('');

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error('Admin session expire ho gaya hai. Dobara login karke try karein.');
      }

      const isAllowed = await canAccessDeepakHQ(userData.user);
      if (!isAllowed) {
        throw new Error('Not authorized. Sirf approved admin user commander profile update kar sakta hai.');
      }

      const { error } = await supabase.rpc('update_area_commander_profile', {
        target_user_id: commander.user_id,
        new_password: null,
        new_name: changes.name,
        new_phone: changes.phone,
        new_city: changes.city,
      });

      if (error) throw error;

      await writeAdminAuditLog({
        action: 'area_commander_profile_updated',
        entityType: 'area_commander',
        entityId: commander.user_id,
        metadata: {
          target_user_id: commander.user_id,
          changed_fields: Object.entries(changes)
            .filter(([, value]) => value !== null)
            .map(([field]) => field),
        },
      });

      setSuccessMessage('Commander details successfully update ho gaye.');
      await onSaved?.();
    } catch (error) {
      setErrorMessage(getFriendlyRpcError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[2rem] border border-teal-500/30 shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5 md:p-6">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="text-teal-400" size={22} />
              Edit Commander
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Profile update privileged admin action hai. Password reset security review tak paused hai.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl p-2 disabled:opacity-50"
            aria-label="Close edit commander modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative md:col-span-2">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Full Name"
                autoComplete="name"
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-500/50 disabled:opacity-60"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: normalizePhoneInput(event.target.value) }))}
                placeholder="10 digits or +91XXXXXXXXXX"
                inputMode="tel"
                maxLength={13}
                autoComplete="tel"
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-500/50 disabled:opacity-60"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                placeholder="Assigned City"
                autoComplete="address-level2"
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-teal-500/50 disabled:opacity-60"
              />
            </div>

            <div className="relative md:col-span-2">
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-amber-200">
                <KeyRound className="mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-sm font-black">Password reset is temporarily disabled for security review.</p>
                  <p className="text-xs text-amber-200/75 mt-1">
                    Password reset ko service-role Edge Function ya verified Supabase Auth Admin flow ke baad enable kiya jayega.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm font-semibold text-red-300">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-green-500/30 bg-green-950/30 px-4 py-3 text-sm font-semibold text-green-300">
              {successMessage}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
