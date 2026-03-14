import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchRazorpayPayment(paymentId: string) {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID');
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!keyId || !keySecret) throw new Error('Razorpay secrets not set');
  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: { 'Authorization': `Basic ${auth}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Razorpay payment fetch failed: ${res.status} ${t}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'Missing Authorization header' }, { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return Response.json({ error: 'Invalid or expired token' }, { status: 401, headers: corsHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const orderId = body?.order_id;
    const razorpayPaymentId = body?.razorpay_payment_id;
    if (!orderId || !razorpayPaymentId) {
      return Response.json({ error: 'order_id and razorpay_payment_id required' }, { status: 400, headers: corsHeaders });
    }

    const payment = await fetchRazorpayPayment(razorpayPaymentId);
    if (payment.status !== 'captured') {
      return Response.json({ error: 'Payment not captured' }, { status: 400, headers: corsHeaders });
    }
    if (payment.order_id !== orderId) {
      return Response.json({ error: 'Order ID mismatch' }, { status: 400, headers: corsHeaders });
    }

    const amountPaise = Number(payment.amount);
    const amountRupees = amountPaise / 100;
    if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
      return Response.json({ error: 'Invalid payment amount' }, { status: 400, headers: corsHeaders });
    }

    const { data: expert, error: expertError } = await supabase
      .from('experts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (expertError || !expert) {
      return Response.json({ error: 'Expert not found' }, { status: 403, headers: corsHeaders });
    }

    const { data: existing } = await supabaseAdmin
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', expert.id)
      .eq('user_type', 'expert')
      .eq('reason', 'wallet_recharge')
      .ilike('description', `%${razorpayPaymentId}%`)
      .limit(1)
      .maybeSingle();
    if (existing) {
      const { data: cur } = await supabaseAdmin.from('experts').select('wallet_balance').eq('id', expert.id).single();
      return Response.json({ success: true, message: 'Already processed', new_balance: Number(cur?.wallet_balance ?? 0) }, { headers: corsHeaders });
    }

    const { data: currentExpert } = await supabaseAdmin.from('experts').select('wallet_balance').eq('id', expert.id).single();
    const currentBalance = Number(currentExpert?.wallet_balance ?? 0);
    const newBalance = currentBalance + amountRupees;

    const { error: updateErr } = await supabaseAdmin
      .from('experts')
      .update({ wallet_balance: newBalance })
      .eq('id', expert.id);
    if (updateErr) {
      return Response.json({ error: 'Failed to update wallet: ' + updateErr.message }, { status: 500, headers: corsHeaders });
    }

    const { error: txError } = await supabaseAdmin.from('wallet_transactions').insert({
      user_id: expert.id,
      user_type: 'expert',
      amount: amountRupees,
      transaction_type: 'credit',
      reason: 'wallet_recharge',
      description: `Wallet Recharge via Razorpay (${razorpayPaymentId})`,
      booking_id: null,
    });
    if (txError) {
      return Response.json({ error: 'Wallet updated but transaction log failed: ' + txError.message }, { status: 500, headers: corsHeaders });
    }

    return Response.json({
      success: true,
      message: 'Wallet recharged successfully',
      new_balance: newBalance,
    }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500, headers: corsHeaders });
  }
});
