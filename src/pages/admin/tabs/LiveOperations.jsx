import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Activity, Loader2, UserCheck, X, AlertCircle, RefreshCw } from 'lucide-react';
import BookingTimelineModal from '../../../components/admin/BookingTimelineModal';
import { writeAdminAuditLog } from '../../../utils/adminAuditTrail';
import { sendExpertAssignmentPush } from '../../../lib/sendExpertAssignmentPush';

function statusBadgeClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'assigned') return 'bg-blue-600 text-white';
  if (s === 'completed') return 'bg-green-600 text-white';
  if (s === 'pending') return 'bg-amber-500 text-slate-900';
  if (s === 'cancelled') return 'bg-rose-600 text-white';
  return 'bg-slate-700 text-slate-200';
}

function AssignmentModal({
  open,
  booking,
  experts,
  loading,
  assigning,
  onClose,
  onAssign,
}) {
  const [selectedExpertId, setSelectedExpertId] = useState('');

  useEffect(() => {
    if (!open) setSelectedExpertId('');
  }, [open]);

  if (!open || !booking) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white">Assign Expert</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-slate-300 mb-1">
          Booking: <span className="font-bold text-white">{booking.service_name || 'Service'}</span>
        </p>
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">
          City: {booking.city || 'Unknown'}
        </p>

        {loading ? (
          <div className="py-8 flex items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mr-2" size={16} /> Loading experts...
          </div>
        ) : experts.length === 0 ? (
          <div className="py-6 rounded-xl border border-dashed border-slate-700 text-center text-slate-400 text-sm">
            No verified experts found for this city.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {experts.map((expert) => {
              const checked = String(selectedExpertId) === String(expert.id);
              return (
                <button
                  key={expert.id}
                  type="button"
                  onClick={() => setSelectedExpertId(String(expert.id))}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                    checked
                      ? 'border-teal-400 bg-teal-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <p className="font-bold text-white">{expert.name || expert.full_name || 'Unnamed Expert'}</p>
                  <p className="text-xs text-slate-400">
                    {expert.phone || 'No phone'} • {expert.city || 'No city'}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedExpertId || assigning}
            onClick={() => onAssign(selectedExpertId)}
            className="flex-1 min-h-[44px] rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-sm uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {assigning ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LiveOperations() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [experts, setExperts] = useState([]);
  const [expertsLoading, setExpertsLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [timelineBookingId, setTimelineBookingId] = useState(null);

  const fetchBookings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const { data, error: fetchErr } = await supabase
        .from('bookings')
        .select('id, created_at, booking_date, scheduled_time, service_name, city, status, expert_id, customer_name, contact_name, contact_phone, address')
        .order('created_at', { ascending: false });
      if (fetchErr) throw fetchErr;
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.message || String(e);
      setError(msg);
      console.error('[LiveOps] bookings fetch failed:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel('deepakhq-live-ops-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          fetchBookings(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  const openAssignModal = async (booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
    setExperts([]);
    setExpertsLoading(true);
    try {
      let query = supabase
        .from('experts')
        .select('id, name, full_name, phone, city, is_verified')
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      const city = String(booking?.city || '').trim();
      if (city) {
        query = query.ilike('city', city);
      }

      const { data, error: expErr } = await query.limit(50);
      if (expErr) throw expErr;
      setExperts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('[LiveOps] expert list fetch failed:', e);
      setExperts([]);
    } finally {
      setExpertsLoading(false);
    }
  };

  const handleAssign = async (expertId) => {
    if (!selectedBooking?.id || !expertId) return;
    setAssigning(true);
    try {
      const { error: updateErr } = await supabase
        .from('bookings')
        .update({ expert_id: expertId, status: 'assigned' })
        .eq('id', selectedBooking.id);
      if (updateErr) throw updateErr;

      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id ? { ...b, expert_id: expertId, status: 'assigned' } : b
        )
      );
      writeAdminAuditLog({
        action: 'booking.assigned.live_ops',
        entityType: 'booking',
        entityId: selectedBooking.id,
        metadata: { expert_id: expertId, city: selectedBooking.city || null },
      });
      void sendExpertAssignmentPush({ bookingId: selectedBooking.id, expertId });
      setModalOpen(false);
      setSelectedBooking(null);
    } catch (e) {
      console.error('[LiveOps] manual assignment failed:', e);
      alert(`Assignment failed: ${e?.message || String(e)}`);
    } finally {
      setAssigning(false);
    }
  };

  const items = useMemo(() => bookings, [bookings]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Activity className="text-teal-400" /> Live Operations
        </h2>
        <button
          type="button"
          onClick={() => fetchBookings()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold uppercase tracking-widest"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
          <Loader2 className="inline animate-spin mr-2" size={16} /> Loading live operations...
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-rose-200 text-sm">
          <AlertCircle className="inline mr-2" size={16} />
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
          No bookings found.
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((booking) => {
            const customer = booking.customer_name || booking.contact_name || 'Guest Customer';
            return (
              <div
                key={booking.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center gap-5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusBadgeClass(
                        booking.status
                      )}`}
                    >
                      {booking.status || 'unknown'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      #{String(booking.id).slice(0, 8)}
                    </span>
                  </div>
                  <p className="text-white text-lg font-black leading-tight">{booking.service_name || 'Service'}</p>
                  <p className="text-slate-300 text-sm mt-1">{customer}</p>
                  <p className="text-slate-400 text-xs mt-1">{booking.contact_phone || 'No phone'}</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">City</p>
                    <p className="text-slate-200 font-semibold">{booking.city || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Date/Time</p>
                    <p className="text-slate-200 font-semibold">
                      {booking.booking_date || '—'} {booking.scheduled_time ? `• ${booking.scheduled_time}` : ''}
                    </p>
                  </div>
                </div>

                <div className="lg:w-44">
                  {String(booking.status).toLowerCase() === 'pending' ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => openAssignModal(booking)}
                        className="w-full min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <UserCheck size={14} /> Assign Expert
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimelineBookingId(booking.id)}
                        className="w-full min-h-[36px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-[10px] uppercase tracking-widest"
                      >
                        Timeline
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[11px] text-slate-400 text-right">
                        {booking.expert_id ? `Expert #${String(booking.expert_id).slice(0, 8)}` : 'No expert'}
                      </div>
                      <button
                        type="button"
                        onClick={() => setTimelineBookingId(booking.id)}
                        className="w-full min-h-[36px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-[10px] uppercase tracking-widest"
                      >
                        Timeline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AssignmentModal
        open={modalOpen}
        booking={selectedBooking}
        experts={experts}
        loading={expertsLoading}
        assigning={assigning}
        onClose={() => {
          if (assigning) return;
          setModalOpen(false);
          setSelectedBooking(null);
        }}
        onAssign={handleAssign}
      />
      <BookingTimelineModal
        open={Boolean(timelineBookingId)}
        bookingId={timelineBookingId}
        onClose={() => setTimelineBookingId(null)}
      />
    </div>
  );
}
