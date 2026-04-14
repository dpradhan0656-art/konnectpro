import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../lib/supabase';
import { ACCENT, BG, BORDER, CARD, TEXT, TEXT_MUTED } from '../components/dashboard/theme';
import { computeKshatryxSplit } from '../utils/paymentSplitMath';

const MIN_WITHDRAWAL_INR = 500;

function formatInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '?0';
  return `?${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

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

function showToast(message) {
  if (!message) return;
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }
  Alert.alert('Finance', message);
}

/** @param {{ expert: { id?: string | number | null } | null }} props */
export default function FinanceScreen({ expert }) {
  const expertId = expert?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [walletBalance, setWalletBalance] = useState(0);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);

  const lifetimeEarnings = useMemo(
    () =>
      completedJobs.reduce((sum, row) => {
        const payout = Number(row?.expert_payout);
        if (Number.isFinite(payout) && payout > 0) return sum + payout;
        const fallback = Number(row?.total_amount);
        return Number.isFinite(fallback) && fallback > 0 ? sum + fallback : sum;
      }, 0),
    [completedJobs]
  );

  const splitPreview = useMemo(
    () =>
      completedJobs.slice(0, 5).map((job) => {
        const split = computeKshatryxSplit(job);
        return {
          id: job?.id,
          service: job?.service_name || job?.category || job?.service_category || 'Service',
          createdAt: job?.created_at,
          split,
        };
      }),
    [completedJobs]
  );

  const load = async () => {
    if (!expertId) {
      setWalletBalance(0);
      setCompletedJobs([]);
      setWalletTransactions([]);
      setError(null);
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const [walletRes, jobsRes, txRes] = await Promise.all([
        supabase.from('experts').select('wallet_balance').eq('id', expertId).maybeSingle(),
        supabase
          .from('bookings')
          .select('id, status, service_name, category, service_category, service_type, partner_module, total_amount, expert_payout, created_at')
          .eq('expert_id', expertId)
          .in('status', ['completed'])
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('wallet_transactions')
          .select('id, amount, transaction_type, reason, description, created_at')
          .eq('user_id', expertId)
          .eq('user_type', 'expert')
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (walletRes.error) throw walletRes.error;
      if (jobsRes.error) throw jobsRes.error;
      if (txRes.error) throw txRes.error;

      const balance = Number(walletRes.data?.wallet_balance);
      setWalletBalance(Number.isFinite(balance) ? balance : 0);
      setCompletedJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      setWalletTransactions(Array.isArray(txRes.data) ? txRes.data : []);
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

  const onWithdraw = () => {
    if (walletBalance >= MIN_WITHDRAWAL_INR) {
      showToast('Withdrawal Request Sent to Kshatryx Admin');
      return;
    }
    showToast('Minimum withdrawal amount is ?500');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ACCENT}
            colors={[ACCENT]}
          />
        }
      >
        <Text style={styles.title}>Finance</Text>
        <Text style={styles.sub}>Wallet, split preview and withdrawal controls.</Text>

        {loading ? (
          <View style={styles.centered}><ActivityIndicator color={ACCENT} /></View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading ? (
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Wallet Balance</Text>
            <Text style={styles.heroAmount}>{formatInr(walletBalance)}</Text>
            <Text style={styles.heroHint}>Available for payouts and recharge expenses</Text>
            <Pressable
              onPress={onWithdraw}
              style={({ pressed }) => [styles.withdrawBtn, pressed && { opacity: 0.9 }]}
              accessibilityRole="button"
              accessibilityLabel="Withdraw funds"
            >
              <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
            </Pressable>
            <Text style={styles.withdrawRule}>Minimum withdrawal amount: ?500</Text>
          </View>
        ) : null}

        {!loading ? (
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Lifetime Earnings</Text>
              <Text style={styles.metricValue}>{formatInr(lifetimeEarnings)}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Recent Transactions</Text>
              <Text style={styles.metricValue}>{walletTransactions.length}</Text>
            </View>
          </View>
        ) : null}

        {!loading ? (
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Kshatryx Commission Split (Display)</Text>
            <Text style={styles.sectionSub}>Standard: 81% Expert / 19% Kshatryx. Medical: 75% Expert/Partner / 25% Kshatryx.</Text>

            {!splitPreview.length ? (
              <Text style={styles.emptyText}>No completed jobs yet for split preview.</Text>
            ) : null}

            {splitPreview.map((row) => (
              <View key={String(row.id)} style={styles.splitRow}>
                <View style={styles.splitTop}>
                  <Text style={styles.splitService} numberOfLines={1}>{row.service}</Text>
                  {row.split.isMedical ? (
                    <View style={styles.medicalBadge}><Text style={styles.medicalBadgeText}>MEDICAL 25%</Text></View>
                  ) : (
                    <View style={styles.standardBadge}><Text style={styles.standardBadgeText}>STANDARD 19%</Text></View>
                  )}
                </View>
                <Text style={styles.splitMeta}>Job Total: {formatInr(row.split.totalAmount)}</Text>
                <Text style={styles.splitMeta}>Expert/Partner: {row.split.expertPct}% ({formatInr(row.split.expertShare)})</Text>
                <Text style={styles.splitMeta}>Kshatryx: {row.split.kshatryxPct}% ({formatInr(row.split.kshatryxShare)})</Text>
              </View>
            ))}
          </View>
        ) : null}

        {!loading ? (
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {!walletTransactions.length ? (
              <Text style={styles.emptyText}>No wallet transactions found.</Text>
            ) : null}
            {walletTransactions.map((tx) => {
              const amount = Number(tx?.amount);
              const positive = String(tx?.transaction_type || '').toLowerCase() !== 'debit' && amount >= 0;
              return (
                <View key={String(tx.id)} style={styles.txRow}>
                  <View style={styles.txLeft}>
                    <Text style={styles.txReason}>{tx.reason || tx.description || 'Transaction'}</Text>
                    <Text style={styles.txDate}>{formatDate(tx.created_at)}</Text>
                  </View>
                  <Text style={[styles.txAmount, positive ? styles.amountPositive : styles.amountNegative]}>
                    {positive ? '+' : '-'}{formatInr(Math.abs(amount || 0))}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { padding: 20, paddingBottom: 32 },
  title: { color: TEXT, fontSize: 24, fontWeight: '800' },
  sub: { color: TEXT_MUTED, fontSize: 13, marginTop: 6, marginBottom: 14 },
  centered: { paddingVertical: 18, alignItems: 'center' },
  error: { color: '#fca5a5', marginBottom: 12 },

  heroCard: {
    backgroundColor: CARD,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  heroLabel: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroAmount: {
    color: TEXT,
    fontSize: 36,
    fontWeight: '900',
    marginTop: 6,
  },
  heroHint: {
    color: TEXT_MUTED,
    marginTop: 6,
    fontSize: 12,
  },
  withdrawBtn: {
    marginTop: 14,
    backgroundColor: ACCENT,
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.55)',
  },
  withdrawBtnText: {
    color: '#f0fdfa',
    fontSize: 15,
    fontWeight: '800',
  },
  withdrawRule: {
    color: TEXT_MUTED,
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },

  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: CARD,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  metricLabel: {
    color: TEXT_MUTED,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    color: TEXT,
    marginTop: 6,
    fontSize: 20,
    fontWeight: '800',
  },

  cardSection: {
    backgroundColor: CARD,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSub: {
    color: TEXT_MUTED,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 10,
  },

  splitRow: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#0f172a',
  },
  splitTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8,
  },
  splitService: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  medicalBadge: {
    borderRadius: 999,
    backgroundColor: 'rgba(245,158,11,0.2)',
    borderColor: 'rgba(245,158,11,0.4)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  medicalBadgeText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '800',
  },
  standardBadge: {
    borderRadius: 999,
    backgroundColor: 'rgba(45,212,191,0.16)',
    borderColor: 'rgba(45,212,191,0.4)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  standardBadgeText: {
    color: '#5eead4',
    fontSize: 10,
    fontWeight: '800',
  },
  splitMeta: {
    color: TEXT_MUTED,
    fontSize: 12,
    marginTop: 2,
  },

  txRow: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  txLeft: {
    flex: 1,
  },
  txReason: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  txDate: {
    color: TEXT_MUTED,
    fontSize: 11,
    marginTop: 4,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  amountPositive: {
    color: '#4ade80',
  },
  amountNegative: {
    color: '#f87171',
  },
});
