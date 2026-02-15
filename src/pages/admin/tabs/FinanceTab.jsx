import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { DollarSign, TrendingUp, MapPin, PieChart, ArrowUpRight } from 'lucide-react';

export default function FinanceTab() {
  const [financeData, setFinanceData] = useState([]);
  const [cityStats, setCityStats] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    // Bookings se price data aur Experts se city data fetch karna
    const { data, error } = await supabase
      .from('bookings')
      .select('total_price, status, created_at, experts(city)');

    if (data) {
      let total = 0;
      let cityMap = {};

      data.forEach(booking => {
        const price = parseFloat(booking.total_price || 0);
        const city = booking.experts?.city || "Unknown";

        if (booking.status === 'Completed') {
          total += price;
          cityMap[city] = (cityMap[city] || 0) + price;
        }
      });

      setFinanceData(data);
      setTotalRevenue(total);
      setCityStats(cityMap);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* 💰 TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Platform Revenue</p>
            <h3 className="text-4xl font-black text-white">₹{totalRevenue.toLocaleString()}</h3>
            <div className="mt-4 flex items-center gap-2 text-green-400 text-xs font-bold">
              <TrendingUp size={14}/> +12% from last month
            </div>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 text-white/5" size={120} />
        </div>

        <div className="bg-teal-900/20 p-6 rounded-[2rem] border border-teal-900/30 shadow-xl">
          <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-1">Platform Commission (10%)</p>
          <h3 className="text-3xl font-black text-white">₹{(totalRevenue * 0.1).toLocaleString()}</h3>
          <p className="text-slate-500 text-[10px] mt-2 italic">*Based on current business model</p>
        </div>
      </div>

      {/* 🏙️ CITY-WISE REVENUE SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <MapPin className="text-pink-500" size={18}/> City-wise Earnings
          </h3>
          <div className="space-y-4">
            {Object.keys(cityStats).length > 0 ? Object.entries(cityStats).map(([city, amount]) => (
              <div key={city} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-pink-500 group-hover:text-white transition-all">
                    {city[0]}
                  </div>
                  <div>
                    <p className="text-white font-bold">{city}</p>
                    <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-pink-500 rounded-full" 
                        style={{ width: `${(amount/totalRevenue)*100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-lg">₹{amount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">{Math.round((amount/totalRevenue)*100)}% Share</p>
                </div>
              </div>
            )) : <p className="text-slate-500 text-sm italic">No data available for cities.</p>}
          </div>
        </div>

        {/* 📈 GROWTH INSIGHTS */}
        <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 flex flex-col justify-center items-center text-center">
          <PieChart className="text-teal-500 mb-4 opacity-20" size={64} />
          <h4 className="text-white font-bold text-lg mb-2">Expansion Insight</h4>
          <p className="text-slate-400 text-sm px-6">
            Jabalpur is your primary market. 
            <span className="text-teal-400 font-bold ml-1">Strategy:</span> Target 15% growth in nearby cities to balance the revenue.
          </p>
          <button className="mt-6 flex items-center gap-2 text-teal-500 font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all">
             View Detailed Reports <ArrowUpRight size={14}/>
          </button>
        </div>
      </div>

    </div>
  );
}