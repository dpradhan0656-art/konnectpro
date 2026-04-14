import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { canAccessDeepakHQ } from '../../../lib/adminAccess';
import { Loader2, Plus, RefreshCw, Shield, Trash2, UserMinus } from 'lucide-react';

const PARTNER_ROLE = 'partner';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export default function AdminsPartnersTab() {
  const [checking, setChecking] = useState(true);
  const [canWrite, setCanWrite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partners, setPartners] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    assigned_area: '',
    role: PARTNER_ROLE,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: partnerRows, error: partnerErr }, { data: adminRows, error: adminErr }] = await Promise.all([
        supabase
          .from('business_partners')
          .select('id, name, email, assigned_area, access_role, active_status, user_id, created_at')
          .order('created_at', { ascending: false }),
        supabase.from('app_admin').select('id, user_id, created_at').order('created_at', { ascending: false }),
      ]);
      if (partnerErr) throw partnerErr;
      if (adminErr) throw adminErr;
      setPartners(partnerRows || []);
      setAdmins(adminRows || []);
    } catch (e) {
      setError(e?.message || String(e));
      setPartners([]);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: userErr } = await supabase.auth.getUser();
        if (userErr || !data?.user) {
          if (!cancelled) setCanWrite(false);
          return;
        }
        const allowed = await canAccessDeepakHQ(data.user);
        if (!cancelled) setCanWrite(Boolean(allowed));
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const sortedPartners = useMemo(
    () =>
      [...partners].sort((a, b) => {
        if (a.active_status === b.active_status) return 0;
        return a.active_status ? -1 : 1;
      }),
    [partners]
  );

  const handleAppoint = async (e) => {
    e.preventDefault();
    if (!canWrite) {
      alert('Only admin-authenticated users can appoint partners.');
      return;
    }
    const email = normalizeEmail(form.email);
    if (!email) {
      alert('Partner email is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim() || email.split('@')[0],
        email,
        assigned_area: form.assigned_area.trim() || null,
        access_role: PARTNER_ROLE,
        active_status: true,
      };
      const { error: upsertErr } = await supabase.from('business_partners').upsert(payload, { onConflict: 'email' });
      if (upsertErr) throw upsertErr;
      setForm({ name: '', email: '', assigned_area: '', role: PARTNER_ROLE });
      await loadData();
      alert('Partner appointed/updated successfully.');
    } catch (e2) {
      alert(e2?.message || String(e2));
    } finally {
      setSaving(false);
    }
  };

  const revokePartner = async (row) => {
    if (!canWrite) {
      alert('Only admin-authenticated users can revoke partners.');
      return;
    }
    if (!window.confirm(`Revoke partner access for ${row.name || row.email || 'this partner'}?`)) return;
    const { error: revokeErr } = await supabase
      .from('business_partners')
      .update({ active_status: false, access_role: PARTNER_ROLE })
      .eq('id', row.id);
    if (revokeErr) {
      alert(revokeErr.message || String(revokeErr));
      return;
    }
    await loadData();
  };

  const deletePartner = async (row) => {
    if (!canWrite) {
      alert('Only admin-authenticated users can delete partners.');
      return;
    }
    if (!window.confirm(`Permanently delete ${row.name || row.email || 'this partner'}?`)) return;
    const { error: delErr } = await supabase.from('business_partners').delete().eq('id', row.id);
    if (delErr) {
      alert(delErr.message || String(delErr));
      return;
    }
    await loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-teal-400">DeepakHQ RBAC</p>
          <h2 className="text-2xl font-black text-white tracking-tight">Admins & Partners</h2>
          <p className="text-slate-500 text-sm mt-2">
            Appoint/revoke partner access for `/partner-dashboard` with strict role gating.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadData()}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-700"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {!checking && !canWrite ? (
        <div className="rounded-2xl border border-red-700/40 bg-red-950/20 p-4 text-xs font-bold text-red-300">
          Write actions are locked: only admin-authenticated users can change partner access.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-700/40 bg-red-950/20 p-4 text-sm text-red-300">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5">
          <h3 className="text-white font-black text-lg mb-4">Appoint Partner</h3>
          <form onSubmit={handleAppoint} className="space-y-3">
            <input
              type="text"
              placeholder="Partner name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
            <input
              type="email"
              required
              placeholder="partner@email.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
            <input
              type="text"
              placeholder="Assigned area (e.g. Jabalpur North)"
              value={form.assigned_area}
              onChange={(e) => setForm((p) => ({ ...p, assigned_area: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            >
              <option value={PARTNER_ROLE}>Partner</option>
            </select>
            <button
              type="submit"
              disabled={saving || !canWrite}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={14} />}
              Appoint / Update Partner
            </button>
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5">
          <h3 className="text-white font-black text-lg mb-4">Super Admin Registry</h3>
          <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
            {admins.map((a) => (
              <div key={String(a.id)} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-bold">Admin UID</p>
                  <p className="text-[11px] text-slate-400 font-mono">{a.user_id}</p>
                </div>
                <Shield size={16} className="text-teal-400" />
              </div>
            ))}
            {!admins.length && <p className="text-slate-500 text-sm">No admin rows found in `app_admin`.</p>}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-950/80 border-b border-slate-800">
            <tr className="text-[10px] uppercase tracking-widest text-slate-500">
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Linked User</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-slate-400" colSpan={7}>
                  Loading partners...
                </td>
              </tr>
            ) : null}
            {!loading &&
              sortedPartners.map((p) => (
                <tr key={p.id} className="border-b border-slate-800/70 text-sm">
                  <td className="px-4 py-3 text-white font-semibold">{p.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{p.email || '—'}</td>
                  <td className="px-4 py-3 text-violet-300 uppercase font-bold">{p.access_role || PARTNER_ROLE}</td>
                  <td className="px-4 py-3 text-slate-300">{p.assigned_area || '—'}</td>
                  <td className="px-4 py-3 text-[11px] font-mono text-slate-500">{p.user_id || 'not linked yet'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        p.active_status
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-700/40'
                          : 'bg-red-500/20 text-red-300 border border-red-700/40'
                      }`}
                    >
                      {p.active_status ? 'active' : 'revoked'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!canWrite}
                        onClick={() => revokePartner(p)}
                        className="px-3 py-2 rounded-lg text-[10px] uppercase tracking-widest font-black bg-amber-600/20 text-amber-200 border border-amber-700/40 disabled:opacity-40"
                      >
                        <UserMinus size={12} className="inline mr-1" />
                        Revoke
                      </button>
                      <button
                        type="button"
                        disabled={!canWrite}
                        onClick={() => deletePartner(p)}
                        className="px-3 py-2 rounded-lg text-[10px] uppercase tracking-widest font-black bg-red-600/20 text-red-200 border border-red-700/40 disabled:opacity-40"
                      >
                        <Trash2 size={12} className="inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && sortedPartners.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={7}>
                  No partner rows found. Appoint one partner to enable portal access.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
