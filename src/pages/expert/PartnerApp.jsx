import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { canAccessDeepakHQ } from '../../lib/adminAccess';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, MapPin, Clock, ShieldCheck, LogOut, CheckCircle, Plus, X, Loader2 } from 'lucide-react';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(false);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function PartnerApp() {
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeError, setRechargeError] = useState('');

  useEffect(() => { checkExpertProfile(); }, []);

  const checkExpertProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      navigate('/expert/login');
      return;
    }

    if (await canAccessDeepakHQ(user)) {
      setLoading(false);
      navigate('/deepakhq', { replace: true });
      return;
    }

    const { data: expertData, error: expError } = await supabase
      .from('experts')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (expError) {
      setLoading(false);
      navigate('/expert/login');
      return;
    }

    if (expertData) {
      setExpert(expertData);
      if (expertData.status === 'approved') {
        fetchJobs(expertData.id);
        fetchWallet(expertData.id);
      }
    } else {
      navigate('/register-expert', { state: { fromExpertLogin: true, message: 'Google se sign-in ho chuka. Ab Expert registration complete karein.' } });
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
      try {
          const { error } = await supabase.rpc('process_job_payout', { p_booking_id: job.id });
          if (error) throw error;
          alert("Job Completed Successfully!");
          checkExpertProfile();
      } catch (err) {
          alert("Error: " + (err?.message || err));
      } finally {
          setLoading(false);
      }
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      navigate('/expert/login');
  };

  const handleWithdraw = async () => {
    if (!expert?.wallet_balance || expert.wallet_balance <= 0) return;
    const upiId = prompt('UPI ID / Bank Details:');
    if (!upiId) return;
    const amountStr = prompt(`Withdraw (Max: ₹${expert.wallet_balance}):`, String(expert.wallet_balance));
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Invalid amount!');
      return;
    }
    try {
      const { error } = await supabase.rpc('request_wallet_withdrawal', {
        p_user_id: expert.user_id,
        p_user_type: 'expert',
        p_user_name: expert.name,
        p_amount: amount,
        p_payment_method: 'UPI/Bank',
        p_payment_details: upiId,
      });
      if (error) throw error;
      alert('Request sent!');
      checkExpertProfile();
    } catch (err) {
      alert('Failed: ' + (err?.message || err));
    }
  };

  const PRESET_AMOUNTS = [500, 1000, 2000];
  const getRechargeAmountRupees = () => {
    if (rechargeAmount !== null) return rechargeAmount;
    const n = Number(customAmount);
    return Number.isFinite(n) && n >= 1 && n <= 100000 ? n : null;
  };

  const handleProceedToPay = async () => {
    const amountRupees = getRechargeAmountRupees();
    if (amountRupees === null || amountRupees < 1) {
      setRechargeError('Please select an amount or enter a valid amount (₹1 – ₹1,00,000).');
      return;
    }
    setRechargeError('');
    setRechargeLoading(true);
    try {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      const session = refreshData?.session ?? (await supabase.auth.getSession()).data?.session;
      if (!session?.access_token) {
        setRechargeError(refreshError?.message || 'Session expired. Please sign in again.');
        setRechargeLoading(false);
        return;
      }
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${baseUrl}/functions/v1/create-wallet-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token,
          'apikey': anonKey,
        },
        body: JSON.stringify({ amount: amountRupees }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = body?.details || body?.error || body?.message || res.statusText || 'Could not create payment order.';
        throw new Error(msg);
      }
      const { order_id, amount_paise, currency, key_id } = body;
      if (!order_id || !amount_paise) {
        throw new Error(body?.error || 'Could not create payment order.');
      }
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay. Check your connection.');
      }
      const options = {
        key: key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount_paise,
        currency: currency || 'INR',
        order_id,
        name: 'Kshatr Partner Wallet',
        description: 'Wallet Recharge',
        handler: async function (response) {
          try {
            const { data: refData } = await supabase.auth.refreshSession();
            const confirmSession = refData?.session ?? (await supabase.auth.getSession()).data?.session;
            if (!confirmSession?.access_token) {
              alert('Session expired. Please sign in again and retry.');
              return;
            }
            const baseUrl = import.meta.env.VITE_SUPABASE_URL;
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            const confirmRes = await fetch(`${baseUrl}/functions/v1/confirm-wallet-recharge`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + confirmSession.access_token,
                'apikey': anonKey,
              },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
              }),
            });
            const result = await confirmRes.json().catch(() => ({}));
            if (!confirmRes.ok || result?.error) {
              alert('Recharge failed: ' + (result?.details || result?.error || confirmRes.statusText || 'Unknown error'));
              return;
            }
            setExpert((e) => (e ? { ...e, wallet_balance: result?.new_balance ?? e.wallet_balance } : e));
            if (expert?.id) fetchWallet(expert.id);
            setShowRecharge(false);
            setRechargeAmount(null);
            setCustomAmount('');
            alert('Wallet recharged successfully! New balance: ₹' + (result?.new_balance ?? 0));
          } catch (e) {
            alert('Recharge confirmation failed: ' + (e?.message || e));
          } finally {
            setRechargeLoading(false);
          }
        },
        prefill: {
          name: expert?.name || 'Expert',
          email: (await supabase.auth.getUser()).data?.user?.email || '',
        },
        theme: { color: '#0f766e' },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setRechargeLoading(false);
        setRechargeError('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      setRechargeError(err?.message || 'Something went wrong.');
    } finally {
      setRechargeLoading(false);
    }
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
           <div className="mt-6 bg-gradient-to-br from-teal-500 to-teal-700 p-5 rounded-2xl shadow-lg border border-teal-400/30">
               <div className="flex justify-between items-center gap-4 mb-4">
                 <div><p className="text-[10px] uppercase font-bold text-teal-100 flex items-center gap-1"><Wallet size={12}/> Prepaid Wallet</p><h2 className="text-3xl font-black mt-1">₹{expert.wallet_balance ?? 0}</h2></div>
               </div>
               <div className="flex gap-3">
                 <button
                   type="button"
                   onClick={() => { setShowRecharge(true); setRechargeError(''); setRechargeAmount(null); setCustomAmount(''); }}
                   className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black text-xs uppercase tracking-wider px-4 py-3 rounded-xl shadow-lg border border-green-400/50 transition-all"
                 >
                   <Plus size={16}/> Add Money
                 </button>
                 <button
                   type="button"
                   onClick={handleWithdraw}
                   disabled={!(expert.wallet_balance > 0)}
                   className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl border border-white/30 transition-all"
                 >
                   <Wallet size={16}/> Withdraw
                 </button>
               </div>
           </div>
           <p className="text-[10px] text-teal-200/80 mt-2 text-center">Platform fee cash jobs par wallet se cut hota hai. Recharge above or <Link to="/contact-support" className="underline font-bold">Contact Support</Link>.</p>

           {/* Recharge Wallet Modal */}
           {showRecharge && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !rechargeLoading && setShowRecharge(false)}>
               <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-black text-slate-900">Add Money to Wallet</h3>
                   <button type="button" onClick={() => !rechargeLoading && setShowRecharge(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={20}/></button>
                 </div>
                 <p className="text-xs text-slate-500 mb-4">Choose amount or enter custom (₹1 – ₹1,00,000). Secure payment via Razorpay.</p>
                 <div className="flex gap-2 mb-4">
                   {PRESET_AMOUNTS.map((amt) => (
                     <button
                       key={amt}
                       type="button"
                       onClick={() => { setRechargeAmount(amt); setCustomAmount(''); setRechargeError(''); }}
                       className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${rechargeAmount === amt ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600 hover:border-teal-300'}`}
                     >
                       ₹{amt}
                     </button>
                   ))}
                 </div>
                 <div className="mb-4">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount (₹) — preset or custom</label>
                   <input
                     type="number"
                     min={1}
                     max={100000}
                     placeholder="e.g. 500 or 5000"
                     value={rechargeAmount !== null ? String(rechargeAmount) : customAmount}
                     onChange={(e) => { setRechargeAmount(null); setCustomAmount(e.target.value); setRechargeError(''); }}
                     className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-medium text-slate-900 placeholder-slate-400"
                   />
                 </div>
                 {rechargeError && <p className="text-xs text-red-600 font-medium mb-3">{rechargeError}</p>}
                 <button
                   type="button"
                   disabled={rechargeLoading}
                   onClick={handleProceedToPay}
                   className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                 >
                   {rechargeLoading ? <><Loader2 size={18} className="animate-spin"/> Proceeding…</> : 'Proceed to Pay'}
                 </button>
               </div>
             </div>
           )}
       </div>

       <div className="p-4 max-w-md mx-auto space-y-6 mt-4">
           <div>
               <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2"><Clock size={16} className="text-amber-500"/> Active Jobs ({bookings.length})</h2>
               {bookings.length === 0 ? (
                   <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-6 text-center">
                     <span className="text-4xl block mb-3">📋</span>
                     <p className="text-slate-400 text-xs font-bold">No new jobs assigned.</p>
                   </div>
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
