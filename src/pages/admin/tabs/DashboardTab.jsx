import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Activity, Users, Wallet, Calendar, TrendingUp } from 'lucide-react';

const MONTHLY_BOOKING_TARGET = 50;

export default function DashboardTab() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, experts: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [growthTip, setGrowthTip] = useState('');
  const [growthProgress, setGrowthProgress] = useState(0);
  const [growthLoading, setGrowthLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        const [{ data: bookings }, { count: orderCount }, { count: expertCount }] = await Promise.all([
            supabase.from('bookings').select('id, total_amount, service_name, contact_name').order('created_at', { ascending: false }).limit(50),
            supabase.from('bookings').select('*', { count: 'exact', head: true }),
            supabase.from('experts').select('*', { count: 'exact', head: true })
        ]);
        if (bookings) {
            const totalRev = bookings.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
            setStats({ orders: orderCount ?? 0, revenue: totalRev, experts: expertCount ?? 0 });
            setRecentBookings(bookings.slice(0, 5));
        }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchGrowthData = async () => {
      setGrowthLoading(true);
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const iso30 = thirtyDaysAgo.toISOString();

        const { data: recentData, error } = await supabase
          .from('bookings')
          .select('service_name, city, created_at')
          .gte('created_at', iso30)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Dashboard growth data error:', error);
          setGrowthTip('डैशबोर्ड पर नज़र रखें। नए Experts जोड़ने के लिए \'Expert Control\' टैब का उपयोग करें।');
          setGrowthProgress(0);
          return;
        }

        const list = recentData || [];
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const bookingsThisMonth = list.filter((b) => {
          const d = new Date(b.created_at);
          return d >= startOfMonth && d <= endOfMonth;
        }).length;
        const progress = Math.min(100, Math.round((bookingsThisMonth / MONTHLY_BOOKING_TARGET) * 100));
        setGrowthProgress(progress);

        if (list.length === 0) {
          setGrowthTip('अभी तक बुकिंग नहीं है। नए Experts और सर्विसेज़ जोड़ने के लिए \'Expert Control\' और \'Rate List\' टैब का उपयोग करें।');
          return;
        }

        const keyCount = {};
        list.forEach((b) => {
          const city = (b.city || 'Jabalpur').trim() || 'Jabalpur';
          const service = (b.service_name || 'Service').trim() || 'Service';
          const key = `${city}|${service}`;
          keyCount[key] = (keyCount[key] || 0) + 1;
        });
        const topKey = Object.entries(keyCount).sort((a, b) => b[1] - a[1])[0]?.[0];
        const [city, service] = topKey ? topKey.split('|') : ['Jabalpur', 'Service'];
        const tip = `${city} में ${service} की मांग बढ़ रही है। नए Experts को जोड़ने के लिए 'Expert Control' टैब का उपयोग करें।`;
        setGrowthTip(tip);
      } catch (e) {
        console.warn('Dashboard growth exception:', e);
        setGrowthTip('डैशबोर्ड पर नज़र रखें। नए Experts जोड़ने के लिए \'Expert Control\' टैब का उपयोग करें।');
        setGrowthProgress(0);
      } finally {
        setGrowthLoading(false);
      }
    };
    fetchGrowthData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-teal-500"/> Live Operations
        </h2>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Orders" value={stats.orders} icon={<Calendar/>} color="blue" />
            <StatCard title="Total Revenue" value={`₹${stats.revenue}`} icon={<Wallet/>} color="green" />
            <StatCard title="Active Experts" value={stats.experts} icon={<Users/>} color="purple" />
            <StatCard title="System Status" value="Online" icon={<Activity/>} color="teal" />
        </div>

        {/* RECENT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider">Recent Bookings</h3>
                    <span className="text-[10px] bg-green-900 text-green-400 px-2 py-1 rounded border border-green-500/20 animate-pulse">LIVE</span>
                </div>
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900 text-xs uppercase text-slate-500">
                        <tr><th className="p-4">Customer</th><th className="p-4">Service</th><th className="p-4 text-right">Price</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {recentBookings.length > 0 ? recentBookings.map(b => (
                            <tr key={b.id} className="hover:bg-slate-700/50">
                                <td className="p-4 font-bold text-white">{b.contact_name || 'Guest'}</td>
                                <td className="p-4">{b.service_name}</td>
                                <td className="p-4 text-right font-mono text-teal-400">₹{b.total_amount ?? '—'}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3" className="p-8 text-center text-slate-500">No bookings yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Quick Actions / Notices — dynamic from last 30 days + monthly target */}
            <div className="bg-gradient-to-br from-teal-900 to-slate-900 p-6 rounded-2xl border border-teal-500/30">
                <h3 className="font-bold text-white mb-2 flex items-center gap-2"><TrendingUp/> Growth Tip</h3>
                {growthLoading ? (
                  <p className="text-sm text-teal-100/80 leading-relaxed mb-4 animate-pulse">Loading tip...</p>
                ) : (
                  <p className="text-sm text-teal-100/80 leading-relaxed mb-4">
                    {growthTip}
                  </p>
                )}
                <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-400 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(100, growthProgress)}%` }}
                    />
                </div>
                <p className="text-[10px] text-teal-300 mt-2 text-right">
                  Target: {growthProgress}% Achieved (monthly goal: {MONTHLY_BOOKING_TARGET} bookings)
                </p>
            </div>
        </div>
    </div>
  );
}

// Simple Card Component
const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-slate-800 p-5 rounded-2xl border-b-4 border-${color}-500 shadow-lg hover:translate-y-[-2px] transition-transform`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-black text-white mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-slate-700/50 text-${color}-400`}>{icon}</div>
        </div>
    </div>
);