import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { fetchExpertProfileMaster, upsertExpertProfileMaster } from '../../../lib/expertProfileMaster';
import { compressAndUploadExpertPhoto } from '../../../utils/uploadImage';
import { compressAndUploadExpertKycDocument, createSignedKycDocumentUrl } from '../../../utils/uploadKycDocument';
import { adminEnsureExpertAuth, EXPERT_DEFAULT_PASSWORD } from '../../../lib/authAdmin';
import { Shield, User, FileText, MapPin, Briefcase, CheckCircle, XCircle, Loader2, Eye, Landmark, CreditCard, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { writeAdminAuditLog } from '../../../utils/adminAuditTrail';

export default function ExpertVerification() {
  const [pendingExperts, setPendingExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState(null); // Modal ke liye
  const [actionLoading, setActionLoading] = useState(false);
  /** Inline confirm — avoids blocking window.confirm (INP). */
  const [pendingConfirm, setPendingConfirm] = useState(null);
  const [profileMaster, setProfileMaster] = useState(null);
  const [aadharPreviewUrl, setAadharPreviewUrl] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState('');
  const [payoutDraft, setPayoutDraft] = useState({
    bank_account_holder_name: '',
    bank_account_number: '',
    ifsc_code: '',
    pan_number: '',
    residential_address: '',
  });

  useEffect(() => {
    fetchPendingExperts();
  }, []);

  useEffect(() => {
    if (!selectedExpert?.id) {
      setProfileMaster(null);
      setLoadingDocs(false);
      return;
    }
    let cancelled = false;
    const loadProfileMaster = async () => {
      setLoadingDocs(true);
      setProfileMaster(null);
      try {
        const data = await fetchExpertProfileMaster(selectedExpert.id);
        if (!cancelled) setProfileMaster(data);
      } catch (err) {
        console.error('Error fetching expert_profile_master:', err);
        if (!cancelled) setProfileMaster(null);
      } finally {
        if (!cancelled) setLoadingDocs(false);
      }
    };
    void loadProfileMaster();
    return () => { cancelled = true; };
  }, [selectedExpert]);

  useEffect(() => {
    let cancelled = false;
    const loadSignedAadhaar = async () => {
      const storedPath = profileMaster?.aadhar_card_photo_url;
      if (!storedPath) {
        setAadharPreviewUrl('');
        return;
      }
      try {
        const signedUrl = await createSignedKycDocumentUrl(storedPath);
        if (!cancelled) setAadharPreviewUrl(signedUrl);
      } catch (err) {
        console.error('Error signing Aadhaar preview URL:', err);
        if (!cancelled) setAadharPreviewUrl('');
      }
    };
    void loadSignedAadhaar();
    return () => { cancelled = true; };
  }, [profileMaster?.aadhar_card_photo_url]);

  useEffect(() => {
    if (!selectedExpert?.id) return;
    setPayoutDraft({
      bank_account_holder_name: profileMaster?.bank_account_holder_name || '',
      bank_account_number: profileMaster?.bank_account_number || '',
      ifsc_code: profileMaster?.ifsc_code || '',
      pan_number: profileMaster?.pan_number || '',
      residential_address: profileMaster?.residential_address || '',
    });
  }, [profileMaster, selectedExpert?.id]);

  const savePayoutDraft = async () => {
    if (!selectedExpert?.id) return;
    setActionLoading(true);
    try {
      await upsertExpertProfileMaster(selectedExpert.id, {
        bank_account_holder_name: payoutDraft.bank_account_holder_name.trim() || null,
        bank_account_number: payoutDraft.bank_account_number.replace(/\D/g, '') || null,
        ifsc_code: payoutDraft.ifsc_code.trim().toUpperCase().replace(/\s/g, '') || null,
        pan_number: payoutDraft.pan_number.trim().toUpperCase().replace(/\s/g, '') || null,
        residential_address: payoutDraft.residential_address.trim() || null,
      });
      const data = await fetchExpertProfileMaster(selectedExpert.id);
      setProfileMaster(data);
      toast.success('Payout details saved.');
    } catch (err) {
      toast.error(err?.message || 'Could not save payout details');
    }
    setActionLoading(false);
  };

  // 1. Database se Pending Experts lana
  const fetchPendingExperts = async () => {
    setLoading(true);
    // Single source registration ke baad pending approvals ko source-agnostic rakho:
    // self / footer / area-head / admin sab yahin dikhen.
    const { data, error } = await supabase
      .from('experts')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setPendingExperts([]);
    } else {
      setPendingExperts(data || []);
    }
    setLoading(false);
  };

  const runApprove = async (expert) => {
    setActionLoading(true);
    const id = expert?.id;
    const name = expert?.name || 'Expert';
    if (!id) {
      toast.error('Expert id missing.');
      setActionLoading(false);
      return;
    }
    const { data: latestExpert, error } = await supabase
      .from('experts')
      .select('id, email, user_id')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      toast.error(error.message || 'Approval pre-check failed');
      setActionLoading(false);
      return;
    }

    try {
      const authResult = await adminEnsureExpertAuth({
        expertId: id,
        email: expert?.email || latestExpert?.email,
        password: EXPERT_DEFAULT_PASSWORD,
      });

      const payoutFields = {
        bank_account_holder_name: payoutDraft.bank_account_holder_name.trim() || null,
        bank_account_number: payoutDraft.bank_account_number.replace(/\D/g, '') || null,
        ifsc_code: payoutDraft.ifsc_code.trim().toUpperCase().replace(/\s/g, '') || null,
        pan_number: payoutDraft.pan_number.trim().toUpperCase().replace(/\s/g, '') || null,
        residential_address: payoutDraft.residential_address.trim() || null,
      };
      const hasPayout = Object.values(payoutFields).some((v) => v);
      if (hasPayout) {
        await upsertExpertProfileMaster(id, payoutFields);
      }

      const { error: approveError } = await supabase
        .from('experts')
        .update({ status: 'approved', is_verified: true, user_id: authResult.user_id })
        .eq('id', id);
      if (approveError) throw approveError;

      void writeAdminAuditLog({
        action: 'expert.approved.kyc',
        entityType: 'expert',
        entityId: id,
        metadata: { name, default_password_set: true },
      });
      toast.success(`${name} approved. Default login password: ${EXPERT_DEFAULT_PASSWORD}`);
      setSelectedExpert(null);
      setPendingConfirm(null);
      void fetchPendingExperts();
    } catch (err) {
      toast.error(err?.message || 'Approve failed');
    }
    setActionLoading(false);
  };

  const runReject = async (id, name) => {
    setActionLoading(true);
    const { error } = await supabase
      .from('experts')
      .update({ status: 'rejected', is_kyc_submitted: false })
      .eq('id', id);

    if (!error) {
      void writeAdminAuditLog({
        action: 'expert.rejected.kyc',
        entityType: 'expert',
        entityId: id,
        metadata: { name },
      });
      toast.success(`${name} rejected — they can re-apply.`);
      setSelectedExpert(null);
      setPendingConfirm(null);
      void fetchPendingExperts();
    } else {
      toast.error(error.message || 'Reject failed');
    }
    setActionLoading(false);
  };

  const executePendingConfirm = () => {
    if (!pendingConfirm || actionLoading) return;
    const { action, id, name } = pendingConfirm;
    if (action === 'approve') void runApprove(pendingConfirm.expert || { id, name });
    else void runReject(id, name);
  };

  const handleKycDocumentUpload = async (kind, file) => {
    if (!selectedExpert?.id || !file) return;
    setUploadingDoc(kind);
    try {
      if (kind === 'profile') {
        const upload = await compressAndUploadExpertPhoto({
          file,
          expertKey: selectedExpert.id,
          objectSuffix: 'profile-selfie',
        });
        const { error } = await supabase
          .from('experts')
          .update({ photo_url: upload.publicUrl, kyc_status: 'pending' })
          .eq('id', selectedExpert.id);
        if (error) throw error;
        setSelectedExpert((prev) => (prev ? { ...prev, photo_url: upload.publicUrl } : prev));
      } else {
        const upload = await compressAndUploadExpertKycDocument({
          file,
          expertKey: selectedExpert.id,
          objectSuffix: 'aadhaar-scan',
        });
        await upsertExpertProfileMaster(selectedExpert.id, {
          aadhar_card_photo_url: upload.objectPath,
        });
        setProfileMaster((prev) => ({
          ...(prev || { expert_id: selectedExpert.id }),
          aadhar_card_photo_url: upload.objectPath,
        }));
      }

      toast.success(kind === 'profile' ? 'Profile photo uploaded.' : 'Aadhaar scan uploaded.');
      void fetchPendingExperts();
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploadingDoc('');
    }
  };

  if (loading) return <div className="text-teal-500 flex justify-center py-20"><Loader2 className="animate-spin" size={40}/></div>;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      {/* 🛡️ HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-[2rem] border border-teal-500/30 gap-4 shadow-xl">
        <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2"><Shield className="text-teal-500"/> KYC Verifications</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Review & Approve New Partners</p>
        </div>
        <button onClick={fetchPendingExperts} className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl text-slate-300 font-bold transition-colors">
            Refresh List
        </button>
      </div>

      {/* 📋 PENDING LIST */}
      <div className="grid gap-4">
          {pendingExperts.length === 0 ? (
              <div className="text-center py-12 bg-slate-900 rounded-[2rem] border border-slate-800 border-dashed shadow-sm">
                  <div className="inline-flex p-4 bg-slate-950 rounded-full mb-4 text-slate-600">
                      <CheckCircle size={32} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">All Clear!</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No pending KYC applications.</p>
              </div>
          ) : pendingExperts.map(expert => (
              <div key={expert.id} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-14 h-14 bg-slate-950 rounded-full flex items-center justify-center border-2 border-amber-500/50 text-amber-500">
                          <User size={24} />
                      </div>
                      <div>
                          <h3 className="text-xl font-black text-white">{expert.name}</h3>
                          <p className="text-xs font-bold text-slate-400 flex gap-2 items-center uppercase tracking-widest mt-1">
                              <Briefcase size={12} className="text-teal-500"/> {expert.service_category || expert.category || 'Expert'}
                          </p>
                      </div>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                      <button 
                          onClick={() => setSelectedExpert(expert)} 
                          className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex justify-center items-center gap-2 transition-colors border border-slate-700"
                      >
                          <Eye size={16}/> Review Documents
                      </button>
                  </div>
              </div>
          ))}
      </div>

      {/* 🔍 REVIEW MODAL (Popup) */}
      {selectedExpert && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-teal-500/30 shadow-2xl overflow-hidden animate-in zoom-in-95">
                  <div className="p-6 md:p-8 relative">
                      {/* Close Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedExpert(null);
                          setPendingConfirm(null);
                          setProfileMaster(null);
                        }}
                        className="absolute top-6 right-6 text-slate-500 hover:text-white bg-slate-950 p-2 rounded-full transition-colors"
                      >
                          <XCircle size={24} />
                      </button>

                      <h2 className="text-2xl font-black text-white mb-6 pr-10">Applicant Profile</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Info Cards */}
                          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Full Name</p>
                              <p className="text-lg font-black text-white flex items-center gap-2"><User size={16} className="text-teal-500"/> {selectedExpert.name}</p>
                          </div>

                          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Mobile Number</p>
                              <p className="text-lg font-black text-white">{selectedExpert.phone}</p>
                          </div>

                          {/* Legacy Duplicate Approval Flow — hardcoded demo placeholders (pre–real KYC data) */}
                          {/*
                          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Aadhar Number</p>
                              <p className="text-lg font-black text-white flex items-center gap-2"><FileText size={16} className="text-teal-500"/> 1234 5678 9012 (Demo)</p>
                          </div>
                          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Experience</p>
                              <p className="text-lg font-black text-white flex items-center gap-2"><Briefcase size={16} className="text-teal-500"/> 5 Years (Demo)</p>
                          </div>
                          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 md:col-span-2">
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Address</p>
                              <p className="text-sm font-bold text-white flex items-start gap-2"><MapPin size={16} className="text-teal-500 shrink-0 mt-0.5"/> Jabalpur, Madhya Pradesh (Demo Address)</p>
                          </div>
                          */}
                          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Aadhar Number</p>
                              <p className="text-lg font-black text-white flex items-center gap-2 break-all">
                                <FileText size={16} className="text-teal-500 shrink-0"/>
                                {selectedExpert.aadhar_number || 'Not Provided'}
                              </p>
                          </div>

                          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Experience (years)</p>
                              <p className="text-lg font-black text-white flex items-center gap-2">
                                <Briefcase size={16} className="text-teal-500"/>
                                {selectedExpert.experience_years || '0'}
                              </p>
                          </div>

                          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 md:col-span-2">
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Location</p>
                              <p className="text-sm font-bold text-white flex items-start gap-2">
                                <MapPin size={16} className="text-teal-500 shrink-0 mt-0.5"/>
                                {[
                                  profileMaster?.residential_address,
                                  selectedExpert.address,
                                  selectedExpert.city,
                                ].filter(Boolean).join(', ') || 'Not Provided'}
                              </p>
                          </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-800">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                          <Landmark size={16} className="text-teal-500" />
                          Bank &amp; KYC Documents
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                          <label className="rounded-2xl border border-slate-700 bg-slate-950 p-4 cursor-pointer hover:border-teal-500/60 transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                              {uploadingDoc === 'profile' ? <Loader2 size={14} className="animate-spin text-teal-500" /> : <Upload size={14} className="text-teal-500" />}
                              Upload profile photo
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={Boolean(uploadingDoc)}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = '';
                                void handleKycDocumentUpload('profile', file);
                              }}
                              className="hidden"
                            />
                            <p className="mt-2 text-[11px] text-slate-500">
                              Links WhatsApp selfie to experts.photo_url.
                            </p>
                          </label>
                          <label className="rounded-2xl border border-slate-700 bg-slate-950 p-4 cursor-pointer hover:border-teal-500/60 transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                              {uploadingDoc === 'aadhaar' ? <Loader2 size={14} className="animate-spin text-teal-500" /> : <Upload size={14} className="text-teal-500" />}
                              Upload Aadhaar scan
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={Boolean(uploadingDoc)}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = '';
                                void handleKycDocumentUpload('aadhaar', file);
                              }}
                              className="hidden"
                            />
                            <p className="mt-2 text-[11px] text-slate-500">
                              Stores under expert_profile_master.aadhar_card_photo_url.
                            </p>
                          </label>
                        </div>
                        {loadingDocs ? (
                          <p className="text-xs text-slate-500 font-bold flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin text-teal-500" />
                            Loading payout &amp; document records…
                          </p>
                        ) : profileMaster || selectedExpert.photo_url ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <label className="bg-slate-950 p-4 rounded-2xl border border-slate-800 block">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Account holder</span>
                                <input
                                  value={payoutDraft.bank_account_holder_name}
                                  onChange={(e) => setPayoutDraft((d) => ({ ...d, bank_account_holder_name: e.target.value }))}
                                  className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-teal-500/60"
                                  placeholder="Optional until withdrawal"
                                />
                              </label>
                              <label className="bg-slate-950 p-4 rounded-2xl border border-slate-800 block">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Account number</span>
                                <input
                                  value={payoutDraft.bank_account_number}
                                  onChange={(e) => setPayoutDraft((d) => ({ ...d, bank_account_number: e.target.value }))}
                                  className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-teal-500/60"
                                  inputMode="numeric"
                                />
                              </label>
                              <label className="bg-slate-950 p-4 rounded-2xl border border-slate-800 block">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">IFSC</span>
                                <input
                                  value={payoutDraft.ifsc_code}
                                  onChange={(e) => setPayoutDraft((d) => ({ ...d, ifsc_code: e.target.value }))}
                                  className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase outline-none focus:border-teal-500/60"
                                />
                              </label>
                              <label className="bg-slate-950 p-4 rounded-2xl border border-slate-800 block">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">PAN</span>
                                <input
                                  value={payoutDraft.pan_number}
                                  onChange={(e) => setPayoutDraft((d) => ({ ...d, pan_number: e.target.value }))}
                                  className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase outline-none focus:border-teal-500/60"
                                />
                              </label>
                              <label className="bg-slate-950 p-4 rounded-2xl border border-slate-800 block sm:col-span-2">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Residential address</span>
                                <textarea
                                  rows={2}
                                  value={payoutDraft.residential_address}
                                  onChange={(e) => setPayoutDraft((d) => ({ ...d, residential_address: e.target.value }))}
                                  className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-teal-500/60 resize-none"
                                />
                              </label>
                            </div>
                            <button
                              type="button"
                              onClick={() => void savePayoutDraft()}
                              disabled={actionLoading}
                              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                            >
                              Save payout details
                            </button>
                            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest">
                              <span className={`px-3 py-1.5 rounded-full border ${selectedExpert.aadhar_number ? 'border-green-500/40 text-green-400 bg-green-500/10' : 'border-amber-500/40 text-amber-400 bg-amber-500/10'}`}>
                                Aadhaar digits: {selectedExpert.aadhar_number ? 'Provided' : 'Missing'}
                              </span>
                              <span className={`px-3 py-1.5 rounded-full border ${profileMaster?.bank_account_number && profileMaster?.ifsc_code ? 'border-green-500/40 text-green-400 bg-green-500/10' : 'border-amber-500/40 text-amber-400 bg-amber-500/10'}`}>
                                Bank details: {profileMaster?.bank_account_number && profileMaster?.ifsc_code ? 'Complete' : 'Incomplete'}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {selectedExpert.photo_url && (
                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <User size={12} className="text-teal-500" /> Profile selfie
                                  </p>
                                  <a href={selectedExpert.photo_url} target="_blank" rel="noopener noreferrer" className="block">
                                    <img
                                      src={selectedExpert.photo_url}
                                      alt="Expert profile"
                                      className="w-full max-h-48 object-contain rounded-xl border border-slate-700 bg-slate-900"
                                    />
                                  </a>
                                </div>
                              )}
                              {profileMaster?.aadhar_card_photo_url && aadharPreviewUrl && (
                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <CreditCard size={12} className="text-teal-500" /> Aadhaar card (upload)
                                  </p>
                                  <a href={aadharPreviewUrl} target="_blank" rel="noopener noreferrer" className="block">
                                    <img
                                      src={aadharPreviewUrl}
                                      alt="Aadhaar document"
                                      className="w-full max-h-48 object-contain rounded-xl border border-slate-700 bg-slate-900"
                                    />
                                  </a>
                                </div>
                              )}
                            </div>
                            {!profileMaster && (
                              <p className="text-xs text-amber-400/90 font-bold">
                                No expert_profile_master row yet — bank fields may only exist after Expo KYC or Expert Control.
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-amber-400 font-bold">
                              No saved payout row yet — enter bank details below (optional until withdrawal).
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <label className="bg-slate-950 p-4 rounded-2xl border border-slate-800 block">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Account holder</span>
                                <input
                                  value={payoutDraft.bank_account_holder_name}
                                  onChange={(e) => setPayoutDraft((d) => ({ ...d, bank_account_holder_name: e.target.value }))}
                                  className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-teal-500/60"
                                />
                              </label>
                              <label className="bg-slate-950 p-4 rounded-2xl border border-slate-800 block">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Account number</span>
                                <input
                                  value={payoutDraft.bank_account_number}
                                  onChange={(e) => setPayoutDraft((d) => ({ ...d, bank_account_number: e.target.value }))}
                                  className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-teal-500/60"
                                  inputMode="numeric"
                                />
                              </label>
                              <label className="bg-slate-950 p-4 rounded-2xl border border-slate-800 block">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">IFSC</span>
                                <input
                                  value={payoutDraft.ifsc_code}
                                  onChange={(e) => setPayoutDraft((d) => ({ ...d, ifsc_code: e.target.value }))}
                                  className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase outline-none focus:border-teal-500/60"
                                />
                              </label>
                              <label className="bg-slate-950 p-4 rounded-2xl border border-slate-800 block">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">PAN</span>
                                <input
                                  value={payoutDraft.pan_number}
                                  onChange={(e) => setPayoutDraft((d) => ({ ...d, pan_number: e.target.value }))}
                                  className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase outline-none focus:border-teal-500/60"
                                />
                              </label>
                            </div>
                            <button
                              type="button"
                              onClick={() => void savePayoutDraft()}
                              disabled={actionLoading}
                              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                            >
                              Save payout details
                            </button>
                          </div>
                        )}
                      </div>

                      {pendingConfirm && (
                        <div className="mt-6 p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10">
                          <p className="text-sm font-bold text-amber-100 mb-3">
                            {pendingConfirm.action === 'approve'
                              ? `Approve ${pendingConfirm.name}? Login email will use default password ${EXPERT_DEFAULT_PASSWORD}.`
                              : `Reject ${pendingConfirm.name}? They will need to re-apply.`}
                          </p>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={executePendingConfirm}
                              disabled={actionLoading}
                              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-xl font-black uppercase tracking-widest text-xs disabled:opacity-50"
                            >
                              {actionLoading ? 'Saving…' : 'Yes, confirm'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingConfirm(null)}
                              disabled={actionLoading}
                              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row gap-4 mt-8 pt-6 border-t border-slate-800">
                          <button
                              type="button"
                              onClick={() => setPendingConfirm({
                                action: 'approve',
                                id: selectedExpert.id,
                                name: selectedExpert.name,
                                expert: selectedExpert,
                              })}
                              disabled={actionLoading || !!pendingConfirm}
                              className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 shadow-lg shadow-green-900/50 transition-all active:scale-95 disabled:opacity-50"
                          >
                              {actionLoading && pendingConfirm?.action === 'approve'
                                ? <Loader2 className="animate-spin" size={16}/>
                                : <CheckCircle size={18}/>}
                              Approve Expert
                          </button>

                          <button
                              type="button"
                              onClick={() => setPendingConfirm({
                                action: 'reject',
                                id: selectedExpert.id,
                                name: selectedExpert.name,
                              })}
                              disabled={actionLoading || !!pendingConfirm}
                              className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                          >
                              <XCircle size={18}/> Reject / Re-apply
                          </button>
                      </div>

                  </div>
              </div>
          </div>
      )}

    </div>
  );
}