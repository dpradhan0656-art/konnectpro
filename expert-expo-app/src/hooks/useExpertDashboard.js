import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';
import {
  createWalletOrderViaEdge,
  confirmWalletRechargeViaEdge,
  openRazorpayCheckout,
} from '../services/paymentService';

const LOW_BALANCE_INR = 200;

function sumCompletedEarnings(bookings) {
  if (!Array.isArray(bookings)) return 0;
  return bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => {
      const payout = Number(b.expert_payout);
      if (Number.isFinite(payout) && payout > 0) return sum + payout;
      const total = Number(b.total_amount);
      if (Number.isFinite(total) && total > 0) return sum + total;
      return sum;
    }, 0);
}

function splitBookings(bookings) {
  const list = Array.isArray(bookings) ? bookings : [];
  const active = [];
  const completed = [];
  for (const b of list) {
    const s = b.status;
    if (s === 'completed' || s === 'cancelled') completed.push(b);
    else active.push(b);
  }
  active.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  completed.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return { active, completed };
}

/**
 * @param {string | number | null | undefined} expertId — experts.id
 */
export function useExpertDashboard(expertId, expertProfile) {
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletTxLoading, setWalletTxLoading] = useState(false);
  const [walletTxError, setWalletTxError] = useState(null);
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workAlert, setWorkAlert] = useState(false);
  const [realtimePayload, setRealtimePayload] = useState(null);
  const [statusUpdatingById, setStatusUpdatingById] = useState({});
  const expertIdRef = useRef(expertId);
  const expertProfileRef = useRef(expertProfile);
  const walletBalanceRef = useRef(walletBalance);

  const totalEarnings = sumCompletedEarnings(bookings);
  const { active: activeBookings, completed: completedBookings } = splitBookings(bookings);
  const isLowBalance =
    walletBalance !== null && Number(walletBalance) < LOW_BALANCE_INR;

  expertIdRef.current = expertId;
  expertProfileRef.current = expertProfile;
  walletBalanceRef.current = walletBalance;

  const loadWallet = useCallback(async () => {
    const id = expertIdRef.current;
    if (id == null) return;
    const { data, error: wErr } = await supabase
      .from('experts')
      .select('wallet_balance')
      .eq('id', id)
      .maybeSingle();
    if (wErr) throw wErr;
    const bal = data?.wallet_balance;
    setWalletBalance(bal === null || bal === undefined ? 0 : Number(bal));
  }, []);

  const loadBookings = useCallback(async () => {
    const id = expertIdRef.current;
    if (id == null) return;
    const { data, error: bErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('expert_id', id)
      .order('created_at', { ascending: false });
    if (bErr) throw bErr;
    setBookings(data || []);
  }, []);

  const loadWalletTransactions = useCallback(async () => {
    const id = expertIdRef.current;
    if (id == null) {
      setWalletTransactions([]);
      return [];
    }
    setWalletTxError(null);
    setWalletTxLoading(true);
    try {
      const { data, error: txErr } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', id)
        .eq('user_type', 'expert')
        .order('created_at', { ascending: false })
        .limit(20);
      if (txErr) throw txErr;
      const list = Array.isArray(data) ? data : [];
      setWalletTransactions(list);
      return list;
    } catch (e) {
      setWalletTxError(e?.message || String(e));
      return [];
    } finally {
      setWalletTxLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    const id = expertIdRef.current;
    if (id == null) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      await Promise.all([loadWallet(), loadBookings(), loadWalletTransactions()]);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [loadBookings, loadWallet, loadWalletTransactions]);

  useEffect(() => {
    if (expertId == null) {
      setWalletBalance(null);
      setWalletTransactions([]);
      setWalletTxError(null);
      setWalletTxLoading(false);
      setBookings([]);
      setError(null);
      setWorkAlert(false);
      setRealtimePayload(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();
  }, [expertId, refresh]);

  useEffect(() => {
    if (expertId == null) return;

    const idStr = String(expertId);
    const channel = supabase
      .channel(`expert-bookings-${idStr}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `expert_id=eq.${idStr}`,
        },
        (payload) => {
          setWorkAlert(true);
          setRealtimePayload(payload);
          loadBookings().catch(() => {});
          loadWallet().catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [expertId, loadBookings, loadWallet]);

  const clearWorkAlert = useCallback(() => {
    setWorkAlert(false);
    setRealtimePayload(null);
  }, []);

  const updateBookingStatus = useCallback(async (bookingId, newStatus) => {
    const id = expertIdRef.current;
    if (id == null || bookingId == null || !newStatus) {
      return { ok: false, error: new Error('Missing booking update arguments') };
    }

    const bookingKey = String(bookingId);
    let previousRow = null;
    setError(null);
    setStatusUpdatingById((prev) => ({ ...prev, [bookingKey]: true }));
    setBookings((prev) =>
      prev.map((b) => {
        if (String(b.id) !== bookingKey) return b;
        previousRow = b;
        return {
          ...b,
          status: newStatus,
          updated_at: new Date().toISOString(),
        };
      })
    );

    try {
      const { data, error: uErr } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)
        .eq('expert_id', id)
        .select('*')
        .maybeSingle();
      if (uErr) throw uErr;

      if (data) {
        setBookings((prev) =>
          prev.map((b) => (String(b.id) === bookingKey ? { ...b, ...data } : b))
        );
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return { ok: true };
    } catch (e) {
      if (previousRow) {
        setBookings((prev) =>
          prev.map((b) => (String(b.id) === bookingKey ? previousRow : b))
        );
      }
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err.message);
      return { ok: false, error: err };
    } finally {
      setStatusUpdatingById((prev) => {
        const next = { ...prev };
        delete next[bookingKey];
        return next;
      });
    }
  }, []);

  const applyRechargeSuccess = useCallback(async (amountInRupees, paymentInfo, options = {}) => {
    const id = expertIdRef.current;
    if (id == null) return;

    const { skipDbWrites = false, skipTxInsert = false } = options;

    const nowIso = new Date().toISOString();
    const amount = Number(amountInRupees);
    const tx = {
      id: `local-${nowIso}`,
      created_at: nowIso,
      transaction_type: 'credit',
      amount,
      reason: 'wallet_recharge',
      description: 'Wallet Recharge',
      user_id: id,
      user_type: 'expert',
      payment_id: paymentInfo?.razorpay_payment_id || paymentInfo?.payment_id || null,
    };
    const nextBalance = Number(walletBalanceRef.current || 0) + amount;

    // Optimistic wallet update to keep UI instant after payment success.
    setWalletBalance(nextBalance);
    if (!skipTxInsert) {
      setWalletTransactions((prev) => [tx, ...(Array.isArray(prev) ? prev : [])].slice(0, 20));
    }

    if (!skipDbWrites) {
      try {
        await Promise.all([
          supabase
            .from('experts')
            .update({ wallet_balance: nextBalance })
            .eq('id', id),
          supabase.from('wallet_transactions').insert({
            user_id: id,
            user_type: 'expert',
            amount,
            transaction_type: 'credit',
            reason: 'wallet_recharge',
            description: `Wallet Recharge${tx.payment_id ? ` (${tx.payment_id})` : ''}`,
          }),
        ]);
      } catch (e) {
        setWalletTxError(e?.message || String(e));
        // Keep optimistic value visible; background refresh can reconcile any mismatch.
      }
    }
  }, []);

  const handleRecharge = useCallback(async (amountInRupees) => {
    const id = expertIdRef.current;
    const amount = Number(amountInRupees);
    if (id == null || !Number.isFinite(amount) || amount <= 0) {
      return { ok: false, code: 'INVALID_AMOUNT', error: new Error('Invalid recharge amount') };
    }

    setRechargeLoading(true);
    setWalletTxError(null);
    let checkoutSucceeded = false;
    try {
      const sessionRes = await supabase.auth.getSession();
      const session = sessionRes?.data?.session ?? sessionRes?.session ?? null;
      const accessToken = session?.access_token;
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

      if (!accessToken) {
        return { ok: false, code: 'INIT_FAILED', error: new Error('Session expired. Please login again.') };
      }

      const attemptId = `wallet_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const order = await createWalletOrderViaEdge({
        amountInRupees: amount,
        attemptId,
        accessToken,
        anonKey,
        expertId: id,
      });

      const checkout = await openRazorpayCheckout({
        key: order?.key_id,
        orderId: order?.order_id,
        amountInPaise: order?.amount_paise,
        expert: expertProfileRef.current || {},
      });

      if (!checkout.ok) {
        return {
          ok: false,
          code: checkout.isCancelled ? 'CANCELLED' : 'PAYMENT_FAILED',
          error: checkout.error,
        };
      }

      checkoutSucceeded = true;
      // Optimistic wallet balance only (no DB writes). Confirm edge will reconcile.
      await applyRechargeSuccess(amount, checkout.payment, { skipDbWrites: true, skipTxInsert: true });

      const razorpayPaymentId = checkout.payment?.razorpay_payment_id || checkout.payment?.payment_id;
      const confirmRes = await confirmWalletRechargeViaEdge({
        orderId: order?.order_id,
        razorpayPaymentId,
        accessToken,
        anonKey,
      });

      const newBalance = Number(confirmRes?.new_balance ?? 0);
      setWalletBalance(newBalance);
      await loadWalletTransactions();
      return { ok: true, amount };
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      return {
        ok: false,
        code: checkoutSucceeded ? 'PAYMENT_FAILED' : 'INIT_FAILED',
        error: err,
      };
    } finally {
      setRechargeLoading(false);
    }
  }, [applyRechargeSuccess, loadWalletTransactions]);

  return {
    walletBalance,
    bookings,
    walletTransactions,
    walletTxLoading,
    walletTxError,
    rechargeLoading,
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
    loadWalletTransactions,
    refresh,
    isLowBalance,
    lowBalanceThreshold: LOW_BALANCE_INR,
  };
}
