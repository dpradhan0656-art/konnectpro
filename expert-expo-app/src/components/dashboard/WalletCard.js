import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ACCENT, BORDER, CARD, TEXT, TEXT_MUTED } from './theme';

function formatInr(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * @param {{ balance: number | null; loading?: boolean; t: Record<string, string>; onPress?: () => void }} props
 */
export default function WalletCard({ balance, loading, t, onPress }) {
  const cardBody = (
    <View style={styles.card}>
      <Text style={styles.label}>{t.kshatrWalletLabel}</Text>
      {loading && balance === null ? (
        <Text style={styles.amount}>…</Text>
      ) : (
        <Text style={styles.amount}>{formatInr(balance)}</Text>
      )}
      <Text style={styles.hint}>{t.kshatrWalletHint}</Text>
      <Text style={styles.tapHint}>{t.viewWalletDetails}</Text>
    </View>
  );

  if (!onPress) {
    return cardBody;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t.walletDetailsTitle}
      style={({ pressed }) => [pressed && { opacity: 0.92 }]}
    >
      {cardBody}
    </Pressable>
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
  tapHint: {
    marginTop: 10,
    color: ACCENT,
    fontSize: 12,
    fontWeight: '700',
  },
});
