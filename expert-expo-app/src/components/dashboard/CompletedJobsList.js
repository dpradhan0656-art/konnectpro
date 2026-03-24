import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BORDER, CARD, TEXT, TEXT_MUTED } from './theme';

function formatInr(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatStatus(s) {
  if (!s) return '—';
  return String(s).replace(/_/g, ' ');
}

/**
 * @param {{ jobs: object[]; t: Record<string, string> }} props
 */
export default function CompletedJobsList({ jobs, t }) {
  if (!jobs?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{t.emptyCompletedTitle}</Text>
        <Text style={styles.emptySub}>{t.emptyCompletedSub}</Text>
      </View>
    );
  }

  return (
    <View>
      {jobs.map((job, index) => {
        const payout = Number(job.expert_payout);
        const showPayout = Number.isFinite(payout) && payout > 0;
        const total = Number(job.total_amount);
        const amountLabel = showPayout ? formatInr(payout) : Number.isFinite(total) ? formatInr(total) : '—';

        return (
          <View
            key={String(job.id)}
            style={[styles.row, index < jobs.length - 1 ? styles.rowSpaced : null]}
          >
            <View style={styles.rowTop}>
              <Text style={styles.service} numberOfLines={2}>
                {job.service_name || t.serviceFallback}
              </Text>
              <Text style={styles.amount}>{amountLabel}</Text>
            </View>
            <View style={styles.rowBottom}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{formatStatus(job.status)}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rowSpaced: {
    marginBottom: 10,
  },
  row: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  service: {
    flex: 1,
    color: TEXT,
    fontSize: 15,
    fontWeight: '700',
  },
  amount: {
    color: '#4ade80',
    fontSize: 15,
    fontWeight: '800',
  },
  rowBottom: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(71, 85, 105, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  empty: {
    paddingVertical: 24,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  emptyText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySub: {
    color: TEXT_MUTED,
    fontSize: 13,
    textAlign: 'center',
  },
});
