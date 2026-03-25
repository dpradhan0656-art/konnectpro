/**
 * Payment orchestration helpers for wallet recharge.
 * Wallet recharge is orchestrated via Supabase Edge Functions.
 */

let RazorpayCheckoutModule = null;
try {
  // Keep import lazy-safe so app can still run in environments where the native module is unavailable.
  // eslint-disable-next-line global-require
  RazorpayCheckoutModule = require('react-native-razorpay').default;
} catch {
  RazorpayCheckoutModule = null;
}

const SUPABASE_BASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callEdgeJson({ url, accessToken, anonKey, body, retries = 2, timeoutMs = 12000 }) {
  if (!url) throw new Error('Edge URL missing');
  const token = accessToken ? String(accessToken) : '';
  const key = anonKey ? String(anonKey) : '';

  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller
        ? setTimeout(() => controller.abort(), timeoutMs)
        : null;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(key ? { apikey: key } : {}),
        },
        body: JSON.stringify(body ?? {}),
        signal: controller ? controller.signal : undefined,
      });

      if (timeoutId) clearTimeout(timeoutId);

      const text = await res.text();
      let json;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        const msg =
          json?.error?.description ||
          json?.error ||
          json?.details ||
          json?.message ||
          text ||
          `Edge request failed (${res.status})`;
        throw new Error(msg);
      }

      return json;
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      if (attempt < retries) {
        await delay(250 * (attempt + 1));
      }
    }
  }

  throw lastErr || new Error('Edge request failed');
}

export async function createWalletOrderViaEdge({
  amountInRupees,
  attemptId,
  accessToken,
  anonKey,
}) {
  const amount = Number(amountInRupees);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid recharge amount');
  }
  if (!SUPABASE_BASE_URL) throw new Error('EXPO_PUBLIC_SUPABASE_URL missing');
  const key = anonKey || SUPABASE_ANON_KEY;
  if (!key) throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY missing');

  const url = `${SUPABASE_BASE_URL}/functions/v1/create-wallet-order`;
  const payload = { amount, attempt_id: attemptId };

  return callEdgeJson({
    url,
    accessToken,
    anonKey: key,
    body: payload,
    retries: 2,
    timeoutMs: 15000,
  });
}

export async function confirmWalletRechargeViaEdge({
  orderId,
  razorpayPaymentId,
  accessToken,
  anonKey,
}) {
  if (!SUPABASE_BASE_URL) throw new Error('EXPO_PUBLIC_SUPABASE_URL missing');
  const key = anonKey || SUPABASE_ANON_KEY;
  if (!key) throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY missing');

  const url = `${SUPABASE_BASE_URL}/functions/v1/confirm-wallet-recharge`;
  const payload = { order_id: orderId, razorpay_payment_id: razorpayPaymentId };

  return callEdgeJson({
    url,
    accessToken,
    anonKey: key,
    body: payload,
    retries: 2,
    timeoutMs: 15000,
  });
}

/**
 * Mock server call to create a Razorpay order.
 * @param {{ amountInRupees: number; expertId: string | number | null | undefined }} args
 */
export async function createMockRazorpayOrder({ amountInRupees, expertId }) {
  const amount = Number(amountInRupees);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid recharge amount');
  }

  await new Promise((resolve) => setTimeout(resolve, 350));

  return {
    orderId: `order_mock_${Date.now()}`,
    amountInPaise: Math.round(amount * 100),
    currency: 'INR',
    receipt: `exp_${expertId || 'na'}_${Date.now()}`,
  };
}

/**
 * Opens native Razorpay checkout.
 * @param {{
 * key?: string;
 * orderId: string;
 * amountInPaise: number;
 * expert: { name?: string | null; email?: string | null; phone?: string | null; mobile?: string | null };
 * }} args
 */
export async function openRazorpayCheckout({ key, orderId, amountInPaise, expert }) {
  if (!RazorpayCheckoutModule?.open) {
    return {
      ok: false,
      isCancelled: false,
      error: new Error('Razorpay SDK unavailable in current build'),
    };
  }

  const options = {
    key: key || 'rzp_test_mock_key_123456',
    amount: amountInPaise,
    currency: 'INR',
    order_id: orderId,
    name: 'Kshatryx Technologies',
    description: 'Expert Wallet Recharge',
    prefill: {
      name: expert?.name || '',
      email: expert?.email || '',
      contact: expert?.phone || expert?.mobile || '',
    },
    theme: { color: '#0d9488' },
  };

  try {
    const payment = await RazorpayCheckoutModule.open(options);
    return { ok: true, payment };
  } catch (e) {
    const msg = e?.description || e?.message || String(e);
    const lower = String(msg).toLowerCase();
    const cancelled =
      lower.includes('cancel') ||
      lower.includes('dismiss') ||
      lower.includes('close') ||
      String(e?.code || '').includes('PAYMENT_CANCELLED');
    return { ok: false, isCancelled: cancelled, error: e instanceof Error ? e : new Error(msg) };
  }
}
