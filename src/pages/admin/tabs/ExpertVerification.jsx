import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Shield, User, FileText, MapPin, Briefcase, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';

export default function ExpertVerification() {
  const [pendingExperts, setPendingExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState(null); // Modal ke liye
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingExperts();
  }, []);

  // 1. Database se Pending Experts lana
  const fetchPendingExperts = async () => {
    setLoading(true);
    // Un experts ko lao jinka status 'pending' hai aur KYC form bhar diya hai
    const { data, error } = await supabase
      .from('experts')
      .select('*')
      .eq('status', 'pending')
      .eq('is_kyc_submitted', true)
      .order('created_at', { ascending: false });
      
    if (data) setPendingExperts(data);
    setLoading(false);
  };

  // 2. Expert ko Approve karna (Green Signal)
  const handleApprove = async (id, name) => {
    const confirm = window.confirm(`Kya aap ${name} ko Approve karna chahte hain? Unki duty turant chalu ho jayegi.`);
    if (!confirm) return;

    setActionLoading(true);
    const { error } = await supabase.from('experts').update({ status: 'approved' }).eq('id', id);
    
    if (!error) {
        alert(`✅ ${name} ka account Approve ho gaya hai!`);
        setSelectedExpert(null);
        fetchPendingExperts(); // List refresh karo
    } else {
        alert("Error: " + error.message);
    }
    setActionLoading(false);
  };

  // 3. Expert ko Reject karna (Red Signal)
  const handleReject = async (id, name) => {
    const confirm = window.confirm(`⛔ Kya aap ${name} ka form Reject karna chahte hain? Unhe form wapas bharna padega.`);
    if (!confirm) return;

    setActionLoading(true);
    // Reject karne par KYC wapas false kar do taaki wo wapas form bhar sake
    const { error } = await supabase.from('experts').update({ status: 'rejected', is_kyc_submitted: false }).eq('id', id);
    
    if (!error) {
        alert(`❌ ${name} ka account Reject kar diya gaya hai.`);
        setSelectedExpert(null);
        fetchPendingExperts();
    }
    setActionLoading(false);
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
                              <Briefcase size={12} className="text-teal-500"/> {expert.category || 'Expert'}
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
                      <button onClick={() => setSelectedExpert(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white bg-slate-950 p-2 rounded-full transition-colors">
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

                          {/* DUMMY DATA FOR NOW (Since we mocked upload) */}
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
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col md:flex-row gap-4 mt-8 pt-6 border-t border-slate-800">
                          <button 
                              onClick={() => handleApprove(selectedExpert.id, selectedExpert.name)} 
                              disabled={actionLoading}
                              className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 shadow-lg shadow-green-900/50 transition-all active:scale-95 disabled:opacity-50"
                          >
                              {actionLoading ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={18}/>} Approve Expert
                          </button>
                          
                          <button 
                              onClick={() => handleReject(selectedExpert.id, selectedExpert.name)} 
                              disabled={actionLoading}
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