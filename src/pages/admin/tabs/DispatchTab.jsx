import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { 
  Navigation, Clock, MapPin, CheckCircle, XCircle, 
  RefreshCw, IndianRupee, Zap, Phone, AlertCircle, Loader2, MapPinned, Building
} from 'lucide-react';

export default function DispatchTab() {
  const [bookings, setBookings] = useState([]);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Har 15 sec me auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Fetch Bookings (With proper Error Handling)
    const { data: bData, error: bError } = await supabase
        .from('bookings')
        .select(`*, experts(name, phone)`)
        .order('created_at', { ascending: false });
        
    if (bError) {
        console.error("Booking Fetch Error:", bError);
        if(bError.code !== 'PGRST116') alert("DB Error: " + bError.message); 
    } else if (bData) {
        setBookings(bData);
    }

    // 2. Fetch Active Experts
    const { data: eData, error: eError } = await supabase
        .from('experts')
        .select('*')
        .eq('status', 'approved')
        .eq('is_active', true); 
        
    if (eData) setExperts(eData);
    
    setLoading(false);
  };

  // 🌍 THE RADAR MATH
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth's Radius in KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1); 
  };

  // 🛠️ Smart Assign Expert
  const handleAssign = async (bookingId, expertId) => {
      if (!expertId) return;
      if (!window.confirm("Confirm Assignment? Expert ko app par notification mil jayegi.")) return;

      const { error } = await supabase
        .from('bookings')
        .update({ expert_id: expertId, status: 'assigned' })
        .eq('id', bookingId);
      
      if(!error) {
          fetchData();
      } else {
          alert("Error assigning expert: " + error.message);
      }
  };

  // 💰 Mark Completed & Wallet Math
  const handleComplete = async (job) => {
      if (!window.confirm(`Mark Job #${String(job.id).slice(0,5)} as COMPLETED?`)) return;

      const amount = parseFloat(job.total_amount || 0);
      const commissionRate = 0.20; 
      const platformFee = amount * commissionRate;
      const expertPayout = amount - platformFee;

      const { error } = await supabase.from('bookings').update({ 
          status: 'completed',
          platform_fee: platformFee,
          expert_payout: expertPayout
      }).eq('id', job.id);

      if(error) return alert("Error updating job: " + error.message);

      const expert = experts.find(e => e.id === job.expert_id);
      if (expert) {
          let newBalance = parseFloat(expert.wallet_balance || 0);
          let transType = '';
          let transAmount = 0;

          if (job.payment_mode?.includes('cash')) {
              newBalance -= platformFee;
              transType = 'debit';
              transAmount = platformFee;
          } else {
              newBalance += expertPayout;
              transType = 'credit';
              transAmount = expertPayout;
          }

          await supabase.from('experts').update({ wallet_balance: newBalance }).eq('id', expert.id);

          await supabase.from('wallet_transactions').insert({
              user_id: expert.id,
              user_type: 'expert',
              amount: transAmount,
              transaction_type: transType,
              reason: transType === 'debit' ? 'commission_cut' : 'online_payout',
              description: `Job #${String(job.id).slice(0,5)} settlement`,
              booking_id: job.id
          });
      }
      fetchData();
      alert("✅ Job Completed & Wallet Updated!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 font-sans">
      
      {/* 🚀 HEADER PANEL */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl gap-4">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500 animate-pulse">
                <Navigation size={32} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Dispatch Board</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Real-time Order Monitoring</p>
            </div>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">
            {loading ? <Loader2 className="animate-spin" size={14}/> : <RefreshCw size={14}/>} Refresh Feed
        </button>
      </div>

      {/* 📋 BOOKING CARDS */}
      <div className="grid gap-6">
          {bookings.length === 0 ? (
              <div className="text-center py-20 bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-800">
                  <AlertCircle className="mx-auto mb-4 text-slate-700" size={48}/>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No Active Bookings Found</p>
              </div>
          ) : bookings.map(job => (
              <div key={job.id} className={`bg-slate-900 border ${job.status === 'pending' ? 'border-orange-500/30' : 'border-slate-800'} rounded-[2.5rem] p-6 shadow-2xl flex flex-col lg:flex-row gap-6 hover:border-teal-500/30 transition-all group relative overflow-hidden`}>
                  
                  {/* City Indicator Badge */}
                  <div className="absolute top-0 right-10 bg-slate-800 px-4 py-1 rounded-b-xl border-x border-b border-slate-700 flex items-center gap-1.5 z-10 shadow-lg">
                      <Building size={10} className="text-slate-400"/>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{job.city || 'Jabalpur'}</span>
                  </div>

                  {/* LEFT: STATUS & SERVICE */}
                  <div className="flex-1 mt-2">
                      <div className="flex items-center gap-3 mb-4">
                          <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              job.status === 'pending' ? 'bg-orange-500 text-white animate-pulse' : 
                              job.status === 'assigned' ? 'bg-blue-600 text-white' : 
                              job.status === 'completed' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-500'
                          }`}>
                              {job.status}
                          </span>
                          <span className="text-slate-600 font-mono text-[10px]">ID: {String(job.id).slice(0,8)}</span>
                      </div>
                      
                      <h3 className="text-2xl font-black text-white group-hover:text-teal-400 transition-colors mb-4 flex items-center gap-2">
                        <Zap size={20} className="text-teal-500"/> {job.service_name}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2 text-slate-400">
                            <MapPin size={16} className="text-slate-600 shrink-0 mt-1"/>
                            <p className="text-xs font-medium leading-relaxed">{job.address}</p>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={16} className="text-slate-600 shrink-0"/>
                            <p className="text-xs font-bold font-mono">{new Date(job.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                  </div>

                  {/* RIGHT: PRICING & ACTION CENTER */}
                  <div className="lg:w-[300px] border-t lg:border-t-0 lg:border-l border-slate-800/50 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between">
                      <div className="mb-6 text-right">
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Bill</p>
                          <div className="text-3xl font-black text-white flex items-center justify-end gap-1">
                              <IndianRupee size={24} className="text-teal-500"/> {job.total_amount}
                          </div>
                          <p className={`text-[10px] font-black mt-1 uppercase ${job.payment_mode?.includes('cash') ? 'text-orange-400' : 'text-green-400'}`}>
                              ● {job.payment_mode === 'cash_after_service' ? 'Cash After Service' : 'Online Paid'}
                          </p>
                      </div>

                      <div className="space-y-3">
                          {job.status === 'pending' && (
                              <div className="space-y-2">
                                <label className="text-[9px] font-bold text-orange-500 uppercase ml-1 flex items-center gap-1">
                                    <MapPinned size={10}/> Assign Expert (Radar)
                                </label>
                                
                                <select 
                                    onChange={(e) => handleAssign(job.id, e.target.value)} 
                                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl p-4 outline-none focus:border-orange-500 transition-all cursor-pointer appearance-none shadow-inner"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select Matching Expert...</option>
                                    
                                    {(() => {
                                        // 1. नाम को एकदम साफ़ करो (spaces और बड़े अक्षर हटाकर)
                                        const jobService = (job.service_name || "").toLowerCase().trim();
                                        const jobCat = (job.category || job.service_category || "").toLowerCase().trim();

                                        // 2. सिर्फ काम के एक्सपर्ट्स को चुनो (Smart AI Filter)
const availableExperts = experts.filter(exp => {
    const expCat = (exp.service_category || "").toLowerCase().trim();
    
    // अगर एक्सपर्ट की कैटेगरी खाली है, तो उसे मत दिखाओ
    if (!expCat) return false;

    // 🧠 SMART KEYWORDS: ऐप को सिखाएं कि कौन सा काम किसका है
    const isElectricalJob = jobService.includes('fan') || jobService.includes('light') || jobService.includes('wire') || jobService.includes('switch') || jobService.includes('ac') || jobService.includes('board') || jobService.includes('inverter');
    
    const isPlumbingJob = jobService.includes('pipe') || jobService.includes('tap') || jobService.includes('water') || jobService.includes('tank') || jobService.includes('sink') || jobService.includes('motor') || jobService.includes('plumbing');

    // MATCH LOGIC
    const isCategoryMatch = (expCat === jobCat) || 
                            jobService.includes(expCat) || 
                            jobCat.includes(expCat) ||
                            (expCat.includes('electric') && isElectricalJob) ||
                            (expCat.includes('plumb') && isPlumbingJob);
    
    return isCategoryMatch;
});

                                        // 3. अगर कोई सही एक्सपर्ट नहीं मिला
                                        if (availableExperts.length === 0) {
                                            return <option value="" disabled className="text-red-400">⚠️ No {job.service_name || 'Matching'} Expert Online</option>;
                                        }

                                        // 4. दूरी नापो और सबसे करीब वाले को सबसे ऊपर रखो
                                        return availableExperts
                                            .map(exp => {
                                                const dist = calculateDistance(job.latitude, job.longitude, exp.latitude, exp.longitude);
                                                // अगर GPS नहीं है तो उसे 999 मानकर सबसे नीचे डाल दो
                                                return { ...exp, dist: dist ? parseFloat(dist) : 999 }; 
                                            })
                                            .sort((a, b) => a.dist - b.dist)
                                            .map(exp => (
                                                <option key={exp.id} value={exp.id} className="bg-slate-900">
                                                    {exp.dist !== 999 ? `🚗 ${exp.dist} KM - ` : '📍 No GPS - '} 
                                                    {exp.name} ({exp.service_category})
                                                </option>
                                            ));
                                    })()}
                                </select>
                              </div>
                          )}

                          {job.expert_id && (
                              <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-4 flex items-center gap-3">
                                  <div className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center font-black shadow-lg">
                                      {job.experts?.name?.[0] || 'E'}
                                  </div>
                                  <div>
                                      <p className="text-[9px] text-teal-500 font-black uppercase tracking-wider">Assigned Force</p>
                                      <p className="text-sm font-bold text-white">{job.experts?.name}</p>
                                      <p className="text-[10px] text-slate-500 flex items-center gap-1"><Phone size={10}/> {job.experts?.phone}</p>
                                  </div>
                              </div>
                          )}

                          {job.status === 'assigned' && (
                              <button onClick={() => handleComplete(job)} className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-900/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                                  <CheckCircle size={18}/> Job Complete
                              </button>
                          )}
                          
                          {job.status !== 'completed' && job.status !== 'cancelled' && (
                              <button onClick={() => {if(window.confirm("Cancel Order?")) supabase.from('bookings').update({status:'cancelled'}).eq('id', job.id).then(fetchData)}} className="w-full text-slate-500 hover:text-red-400 py-2 text-[10px] font-black uppercase tracking-widest transition-all">
                                  <XCircle size={12} className="inline mr-1"/> Cancel Booking
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}