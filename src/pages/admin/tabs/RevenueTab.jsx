import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { IndianRupee, PieChart, TrendingUp, Download } from 'lucide-react';

export default function RevenueTab() {
  const [revenue, setRevenue] = useState([]);
  const [stats, setStats] = useState({ totalBusiness: 0, platformEarnings: 0, expertPayouts: 0 });

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
      // Sirf Completed jobs ka hisab layenge
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if(data) {
          setRevenue(data);
          // Calculate Totals
          const total = data.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
          const comm = data.reduce((acc, curr) => acc + (curr.commission_amount || 0), 0);
          const exp = data.reduce((acc, curr) => acc + (curr.expert_earning || 0), 0);
          setStats({ totalBusiness: total, platformEarnings: comm, expertPayouts: exp });
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <IndianRupee className="text-green-500" /> Revenue & Transparency
            </h2>
            <button className="bg-slate-800 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-700">
                <Download size={14}/> Download Report
            </button>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl">
                <p className="text-blue-400 text-xs font-bold uppercase">Total Market Business</p>
                <h3 className="text-3xl font-black text-white mt-1">₹{stats.totalBusiness}</h3>
                <p className="text-[10px] text-slate-400 mt-2">Total cash flow in market</p>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-2xl">
                <p className="text-green-400 text-xs font-bold uppercase">DeepakHQ Net Profit</p>
                <h3 className="text-3xl font-black text-white mt-1">₹{stats.platformEarnings}</h3>
                <p className="text-[10px] text-slate-400 mt-2">20% Commission Earnings</p>
            </div>
            <div className="bg-purple-900/20 border border-purple-500/30 p-6 rounded-2xl">
                <p className="text-purple-400 text-xs font-bold uppercase">Expert Earnings</p>
                <h3 className="text-3xl font-black text-white mt-1">₹{stats.expertPayouts}</h3>
                <p className="text-[10px] text-slate-400 mt-2">80% distributed to partners</p>
            </div>
        </div>

        {/* --- DETAILED TABLE --- */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                <h3 className="font-bold text-white text-sm">Transaction Ledger</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-500">
                        <tr>
                            <th className="p-4">Date & ID</th>
                            <th className="p-4">Expert Name</th>
                            <th className="p-4 text-right">Total Bill</th>
                            <th className="p-4 text-right text-green-400">Commission (20%)</th>
                            <th className="p-4 text-right text-purple-400">Expert Share (80%)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {revenue.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/50">
                                <td className="p-4">
                                    <div className="font-bold text-white">#{item.id}</div>
                                    <div className="text-[10px] text-slate-500">{new Date(item.completed_at).toLocaleDateString()}</div>
                                </td>
                                <td className="p-4 text-slate-300">{item.expert_name}</td>
                                <td className="p-4 text-right font-bold text-white">₹{item.total_amount}</td>
                                <td className="p-4 text-right font-mono text-green-400">+ ₹{item.commission_amount}</td>
                                <td className="p-4 text-right font-mono text-purple-400">₹{item.expert_earning}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}