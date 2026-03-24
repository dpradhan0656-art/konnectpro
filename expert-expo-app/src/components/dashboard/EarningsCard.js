import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ACCENT, BORDER, CARD, TEXT, TEXT_MUTED } from './theme';

function formatInr(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * @param {{ totalEarnings: number; loading?: boolean; t: Record<string, string> }} props
 */
export default function EarningsCard({ totalEarnings, loading, t }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t.lifetimeEarningsLabel}</Text>
      {loading ? (
        <Text style={styles.amount}>…</Text>
      ) : (
        <Text style={styles.amount}>{formatInr(totalEarnings)}</Text>
      )}
      <Text style={styles.hint}>{t.lifetimeEarningsHint}</Text>
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
    marginBottom: 16,
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
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  hint: {
    marginTop: 8,
    color: TEXT_MUTED,
    fontSize: 12,
  },
});
