import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { MapPin, Navigation, User, CheckCircle, AlertTriangle, Zap, Search } from 'lucide-react';

export default function DispatchTab() {
  const [bookings, setBookings] = useState([]);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState(null); // Track which job is being processed

  // --- 1. Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    // Pending bookings fetch karein
    const { data: bData } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'pending') // Sirf pending kaam dikhayenge
      .order('created_at', { ascending: false });

    // Online Experts fetch karein
    const { data: eData } = await supabase
      .from('experts')
      .select('*')
      .eq('is_online', true) // Sirf jo duty par hain
      .eq('is_verified', true);

    if (bData) setBookings(bData);
    if (eData) setExperts(eData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. Distance Calculator (Haversine Formula) ---
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // --- 3. AUTO DISPATCH LOGIC (The Brain) 🧠 ---
  const handleAutoDispatch = async (booking) => {
    setAssigningId(booking.id);
    
    // Check if Booking has GPS
    if (!booking.customer_lat || !booking.customer_lng) {
      alert("⚠️ Customer GPS missing! Please assign manually.");
      setAssigningId(null);
      return;
    }

    // Step A: Calculate distances for ALL experts
    const expertsWithDist = experts.map(exp => {
      const dist = getDistance(booking.customer_lat, booking.customer_lng, exp.lat, exp.lng);
      return { ...exp, distance: dist };
    });

    // Step B: Sort by nearest first
    expertsWithDist.sort((a, b) => a.distance - b.distance);

    // Step C: Filter logic (2km -> 16km)
    let selectedExpert = null;

    // 1. Try finding within 2km
    const nearby = expertsWithDist.find(e => e.distance <= 2 && e.service_category === booking.service_name.split(' ')[0]); // Match category logic needs refinement based on your category names
    
    if (nearby) {
      selectedExpert = nearby;
      console.log("Found in 2km radius:", nearby.name);
    } else {
      // 2. Try finding within 16km
      const cityLimit = expertsWithDist.find(e => e.distance <= 16 && e.service_category === booking.service_name.split(' ')[0]);
      if (cityLimit) {
        selectedExpert = cityLimit;
        console.log("Found in 16km radius:", cityLimit.name);
      }
    }

    // Step D: Assign or Fail
    if (selectedExpert) {
      // ASSIGN JOB
      const { error } = await supabase
        .from('bookings')
        .update({ 
            status: 'assigned', 
            expert_id: selectedExpert.id,
            expert_name: selectedExpert.name,
            expert_phone: selectedExpert.phone
        })
        .eq('id', booking.id);

      if (!error) {
        alert(`✅ Job Assigned to ${selectedExpert.name} (${selectedExpert.distance.toFixed(1)} km away)`);
        fetchData();
      }
    } else {
      // NO EXPERT FOUND
      alert("❌ No Expert found within 16km range! Sending apology to customer...");
      // Optional: Update status to 'unassigned' or send SMS logic here
    }
    setAssigningId(null);
  };

  // --- 4. MANUAL ASSIGN ---
  const handleManualAssign = async (bookingId, expertId) => {
    if(!expertId) return;
    if(!confirm("Confirm manual assignment?")) return;
    
    const expert = experts.find(e => e.id === parseInt(expertId));
    
    await supabase.from('bookings').update({ 
        status: 'assigned', 
        expert_id: expert.id,
        expert_name: expert.name,
        expert_phone: expert.phone
    }).eq('id', bookingId);
    
    alert("✅ Manually Assigned!");
    fetchData();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Zap className="text-yellow-500" /> Dispatch Command Center
            </h2>
            <p className="text-slate-400 text-xs">Auto-assign jobs based on GPS location (2km - 16km radius).</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-full text-xs font-bold text-green-400 border border-green-500/30">
            {experts.length} Experts Online 🟢
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bookings.length === 0 ? (
            <div className="p-10 text-center text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
                No pending bookings. System idle.
            </div>
        ) : (
            bookings.map(book => (
                <div key={book.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between gap-6">
                    
                    {/* Job Details */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Pending</span>
                            <h3 className="text-lg font-bold text-white">{book.service_name}</h3>
                        </div>
                        <p className="text-slate-400 text-sm flex items-center gap-2 mb-1">
                            <User size={14}/> {book.customer_name}
                        </p>
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                            <MapPin size={14} className="text-red-500"/> {book.address}
                        </p>
                        {!book.customer_lat && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertTriangle size={10}/> GPS Missing</p>}
                    </div>

                    {/* Action Center */}
                    <div className="flex-1 flex flex-col gap-3 justify-center border-l border-slate-800 pl-0 md:pl-6">
                        
                        {/* Auto Button */}
                        <button 
                            onClick={() => handleAutoDispatch(book)}
                            disabled={assigningId === book.id}
                            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-3 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-900/20"
                        >
                            {assigningId === book.id ? 'Scanning Radar...' : <><Zap size={18}/> Auto Dispatch (GPS)</>}
                        </button>

                        {/* Manual Dropdown */}
                        <div className="flex gap-2">
                            <select 
                                className="flex-1 bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg p-2 outline-none"
                                onChange={(e) => handleManualAssign(book.id, e.target.value)}
                            >
                                <option value="">Select Manually...</option>
                                {experts.map(exp => (
                                    <option key={exp.id} value={exp.id}>
                                        {exp.name} ({exp.service_category}) - {exp.is_online ? '🟢' : '🔴'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                </div>
            ))
        )}
      </div>
    </div>
  );
}