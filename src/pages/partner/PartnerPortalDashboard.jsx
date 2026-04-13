import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { splitGrossPaymentPaise } from '../../services/paymentSplitService';
import LedgerView from '../admin/PartnerDashboard/LedgerView';
import { RefreshCw, Users, IndianRupee, CalendarDays, LogOut, Handshake } from 'lucide-react';

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

export default function PartnerPortalDashboard() {
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [gateLoading, setGateLoading] = useState(true);
  const [expertCount, setExpertCount] = useState(0);
  const [todayPartnerPaise, setTodayPartnerPaise] = useState(0);
  const [monthPartnerPaise, setMonthPartnerPaise] = useState(0);
  const [ledgerRows, setLedgerRows] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [error, setError] = useState('');

  const loadGate = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/partner-login', { replace: true });
      return;
    }
    const { data: row, error: err } = await supabase
      .from('business_partners')
      .select('id, name, razorpay_account_id')
      .eq('user_id', user.id)
      .eq('active_status', true)
      .maybeSingle();
    if (err) {
      setError(err.message);
      setPartner(null);
      setGateLoading(false);
      return;
    }
    if (!row) {
      await supabase.auth.signOut();
      navigate('/partner-login', { replace: true });
      return;
    }
    setPartner(row);
    setGateLoading(false);
  }, [navigate]);

  const refreshMetrics = useCallback(async (partnerId) => {
    if (!partnerId) return;
    setError('');
    setLedgerLoading(true);
    try {
      const { data: experts, error: eErr } = await supabase
        .from('experts')
        .select('id')
        .eq('assigned_partner_id', partnerId);
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
  }, []);

  useEffect(() => {
    void loadGate();
  }, [loadGate]);

  useEffect(() => {
    if (!partner?.id) return;
    void refreshMetrics(partner.id);
  }, [partner?.id, refreshMetrics]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/partner-login', { replace: true });
  };

  if (gateLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-500">
        <RefreshCw className="animate-spin mb-4" size={32} />
        <p className="text-xs font-bold uppercase tracking-widest">Portal load ho raha hai…</p>
      </div>
    );
  }

  if (!partner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 px-4 pt-8 md:pt-12 max-w-4xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-violet-500/15 border border-violet-500/30">
            <Handshake className="text-violet-400" size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-1">Bhenaji portal</p>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{partner.name}</h1>
            <p className="text-slate-500 text-sm mt-1">Sirf aapke assigned experts & unke completed jobs</p>
            {partner.razorpay_account_id && (
              <p className="text-[10px] text-slate-600 mt-1 font-mono truncate max-w-xs md:max-w-md">
                Razorpay: {partner.razorpay_account_id}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => refreshMetrics(partner.id)}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-700"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-red-950/50 text-slate-300 px-4 py-3 rounded-xl text-xs font-bold border border-slate-800"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-4 py-3 font-bold mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <Users className="absolute right-4 top-4 text-slate-800" size={56} />
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Assigned experts</p>
          <p className="text-3xl font-black text-white mt-2">{expertCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <IndianRupee className="absolute right-4 top-4 text-violet-900" size={56} />
          <p className="text-[10px] font-black uppercase text-violet-400 tracking-widest">Aaj ka partner cut (9.5%)</p>
          <p className="text-3xl font-black text-violet-300 mt-2">{formatInrFromPaise(todayPartnerPaise)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <CalendarDays className="absolute right-4 top-4 text-slate-800" size={56} />
          <p className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Is mahine partner cut</p>
          <p className="text-3xl font-black text-amber-200 mt-2">{formatInrFromPaise(monthPartnerPaise)}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-black text-white mb-3">Ledger</h2>
        <LedgerView rows={ledgerRows} loading={ledgerLoading} />
      </div>
    </div>
  );
}
