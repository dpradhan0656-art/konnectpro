import React, { useEffect, useRef, useState } from 'react';
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
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { useExpertDashboard } from '../hooks/useExpertDashboard';
import LowBalanceBanner from '../components/dashboard/LowBalanceBanner';
import WalletCard from '../components/dashboard/WalletCard';
import EarningsCard from '../components/dashboard/EarningsCard';
import ActiveJobsList from '../components/dashboard/ActiveJobsList';
import CompletedJobsList from '../components/dashboard/CompletedJobsList';
import LanguagePickerModal from '../components/dashboard/LanguagePickerModal';
import WalletDetailsModal from '../components/dashboard/WalletDetailsModal';
import { ACCENT, BG, TEXT, TEXT_MUTED } from '../components/dashboard/theme';
import { registerExpertPushToken } from '../services/pushRegistration';

/**
 * @param {{ expert: { id?: string | number; name?: string | null; email?: string | null } | null }} props
 */
export default function DashboardScreen({ expert }) {
  const { t, lang, setLang } = useLanguage();
  const expertId = expert?.id ?? null;
  const {
    walletBalance,
    walletTransactions,
    walletTxLoading,
    walletTxError,
    activeBookings,
    completedBookings,
    totalEarnings,
    loading,
    error,
    workAlert,
    realtimePayload,
    statusUpdatingById,
    clearWorkAlert,
    updateBookingStatus,
    handleRecharge,
    rechargeLoading,
    loadWalletTransactions,
    refresh,
    isLowBalance,
    lowBalanceThreshold,
  } = useExpertDashboard(expertId, expert);

  const [signingOut, setSigningOut] = useState(false);
  const [segment, setSegment] = useState('active');
  const [refreshing, setRefreshing] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  /** When true, wallet modal opens directly on the recharge (Add money) step */
  const [walletStartRecharge, setWalletStartRecharge] = useState(false);
  const prevWorkAlert = useRef(false);

  useEffect(() => {
    if (workAlert && !prevWorkAlert.current) {
      Speech.stop();
      const row = realtimePayload?.new ?? realtimePayload?.old;
      const serviceName =
        row?.service_name ?? activeBookings[0]?.service_name ?? t.serviceFallback;
      const line = `${t.v_newJob} ${serviceName}. ${t.v_checkApp}`;
      Speech.speak(line, { language: t.langCode });
    }
    prevWorkAlert.current = workAlert;
  }, [workAlert, realtimePayload, activeBookings, t]);

  /** Expo Push token + language for assignment notifications (screen off / app background). */
  useEffect(() => {
    if (!expert?.id) return;
    let cancelled = false;
    (async () => {
      await registerExpertPushToken({ expertId: expert.id, langCode: lang });
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [expert?.id, lang]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const displayName = expert?.name || expert?.email || t.expertFallback;

  const showToast = (msg) => {
    if (!msg) return;
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
      return;
    }
    Alert.alert(msg);
  };

  const openWalletModal = () => {
    setWalletStartRecharge(false);
    setWalletModalOpen(true);
    loadWalletTransactions().catch(() => {});
  };

  const openWalletForRecharge = () => {
    setWalletStartRecharge(true);
    setWalletModalOpen(true);
    loadWalletTransactions().catch(() => {});
  };

  const closeWalletModal = () => {
    setWalletModalOpen(false);
    setWalletStartRecharge(false);
  };

  const handleRechargePress = async (amount) => {
    const res = await handleRecharge(amount);
    if (res?.ok) {
      showToast(t.rechargeSuccess);
      return res;
    }
    if (res?.code === 'CANCELLED') {
      showToast(t.paymentCancelled);
      return res;
    }
    if (res?.code === 'INVALID_AMOUNT') {
      showToast(t.invalidRechargeAmount);
      return res;
    }
    if (res?.code === 'PAYMENT_FAILED') {
      showToast(t.paymentFailed);
      return res;
    }
    showToast(t.paymentInitFailed);
    return res;
  };

  // Legacy Dummy Recharge
  // const handleRechargePress = () => {
  //   showToast(t.paymentPending);
  // };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ACCENT}
            colors={[ACCENT]}
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t.partnerBadge}</Text>
            </View>
            <Text style={styles.title}>{t.dashboardTitle}</Text>
          </View>
          <Pressable
            onPress={() => setLangModalOpen(true)}
            style={({ pressed }) => [styles.langBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={t.language}
          >
            <Ionicons name="globe-outline" size={26} color={ACCENT} />
          </Pressable>
        </View>
        <Text style={styles.sub}>
          {t.signedInPrefix} {displayName}.
        </Text>

        {workAlert ? (
          <Pressable
            onPress={clearWorkAlert}
            style={({ pressed }) => [styles.alertBanner, pressed && { opacity: 0.9 }]}
            accessibilityRole="button"
            accessibilityLabel={t.dismissWorkAlertA11y}
          >
            <Text style={styles.alertTitle}>{t.newJobActivity}</Text>
            <Text style={styles.alertSub}>{t.tapToDismiss}</Text>
          </Pressable>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {loading && walletBalance === null ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        ) : null}

        <LowBalanceBanner
          visible={isLowBalance}
          threshold={lowBalanceThreshold}
          t={t}
          onAddMoney={openWalletForRecharge}
          rechargeLoading={rechargeLoading}
        />
        <WalletCard
          balance={walletBalance}
          loading={loading}
          t={t}
          onPress={openWalletModal}
          onAddMoney={openWalletForRecharge}
          rechargeLoading={rechargeLoading}
        />
        <EarningsCard totalEarnings={totalEarnings} loading={loading} t={t} />

        <Text style={styles.sectionLabel}>{t.jobsSection}</Text>
        <View style={styles.segment}>
          <Pressable
            onPress={() => setSegment('active')}
            style={({ pressed }) => [
              styles.segmentBtn,
              segment === 'active' && styles.segmentBtnActive,
              pressed && { opacity: 0.92 },
            ]}
          >
            <Text style={[styles.segmentText, segment === 'active' && styles.segmentTextActive]}>
              {t.activeTab} ({activeBookings.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSegment('completed')}
            style={({ pressed }) => [
              styles.segmentBtn,
              segment === 'completed' && styles.segmentBtnActive,
              pressed && { opacity: 0.92 },
            ]}
          >
            <Text style={[styles.segmentText, segment === 'completed' && styles.segmentTextActive]}>
              {t.completedTab} ({completedBookings.length})
            </Text>
          </Pressable>
        </View>

        {segment === 'active' ? (
          <ActiveJobsList
            jobs={activeBookings}
            t={t}
            statusUpdatingById={statusUpdatingById}
            onUpdateStatus={updateBookingStatus}
          />
        ) : (
          <CompletedJobsList jobs={completedBookings} t={t} />
        )}

        <Pressable
          style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.9 }]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color={ACCENT} />
          ) : (
            <Text style={styles.outlineBtnText}>{t.signOut}</Text>
          )}
        </Pressable>
      </ScrollView>

      <LanguagePickerModal
        visible={langModalOpen}
        onClose={() => setLangModalOpen(false)}
        currentLang={lang}
        onSelect={(code) => setLang(code)}
        title={t.chooseLanguage}
      />
      <WalletDetailsModal
        visible={walletModalOpen}
        onClose={closeWalletModal}
        startRecharge={walletStartRecharge}
        t={t}
        balance={walletBalance}
        transactions={walletTransactions}
        loading={walletTxLoading}
        error={walletTxError}
        onRecharge={handleRechargePress}
        rechargeLoading={rechargeLoading}
        onRefresh={loadWalletTransactions}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  topLeft: {
    flex: 1,
    minWidth: 0,
  },
  langBtn: {
    padding: 8,
    marginTop: -4,
    marginRight: -4,
    borderRadius: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#134e4a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    color: TEXT_MUTED,
    marginBottom: 16,
  },
  alertBanner: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.45)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  alertTitle: {
    color: '#5eead4',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  alertSub: {
    color: TEXT_MUTED,
    fontSize: 12,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
  },
  loaderWrap: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  segment: {
    flexDirection: 'row',
    marginBottom: 14,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.25)',
  },
  segmentText: {
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: TEXT,
  },
  outlineBtn: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '700',
  },
});
