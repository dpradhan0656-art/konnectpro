import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { splitGrossPaymentPaise } from '../../../services/paymentSplitService';
import LedgerView from './LedgerView';
import { RefreshCw, Users, IndianRupee, CalendarDays, Building2 } from 'lucide-react';

function rupeesToPaise(rupees) {
  const n = Number(rupees);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function formatInrFromPaise(paise) {
  const n = Number(paise);
  if (!Number.isFinite(n)) return '₹0.00';
  return `₹${(n / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function startOfLocalDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfLocalMonth(d) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Admin-Drishti: Field Partner dashboard (Bhenaji / operations layer).
 * Metrics = assigned experts + estimated partner 9.5% from completed bookings (gross model).
 */
export default function PartnerDashboard() {
  const [partners, setPartners] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [expertCount, setExpertCount] = useState(0);
  const [todayPartnerPaise, setTodayPartnerPaise] = useState(0);
  const [monthPartnerPaise, setMonthPartnerPaise] = useState(0);
  const [ledgerRows, setLedgerRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedPartner = useMemo(
    () => partners.find((p) => p.id === selectedId) || null,
    [partners, selectedId]
  );

  const loadPartners = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('business_partners')
      .select('id, name, razorpay_account_id, active_status')
      .order('name');
    if (err) throw err;
    setPartners(data || []);
    setSelectedId((prev) => {
      if (prev) return prev;
      if (!data?.length) return '';
      const first = data.find((p) => p.active_status !== false) || data[0];
      return first.id;
    });
  }, []);

  const refreshMetrics = useCallback(async () => {
    if (!selectedId) {
      setExpertCount(0);
      setTodayPartnerPaise(0);
      setMonthPartnerPaise(0);
      setLedgerRows([]);
      return;
    }
    setError('');
    setLedgerLoading(true);
    try {
      const { data: experts, error: eErr } = await supabase
        .from('experts')
        .select('id')
        .eq('assigned_partner_id', selectedId);
      if (eErr) throw eErr;
      const expertIds = (experts || []).map((e) => e.id);
      setExpertCount(expertIds.length);

      if (expertIds.length === 0) {
        setTodayPartnerPaise(0);
        setMonthPartnerPaise(0);
        setLedgerRows([]);
        setLedgerLoading(false);
        return;
      }

      const { data: bookings, error: bErr } = await supabase
        .from('bookings')
        .select('id, total_amount, status, updated_at, service_name, expert_id')
        .in('expert_id', expertIds)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(80);
      if (bErr) throw bErr;

      const list = bookings || [];
      setLedgerRows(list);

      const t0 = startOfLocalDay(new Date());
      const m0 = startOfLocalMonth(new Date());
      let todayP = 0;
      let monthP = 0;
      for (const b of list) {
        const ts = b.updated_at ? new Date(b.updated_at) : null;
        const paise = rupeesToPaise(b.total_amount);
        const split = splitGrossPaymentPaise(paise);
        if (ts && ts >= t0) todayP += split.partnerPaise;
        if (ts && ts >= m0) monthP += split.partnerPaise;
      }
      setTodayPartnerPaise(todayP);
      setMonthPartnerPaise(monthP);
    } catch (e) {
      setError(e?.message || String(e));
      setLedgerRows([]);
    } finally {
      setLedgerLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await loadPartners();
      } catch (e) {
        if (!cancelled) setError(e?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPartners]);

  useEffect(() => {
    if (!selectedId) return;
    refreshMetrics();
  }, [selectedId, refreshMetrics]);

  const onRefresh = () => {
    void loadPartners();
    void refreshMetrics();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <RefreshCw className="animate-spin mb-4" size={32} />
        <p className="text-xs font-bold uppercase tracking-widest">Partner Drishti load ho rahi hai…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-teal-500 mb-1">Admin-Drishti</p>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Field Partner Dashboard</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xl">
            Yahan aapke assigned experts aur unke completed jobs se <span className="text-violet-400 font-bold">9.5% partner cut</span>{' '}
            dikhta hai (gross split model: 81% Expert, 9.5% Kshatryx, 9.5% Partner). Razorpay Route ke baad yahi numbers settlement se match karwa lena.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-700"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-4 py-3 font-bold">
          {error}
          <p className="text-[10px] font-normal text-red-400/80 mt-2">
            Agar business_partners table abhi migrate nahi hui, Supabase par migration 20260412130000_partner_system.sql chalao.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <Building2 className="text-teal-500 shrink-0" size={22} />
          <div className="min-w-0 flex-1">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Partner select karein</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm font-bold outline-none focus:border-teal-500"
            >
              {partners.length === 0 && <option value="">— Pehle partner add karein —</option>}
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.active_status === false ? ' (inactive)' : ''}
                </option>
              ))}
            </select>
            {selectedPartner?.razorpay_account_id && (
              <p className="text-[10px] text-slate-600 mt-1 font-mono truncate">
                Razorpay: {selectedPartner.razorpay_account_id}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <Users className="absolute right-4 top-4 text-slate-800" size={56} />
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Assigned experts</p>
          <p className="text-3xl font-black text-white mt-2">{expertCount}</p>
          <p className="text-xs text-slate-500 mt-1">experts.assigned_partner_id se count</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <IndianRupee className="absolute right-4 top-4 text-teal-900" size={56} />
          <p className="text-[10px] font-black uppercase text-violet-400 tracking-widest">Aaj ka partner cut (9.5%)</p>
          <p className="text-3xl font-black text-violet-300 mt-2">{formatInrFromPaise(todayPartnerPaise)}</p>
          <p className="text-xs text-slate-500 mt-1">Aaj complete hue jobs (local date)</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <CalendarDays className="absolute right-4 top-4 text-slate-800" size={56} />
          <p className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Is mahine partner cut</p>
          <p className="text-3xl font-black text-amber-200 mt-2">{formatInrFromPaise(monthPartnerPaise)}</p>
          <p className="text-xs text-slate-500 mt-1">Month-to-date (browser timezone)</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
          Transparent ledger
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live-style breakdown</span>
        </h3>
        <LedgerView rows={ledgerRows} loading={ledgerLoading} />
      </div>
    </div>
  );
}
