/**
 * Payment orchestration helpers for wallet recharge.
 * Backend order creation is mocked for now and will be replaced by an Edge Function.
 */

let RazorpayCheckoutModule = null;
try {
  // Keep import lazy-safe so app can still run in environments where the native module is unavailable.
  // eslint-disable-next-line global-require
  RazorpayCheckoutModule = require('react-native-razorpay').default;
} catch {
  RazorpayCheckoutModule = null;
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
