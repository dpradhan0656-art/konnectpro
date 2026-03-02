import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Power, MapPin, Navigation, Clock, Loader2, User, CheckCircle, Wrench, Wallet, IndianRupee, LogOut, Volume2 } from 'lucide-react';

export default function ExpertDashboard() {
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null); 

  const watchIdRef = useRef(null);
  const prevJobsLength = useRef(0); // नए काम को ट्रैक करने के लिए

  // 🗣️ हिंदी वॉइस असिस्टेंट फंक्शन (The Magic)
  const speakHindi = (text) => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel(); // पुरानी आवाज़ बंद करें
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'hi-IN'; // हिंदी भाषा
          utterance.rate = 1; // बोलने की स्पीड
          utterance.pitch = 1;
          window.speechSynthesis.speak(utterance);
      }
  };

  useEffect(() => {
    checkExpertLogin();
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // 🔔 जब नया काम आए, तो मोबाइल बोलकर बताएगा
  useEffect(() => {
      if (jobs.length > prevJobsLength.current) {
          const newJob = jobs[0];
          if (newJob && newJob.status === 'assigned') {
              speakHindi(`नया काम आया है। सर्विस है: ${newJob.service_name}। कृपया ऐप चेक करें।`);
          }
      }
      prevJobsLength.current = jobs.length;
  }, [jobs]);

  // 1. Verify Login & Profile
  const checkExpertLogin = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) { navigate('/expert/login'); return; }

    const { data: expData } = await supabase.from('experts').select('*').eq('user_id', user.id).single();
    
    if (expData) {
        setExpert(expData);
        fetchMyJobs(expData.id);
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

  // 3. Status Update (Accept/Start)
  const updateJobStatus = async (jobId, newStatus) => {
    setProcessingId(jobId);
    try {
      const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', jobId);
      if (error) throw error;
      setJobs(jobs.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
      
      // स्टेटस बदलने पर भी आवाज़
      if(newStatus === 'accepted') speakHindi('काम एक्सेप्ट कर लिया गया है। कस्टमर की लोकेशन पर जाएँ।');
    } catch (err) {
      alert("Status update fail ho gaya!");
    } finally {
      setProcessingId(null);
    }
  };

  // 💰 4. SECURE PAYOUT FUNCTION (Database RPC)
  const markJobCompleted = async (job) => {
      const confirmDone = window.confirm("क्या काम पूरा हो गया है और आपने पेमेंट ले ली है?");
      if (!confirmDone) return;

      setProcessingId(job.id);
      try {
          const { error } = await supabase.rpc('process_job_payout', {
              p_booking_id: job.id
          });
          
          if (error) throw error;

          setJobs(jobs.filter(j => j.id !== job.id));
          speakHindi("शानदार! काम पूरा हो गया है और पैसा आपके वॉलेट में जोड़ दिया गया है।"); // 🗣️
          alert(`🎉 शानदार! पैसा आपके वॉलेट में जोड़ दिया गया है।`);
          
          checkExpertLogin(); 
      } catch (error) {
          console.error("Payout Error:", error);
          alert("Payment Error: " + error.message);
      } finally {
          setProcessingId(null);
      }
  };

  // 🛰️ GPS Tracking
  const startLiveTracking = (expId) => {
      if (!navigator.geolocation) return;
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);

      watchIdRef.current = navigator.geolocation.watchPosition(
          async (position) => {
              const { latitude, longitude } = position.coords;
              await supabase.from('experts').update({ latitude, longitude }).eq('id', expId);
              setExpert(prev => prev ? { ...prev, latitude, longitude } : prev);
          },
          (err) => console.error("GPS Error:", err),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
  };

  const toggleDutyStatus = async () => {
    if (!expert) return;
    setLocationLoading(true);
    if (expert.is_active) {
        await supabase.from('experts').update({ is_active: false }).eq('id', expert.id);
        setExpert({ ...expert, is_active: false });
        speakHindi("आप अब ऑफलाइन हैं।"); // 🗣️
        if (watchIdRef.current) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    } else {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            await supabase.from('experts').update({ is_active: true, latitude, longitude }).eq('id', expert.id);
            setExpert({ ...expert, is_active: true, latitude, longitude });
            startLiveTracking(expert.id);
            speakHindi("आप अब ऑनलाइन हैं, नया काम आने पर आपको तुरंत बताया जाएगा।"); // 🗣️
        }, () => alert("Location access allow कीजिये!"));
    }
    setLocationLoading(false);
  };

  const handleLogout = async () => {
      if (!window.confirm("Logout करना चाहते हैं?")) return;
      if (expert?.is_active) await supabase.from('experts').update({ is_active: false }).eq('id', expert.id);
      await supabase.auth.signOut();
      navigate('/expert/login'); 
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-teal-500" size={40}/></div>;

  const expertName = expert?.name || expert?.full_name || 'Expert';

  return (
    <div className="min-h-screen bg-slate-950 pb-20 font-sans text-white">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 p-6 rounded-b-[2.5rem] shadow-2xl border-b border-slate-800">
          <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center font-black text-xl relative">
                      {expertName[0]}
                      <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1">
                          <Volume2 size={12} className="text-teal-400"/>
                      </div>
                  </div>
                  <div>
                      <h2 className="text-xl font-black">{expertName}</h2>
                      <p className="text-teal-500 text-[10px] font-black uppercase tracking-widest">{expert?.service_category} Expert</p>
                      <button onClick={handleLogout} className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase mt-1 transition-colors hover:text-red-400">
                          <LogOut size={12}/> Log Out
                      </button>
                  </div>
              </div>

              <div className="text-right bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <p className="text-[9px] text-slate-500 uppercase font-black">Wallet Balance</p>
                  <p className="text-2xl font-black text-green-400 mb-2">₹{expert?.wallet_balance?.toFixed(2) || 0}</p>
                  
                  {/* WITHDRAW BUTTON WITH RPC CALL */}
                  <button 
                    onClick={async () => {
                        const upiId = prompt("UPI ID / Bank Details भरें:");
                        if (!upiId) return;
                        
                        const amountStr = prompt(`Enter amount (Max: ₹${expert.wallet_balance}):`, expert.wallet_balance);
                        if (!amountStr) return;
                        
                        const amount = parseFloat(amountStr);
                        if (isNaN(amount) || amount <= 0) return alert("Invalid amount!");
                        
                        try {
                            const { error } = await supabase.rpc('request_wallet_withdrawal', {
                                p_user_id: expert.user_id,
                                p_user_type: 'expert',
                                p_user_name: expertName,
                                p_amount: amount,
                                p_payment_method: 'UPI/Bank',
                                p_payment_details: upiId
                            });
                            
                            if (error) throw error;
                            speakHindi("निकासी की रिक्वेस्ट भेज दी गई है।");
                            alert("✅ Request Sent! हेडक्वार्टर जल्द ही पेमेंट कर देगा।");
                            checkExpertLogin(); 
                        } catch(err) { 
                            alert("Failed: " + err.message); 
                        }
                    }}
                    disabled={!expert?.wallet_balance || expert.wallet_balance <= 0}
                    className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <IndianRupee size={10} className="inline"/> Withdraw
                  </button>
              </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
              <button 
                  onClick={toggleDutyStatus} disabled={locationLoading}
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all border-4 ${
                      expert?.is_active ? 'bg-green-500/20 text-green-500 border-green-500/50' : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
              >
                  {locationLoading ? <Loader2 size={32} className="animate-spin"/> : <Power size={32} />}
              </button>
              <h3 className={`text-lg font-black uppercase tracking-widest ${expert?.is_active ? 'text-green-500' : 'text-slate-500'}`}>
                  {expert?.is_active ? 'Online' : 'Offline'}
              </h3>
          </div>
      </div>

      {/* JOBS SECTION */}
      <div className="p-6 max-w-lg mx-auto">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Assignments ({jobs.length})</h3>
          <div className="space-y-4">
              {jobs.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center text-slate-500 font-bold">No active jobs.</div>
              ) : jobs.map(job => (
                  <div key={job.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl border-l-4 border-l-teal-500">
                      <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-teal-400 uppercase">{job.status}</span>
                          <span className="text-lg font-black">₹{job.total_amount}</span>
                      </div>
                      <h4 className="text-lg font-bold mb-2">{job.service_name}</h4>
                      <p className="text-sm text-slate-400 flex items-start gap-2 mb-4"><MapPin size={16}/> {job.address}</p>
                      
                      <div className="flex flex-col gap-2">
                          {job.status === 'assigned' && (
                              <button onClick={() => updateJobStatus(job.id, 'accepted')} className="w-full bg-teal-500 text-slate-900 py-3 rounded-xl font-black uppercase text-xs">Accept Job</button>
                          )}
                          {job.status === 'accepted' && (
                              <div className="flex gap-2">
                                  {/* 🚀 FIX: Google Maps Link Update */}
                                  <button onClick={() => window.open(`https://www.google.com/maps?q=${job.latitude},${job.longitude}`, '_blank')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-xs flex justify-center items-center gap-1"><Navigation size={14}/> Navigate</button>
                                  <button onClick={() => updateJobStatus(job.id, 'in_progress')} className="flex-1 bg-yellow-500 text-slate-900 py-3 rounded-xl font-black uppercase text-xs">Start Work</button>
                              </div>
                          )}
                          {job.status === 'in_progress' && (
                              <button onClick={() => markJobCompleted(job)} disabled={processingId === job.id} className="w-full bg-green-500 hover:bg-green-400 text-slate-900 py-4 rounded-xl font-black uppercase text-xs">
                                  {processingId === job.id ? <Loader2 className="animate-spin mx-auto" size={18}/> : "Mark Completed 🏆"}
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