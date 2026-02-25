import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Wallet, MapPin, Clock, ShieldCheck, LogOut, CheckCircle } from 'lucide-react';

export default function PartnerApp() {
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkExpertProfile(); }, []);

  const checkExpertProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        navigate('/expert/login'); // ✅ Fixed Route
        return;
    }

    const { data: expertData } = await supabase.from('experts').select('*').eq('user_id', user.id).single();

    if (expertData) {
        setExpert(expertData);
        if (expertData.status === 'approved') {
            fetchJobs(expertData.id); fetchWallet(expertData.id);
        }
    }
    setLoading(false);
  };

  const fetchJobs = async (expertId) => {
      const { data } = await supabase.from('bookings').select('*').eq('expert_id', expertId).in('status', ['assigned', 'in_progress']).order('created_at', { ascending: false });
      if (data) setBookings(data);
  };

  const fetchWallet = async (expertId) => {
      const { data } = await supabase.from('wallet_transactions').select('*').eq('user_id', expertId).order('created_at', { ascending: false }).limit(10);
      if (data) setTransactions(data);
  };

  const handleCompleteJob = async (job) => {
      if (!confirm("Are you sure you have completed this job?")) return;
      setLoading(true);
      const amount = parseFloat(job.total_amount || 0);
      const platformFee = amount * 0.20;
      const expertPayout = amount - platformFee;

      await supabase.from('bookings').update({ status: 'completed', platform_fee: platformFee, expert_payout: expertPayout }).eq('id', job.id);

      let newBalance = parseFloat(expert.wallet_balance || 0);
      let transType = ''; let transAmount = 0; let reason = '';

      if (job.payment_mode === 'cash_after_service' || job.payment_mode === 'cash') {
          newBalance -= platformFee; transType = 'debit'; transAmount = platformFee; reason = 'commission_cut';
      } else {
          newBalance += expertPayout; transType = 'credit'; transAmount = expertPayout; reason = 'online_payout';
      }

      await supabase.from('experts').update({ wallet_balance: newBalance }).eq('id', expert.id);
      await supabase.from('wallet_transactions').insert({ user_id: expert.id, user_type: 'expert', amount: transAmount, transaction_type: transType, reason: reason, description: `Job #${job.id.slice(0,6)}`, booking_id: job.id });

      alert("Job Completed Successfully!"); checkExpertProfile();
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      navigate('/expert/login'); // ✅ Fixed Route
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading workspace...</div>;

  if (!expert || expert.status !== 'approved') {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
             <ShieldCheck size={60} className={expert ? "text-teal-500 mb-4" : "text-slate-300 mb-4"} />
             <h1 className="text-2xl font-black text-slate-900 mb-2">{expert ? 'Approval Pending' : 'Not an Expert'}</h1>
             <button onClick={handleLogout} className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><LogOut size={16}/> Logout</button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
       <div className="bg-slate-900 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
           <div className="flex justify-between items-center relative z-10">
               <div>
                   <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">KSHATR Partner</p>
                   <h1 className="text-xl font-black">{expert.name}</h1>
               </div>
               <button onClick={handleLogout} className="p-2 bg-white/10 rounded-full hover:bg-red-500/20 hover:text-red-400"><LogOut size={18}/></button>
           </div>
           <div className="mt-6 bg-gradient-to-br from-teal-500 to-teal-700 p-5 rounded-2xl shadow-lg border border-teal-400/30 flex justify-between items-center">
               <div><p className="text-[10px] uppercase font-bold text-teal-100 flex items-center gap-1"><Wallet size={12}/> Prepaid Wallet</p><h2 className="text-3xl font-black mt-1">₹{expert.wallet_balance || 0}</h2></div>
           </div>
       </div>

       <div className="p-4 max-w-md mx-auto space-y-6 mt-4">
           <div>
               <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2"><Clock size={16} className="text-amber-500"/> Active Jobs ({bookings.length})</h2>
               {bookings.length === 0 ? (
                   <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-6 text-center text-slate-400 text-xs font-bold">No new jobs assigned.</div>
               ) : (
                   <div className="space-y-4">
                       {bookings.map(job => (
                           <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                               <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-slate-900">{job.service_name}</h3><span className="text-lg font-black text-slate-900">₹{job.total_amount}</span></div>
                               <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><MapPin size={12}/> {job.address}</p>
                               <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                                   <button onClick={() => handleCompleteJob(job)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> Mark Done</button>
                               </div>
                           </div>
                       ))}
                   </div>
               )}
           </div>
       </div>
    </div>
  );
}
