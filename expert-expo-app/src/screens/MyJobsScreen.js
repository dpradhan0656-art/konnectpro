import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
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

/** @param {{ expert: { id?: string | number | null } | null }} props */
export default function MyJobsScreen({ expert }) {
  const expertId = expert?.id ?? null;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);

  const stats = useMemo(() => {
    const active = jobs.filter((j) => !['completed', 'cancelled'].includes(String(j.status || '').toLowerCase()));
    const done = jobs.filter((j) => ['completed', 'cancelled'].includes(String(j.status || '').toLowerCase()));
    return { active: active.length, done: done.length, total: jobs.length };
  }, [jobs]);

  const load = async () => {
    if (!expertId) {
      setJobs([]);
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ACCENT]} tintColor={ACCENT} />}
      >
        <Text style={styles.title}>My Jobs</Text>
        <Text style={styles.sub}>Complete booking history for this expert account.</Text>

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

        {!loading && jobs.map((job) => (
          <View key={String(job.id)} style={styles.row}>
            <View style={styles.rowTop}>
              <Text style={styles.service}>{job.service_name || 'Service'}</Text>
              <Text style={styles.status}>{String(job.status || '-').replace(/_/g, ' ')}</Text>
            </View>
            <Text style={styles.meta}>Booking ID: {job.id}</Text>
            <Text style={styles.meta}>Created: {formatDate(job.created_at)}</Text>
          </View>
        ))}
      </ScrollView>
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
});
