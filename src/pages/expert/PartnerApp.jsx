import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import ExpertAuth from './ExpertAuth'; 
import { 
  MapPin, Navigation, Car, ShieldCheck, RefreshCw, 
  Lock, Wallet, User, Home, PhoneCall, LogOut, CheckCircle, Bell 
} from 'lucide-react';

// ✅ SOUND SETUP (Bahut Zaroori)
const notificationSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");

export default function PartnerApp() {
  const [session, setSession] = useState(null);
  const [expertData, setExpertData] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); 
  const [myJobs, setMyJobs] = useState([]);
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 🛰️ Live Tracking Ref
  const watchId = useRef(null);

  // --- 1. AUTH & DATA LOAD ---
  const handleAuthSuccess = async (userData) => {
    setSession(userData);
    setExpertData(userData);
    fetchJobs(userData.id);
  };

  const fetchJobs = async (expertId) => {
    setLoading(true);
    const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("expert_id", expertId)
        .neq("status", "cancelled")
        .order("id", { ascending: false });
    setMyJobs(data || []);
    setLoading(false);
  };

  // --- ✅ 2. REAL-TIME ALERT SYSTEM (SOUND ADDED) ---
  useEffect(() => {
    if (!expertData?.id) return;

    console.log("📡 Listening for jobs for Expert:", expertData.id);

    const channel = supabase
      .channel('expert-job-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        
        // Check if this update belongs to THIS expert
        if (payload.new.expert_id === expertData.id) {
            console.log("🔔 Job Update Received:", payload.new);
            
            // Agar nayi job mili hai (Assigned) -> Play Sound 🔊
            if (payload.new.status === 'assigned' && payload.old?.status !== 'assigned') {
                notificationSound.play().catch(e => console.log("Sound play error (User interaction needed first):", e));
                alert(`🔔 NEW JOB ALERT: ${payload.new.service_name}`);
            }

            // List Refresh karo
            fetchJobs(expertData.id);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [expertData]);


  // --- 3. DUTY TOGGLE (Online/Offline) ---
  const toggleDuty = async () => {
    const newState = !expertData.is_online;
    await supabase.from("experts").update({ is_online: newState }).eq("id", expertData.id);
    setExpertData({ ...expertData, is_online: newState });
    
    if(newState) {
        alert("🟢 You are ONLINE. Waiting for jobs...");
        updateLocation();
    } else {
        alert("🔴 You are OFFLINE.");
    }
  };

  const updateLocation = () => {
      if(navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
              await supabase.from("experts").update({ 
                  lat: pos.coords.latitude, 
                  lng: pos.coords.longitude 
              }).eq("id", expertData.id);
          });
      }
  };

  // --- 4. 🚀 LIVE TRACKING LOGIC ---
  const startTrip = async (jobId) => {
     if(!confirm("Start trip to customer location?")) return;

     // A. DB Status Update
     await supabase.from("bookings").update({ status: "on_the_way" }).eq("id", jobId);
     
     // B. Start GPS Watcher
     if (navigator.geolocation) {
         alert("🚗 Trip Started! Sharing Live Location.");
         watchId.current = navigator.geolocation.watchPosition(async (pos) => {
             await supabase.from("experts").update({ 
                 lat: pos.coords.latitude, 
                 lng: pos.coords.longitude 
             }).eq("id", expertData.id);
         }, (err) => console.error(err), { enableHighAccuracy: true });
     }
     fetchJobs(expertData.id);
  };

  const arrivedAtLocation = async (jobId) => {
      if(watchId.current) {
          navigator.geolocation.clearWatch(watchId.current);
          watchId.current = null;
      }
      await supabase.from("bookings").update({ status: "arrived" }).eq("id", jobId);
      fetchJobs(expertData.id);
      alert("📍 You have arrived! Ask customer for Start OTP.");
  };

  // --- 5. 🔐 OTP & WORKFLOW (UPDATED WITH TRANSPARENCY) ---
  const verifyStartOTP = async (job) => {
      if(otpInput !== job.start_otp) return alert("❌ Wrong OTP! Ask customer again.");
      
      await supabase.from("bookings").update({ status: "in_progress", started_at: new Date() }).eq("id", job.id);
      setOtpInput("");
      fetchJobs(expertData.id);
      alert("✅ OTP Verified! Work Started.");
  };

  const verifyEndOTP = async (job) => {
      if(otpInput !== job.end_otp) return alert("❌ Wrong OTP! Work cannot end.");

      // 1. 💰 HISAB KITAB (80-20 Rule)
      // Agar booking table me price nahi hai to default 499 manenge
      const totalBill = job.price || 499; 
      const commissionRate = 0.20; // 20% Platform Fee
      const commission = totalBill * commissionRate;
      const expertEarning = totalBill - commission;

      // 2. CHECK BALANCE
      if((expertData.wallet_balance || 0) < commission) {
           // Agar balance kam hai to warning de sakte hain, par abhi minus me jaane denge
           alert(`⚠️ Notice: Your wallet balance is low. ₹${commission} will be deducted.`);
      }

      // 3. DEDUCT COMMISSION
      const newBalance = (expertData.wallet_balance || 0) - commission;

      // 4. UPDATE BOOKING (Save Transparency Data)
      await supabase.from("bookings").update({ 
          status: "completed", 
          completed_at: new Date(),
          total_amount: totalBill,
          commission_amount: commission,
          expert_earning: expertEarning
      }).eq("id", job.id);

      // 5. UPDATE EXPERT WALLET
      await supabase.from("experts").update({ wallet_balance: newBalance }).eq("id", expertData.id);

      // 6. LOG TRANSACTION (Saboot)
      await supabase.from("transactions").insert([{
          expert_id: expertData.id,
          amount: commission,
          type: 'debit',
          description: `Commission for Order #${job.id} (Bill: ₹${totalBill})`
      }]);

      // 7. REFRESH & ALERT
      setOtpInput("");
      setExpertData({...expertData, wallet_balance: newBalance});
      fetchJobs(expertData.id);
      
      alert(`🎉 Job Completed!\n\n💰 Total Bill: ₹${totalBill}\n🤝 Commission (20%): -₹${commission}\n💵 Your Earning: ₹${expertEarning}\n\nWallet Updated!`);
  };

  // --- RENDER ---
  if (!session) return <ExpertAuth onLoginSuccess={handleAuthSuccess} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
       
       {/* HEADER */}
       <div className="bg-[#0f172a] text-white p-6 rounded-b-[2rem] shadow-xl sticky top-0 z-20">
          <div className="flex justify-between items-center mb-4">
             <div>
                 <h2 className="font-black text-xl">{expertData.name}</h2>
                 <p className="text-xs text-blue-200 font-bold uppercase">{expertData.service_category} Expert</p>
             </div>
             {/* Duty Toggle */}
             <button onClick={toggleDuty} className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all ${expertData.is_online ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-slate-700 text-slate-400'}`}>
                 <div className={`w-2 h-2 rounded-full ${expertData.is_online ? 'bg-white animate-pulse' : 'bg-slate-500'}`}></div>
                 {expertData.is_online ? 'ON DUTY' : 'OFF DUTY'}
             </button>
          </div>
       </div>

       <div className="p-4">
          
          {/* --- TAB: HOME (JOBS) --- */}
          {activeTab === 'home' && (
             <div className="space-y-4 animate-in slide-in-from-bottom">
                <div className="flex justify-between items-end px-2">
                   <h3 className="font-black text-slate-700 text-lg">Active Jobs</h3>
                   <button onClick={() => fetchJobs(expertData.id)} className="text-xs font-bold text-blue-600 flex items-center gap-1">
                       <RefreshCw size={12} className={loading ? "animate-spin" : ""}/> Refresh
                   </button>
                </div>
                
                {myJobs.length === 0 ? (
                    <div className="text-center py-10 opacity-50 border-2 border-dashed border-slate-300 rounded-2xl">
                        <Home size={32} className="mx-auto mb-2 text-slate-400"/>
                        <p className="font-bold text-sm text-slate-500">No jobs assigned yet.</p>
                    </div>
                 ) : (
                    myJobs.map(job => (
                       <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                          
                          {/* Status Badge */}
                          <div className={`absolute top-0 right-0 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase 
                              ${job.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'}`}>
                              {job.status.replace(/_/g, ' ')}
                          </div>
                          
                          <div className="mb-4">
                              <h4 className="font-bold text-lg text-slate-800">{job.service_name || 'Service'}</h4>
                              <p className="text-xs font-bold text-slate-400 mb-2">Order #{job.id.slice(0,8)}</p>
                              <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl">
                                  <MapPin size={16} className="text-blue-500 mt-0.5 shrink-0"/>
                                  <div>
                                      <p className="text-sm font-bold text-slate-700">{job.customer_name || 'Customer'}</p>
                                      <p className="text-xs text-slate-500">{job.address}</p>
                                  </div>
                              </div>
                          </div>

                          {/* 🔥 DYNAMIC ACTION BUTTONS */}
                          <div className="pt-2">
                             {/* 1. ASSIGNED -> Accept */}
                             {job.status === 'assigned' && (
                                 <button onClick={async () => {
                                     if(confirm("Accept this job?")) {
                                         await supabase.from("bookings").update({ status: "accepted" }).eq("id", job.id);
                                         fetchJobs(expertData.id);
                                     }
                                 }} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800">
                                     Accept Job
                                 </button>
                             )}

                             {/* 2. ACCEPTED -> Start Trip */}
                             {job.status === 'accepted' && (
                                 <button onClick={() => startTrip(job.id)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg animate-pulse">
                                     <Navigation size={18}/> Start Trip
                                 </button>
                             )}

                             {/* 3. ON THE WAY -> Arrived */}
                             {job.status === 'on_the_way' && (
                                 <button onClick={() => arrivedAtLocation(job.id)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                                     <MapPin size={18}/> I Have Arrived
                                 </button>
                             )}

                             {/* 4. ARRIVED -> Verify Start OTP */}
                             {job.status === 'arrived' && (
                                 <div className="space-y-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                     <p className="text-xs font-bold text-blue-800 text-center">Ask customer for Start OTP</p>
                                     <div className="flex gap-2">
                                         <input className="flex-1 bg-white border border-blue-200 rounded-lg px-4 text-center font-bold tracking-[4px] text-lg outline-none focus:border-blue-500" 
                                             placeholder="1234" maxLength={4} value={otpInput} onChange={e=>setOtpInput(e.target.value)} />
                                         <button onClick={() => verifyStartOTP(job)} className="bg-blue-600 text-white px-4 rounded-lg font-bold">Start</button>
                                     </div>
                                 </div>
                             )}

                             {/* 5. IN PROGRESS -> Verify End OTP */}
                             {job.status === 'in_progress' && (
                                 <div className="space-y-3 bg-green-50 p-4 rounded-xl border border-green-100">
                                     <p className="text-xs font-bold text-green-800 text-center flex items-center justify-center gap-1"><ShieldCheck size={14}/> Job Started. Ask End OTP to finish.</p>
                                     <div className="flex gap-2">
                                         <input className="flex-1 bg-white border border-green-200 rounded-lg px-4 text-center font-bold tracking-[4px] text-lg outline-none focus:border-green-500" 
                                             placeholder="5678" maxLength={4} value={otpInput} onChange={e=>setOtpInput(e.target.value)} />
                                         <button onClick={() => verifyEndOTP(job)} className="bg-slate-900 text-white px-4 rounded-lg font-bold">Finish</button>
                                     </div>
                                 </div>
                             )}

                             {/* 6. COMPLETED */}
                             {job.status === 'completed' && (
                                 <div className="text-center py-2 text-green-600 font-bold text-xs flex items-center justify-center gap-1">
                                     <CheckCircle size={14}/> Job Completed
                                 </div>
                             )}
                          </div>
                       </div>
                    ))
                 )}
             </div>
          )}

          {/* --- TAB: WALLET --- */}
          {activeTab === 'wallet' && (
              <div className="animate-in slide-in-from-right">
                 <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-xl mb-6">
                     <p className="text-slate-400 text-xs font-bold uppercase mb-1">Wallet Balance</p>
                     <h2 className="text-4xl font-black">₹{expertData.wallet_balance || 0}</h2>
                 </div>
                 <div className="text-center text-slate-400 py-10 font-bold text-sm">No transactions yet.</div>
              </div>
          )}

          {/* --- TAB: PROFILE --- */}
          {activeTab === 'profile' && (
              <div className="space-y-3 animate-in slide-in-from-right">
                  <button onClick={() => {setSession(null); setExpertData(null);}} className="w-full bg-red-50 p-4 rounded-xl font-bold text-red-500 flex items-center justify-between border border-red-100">
                      <span className="flex items-center gap-3"><LogOut size={18}/> Logout</span>
                  </button>
              </div>
          )}

       </div>

       {/* BOTTOM NAV */}
       <div className="fixed bottom-4 left-4 right-4 bg-white rounded-2xl h-16 shadow-2xl border border-slate-100 flex justify-around items-center z-40">
           <button onClick={() => setActiveTab('home')} className={`p-2 rounded-xl transition ${activeTab==='home'?'bg-[#0f172a] text-white':'text-slate-400'}`}><Home size={22}/></button>
           <button onClick={() => setActiveTab('wallet')} className={`p-2 rounded-xl transition ${activeTab==='wallet'?'bg-[#0f172a] text-white':'text-slate-400'}`}><Wallet size={22}/></button>
           <button onClick={() => setActiveTab('profile')} className={`p-2 rounded-xl transition ${activeTab==='profile'?'bg-[#0f172a] text-white':'text-slate-400'}`}><User size={22}/></button>
       </div>

    </div>
  );
}