import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Power, MapPin, Navigation, Clock, Loader2, User, CheckCircle, Wrench, Wallet, IndianRupee, LogOut } from 'lucide-react';

export default function ExpertDashboard() {
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null); 

  // 🛰️ GPS Tracking Remote Control
  const watchIdRef = useRef(null);

  useEffect(() => {
    checkExpertLogin();
    
    // 🛑 Component unmount hone par tracking rok dein (Battery save)
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // 1. Verify Expert Login
  const checkExpertLogin = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) { navigate('/expert/login'); return; } // FIX: Updated redirect path

    const { data: expData } = await supabase.from('experts').select('*').eq('user_id', user.id).single();
    
    if (expData) {
        setExpert(expData);
        fetchMyJobs(expData.id);
        
        // Agar expert pehle se online tha, toh app khulte hi tracking resume karo
        if (expData.is_active) {
            startLiveTracking(expData.id);
        }
    } else {
        alert("Access Denied: You are not registered as an Expert.");
        navigate('/expert/login'); 
    }
    setLoading(false);
  };

  // 2. Fetch Assigned Jobs
  const fetchMyJobs = async (expertId) => {
    const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('expert_id', expertId)
        .in('status', ['assigned', 'accepted', 'in_progress'])
        .order('created_at', { ascending: false });
    
    if (data) setJobs(data);
  };

  // 3. Update Normal Status
  const updateJobStatus = async (jobId, newStatus) => {
    setProcessingId(jobId);
    try {
      const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', jobId);
      if (error) throw error;
      
      setJobs(jobs.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
    } catch (err) {
      alert("Status update fail ho gaya!");
    } finally {
      setProcessingId(null);
    }
  };

  // 💰 4. THE MAGIC PAYOUT FUNCTION
  const markJobCompleted = async (job) => {
      const confirmDone = window.confirm("Are you sure the job is fully completed and payment is collected?");
      if (!confirmDone) return;

      setProcessingId(job.id);
      try {
          const expertCut = (job.total_amount * 0.80).toFixed(2);
          
          await supabase.from('bookings').update({ status: 'completed' }).eq('id', job.id);

          await supabase.from('transactions').insert({
              booking_id: job.id, user_type: 'expert', user_id: expert.id,
              amount: parseFloat(expertCut), transaction_type: 'credit', description: `Earnings for Booking #${job.id}`
          });

          const newBalance = parseFloat(expert.wallet_balance || 0) + parseFloat(expertCut);
          await supabase.from('experts').update({ wallet_balance: newBalance }).eq('id', expert.id);
          
          setExpert({ ...expert, wallet_balance: newBalance });

          if (job.area_head_id) {
              const { data: ah } = await supabase.from('area_heads').select('*').eq('id', job.area_head_id).single();
              if (ah && ah.employment_type === 'commission') {
                  const ahCut = (job.total_amount * (ah.compensation_value / 100)).toFixed(2);
                  await supabase.from('transactions').insert({
                      booking_id: job.id, user_type: 'area_head', user_id: ah.user_id,
                      amount: parseFloat(ahCut), transaction_type: 'credit', description: `Commission from Booking #${job.id}`
                  });
                  await supabase.from('area_heads').update({ wallet_balance: parseFloat(ah.wallet_balance || 0) + parseFloat(ahCut) }).eq('id', ah.id);
              }
          }

          setJobs(jobs.filter(j => j.id !== job.id));
          alert(`🎉 Shaandaar! Kaam poora ho gaya.\n💰 ₹${expertCut} aapke wallet me add kar diye gaye hain!`);

      } catch (error) {
          console.error("Payout Error:", error);
          alert("Payment process me error aayi. Please contact Admin.");
      } finally {
          setProcessingId(null);
      }
  };

  // 🛰️ LIVE TRACKING FUNCTION
  const startLiveTracking = (expId) => {
      if (!navigator.geolocation) return;
      
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);

      watchIdRef.current = navigator.geolocation.watchPosition(
          async (position) => {
              const { latitude, longitude } = position.coords;
              await supabase.from('experts').update({ latitude, longitude }).eq('id', expId);
              setExpert(prev => prev ? { ...prev, latitude, longitude } : prev);
          },
          (err) => console.error("GPS Tracking Error:", err),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
  };

  // 5. GO ONLINE / OFFLINE TOGGLE
  const toggleDutyStatus = async () => {
    if (!expert) return;

    if (expert.is_active) {
        setLocationLoading(true);
        await supabase.from('experts').update({ is_active: false }).eq('id', expert.id);
        setExpert({ ...expert, is_active: false });
        
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        
        setLocationLoading(false);
        return;
    }

    if (!navigator.geolocation) { alert("GPS is not supported."); return; }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const { error } = await supabase.from('experts').update({ is_active: true, latitude, longitude }).eq('id', expert.id);
        
        if (!error) {
            setExpert({ ...expert, is_active: true, latitude, longitude });
            startLiveTracking(expert.id);
        }
        setLocationLoading(false);
    }, (err) => {
        alert("⚠️ Please ALLOW Location Access to go online.");
        setLocationLoading(false);
    });
  };

  // 🚪 6. LOGOUT FUNCTION (Ab ye sahi jagah par hai)
  const handleLogout = async () => {
      const confirmOut = window.confirm("Are you sure you want to log out?");
      if (!confirmOut) return;
      
      if (expert?.is_active) {
          await supabase.from('experts').update({ is_active: false }).eq('id', expert.id);
      }
      if (watchIdRef.current) {
          navigator.geolocation.clearWatch(watchIdRef.current);
      }

      await supabase.auth.signOut();
      navigate('/expert/login'); 
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-teal-500" size={40}/></div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-20 font-sans text-white selection:bg-teal-500/30">
      
      {/* 🛡️ EXPERT PROFILE HEADER */}
      <div className="bg-slate-900 p-6 rounded-b-[2.5rem] shadow-2xl border-b border-slate-800">
          <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center font-black text-xl shadow-lg shadow-teal-500/20">
                      {expert?.name?.[0] || <User/>}
                  </div>
                  <div>
                      <h2 className="text-xl font-black">{expert?.name}</h2>
                      <p className="text-teal-500 text-[10px] font-black uppercase tracking-widest mb-1">{expert?.service_category} Expert</p>
                      
                      {/* 🚀 LOGOUT BUTTON (Ab single baar dikhega) */}
                      <button onClick={handleLogout} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-400 font-bold uppercase tracking-wider transition-colors">
                          <LogOut size={12}/> Log Out
                      </button>
                  </div>
              </div>

              <div className="text-right bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <p className="text-[9px] text-slate-500 uppercase font-black flex items-center justify-end gap-1"><Wallet size={10}/> Wallet Balance</p>
                  <p className="text-2xl font-black text-green-400 mb-2">₹{expert?.wallet_balance?.toFixed(2) || 0}</p>
                  
                  {/* WITHDRAW BUTTON */}
                  <button 
                      onClick={async () => {
                          const upiId = prompt("Enter your UPI ID or Bank Details to receive funds:");
                          if (!upiId) return;
                          
                          const amountStr = prompt(`Enter amount to withdraw (Max: ₹${expert.wallet_balance}):`, expert.wallet_balance);
                          if (!amountStr) return;
                          
                          const amount = parseFloat(amountStr);
                          if (isNaN(amount) || amount > expert.wallet_balance || amount <= 0) {
                              return alert("Invalid amount!");
                          }
                          
                          try {
                              const { error } = await supabase.from('withdrawal_requests').insert({
                                  user_id: expert.id, 
                                  user_type: 'expert',
                                  user_name: expert.name,
                                  amount: amount,
                                  payment_method: 'UPI/Bank',
                                  payment_details: upiId
                              });
                              
                              if (error) throw error;
                              
                              alert("✅ Withdrawal request sent to Kshatr HQ! Money will be transferred soon.");
                          } catch(err) { 
                              alert("Failed to send request: " + err.message); 
                          }
                      }}
                      disabled={!expert?.wallet_balance || expert.wallet_balance <= 0}
                      className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex justify-center items-center gap-1"
                  >
                      <IndianRupee size={12}/> Withdraw
                  </button>
              </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
              <button 
                  onClick={toggleDutyStatus} disabled={locationLoading}
                  className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-500 shadow-2xl border-4 ${
                      expert?.is_active ? 'bg-green-500/20 text-green-500 border-green-500/50 shadow-green-500/20' : 'bg-slate-800 text-slate-500 border-slate-700 shadow-none'
                  }`}
              >
                  {locationLoading ? <Loader2 size={32} className="animate-spin"/> : <Power size={40} />}
              </button>
              
              <h3 className={`text-xl font-black uppercase tracking-widest ${expert?.is_active ? 'text-green-500' : 'text-slate-500'}`}>
                  {expert?.is_active ? 'You are Online' : 'You are Offline'}
              </h3>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                  {expert?.is_active ? "Your GPS is locked. Waiting for new jobs from Dispatch." : "Go online to share your location and receive jobs."}
              </p>
          </div>
      </div>

      {/* 📋 MY JOBS SECTION */}
      <div className="p-6 max-w-lg mx-auto">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Navigation size={16}/> Active Assignments ({jobs.length})
          </h3>

          <div className="space-y-4">
              {jobs.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center">
                      <Clock size={32} className="mx-auto text-slate-700 mb-3"/>
                      <p className="text-slate-500 font-bold text-sm">No active jobs right now.</p>
                  </div>
              ) : jobs.map(job => (
                  <div key={job.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl border-l-4 border-l-teal-500">
                      
                      <div className="flex justify-between items-start mb-3">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                              job.status === 'assigned' ? 'bg-orange-500/10 text-orange-400' :
                              job.status === 'accepted' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                              {job.status.replace('_', ' ')}
                          </span>
                          <span className="text-lg font-black text-white">₹{job.total_amount}</span>
                      </div>
                      
                      <h4 className="text-lg font-bold text-white mb-2">{job.service_name}</h4>
                      <p className="text-sm text-slate-400 flex items-start gap-2 mb-2">
                          <MapPin size={16} className="text-slate-600 shrink-0 mt-0.5"/> {job.address}
                      </p>
                      
                      <p className={`text-[10px] mt-2 font-black uppercase ${job.payment_mode?.includes('cash') ? 'text-orange-400' : 'text-green-400'}`}>
                          {job.payment_mode === 'cash_after_service' ? 'Collect Cash' : 'Online Paid'}
                      </p>

                      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-3">
                          
                          {job.status === 'assigned' && (
                              <button onClick={() => updateJobStatus(job.id, 'accepted')} disabled={processingId === job.id} className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 py-3.5 rounded-xl font-black uppercase text-xs flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                                  {processingId === job.id ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>} Accept Job
                              </button>
                          )}

                          {job.status === 'accepted' && (
                              <div className="flex gap-3">
                                  {/* 🚀 FINAL FIXED UNIVERSAL GOOGLE MAPS LINK */}
                                  <button onClick={() => {
                                          if(job.latitude && job.longitude) {
                                              // 👇 TRUE GOOGLE MAPS DIRECTIONS LINK
                                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`, '_blank');
                                          } else {
                                              alert("Customer GPS Location not found!");
                                          }
                                      }}
                                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-black uppercase text-xs flex justify-center items-center gap-2 transition-all active:scale-95"
                                  >
                                      <Navigation size={16}/> Navigate
                                  </button>
                                  <button onClick={() => updateJobStatus(job.id, 'in_progress')} disabled={processingId === job.id} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-900 py-3.5 rounded-xl font-black uppercase text-xs flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                                      {processingId === job.id ? <Loader2 size={16} className="animate-spin"/> : <Wrench size={16}/>} Start Work
                                  </button>
                              </div>
                          )}

                          {job.status === 'in_progress' && (
                              <button onClick={() => markJobCompleted(job)} disabled={processingId === job.id} className="w-full bg-green-500 hover:bg-green-400 text-slate-900 py-4 rounded-xl font-black uppercase text-xs flex justify-center items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50">
                                  {processingId === job.id ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>} Mark as Completed 🏆
                              </button>
                          )}

                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}