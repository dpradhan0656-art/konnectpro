import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import {
  CheckCircle,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react';

const formatDate = (value) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const safeErrorMessage = (error, fallback) => {
  const message = String(error?.message || error || '').toLowerCase();
  if (message.includes('not authorized') || message.includes('not authenticated')) {
    return 'Only DeepakHQ admins can perform this action.';
  }
  if (message.includes('not pending verification')) {
    return 'This lead is no longer pending verification.';
  }
  if (message.includes('not found')) {
    return 'Expert lead not found.';
  }
  return fallback;
};

export default function PendingExpertLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionExpertId, setActionExpertId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchPendingLeads = async () => {
    setLoading(true);
    setError('');
    const { data, error: rpcError } = await supabase.rpc('get_pending_expert_leads_for_admin');
    if (rpcError) {
      setLeads([]);
      setError(safeErrorMessage(rpcError, 'Could not load pending expert leads.'));
    } else {
      setLeads(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchPendingLeads();
  }, []);

  const runLeadAction = async (lead, action) => {
    if (!lead?.expert_id || actionExpertId) return;

    const actionLabel = action === 'approve' ? 'approve' : 'reject';
    const confirmed = window.confirm(
      `Confirm ${actionLabel} for ${lead.expert_name || 'this expert lead'}?`
    );
    if (!confirmed) return;

    setActionExpertId(lead.expert_id);
    setMessage('');
    setError('');

    const rpcName =
      action === 'approve' ? 'admin_approve_expert_lead' : 'admin_reject_expert_lead';
    const params =
      action === 'approve'
        ? { target_expert_id: lead.expert_id }
        : { target_expert_id: lead.expert_id, reject_note: null };

    const { data, error: rpcError } = await supabase.rpc(rpcName, params);

    if (rpcError) {
      setError(
        safeErrorMessage(
          rpcError,
          action === 'approve' ? 'Could not approve expert lead.' : 'Could not reject expert lead.'
        )
      );
    } else {
      setMessage(data || (action === 'approve' ? 'Expert lead approved' : 'Expert lead rejected'));
      await fetchPendingLeads();
    }

    setActionExpertId('');
  };

  if (loading) {
    return (
      <div className="text-teal-500 flex justify-center py-20">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-[2rem] border border-teal-500/30 gap-4 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="text-teal-500" /> Pending Expert Leads
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
            Area Head submitted leads for DeepakHQ approval
          </p>
        </div>
        <button
          type="button"
          onClick={fetchPendingLeads}
          disabled={Boolean(actionExpertId)}
          className="text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-60 px-4 py-2.5 rounded-xl text-slate-300 font-bold transition-colors flex items-center gap-2"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-4 py-3 text-sm font-bold">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 text-sm font-bold">
          {error}
        </div>
      )}

      {leads.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-[2rem] border border-slate-800 border-dashed shadow-sm">
          <div className="inline-flex p-4 bg-slate-950 rounded-full mb-4 text-slate-600">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-lg font-black text-white mb-1">All Clear</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            No pending Area Head expert leads.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-widest">
              <tr>
                <th className="text-left px-5 py-4">Name</th>
                <th className="text-left px-5 py-4">Phone</th>
                <th className="text-left px-5 py-4">Category</th>
                <th className="text-left px-5 py-4">City</th>
                <th className="text-left px-5 py-4">Experience</th>
                <th className="text-left px-5 py-4">Submitted By</th>
                <th className="text-left px-5 py-4">Submitted</th>
                <th className="text-left px-5 py-4">Status</th>
                <th className="text-right px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {leads.map((lead) => {
                const busy = actionExpertId === lead.expert_id;
                return (
                  <tr key={lead.expert_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-black text-white">{lead.expert_name || 'Expert'}</div>
                      <div className="text-[10px] text-slate-500 font-bold mt-1">
                        ID: {String(lead.expert_id).slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300 font-bold">
                      {lead.phone_masked || '-'}
                    </td>
                    <td className="px-5 py-4 text-slate-300">{lead.service_category || '-'}</td>
                    <td className="px-5 py-4 text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} className="text-teal-500" />
                        {lead.city || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {Number(lead.experience_years || 0)} yrs
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white font-bold flex items-center gap-1">
                        <UserCheck size={13} className="text-teal-500" />
                        {lead.area_head_name || 'Area Head'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold mt-1">
                        {lead.area_head_assigned_area || 'Assigned area'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{formatDate(lead.submitted_at)}</td>
                    <td className="px-5 py-4">
                      <div className="inline-flex rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                        {lead.lead_status || 'pending_verification'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold mt-2">
                        KYC: {lead.kyc_status || 'pending'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={Boolean(actionExpertId)}
                          onClick={() => runLeadAction(lead, 'approve')}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1"
                        >
                          {busy ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(actionExpertId)}
                          onClick={() => runLeadAction(lead, 'reject')}
                          className="bg-red-600/90 hover:bg-red-500 disabled:opacity-60 text-white px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1"
                        >
                          {busy ? <Loader2 className="animate-spin" size={14} /> : <XCircle size={14} />}
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
