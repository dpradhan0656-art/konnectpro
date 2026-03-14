import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function createRazorpayOrder(amountPaise: number, expertId: number, receipt: string) {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID');
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!keyId || !keySecret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set');
  }
  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: { expert_id: String(expertId) },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay order failed: ${res.status} ${err}`);
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
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return Response.json({ error: 'Invalid or expired token' }, { status: 401, headers: corsHeaders });
    }

    const { data: expert, error: expertError } = await supabase
      .from('experts')
      .select('id, status')
      .eq('user_id', user.id)
      .single();

    if (expertError || !expert || expert.status !== 'approved') {
      return Response.json({ error: 'Expert not found or not approved' }, { status: 403, headers: corsHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const amountRupees = Number(body?.amount);
    const amountPaise = Math.round(amountRupees * 100);
    const minPaise = 100;   // ₹1
    const maxPaise = 100000 * 100; // ₹1,00,000

    if (!Number.isFinite(amountPaise) || amountPaise < minPaise || amountPaise > maxPaise) {
      return Response.json({ error: 'Invalid amount. Send amount in rupees (e.g. 500, 1000). Min ₹1, max ₹1,00,000.' }, { status: 400, headers: corsHeaders });
    }

    const receipt = `wallet_${expert.id}_${Date.now()}`;
    const order = await createRazorpayOrder(amountPaise, expert.id, receipt);

    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    return Response.json({
      order_id: order.id,
      amount_paise: amountPaise,
      currency: 'INR',
      key_id: keyId,
    }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500, headers: corsHeaders });
  }
});
