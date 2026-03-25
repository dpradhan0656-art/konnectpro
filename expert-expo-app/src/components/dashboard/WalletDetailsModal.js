import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ACCENT, BG, BORDER, CARD, TEXT, TEXT_MUTED } from './theme';

function formatInr(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return `₹${Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(s) {
  if (!s) return '—';
  const dt = new Date(s);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function resolveTxAmount(tx) {
  const raw = tx?.amount ?? tx?.transaction_amount ?? tx?.value;
  const n = Number(raw);
  if (Number.isFinite(n)) return n;
  return 0;
}

function resolveTxReason(tx, t) {
  return tx?.reason || tx?.type || tx?.transaction_type || tx?.description || t.transactionReasonFallback;
}

function normalizeTxType(tx) {
  const raw = String(tx?.type ?? tx?.transaction_type ?? '').trim().toLowerCase();
  if (raw === 'credit' || raw === 'refund') return raw;
  if (raw === 'debit' || raw === 'fee') return raw;
  return '';
}

function isPositiveType(type, amount) {
  if (type === 'credit' || type === 'refund') return true;
  if (type === 'debit' || type === 'fee') return false;
  return amount >= 0;
}

function getTypeLabel(type, t) {
  if (type === 'credit') return t.txCredit;
  if (type === 'refund') return t.txRefund;
  if (type === 'debit') return t.txDebit;
  if (type === 'fee') return t.txFee;
  return null;
}

/**
 * @param {{
 * visible: boolean;
 * onClose: () => void;
 * t: Record<string, string>;
 * balance: number | null;
 * transactions: object[];
 * loading?: boolean;
 * error?: string | null;
 * onRecharge?: (amount: number) => Promise<{ ok?: boolean } | void> | void;
 * rechargeLoading?: boolean;
 * onRefresh?: () => Promise<unknown> | void;
 * startRecharge?: boolean;
 * }} props
 */
export default function WalletDetailsModal({
  visible,
  onClose,
  t,
  balance,
  transactions,
  loading,
  error,
  onRecharge,
  rechargeLoading,
  onRefresh,
  startRecharge = false,
}) {
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const presets = useMemo(() => [500, 1000, 2000, 5000], []);

  useEffect(() => {
    if (!visible) {
      setRechargeOpen(false);
      setAmountInput('');
      return;
    }
    setRechargeOpen(Boolean(startRecharge));
  }, [visible, startRecharge]);

  const submitRecharge = async () => {
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const res = await onRecharge?.(amount);
    if (res?.ok) {
      setRechargeOpen(false);
      setAmountInput('');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.walletDetailsTitle}</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.82 }]}
              accessibilityRole="button"
              accessibilityLabel={t.close}
            >
              <Ionicons name="close" size={20} color={TEXT} />
            </Pressable>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>{t.totalBalance}</Text>
            <Text style={styles.balanceAmount}>{formatInr(balance)}</Text>
            {rechargeOpen ? (
              <View style={styles.rechargeBox}>
                <Text style={styles.inputLabel}>{t.rechargeAmountLabel}</Text>
                <View style={styles.presetRow}>
                  {presets.map((value) => {
                    const selected = Number(amountInput) === value;
                    return (
                      <Pressable
                        key={String(value)}
                        onPress={() => setAmountInput(String(value))}
                        style={({ pressed }) => [
                          styles.presetChip,
                          selected && styles.presetChipActive,
                          pressed && { opacity: 0.9 },
                        ]}
                      >
                        <Text style={[styles.presetText, selected && styles.presetTextActive]}>₹{value}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <TextInput
                  value={amountInput}
                  onChangeText={(txt) => setAmountInput(txt.replace(/[^\d]/g, ''))}
                  keyboardType="number-pad"
                  placeholder={t.rechargeAmountPlaceholder}
                  placeholderTextColor={TEXT_MUTED}
                  style={styles.amountInput}
                />
                <View style={styles.rechargeActions}>
                  <Pressable
                    onPress={() => setRechargeOpen(false)}
                    style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.9 }]}
                  >
                    <Text style={styles.cancelBtnText}>{t.cancel}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => submitRecharge().catch(() => {})}
                    disabled={rechargeLoading || !Number(amountInput)}
                    style={({ pressed }) => [
                      styles.rechargeBtn,
                      (rechargeLoading || !Number(amountInput)) && styles.rechargeBtnDisabled,
                      pressed && !rechargeLoading && { opacity: 0.9 },
                    ]}
                  >
                    {rechargeLoading ? (
                      <ActivityIndicator color="#1f2937" />
                    ) : (
                      <Text style={styles.rechargeText}>{t.rechargeProceed}</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setRechargeOpen(true)}
                style={({ pressed }) => [styles.rechargeBtn, pressed && { opacity: 0.9 }]}
                accessibilityRole="button"
                accessibilityLabel={t.rechargeWallet}
              >
                <Text style={styles.rechargeText}>{t.rechargeWallet}</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{t.recentTransactions}</Text>
            <Pressable onPress={onRefresh} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
              <Ionicons name="refresh" size={18} color={ACCENT} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={ACCENT} />
            </View>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {!loading && !transactions?.length ? (
            <View style={styles.centered}>
              <Text style={styles.empty}>{t.noTransactions}</Text>
            </View>
          ) : null}

          {!loading ? (
            <FlatList
              data={transactions || []}
              keyExtractor={(item, index) => String(item?.id ?? `${item?.created_at || 'tx'}-${index}`)}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const amt = resolveTxAmount(item);
                const txType = normalizeTxType(item);
                const positive = isPositiveType(txType, amt);
                const badgeLabel = getTypeLabel(txType, t);
                return (
                  <View style={styles.txRow}>
                    <View style={styles.txLeft}>
                      <Text style={styles.txReason} numberOfLines={1}>
                        {resolveTxReason(item, t)}
                      </Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.txDate}>{formatDate(item?.created_at)}</Text>
                        {badgeLabel ? (
                          <View style={[styles.typeBadge, positive ? styles.typeBadgePositive : styles.typeBadgeNegative]}>
                            <Text style={[styles.typeBadgeText, positive ? styles.typeBadgeTextPositive : styles.typeBadgeTextNegative]}>
                              {badgeLabel}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.amountWrap}>
                      <Text style={[styles.txAmount, positive ? styles.amountPositive : styles.amountNegative]}>
                        {positive ? '+' : '-'}
                        {formatInr(amt)}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    maxHeight: '88%',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: TEXT,
    fontSize: 19,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  balanceCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  balanceLabel: {
    color: TEXT_MUTED,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 6,
    fontWeight: '700',
  },
  balanceAmount: {
    color: TEXT,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 12,
  },
  rechargeBtn: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#eab308',
    borderWidth: 1,
    borderColor: '#facc15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rechargeText: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '900',
  },
  rechargeBtnDisabled: {
    opacity: 0.65,
  },
  rechargeBox: {
    marginTop: 2,
  },
  inputLabel: {
    color: TEXT_MUTED,
    fontSize: 12,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  presetChip: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#0f172a',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  presetChipActive: {
    borderColor: 'rgba(45, 212, 191, 0.75)',
    backgroundColor: 'rgba(13, 148, 136, 0.22)',
  },
  presetText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '700',
  },
  presetTextActive: {
    color: TEXT,
  },
  amountInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    color: TEXT,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  rechargeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    minHeight: 46,
    minWidth: 92,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#0f172a',
  },
  cancelBtnText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
  },
  centered: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    marginBottom: 6,
  },
  empty: {
    color: TEXT_MUTED,
    fontSize: 13,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 20,
  },
  txRow: {
    backgroundColor: CARD,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  txLeft: {
    flex: 1,
    minWidth: 0,
  },
  txReason: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  txDate: {
    color: TEXT_MUTED,
    fontSize: 11,
  },
  metaRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
  },
  typeBadgePositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  typeBadgeNegative: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.35)',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  typeBadgeTextPositive: {
    color: '#10b981',
  },
  typeBadgeTextNegative: {
    color: '#f43f5e',
  },
  amountWrap: {
    minWidth: 98,
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  amountPositive: {
    color: '#4ade80',
  },
  amountNegative: {
    color: '#f87171',
  },
});
