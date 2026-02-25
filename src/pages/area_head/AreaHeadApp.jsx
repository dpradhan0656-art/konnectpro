import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, Briefcase, LogOut, Users, Activity, Clock, CheckCircle, Navigation } from 'lucide-react';

export default function AreaHeadApp() {
  const navigate = useNavigate();
  const [manager, setManager] = useState(null);
  const [areaBookings, setAreaBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkManagerProfile(); }, []);

  const checkManagerProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/area-head/login'); return; }

    // 🌟 Fetching from your actual 'area_heads' table
    const { data: managerData } = await supabase.from('area_heads').select('*').eq('user_id', user.id).single();
    if (managerData) {
        setManager(managerData);
        if(managerData.status === 'active') fetchAreaBookings(managerData.id);
    }
    setLoading(false);
  };

  // 1. Fetch Bookings for this Area Head
  const fetchAreaBookings = async (headId) => {
      const { data } = await supabase
          .from('bookings')
          .select('*, experts(name, phone)')
          .eq('area_head_id', headId) // Filters by assigned area head
          .order('created_at', { ascending: false })
          .limit(20);
      if (data) setAreaBookings(data);
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      navigate('/area-head/login'); 
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-teal-500 font-bold uppercase tracking-widest text-xs">Loading Command Center...</div>;

  if (!manager || manager.status !== 'active') {
      return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
             <Shield size={60} className="text-red-500/50 mb-4" />
             <h1 className="text-2xl font-black text-white mb-2">Access Restricted</h1>
             <p className="text-slate-500 text-sm">Your Area Commander profile is pending or inactive.</p>
             <button onClick={handleLogout} className="mt-6 bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl font-bold flex items-center gap-2"><LogOut size={16}/> Return to Login</button>
          </div>
      );
  }

  // Calculate Stats
  const completedJobs = areaBookings.filter(b => b.status === 'completed').length;
  const activeJobs = areaBookings.filter(b => b.status === 'assigned' || b.status === 'pending' || b.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-slate-950 font-sans pb-24 selection:bg-teal-500/30">
       
       {/* 🛡️ KSHATR COMMANDER HEADER */}
       <div className="bg-slate-900 text-white p-6 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden border-b border-slate-800">
           <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
           <div className="flex justify-between items-center relative z-10">
               <div>
                   <p className="text-[10px] text-teal-500 font-black uppercase tracking-widest flex items-center gap-1 mb-1">
                       <Shield size={12}/> Kshatr City Commander
                   </p>
                   <h1 className="text-2xl font-black">{manager.name}</h1>
                   <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-1 bg-slate-800 px-2 py-1 rounded-md uppercase">
                       <MapPin size={10} className="text-teal-500"/> {manager.assigned_area || 'All Areas'}
                   </span>
               </div>
               <button onClick={handleLogout} className="p-3 bg-slate-800 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-colors border border-slate-700">
                   <LogOut size={18}/>
               </button>
           </div>
           
           {/* 💰 PAYOUT / WALLET CARD */}
           <div className="mt-8 bg-gradient-to-br from-teal-900/40 to-slate-900 p-5 rounded-2xl shadow-lg border border-teal-500/20 relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-10"><Briefcase size={80}/></div>
               <div className="flex justify-between items-start relative z-10">
                   <div>
                       <p className="text-[10px] uppercase font-bold text-teal-400 flex items-center gap-1">
                           <Briefcase size={12}/> {manager.employment_type === 'salary' ? 'Monthly Salary' : 'Commission Wallet'}
                       </p>
                       <h2 className="text-3xl font-black mt-1 text-white">
                           {manager.employment_type === 'salary' ? `₹${manager.compensation_value}/mo` : `₹${manager.wallet_balance || 0}`}
                       </h2>
                   </div>
                   <div className="text-right">
                       <span className="bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[9px] font-black px-2 py-1 rounded uppercase">
                           {manager.employment_type === 'salary' ? 'Salaried Employee' : `${manager.compensation_value}% Revenue Cut`}
                       </span>
                   </div>
               </div>
           </div>
       </div>

       <div className="p-4 max-w-xl mx-auto space-y-6 mt-2">
           {/* 📊 QUICK STATS */}
           <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-900 p-4 rounded-2xl shadow-lg border border-slate-800 flex items-center gap-4">
                   <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20"><Activity size={20}/></div>
                   <div>
                       <h3 className="text-2xl font-black text-white">{activeJobs}</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Jobs</p>
                   </div>
               </div>
               <div className="bg-slate-900 p-4 rounded-2xl shadow-lg border border-slate-800 flex items-center gap-4">
                   <div className="p-3 bg-green-500/10 rounded-xl text-green-500 border border-green-500/20"><CheckCircle size={20}/></div>
                   <div>
                       <h3 className="text-2xl font-black text-white">{completedJobs}</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Completed</p>
                   </div>
               </div>
           </div>

           {/* 📋 AREA BOOKINGS RADAR */}
           <div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Navigation size={16} className="text-teal-500"/> Live Radar ({areaBookings.length})
               </h3>
               
               {areaBookings.length === 0 ? (
                   <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-8 text-center shadow-sm">
                       <MapPin size={32} className="mx-auto text-slate-700 mb-2"/>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No territory activity detected.</p>
                   </div>
               ) : (
                   <div className="space-y-4">
                       {areaBookings.map(job => (
                           <div key={job.id} className="bg-slate-900 p-5 rounded-3xl shadow-lg border border-slate-800 relative overflow-hidden">
                               {/* Status Indicators */}
                               {job.status === 'completed' && <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>}
                               {(job.status === 'assigned' || job.status === 'pending') && <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>}
                               {job.status === 'in_progress' && <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>}
                               
                               <div className="flex justify-between items-start mb-3">
                                   <div>
                                       <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                                           job.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                           job.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                                           'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                       }`}>
                                           {job.status.replace('_', ' ')}
                                       </span>
                                       <h4 className="font-bold text-white text-lg mt-2">{job.service_name}</h4>
                                   </div>
                                   <span className="font-black text-teal-400 text-lg">₹{job.total_amount}</span>
                               </div>
                               
                               <div className="text-xs text-slate-400 space-y-2 mt-4 pt-4 border-t border-slate-800">
                                   <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-slate-600 shrink-0"/> {job.address}</p>
                                   <p className="flex items-center gap-2"><Clock size={14} className="text-slate-600 shrink-0"/> {new Date(job.created_at).toLocaleString()}</p>
                                   
                                   {job.experts ? (
                                       <div className="flex justify-between items-center mt-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                           <p className="flex items-center gap-2 text-slate-300 font-bold">
                                               <Users size={14} className="text-teal-500"/> {job.experts.name}
                                           </p>
                                           <a href={`tel:${job.experts.phone}`} className="text-teal-500 bg-teal-500/10 p-1.5 rounded-lg hover:bg-teal-500 hover:text-white transition-colors">
                                               <Phone size={14} />
                                           </a>
                                       </div>
                                   ) : (
                                       <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-2 animate-pulse">Waiting for Expert Assignment...</p>
                                   )}
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