import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Users, RefreshCw } from 'lucide-react';

/**
 * Experts onboarded by this area commander (experts.area_head_id = area_heads.id).
 * Uses `experts` table — not `profiles` (catalog/auth profile is separate).
 */
export default function MyExpertsList({ managerId, refreshKey = 0 }) {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyExperts = useCallback(async () => {
    if (!managerId) {
      setExperts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: qErr } = await supabase
        .from('experts')
        .select('id, name, phone, email, service_category, status, created_at')
        .eq('area_head_id', managerId)
        .order('created_at', { ascending: false });

      if (qErr) throw qErr;
      setExperts(data || []);
    } catch (err) {
      console.error('[MyExpertsList]', err);
      setError(err.message || 'Could not load experts.');
      setExperts([]);
    } finally {
      setLoading(false);
    }
  }, [managerId]);

  useEffect(() => {
    fetchMyExperts();
  }, [fetchMyExperts, refreshKey]);

  const formatJoined = (row) => {
    const raw = row.created_at;
    if (!raw) return '—';
    try {
      return new Date(raw).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Users size={16} className="text-teal-500" />
          My Experts ({experts.length})
        </h3>
        <button
          type="button"
          onClick={fetchMyExperts}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 font-semibold mb-3">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <Loader2 size={18} className="animate-spin text-teal-500" />
          Loading your experts…
        </div>
      ) : experts.length === 0 ? (
        <p className="text-xs text-slate-500 font-semibold text-center py-6 border border-dashed border-slate-800 rounded-xl">
          No experts onboarded yet. Use the form above to add a Karigar.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th className="p-3 pl-4">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {experts.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-950/50">
                  <td className="p-3 pl-4 font-bold text-white">{ex.name || '—'}</td>
                  <td className="p-3">{ex.phone || '—'}</td>
                  <td className="p-3 text-xs">{ex.service_category || '—'}</td>
                  <td className="p-3">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-teal-400">
                      {ex.status || 'pending'}
                    </span>
                  </td>
                  <td className="p-3 pr-4 text-xs text-slate-400">{formatJoined(ex)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
