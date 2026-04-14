import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../lib/supabase';
import { computeKshatryxSplit } from '../utils/paymentSplitMath';
import { formatInr } from '../utils/formatInr';
import { ACCENT, BG, BORDER, CARD, TEXT, TEXT_MUTED } from '../components/dashboard/theme';

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function showFeedback(message, type = 'info') {
  if (!message) return;
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }
  Alert.alert(type === 'error' ? 'Error' : 'My Jobs', message);
}

function resolveBookingAmount(job) {
  const finalAmount = Number(job?.final_amount);
  if (Number.isFinite(finalAmount) && finalAmount > 0) return finalAmount;
  const total = Number(job?.total_amount);
  if (Number.isFinite(total) && total > 0) return total;
  const fallback = Number(job?.amount);
  if (Number.isFinite(fallback) && fallback > 0) return fallback;
  return 0;
}

/** @param {{ expert: { id?: string | number | null } | null }} props */
export default function MyJobsScreen({ expert }) {
  const expertId = expert?.id ?? null;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);

  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [finalAmountInput, setFinalAmountInput] = useState('');
  const [completing, setCompleting] = useState(false);

  const stats = useMemo(() => {
    const active = jobs.filter((j) => !['completed', 'cancelled'].includes(String(j.status || '').toLowerCase()));
    const done = jobs.filter((j) => ['completed', 'cancelled'].includes(String(j.status || '').toLowerCase()));
    return { active: active.length, done: done.length, total: jobs.length };
  }, [jobs]);

  const splitPreview = useMemo(() => {
    if (!selectedJob) return null;
    const amount = Number(finalAmountInput);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return computeKshatryxSplit({ ...selectedJob, final_amount: amount, total_amount: amount });
  }, [selectedJob, finalAmountInput]);

  const load = async () => {
    if (!expertId) {
      setJobs([]);
      setError(null);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const { data, error: jobsErr } = await supabase
        .from('bookings')
        .select('*')
        .eq('expert_id', expertId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (jobsErr) throw jobsErr;
      setJobs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expertId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openCompletionModal = (job) => {
    const baseAmount = resolveBookingAmount(job);
    setSelectedJob(job);
    setFinalAmountInput(baseAmount > 0 ? String(Math.round(baseAmount)) : '');
    setCompletionModalOpen(true);
  };

  const closeCompletionModal = () => {
    if (completing) return;
    setCompletionModalOpen(false);
    setSelectedJob(null);
    setFinalAmountInput('');
  };

  const completeJobWithFinalAmount = async () => {
    if (!selectedJob || !expertId || completing) return;

    const finalAmount = Number(finalAmountInput);
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      showFeedback('Please enter a valid final bill amount.', 'error');
      return;
    }

    const split = computeKshatryxSplit({ ...selectedJob, final_amount: finalAmount, total_amount: finalAmount });
    setCompleting(true);

    try {
      const { data: expertRow, error: expertErr } = await supabase
        .from('experts')
        .select('wallet_balance')
        .eq('id', expertId)
        .maybeSingle();
      if (expertErr) throw expertErr;

      const currentWallet = Number(expertRow?.wallet_balance || 0);
      const nextWallet = currentWallet - Number(split.kshatryxShare || 0);

      const { error: bookingErr } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          final_amount: finalAmount,
          total_amount: finalAmount,
          expert_payout: split.expertShare,
        })
        .eq('id', selectedJob.id)
        .eq('expert_id', expertId);

      if (bookingErr) {
        if (String(bookingErr.message || '').toLowerCase().includes('final_amount')) {
          throw new Error(
            '`final_amount` column is missing in `bookings`. Please run the provided Supabase migration, then retry.'
          );
        }
        throw bookingErr;
      }

      const { error: walletErr } = await supabase
        .from('experts')
        .update({ wallet_balance: nextWallet })
        .eq('id', expertId);
      if (walletErr) throw walletErr;

      const { error: txErr } = await supabase.from('wallet_transactions').insert({
        user_id: expertId,
        user_type: 'expert',
        amount: split.kshatryxShare,
        transaction_type: 'debit',
        reason: 'platform_commission',
        description: `Commission debit for booking ${selectedJob.id} (final bill ${formatInr(finalAmount)})`,
      });

      if (txErr) {
        // Non-blocking: job + wallet are already updated.
        showFeedback('Job completed, wallet updated. Transaction log insert failed; admin can reconcile.', 'error');
      } else {
        showFeedback(
          `Job completed. Kshatryx commission ${formatInr(split.kshatryxShare)} debited. Wallet can go negative if required.`
        );
      }

      closeCompletionModal();
      setLoading(true);
      await load();
    } catch (e) {
      showFeedback(e?.message || String(e), 'error');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ACCENT]} tintColor={ACCENT} />}
      >
        <Text style={styles.title}>My Jobs</Text>
        <Text style={styles.sub}>Complete booking history with final bill amount update before closure.</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statValue}>{stats.total}</Text><Text style={styles.statLabel}>Total</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>{stats.active}</Text><Text style={styles.statLabel}>Active</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>{stats.done}</Text><Text style={styles.statLabel}>Completed/Cancelled</Text></View>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator color={ACCENT} /></View>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !jobs.length ? <Text style={styles.empty}>No jobs found yet.</Text> : null}

        {!loading && jobs.map((job) => {
          const status = String(job.status || '-').toLowerCase();
          const isActive = !['completed', 'cancelled'].includes(status);
          const displayAmount = resolveBookingAmount(job);

          return (
            <View key={String(job.id)} style={styles.row}>
              <View style={styles.rowTop}>
                <Text style={styles.service}>{job.service_name || 'Service'}</Text>
                <Text style={styles.status}>{String(job.status || '-').replace(/_/g, ' ')}</Text>
              </View>
              <Text style={styles.meta}>Booking ID: {job.id}</Text>
              <Text style={styles.meta}>Bill Amount: {formatInr(displayAmount)}</Text>
              <Text style={styles.meta}>Created: {formatDate(job.created_at)}</Text>

              {isActive ? (
                <Pressable
                  style={({ pressed }) => [styles.completeBtn, pressed && { opacity: 0.9 }]}
                  onPress={() => openCompletionModal(job)}
                  accessibilityRole="button"
                  accessibilityLabel="Mark as completed"
                >
                  <Text style={styles.completeBtnText}>Mark as Completed</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={completionModalOpen} transparent animationType="fade" onRequestClose={closeCompletionModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Final Bill Amount?</Text>
            <Text style={styles.modalSub}>Enter final collected amount before completing this job.</Text>

            <TextInput
              value={finalAmountInput}
              onChangeText={(txt) => setFinalAmountInput(txt.replace(/[^\d.]/g, ''))}
              keyboardType="decimal-pad"
              placeholder="Enter final amount"
              placeholderTextColor={TEXT_MUTED}
              style={styles.amountInput}
              editable={!completing}
            />

            {splitPreview ? (
              <View style={styles.splitBox}>
                <Text style={styles.splitLine}>Final Bill: {formatInr(splitPreview.totalAmount)}</Text>
                <Text style={styles.splitLine}>Tier 1 ({splitPreview.tier1RatePct}% on {formatInr(splitPreview.tier1Base)}): {formatInr(splitPreview.tier1Commission)}</Text>
                <Text style={styles.splitLine}>Tier 2 ({splitPreview.tier2RatePct}% on {formatInr(splitPreview.tier2Base)}): {formatInr(splitPreview.tier2Commission)}</Text>
                <Text style={styles.splitLine}>Kshatryx Commission: {formatInr(splitPreview.kshatryxShare)} ({splitPreview.effectiveKshatryxRatePct}%)</Text>
                <Text style={styles.splitLine}>Expert Keeps: {formatInr(splitPreview.expertShare)}</Text>
              </View>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.9 }]}
                onPress={closeCompletionModal}
                disabled={completing}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.confirmBtn, pressed && !completing && { opacity: 0.9 }, completing && { opacity: 0.75 }]}
                onPress={() => completeJobWithFinalAmount().catch(() => {})}
                disabled={completing}
              >
                {completing ? <ActivityIndicator color="#042f2e" /> : <Text style={styles.confirmBtnText}>Complete Job</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { padding: 20, paddingBottom: 28 },
  title: { color: TEXT, fontSize: 24, fontWeight: '800' },
  sub: { color: TEXT_MUTED, fontSize: 13, marginTop: 6, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: CARD, borderColor: BORDER, borderWidth: 1, borderRadius: 12, padding: 10 },
  statValue: { color: TEXT, fontWeight: '800', fontSize: 18 },
  statLabel: { color: TEXT_MUTED, fontSize: 11, marginTop: 3 },
  center: { paddingVertical: 20, alignItems: 'center' },
  error: { color: '#fca5a5', marginBottom: 10 },
  empty: { color: TEXT_MUTED, textAlign: 'center', marginTop: 26 },

  row: { backgroundColor: CARD, borderColor: BORDER, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  service: { color: TEXT, fontWeight: '700', flex: 1 },
  status: { color: ACCENT, fontSize: 12, textTransform: 'uppercase', fontWeight: '800' },
  meta: { color: TEXT_MUTED, fontSize: 12, marginTop: 5 },
  completeBtn: {
    marginTop: 12,
    backgroundColor: ACCENT,
    borderRadius: 10,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.55)',
  },
  completeBtnText: { color: '#f0fdfa', fontSize: 13, fontWeight: '800' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: CARD,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: { color: TEXT, fontSize: 18, fontWeight: '800' },
  modalSub: { color: TEXT_MUTED, fontSize: 12, marginTop: 6, lineHeight: 18 },
  amountInput: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#0f172a',
    color: TEXT,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  splitBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    padding: 10,
    gap: 4,
  },
  splitLine: { color: TEXT_MUTED, fontSize: 12 },
  modalActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  cancelBtnText: { color: TEXT, fontSize: 13, fontWeight: '700' },
  confirmBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: ACCENT,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: { color: '#042f2e', fontSize: 13, fontWeight: '800' },
});
