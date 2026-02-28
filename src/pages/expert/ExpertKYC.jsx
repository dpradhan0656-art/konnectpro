import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  Camera,
  FileText,
  MapPin,
  Briefcase,
  UploadCloud,
  CheckCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

/**
 * ExpertKYC - Onboarding/KYC form for experts (electricians, plumbers)
 * to verify their identity before receiving jobs.
 * Requires authenticated user via Supabase Auth.
 */
export default function ExpertKYC() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    profilePhoto: null,
    aadharNumber: '',
    aadharPhoto: null,
    experienceYears: '',
    fullAddress: '',
  });

  // File input refs for clearing after submit
  const profilePhotoRef = React.useRef(null);
  const aadharPhotoRef = React.useRef(null);

  /** Fetch currently logged-in user on mount */
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        setError('Please log in to complete KYC.');
        setLoading(false);
        return;
      }
      setUser(authUser);
      setLoading(false);
    };
    fetchUser();
  }, []);

  /** Handle file input change */
  const handleFileChange = (field, e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFormData((prev) => ({ ...prev, [field]: file }));
    } else if (file) {
      setError('Please upload an image file (JPG, PNG, etc.)');
    }
  };

  /** Validate form before submit */
  const validateForm = () => {
    if (!formData.profilePhoto) {
      setError('Please upload your profile photo (selfie).');
      return false;
    }
    const aadhar = formData.aadharNumber.replace(/\s/g, '');
    if (!/^\d{12}$/.test(aadhar)) {
      setError('Aadhar number must be exactly 12 digits.');
      return false;
    }
    if (!formData.aadharPhoto) {
      setError('Please upload your Aadhar card photo (front).');
      return false;
    }
    const years = parseInt(formData.experienceYears, 10);
    if (isNaN(years) || years < 0 || years > 50) {
      setError('Please enter a valid experience (0-50 years).');
      return false;
    }
    if (!formData.fullAddress.trim()) {
      setError('Please enter your full address.');
      return false;
    }
    return true;
  };

  /** Submit form: mock upload + update experts table */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm() || !user) return;

    setSubmitting(true);

    try {
      // Mock upload: simulate 2-second delay (no actual Supabase Storage upload)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update experts table for current user: status='pending', is_kyc_submitted=true
      const { error: updateError } = await supabase
        .from('experts')
        .update({
          status: 'pending',
          is_kyc_submitted: true,
          // Optional: store form values if your DB has these columns
          // aadhar_number: formData.aadharNumber,
          // experience_years: parseInt(formData.experienceYears, 10),
          // full_address: formData.fullAddress,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      // Reset form
      setFormData({
        profilePhoto: null,
        aadharNumber: '',
        aadharPhoto: null,
        experienceYears: '',
        fullAddress: '',
      });
      profilePhotoRef.current?.value && (profilePhotoRef.current.value = '');
      aadharPhotoRef.current?.value && (aadharPhotoRef.current.value = '');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading: checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-teal-500" size={48} />
          <p className="text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 text-center">
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/expert/login')}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 py-3 px-6 rounded-2xl font-black uppercase tracking-widest"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 p-8 rounded-[2.5rem] border border-teal-500/30 shadow-2xl relative overflow-hidden text-center">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10" />

          <div className="relative z-10">
            <div className="inline-flex p-5 bg-teal-500/20 rounded-full mb-6 border border-teal-500/30">
              <CheckCircle size={64} className="text-teal-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight">
              Documents Submitted!
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Your documents are submitted. Admin is reviewing your profile.
              <br />
              You will be notified once verification is complete.
            </p>
            <button
              onClick={() => navigate('/expert/login')}
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-teal-500/10 transition-all active:scale-95"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main KYC form
  return (
    <div className="min-h-screen bg-slate-950 p-4 pb-12 font-sans text-white">
      <div className="w-full max-w-lg mx-auto">
        {/* Header card */}
        <div className="bg-slate-900 rounded-[2.5rem] p-6 mb-6 border border-teal-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl text-teal-500 border border-slate-800">
              <ShieldCheck size={40} />
            </div>
            <div>
              <p className="text-[10px] text-teal-500 font-black uppercase tracking-[0.2em] mb-1">
                Partner Portal
              </p>
              <h1 className="text-2xl font-black tracking-tight">Identity Verification</h1>
              <p className="text-slate-500 text-sm mt-1">Complete KYC to start receiving jobs</p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-800 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold rounded-2xl">
                {error}
              </div>
            )}

            {/* Profile Photo (Selfie) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
                <Camera size={18} className="text-teal-500" />
                Profile Photo (Selfie)
              </label>
              <div className="relative group">
                <input
                  ref={profilePhotoRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('profilePhoto', e)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl border-dashed group-hover:border-teal-500/50 transition-all">
                  <div className="p-3 bg-slate-800 rounded-xl text-teal-500">
                    <UploadCloud size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {formData.profilePhoto
                        ? formData.profilePhoto.name
                        : 'Tap to upload selfie'}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      JPG, PNG (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Aadhar Number */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
                <FileText size={18} className="text-teal-500" />
                Aadhar Number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={12}
                placeholder="12-digit Aadhar number"
                value={formData.aadharNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aadharNumber: e.target.value.replace(/\D/g, ''),
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 px-4 outline-none focus:border-teal-500/50 transition-all font-medium tracking-widest placeholder:text-slate-600"
              />
            </div>

            {/* Aadhar Card Photo (Front) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
                <FileText size={18} className="text-teal-500" />
                Aadhar Card Photo (Front)
              </label>
              <div className="relative group">
                <input
                  ref={aadharPhotoRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('aadharPhoto', e)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl border-dashed group-hover:border-teal-500/50 transition-all">
                  <div className="p-3 bg-slate-800 rounded-xl text-teal-500">
                    <UploadCloud size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {formData.aadharPhoto
                        ? formData.aadharPhoto.name
                        : 'Tap to upload Aadhar front'}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      JPG, PNG (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience (Years) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
                <Briefcase size={18} className="text-teal-500" />
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                placeholder="e.g. 5"
                value={formData.experienceYears}
                onChange={(e) =>
                  setFormData({ ...formData, experienceYears: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 px-4 outline-none focus:border-teal-500/50 transition-all font-medium placeholder:text-slate-600"
              />
            </div>

            {/* Full Address */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
                <MapPin size={18} className="text-teal-500" />
                Full Address
              </label>
              <textarea
                rows={3}
                placeholder="House/Flat no., Street, City, State, PIN"
                value={formData.fullAddress}
                onChange={(e) =>
                  setFormData({ ...formData, fullAddress: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 px-4 outline-none focus:border-teal-500/50 transition-all font-medium placeholder:text-slate-600 resize-none"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-2 shadow-lg shadow-teal-500/10 disabled:opacity-50 transition-all active:scale-95 mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  Uploading...
                </>
              ) : (
                <>
                  Submit Documents
                  <UploadCloud size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
