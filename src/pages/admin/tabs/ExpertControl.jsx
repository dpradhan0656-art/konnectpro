import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Check, X, Search, Shield, MapPin, Phone } from 'lucide-react';

export default function ExpertControl() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Experts
  const fetchExperts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('experts')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) console.error('Error fetching experts:', error);
    else setExperts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchExperts(); }, []);

  // 2. Actions (Verify / Reject)
  const handleStatusUpdate = async (id, status, currentVerifyStatus) => {
    // Optimistic UI Update (Turant screen par change dikhane ke liye)
    setExperts(experts.map(e => e.id === id ? { ...e, is_verified: status } : e));

    const { error } = await supabase
      .from('experts')
      .update({ is_verified: status })
      .eq('id', id);

    if (error) {
        alert("Update failed!");
        fetchExperts(); // Revert on error
    }
  };

  // 3. Filter Logic
  const filteredExperts = experts.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-teal-500" /> Expert Verification
        </h2>
        <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input 
                type="text" 
                placeholder="Search Name or City..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:border-teal-500 outline-none w-64"
            />
        </div>
      </div>

      {/* EXPERT LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExperts.map((expert) => (
            <div key={expert.id} className={`p-5 rounded-xl border transition-all ${expert.is_verified ? 'bg-slate-800 border-teal-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-xl font-bold text-slate-300">
                            {expert.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">{expert.name}</h3>
                            <p className="text-xs text-teal-400 font-bold uppercase tracking-wider">{expert.service_category}</p>
                        </div>
                    </div>
                    {expert.is_verified ? (
                        <span className="bg-teal-900/50 text-teal-400 text-[10px] px-2 py-1 rounded border border-teal-500/30 font-bold uppercase">Verified</span>
                    ) : (
                        <span className="bg-amber-900/50 text-amber-400 text-[10px] px-2 py-1 rounded border border-amber-500/30 font-bold uppercase animate-pulse">Pending</span>
                    )}
                </div>

                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPin size={14} className="text-slate-500"/> {expert.city}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Phone size={14} className="text-slate-500"/> {expert.mobile}
                    </div>
                </div>

                <div className="flex gap-2">
                    {!expert.is_verified ? (
                        <button 
                            onClick={() => handleStatusUpdate(expert.id, true)}
                            className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Check size={14} /> APPROVE
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleStatusUpdate(expert.id, false)}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <X size={14} /> REVOKE
                        </button>
                    )}
                    <button className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg">
                        <Phone size={14} />
                    </button>
                </div>
            </div>
        ))}

        {filteredExperts.length === 0 && !loading && (
            <div className="col-span-full text-center py-10 text-slate-500">
                No experts found. Add them directly via Database for now.
            </div>
        )}
      </div>
    </div>
  );
}