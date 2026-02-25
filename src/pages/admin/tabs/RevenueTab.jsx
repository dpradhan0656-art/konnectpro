import React, { useEffect, useState } from 'react';
import { supabase } from "../../../lib/supabase";
import { IndianRupee, DollarSign, Download, MapPin } from 'lucide-react';

export default function RevenueTab() {
  const [revenue, setRevenue] = useState([]);
  const [stats, setStats] = useState({ totalBusiness: 0, platformEarnings: 0, expertPayouts: 0 });
  const [cityStats, setCityStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
      setLoading(true);
      // ✅ Hybrid Query: Bookings + Expert City Data
      const { data, error } = await supabase
        .from('bookings')
        .select('*, experts(city, name)') 
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if(data) {
          setRevenue(data);

          // 1. Calculate Money Stats (🌟 NEW 80/20 MATH LOGIC)
          const total = data.reduce((acc, curr) => acc + (parseFloat(curr.total_amount) || 0), 0);
          
          // अब हम डायरेक्ट टोटल अमाउंट का 20% और 80% निकाल रहे हैं
          const comm = total * 0.20; 
          const exp = total * 0.80;  
          
          setStats({ totalBusiness: total, platformEarnings: comm, expertPayouts: exp });

          // 2. Calculate City Stats (Hybrid Logic)
          let cityMap = {};
          data.forEach(item => {
              const city = item.experts?.city || "Unknown";
              const amount = parseFloat(item.total_amount) || 0;
              cityMap[city] = (cityMap[city] || 0) + amount;
          });
          setCityStats(cityMap);
      }
      setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <IndianRupee className="text-green-500" /> Revenue & Growth
            </h2>
            <button className="bg-slate-800 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-700 border border-slate-700 transition-colors">
                <Download size={14}/> Download Report
            </button>
        </div>

        {/* --- SECTION 1: BIG NUMBERS (Stats) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Market Business</p>
                <h3 className="text-3xl font-black text-white mt-2">₹{stats.totalBusiness.toLocaleString('en-IN')}</h3>
                <div className="absolute right-0 bottom-0 opacity-10"><DollarSign size={80}/></div>
            </div>
            <div className="bg-teal-900/20 border border-teal-500/30 p-6 rounded-[2rem]">
                <p className="text-teal-400 text-xs font-bold uppercase tracking-widest">Net Profit (Commission)</p>
                {/* Fixed Decimal Display for Profit */}
                <h3 className="text-3xl font-black text-white mt-2">₹{stats.platformEarnings.toLocaleString('en-IN', {maximumFractionDigits: 0})}</h3>
                <p className="text-[10px] text-teal-300/60 mt-2">Your 20% Share</p>
            </div>
            <div className="bg-purple-900/20 border border-purple-500/30 p-6 rounded-[2rem]">
                <p className="text-purple-400 text-xs font-bold uppercase tracking-widest">Expert Payouts</p>
                <h3 className="text-3xl font-black text-white mt-2">₹{stats.expertPayouts.toLocaleString('en-IN', {maximumFractionDigits: 0})}</h3>
                <p className="text-[10px] text-purple-300/60 mt-2">Distributed to Partners (80%)</p>
            </div>
        </div>

        {/* --- SECTION 2: CITY WISE GROWTH --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <MapPin className="text-pink-500" size={18}/> City-wise Performance
                </h3>
                <div className="space-y-4">
                    {Object.keys(cityStats).length > 0 ? Object.entries(cityStats)
                    .sort((a,b) => b[1] - a[1]) // Sorted by highest revenue
                    .map(([city, amount]) => (
                    <div key={city} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3 w-full pr-4">
                            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-400 text-xs shrink-0">
                                {city[0].toUpperCase()}
                            </div>
                            <div className="w-full">
                                <p className="text-slate-200 text-sm font-bold capitalize">{city}</p>
                                <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                                    <div className="h-full bg-pink-500 rounded-full" style={{ width: `${(amount/stats.totalBusiness)*100}%` }}></div>
                                </div>
                            </div>
                        </div>
                        <span className="text-white font-mono font-bold text-sm shrink-0">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                    )) : <p className="text-slate-500 text-xs italic">Waiting for data...</p>}
                </div>
             </div>

             {/* --- SECTION 3: TRANSACTION LEDGER --- */}
             <div className="bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden shadow-xl flex flex-col">
                <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                    <h3 className="font-bold text-white text-sm">Recent Transactions</h3>
                </div>
                <div className="overflow-auto custom-scrollbar flex-1 max-h-[300px]">
                    <table className="w-full text-left text-sm text-slate-300">
                        <tbody className="divide-y divide-slate-800">
                            {revenue.map((item) => {
                                // 🌟 DYNAMIC COMMISSION CALCULATION HERE
                                const itemCommission = (parseFloat(item.total_amount || 0) * 0.20).toFixed(0);
                                const dateStr = item.completed_at ? new Date(item.completed_at).toLocaleDateString() : new Date(item.created_at).toLocaleDateString();

                                return (
                                <tr key={item.id} className="hover:bg-slate-800/50">
                                    <td className="p-4">
                                        <div className="font-bold text-white text-xs">#{item.id.toString().slice(0,6)}</div>
                                        <div className="text-[10px] text-slate-500">{dateStr}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-xs text-white font-bold">{item.experts?.name || 'Unknown Expert'}</div>
                                        <div className="text-[10px] text-slate-500 capitalize">{item.experts?.city || 'Unknown'}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="font-bold text-green-400 text-xs">+ ₹{itemCommission}</div>
                                        <div className="text-[10px] text-slate-500">Comm. (20%)</div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
    </div>
  );
}