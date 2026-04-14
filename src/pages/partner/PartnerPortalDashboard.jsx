import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { splitGrossPaymentPaise } from '../../services/paymentSplitService';
import LedgerView from '../admin/PartnerDashboard/LedgerView';
import { RefreshCw, Users, IndianRupee, CalendarDays, LogOut, Handshake, ShieldCheck } from 'lucide-react';

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
  const [expertRows, setExpertRows] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [kycSavingId, setKycSavingId] = useState(null);
  const [error, setError] = useState('');

  const loadGate = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate('/partner-login', { replace: true });
      return;
    }
    const email = String(user.email || '').trim().toLowerCase();
    const { data: row, error: err } = await supabase
      .from('business_partners')
      .select('id, name, razorpay_account_id, assigned_area, access_role, user_id')
      .or(`user_id.eq.${user.id},email.eq.${email}`)
      .eq('access_role', 'partner')
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
    if (!row.user_id) {
      await supabase.from('business_partners').update({ user_id: user.id }).eq('id', row.id);
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
        .select('id, name, city, category, kyc_status, average_rating, is_online')
        .eq('assigned_partner_id', partnerId);
      if (eErr) throw eErr;
      const scopedExperts = experts || [];
      const expertIds = scopedExperts.map((e) => e.id);
      setExpertCount(expertIds.length);
      setExpertRows(scopedExperts);

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

  useEffect(() => {
    if (!partner?.id) return undefined;
    const channel = supabase
      .channel(`partner-access-${partner.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'business_partners', filter: `id=eq.${partner.id}` },
        async (payload) => {
          const next = payload?.new;
          if (!next || next.active_status !== true || String(next.access_role || '') !== 'partner') {
            await supabase.auth.signOut();
            navigate('/partner-login', { replace: true });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, partner?.id]);

  const updateExpertKyc = async (expertId, nextStatus) => {
    if (!partner?.id) return;
    setKycSavingId(expertId);
    try {
      const { error: upErr } = await supabase
        .from('experts')
        .update({ kyc_status: nextStatus })
        .eq('id', expertId)
        .eq('assigned_partner_id', partner.id);
      if (upErr) throw upErr;
      setExpertRows((prev) =>
        prev.map((x) => (String(x.id) === String(expertId) ? { ...x, kyc_status: nextStatus } : x))
      );
    } catch (e) {
      alert(e?.message || String(e));
    } finally {
      setKycSavingId(null);
    }
  };

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
            {partner.assigned_area ? (
              <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-1">
                Area Scope: {partner.assigned_area}
              </p>
            ) : null}
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

      <div className="mt-10">
        <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          Expert Overview & KYC Review
        </h2>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead className="bg-slate-950/80 border-b border-slate-800">
              <tr className="text-[10px] uppercase tracking-widest text-slate-500">
                <th className="px-4 py-3">Expert</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">KYC Review</th>
              </tr>
            </thead>
            <tbody>
              {expertRows.map((exp) => (
                <tr key={String(exp.id)} className="border-b border-slate-800/70 text-sm">
                  <td className="px-4 py-3 text-white font-semibold">{exp.name || 'Expert'}</td>
                  <td className="px-4 py-3 text-slate-300">{exp.city || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{exp.category || '—'}</td>
                  <td className="px-4 py-3 text-amber-300 font-semibold">{Number(exp.average_rating || 0).toFixed(1)}</td>
                  <td className="px-4 py-3 text-slate-300">{exp.is_online ? 'Online' : 'Offline'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={String(exp.kyc_status || 'pending').toLowerCase()}
                      disabled={kycSavingId === exp.id}
                      onChange={(e) => updateExpertKyc(exp.id, e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-bold text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
              {expertRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={6}>
                    No experts assigned to your partner scope.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
