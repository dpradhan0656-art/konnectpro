import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ACCENT, BORDER, CARD, TEXT, TEXT_MUTED } from './theme';

function formatInr(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * @param {{
 *   balance: number | null;
 *   loading?: boolean;
 *   t: Record<string, string>;
 *   onPress?: () => void;
 *   onAddMoney?: () => void;
 *   rechargeLoading?: boolean;
 * }} props
 */
export default function WalletCard({ balance, loading, t, onPress, onAddMoney, rechargeLoading }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t.kshatrWalletLabel}</Text>
      {loading && balance === null ? (
        <Text style={styles.amount}>…</Text>
      ) : (
        <Text style={styles.amount}>{formatInr(balance)}</Text>
      )}
      <Text style={styles.hint}>{t.kshatrWalletHint}</Text>

      {onAddMoney ? (
        <Pressable
          onPress={onAddMoney}
          disabled={rechargeLoading}
          style={({ pressed }) => [
            styles.addMoneyBtn,
            pressed && !rechargeLoading && { opacity: 0.92 },
            rechargeLoading && { opacity: 0.75 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t.addMoney}
        >
          {rechargeLoading ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={styles.addMoneyText}>{t.addMoney}</Text>
          )}
        </Pressable>
      ) : null}
      {t.walletRechargeHint ? <Text style={styles.trustHint}>{t.walletRechargeHint}</Text> : null}

      {onPress ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.88 }]}
          accessibilityRole="button"
          accessibilityLabel={t.walletDetailsTitle}
        >
          <Text style={styles.tapHint}>{t.viewWalletDetails}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
  },
  label: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  amount: {
    color: TEXT,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  hint: {
    marginTop: 8,
    color: TEXT_MUTED,
    fontSize: 12,
  },
  addMoneyBtn: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#fbbf24',
    borderWidth: 1,
    borderColor: '#fde047',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  addMoneyText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  trustHint: {
    marginTop: 8,
    color: TEXT_MUTED,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  linkRow: {
    marginTop: 12,
    alignSelf: 'center',
  },
  tapHint: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: '700',
  },
});
