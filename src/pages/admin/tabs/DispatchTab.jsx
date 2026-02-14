import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { MapPin, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function DispatchTab() {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [experts, setExperts] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Data Fetching
  const refreshData = async () => {
    // Sirf 'Pending' bookings lao jisme expert assign nahi hai
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .is('expert_id', null) 
      .order('created_at', { ascending: false });

    // Saare Active Experts lao
    const { data: expertList } = await supabase
      .from('experts')
      .select('*')
      .eq('is_verified', true);

    setPendingJobs(bookings || []);
    setExperts(expertList || []);
  };

  useEffect(() => { refreshData(); }, []);

  // 2. Assign Logic
  const assignExpert = async (expertId) => {
    if (!selectedJob) return;
    if (!window.confirm(`Assign this job to Expert?`)) return;

    setLoading(true);
    const { error } = await supabase
      .from('bookings')
      .update({ expert_id: expertId, status: 'assigned' }) // Status update
      .eq('id', selectedJob.id);

    if (error) {
        alert("Error assigning: " + error.message);
    } else {
        alert("Work Assigned Successfully! 🚀");
        setSelectedJob(null);
        refreshData();
    }
    setLoading(false);
  };

  // Helper: Filter experts based on selected job's city
  const nearbyExperts = selectedJob 
    ? experts.filter(e => e.city?.toLowerCase() === selectedJob.city?.toLowerCase())
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
      
      {/* LEFT: PENDING JOBS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-y-auto">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="text-amber-500"/> Pending Demand ({pendingJobs.length})
        </h3>
        <div className="space-y-3">
            {pendingJobs.map(job => (
                <div 
                    key={job.id} 
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedJob?.id === job.id ? 'bg-teal-900/50 border-teal-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
                >
                    <div className="flex justify-between">
                        <span className="text-teal-400 font-bold text-sm">{job.service_name || 'General Service'}</span>
                        <span className="text-slate-500 text-xs">{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300 text-xs mt-2">
                        <MapPin size={12}/> {job.address || 'Location not provided'}, {job.city}
                    </div>
                    <div className="mt-2 text-xs font-mono text-slate-500">Customer: {job.customer_name || 'Unknown'}</div>
                </div>
            ))}
            {pendingJobs.length === 0 && <p className="text-slate-500 text-center mt-10 text-sm">No pending jobs. All clear! 🎉</p>}
        </div>
      </div>

      {/* MIDDLE: ACTION AREA */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
         {!selectedJob ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                 <MapPin size={48} className="mb-4 opacity-20"/>
                 <p>Select a booking from the left list to assign an expert.</p>
             </div>
         ) : (
             <>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
                    <h2 className="text-xl font-bold text-white mb-1">Assigning for: {selectedJob.service_name}</h2>
                    <p className="text-teal-400 text-sm flex items-center gap-2"><MapPin size={14}/> {selectedJob.address}, {selectedJob.city}</p>
                </div>

                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <UserCheck className="text-green-500"/> Available Experts in {selectedJob.city} ({nearbyExperts.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                    {nearbyExperts.map(exp => (
                        <div key={exp.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center group hover:border-teal-500 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                                    {exp.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{exp.name}</h4>
                                    <p className="text-xs text-slate-400">{exp.service_category}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => assignExpert(exp.id)}
                                disabled={loading}
                                className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg shadow-teal-900/50"
                            >
                                Assign <ArrowRight size={12}/>
                            </button>
                        </div>
                    ))}
                    {nearbyExperts.length === 0 && (
                        <div className="col-span-2 text-center p-6 bg-red-900/10 border border-red-900/50 rounded-xl text-red-400">
                            Warning: No verified experts found in {selectedJob.city} for this job.
                        </div>
                    )}
                </div>
             </>
         )}
      </div>
    </div>
  );
}