import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { CheckCircle2, ClipboardCheck, RefreshCw, ShieldAlert, XCircle } from 'lucide-react';

const STORAGE_KEY = 'kshatr_release_ops_checklist_v1';

const CHECKLIST_GROUPS = [
  {
    id: 'customer',
    title: 'Customer',
    items: [
      { id: 'cust_home', label: 'Home and category browsing works' },
      { id: 'cust_cash', label: 'Cash booking path works end-to-end' },
      { id: 'cust_online', label: 'Online booking path works end-to-end' },
    ],
  },
  {
    id: 'admin',
    title: 'Admin',
    items: [
      { id: 'admin_kyc', label: 'KYC pending requests visible and approvable' },
      { id: 'admin_dispatch', label: 'Dispatch assign/cancel/status actions work' },
      { id: 'admin_live_ops', label: 'Live Ops updates and manual assignment work' },
    ],
  },
  {
    id: 'expert',
    title: 'Expert',
    items: [
      { id: 'expert_login', label: 'Approved expert login works (web/app)' },
      { id: 'expert_wallet', label: 'Wallet recharge + ledger update works' },
      { id: 'expert_payment_fail', label: 'Payment fail/dismiss shows safe errors' },
    ],
  },
  {
    id: 'area_head',
    title: 'Area Head',
    items: [
      { id: 'ah_login', label: 'Area head login and role gate works' },
      { id: 'ah_radar', label: 'Territory radar + earnings cards load' },
    ],
  },
  {
    id: 'build',
    title: 'Build & Release',
    items: [
      { id: 'web_build', label: 'Web build completed' },
      { id: 'apk_debug', label: 'Capacitor debug APK generated' },
      { id: 'expo_doctor', label: 'Expo doctor checks passed' },
    ],
  },
];

function loadChecklistState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export default function ReleaseOpsTab() {
  const [checks, setChecks] = useState(() => loadChecklistState());
  const [envStatus, setEnvStatus] = useState({
    loading: true,
    supabaseUrl: false,
    supabaseAnon: false,
    razorpay: false,
    dbReachable: false,
    activeSession: false,
    sessionEmail: '',
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
  }, [checks]);

  const runEnvDiagnostics = async () => {
    setEnvStatus((s) => ({ ...s, loading: true }));
    const next = {
      loading: true,
      supabaseUrl: Boolean(import.meta.env.VITE_SUPABASE_URL),
      supabaseAnon: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY),
      razorpay: Boolean(import.meta.env.VITE_RAZORPAY_KEY_ID),
      dbReachable: false,
      activeSession: false,
      sessionEmail: '',
    };

    try {
      const { error } = await supabase.from('admin_settings').select('setting_key').limit(1);
      next.dbReachable = !error;
    } catch {
      next.dbReachable = false;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      next.activeSession = Boolean(session);
      next.sessionEmail = session?.user?.email || '';
    } catch {
      next.activeSession = false;
      next.sessionEmail = '';
    }

    next.loading = false;
    setEnvStatus(next);
  };

  useEffect(() => {
    runEnvDiagnostics();
  }, []);

  const allItems = useMemo(
    () => CHECKLIST_GROUPS.flatMap((g) => g.items.map((i) => i.id)),
    []
  );
  const checkedCount = useMemo(
    () => allItems.filter((id) => Boolean(checks[id])).length,
    [allItems, checks]
  );
  const totalCount = allItems.length;
  const percent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const toggleCheck = (id) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetChecklist = () => {
    if (!window.confirm('Reset all release checklist marks?')) return;
    setChecks({});
  };

  const envItems = [
    { key: 'VITE_SUPABASE_URL', ok: envStatus.supabaseUrl },
    { key: 'VITE_SUPABASE_ANON_KEY', ok: envStatus.supabaseAnon },
    { key: 'VITE_RAZORPAY_KEY_ID', ok: envStatus.razorpay },
    { key: 'DB Reachable', ok: envStatus.dbReachable },
    { key: 'Admin Session Active', ok: envStatus.activeSession },
  ];

  return (
    <div className="space-y-6 animate-in fade-in pb-20 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <ClipboardCheck className="text-teal-400" />
              Release Ops
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
              One-place smoke checklist + environment verifier
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Completion
            </p>
            <p className="text-2xl font-black text-teal-400">{percent}%</p>
            <p className="text-xs text-slate-400">{checkedCount}/{totalCount} checks</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">
              Launch Smoke Checklist
            </h3>
            <button
              type="button"
              onClick={resetChecklist}
              className="text-[11px] font-bold text-rose-300 hover:text-rose-200"
            >
              Reset
            </button>
          </div>

          <div className="space-y-5">
            {CHECKLIST_GROUPS.map((group) => (
              <div key={group.id}>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-2">
                  {group.title}
                </p>
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const checked = Boolean(checks[item.id]);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-start gap-3 rounded-xl border px-3 py-3 cursor-pointer transition ${
                          checked
                            ? 'bg-teal-500/10 border-teal-500/30'
                            : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCheck(item.id)}
                          className="mt-0.5"
                        />
                        <span className={`text-sm font-semibold ${checked ? 'text-teal-200' : 'text-slate-200'}`}>
                          {item.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">
                Env Verifier
              </h3>
              <button
                type="button"
                onClick={runEnvDiagnostics}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white"
              >
                <RefreshCw size={12} className={envStatus.loading ? 'animate-spin' : ''} />
                Re-run
              </button>
            </div>

            <div className="space-y-2">
              {envItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                >
                  <p className="text-xs font-bold text-slate-200">{item.key}</p>
                  {item.ok ? (
                    <span className="inline-flex items-center gap-1 text-emerald-300 text-xs font-black">
                      <CheckCircle2 size={14} /> PASS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-300 text-xs font-black">
                      <XCircle size={14} /> FAIL
                    </span>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              Session: {envStatus.activeSession ? envStatus.sessionEmail || 'Authenticated' : 'No active session'}
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-[2rem] p-5">
            <p className="text-[10px] uppercase tracking-widest text-amber-300 font-black mb-2 flex items-center gap-1">
              <ShieldAlert size={12} />
              Operator Note
            </p>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              This tab is additive release guidance. It does not change booking, payment, wallet,
              or assignment business logic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

