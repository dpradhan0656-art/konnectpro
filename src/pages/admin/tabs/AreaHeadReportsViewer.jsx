import React, { useEffect, useState } from 'react';
import { CalendarDays, ClipboardCheck, Loader2, RefreshCw } from 'lucide-react';
import { fetchAreaHeadDailyReports } from '../services/areaHeadReportsService';

const formatDate = (value) => {
  if (!value) return '-';
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const safeErrorMessage = (error) => {
  const message = String(error?.message || error || '').toLowerCase();
  if (message.includes('not authorized') || message.includes('not authenticated')) {
    return 'Only DeepakHQ admins can view Area Head daily reports.';
  }
  return 'Could not load Area Head daily reports.';
};

export default function AreaHeadReportsViewer() {
  const [reports, setReports] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = async (date = filterDate) => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchAreaHeadDailyReports(date);
      setReports(rows);
    } catch (err) {
      setReports([]);
      setError(safeErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports('');
    // Initial load only. Filter changes are applied by the button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-[2rem] border border-teal-500/30 gap-4 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ClipboardCheck className="text-teal-500" /> Area Head Daily Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
            Field activity reports submitted from the Area Head app
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadReports(filterDate)}
          disabled={loading}
          className="text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-60 px-4 py-2.5 rounded-xl text-slate-300 font-bold transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex flex-col md:flex-row gap-3 md:items-end">
        <label className="flex-1">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 flex items-center gap-2 mb-2">
            <CalendarDays size={13} /> Filter Date
          </span>
          <input
            type="date"
            value={filterDate}
            onChange={(event) => setFilterDate(event.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500/60"
          />
        </label>
        <button
          type="button"
          onClick={() => loadReports(filterDate)}
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={() => {
            setFilterDate('');
            void loadReports('');
          }}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-200 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest"
        >
          Last 30 Days
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 text-sm font-bold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-teal-500 flex justify-center py-20">
          <Loader2 className="animate-spin" size={40} />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-[2rem] border border-slate-800 border-dashed shadow-sm">
          <div className="inline-flex p-4 bg-slate-950 rounded-full mb-4 text-slate-600">
            <ClipboardCheck size={32} />
          </div>
          <h3 className="text-lg font-black text-white mb-1">No Reports Found</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            Area Head daily reports will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-widest">
              <tr>
                <th className="text-left px-5 py-4">Area Head</th>
                <th className="text-left px-5 py-4">Date</th>
                <th className="text-left px-5 py-4">Experts Contacted</th>
                <th className="text-left px-5 py-4">Onboarded</th>
                <th className="text-left px-5 py-4">Shops</th>
                <th className="text-left px-5 py-4">Jobs</th>
                <th className="text-left px-5 py-4">Complaints</th>
                <th className="text-left px-5 py-4">Hardware Shop</th>
                <th className="text-left px-5 py-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {reports.map((report) => (
                <tr key={report.report_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-black text-white">{report.area_head_name || 'Area Head'}</div>
                    <div className="text-[10px] text-slate-500 font-bold mt-1">
                      {report.assigned_area || 'Assigned area'}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-300 font-bold">
                    {formatDate(report.report_date)}
                  </td>
                  <td className="px-5 py-4 text-slate-300">{report.experts_contacted ?? 0}</td>
                  <td className="px-5 py-4 text-slate-300">{report.experts_onboarded ?? 0}</td>
                  <td className="px-5 py-4 text-slate-300">{report.shops_visited ?? 0}</td>
                  <td className="px-5 py-4 text-slate-300">{report.jobs_followed_up ?? 0}</td>
                  <td className="px-5 py-4 text-slate-300">{report.complaints_handled ?? 0}</td>
                  <td className="px-5 py-4 text-slate-300">
                    <div>{report.hardware_shop_name || '-'}</div>
                    {report.shop_area && (
                      <div className="text-[10px] text-slate-500 font-bold mt-1">{report.shop_area}</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-400 max-w-[320px]">
                    <div className="line-clamp-3">{report.field_notes || '-'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
