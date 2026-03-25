import React from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Pressable, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ACCENT, BORDER, CARD, TEXT, TEXT_MUTED } from './theme';

function formatStatus(s) {
  if (!s) return '—';
  return String(s).replace(/_/g, ' ');
}

function getStatusAction(status, t) {
  if (status === 'assigned') return { label: t.accept, nextStatus: 'accepted' };
  if (status === 'accepted') return { label: t.start, nextStatus: 'in_progress' };
  if (status === 'in_progress') return { label: t.complete, nextStatus: 'completed' };
  return null;
}

function getPhone(job) {
  const raw = job?.customer_phone ?? job?.contact_phone ?? job?.phone ?? job?.mobile;
  if (!raw) return null;
  const cleaned = String(raw).replace(/[^\d+]/g, '');
  return cleaned || null;
}

function getNavigationUrl(job) {
  const latRaw =
    job?.customer_latitude ??
    job?.latitude ??
    job?.lat ??
    job?.service_latitude ??
    job?.booking_latitude;
  const lngRaw =
    job?.customer_longitude ??
    job?.longitude ??
    job?.lng ??
    job?.service_longitude ??
    job?.booking_longitude;
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `google.navigation:q=${lat},${lng}`;
  }

  const address =
    job?.service_address ??
    job?.address ??
    ([job?.street, job?.city, job?.state].filter(Boolean).join(', ') || job?.city);
  if (!address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

async function safeOpenUrl(url) {
  if (!url) return;
  try {
    await Linking.openURL(url);
  } catch {
    // Intentionally silent: cards remain responsive even if a device lacks a handler.
  }
}

function showFeedback(message) {
  if (!message) return;
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }
  Alert.alert(message);
}

function getSuccessMessage(nextStatus, t) {
  if (nextStatus === 'accepted') return t.toastAccepted;
  if (nextStatus === 'in_progress') return t.toastStarted;
  if (nextStatus === 'completed') return t.toastCompleted;
  return t.actionSuccess;
}

/**
 * @param {{
 *  jobs: object[];
 *  t: Record<string, string>;
 *  statusUpdatingById?: Record<string, boolean>;
 *  onUpdateStatus?: (bookingId: string | number, newStatus: string) => Promise<{ ok: boolean }>;
 * }} props
 */
export default function ActiveJobsList({ jobs, t, statusUpdatingById = {}, onUpdateStatus }) {
  const runStatusUpdate = async (jobId, nextStatus) => {
    if (!onUpdateStatus) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore haptics capability errors.
    }

    const run = async () => {
      const res = await onUpdateStatus(jobId, nextStatus);
      if (res?.ok) {
        showFeedback(getSuccessMessage(nextStatus, t));
      } else {
        showFeedback(res?.error?.message || t.actionFailed);
      }
    };

    if (nextStatus === 'completed') {
      Alert.alert(t.finishWorkTitle, t.finishWorkMsg, [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.yesCompleted,
          style: 'default',
          onPress: () => {
            run().catch(() => {});
          },
        },
      ]);
      return;
    }

    await run();
  };

  const handleCallPress = async (tel) => {
    if (!tel) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore haptics capability errors.
    }
    await safeOpenUrl(`tel:${tel}`);
  };

  const handleNavigatePress = async (url) => {
    if (!url) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore haptics capability errors.
    }
    await safeOpenUrl(url);
  };

  if (!jobs?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{t.emptyActiveTitle}</Text>
        <Text style={styles.emptySub}>{t.emptyActiveSub}</Text>
      </View>
    );
  }

  return (
    <View>
      {jobs.map((job, index) => (
        <View key={String(job.id)} style={[styles.row, index < jobs.length - 1 ? styles.rowSpaced : null]}>
          {(() => {
            const bookingKey = String(job.id);
            const action = getStatusAction(job.status, t);
            const statusBusy = Boolean(statusUpdatingById[bookingKey]);
            const tel = getPhone(job);
            const navUrl = getNavigationUrl(job);

            return (
              <>
                <View style={styles.rowTop}>
                  <Text style={styles.service} numberOfLines={2}>
                    {job.service_name || t.serviceFallback}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{formatStatus(job.status)}</Text>
                  </View>
                </View>
                {job.contact_name ? (
                  <Text style={styles.meta}>{job.contact_name}</Text>
                ) : null}
                {job.city ? (
                  <Text style={styles.meta}>{job.city}</Text>
                ) : null}

                <View style={styles.actionsRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.iconBtn,
                      !tel && styles.iconBtnDisabled,
                      pressed && tel && { opacity: 0.85 },
                    ]}
                    disabled={!tel}
                    onPress={() => handleCallPress(tel)}
                    accessibilityRole="button"
                    accessibilityLabel={t.call}
                  >
                    <Ionicons name="call-outline" size={18} color={tel ? ACCENT : '#64748b'} />
                    <Text style={[styles.iconBtnText, !tel && styles.iconBtnTextDisabled]}>{t.call}</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.iconBtn,
                      !navUrl && styles.iconBtnDisabled,
                      pressed && navUrl && { opacity: 0.85 },
                    ]}
                    disabled={!navUrl}
                    onPress={() => handleNavigatePress(navUrl)}
                    accessibilityRole="button"
                    accessibilityLabel={t.navigate}
                  >
                    <Ionicons name="navigate-outline" size={18} color={navUrl ? ACCENT : '#64748b'} />
                    <Text style={[styles.iconBtnText, !navUrl && styles.iconBtnTextDisabled]}>{t.navigate}</Text>
                  </Pressable>
                </View>

                {action ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      statusBusy && styles.primaryBtnDisabled,
                      pressed && !statusBusy && { opacity: 0.9 },
                    ]}
                    disabled={statusBusy || !onUpdateStatus}
                    onPress={() => {
                      runStatusUpdate(job.id, action.nextStatus).catch(() => {
                        showFeedback(t.actionFailed);
                      });
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                  >
                    {statusBusy ? (
                      <ActivityIndicator color="#042f2e" />
                    ) : (
                      <Text style={styles.primaryBtnText}>{action.label}</Text>
                    )}
                  </Pressable>
                ) : null}
              </>
            );
          })()}
        </View>
      ))}
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
  badge: {
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#2dd4bf',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  meta: {
    marginTop: 6,
    color: TEXT_MUTED,
    fontSize: 12,
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  iconBtnDisabled: {
    opacity: 0.65,
  },
  iconBtnText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  iconBtnTextDisabled: {
    color: '#94a3b8',
  },
  primaryBtn: {
    minHeight: 48,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.75)',
  },
  primaryBtnDisabled: {
    opacity: 0.75,
  },
  primaryBtnText: {
    color: '#042f2e',
    fontSize: 14,
    fontWeight: '800',
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
