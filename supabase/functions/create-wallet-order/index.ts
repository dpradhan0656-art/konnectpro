import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Create Razorpay order. expertUuid is the expert's id (UUID string). Receipt max 40 chars. */
async function createRazorpayOrder(amountPaise: number, expertUuid: string, receipt: string) {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID');
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!keyId || !keySecret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in Edge Function secrets.');
  }
  const credentials = `${keyId}:${keySecret}`;
  const auth = btoa(credentials);

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
      notes: { expert_uuid: expertUuid },
    }),
  });

  const responseText = await res.text();
  if (!res.ok) {
    let exactMessage = responseText;
    try {
      const parsed = JSON.parse(responseText);
      if (parsed.error?.description) exactMessage = parsed.error.description;
      else if (parsed.error?.reason) exactMessage = parsed.error.reason;
      else if (parsed.error?.message) exactMessage = parsed.error.message;
      else if (typeof parsed.error === 'string') exactMessage = parsed.error;
    } catch (_) {}
    throw new Error(exactMessage || `Razorpay API error: ${res.status}`);
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error('Invalid JSON from Razorpay');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      return Response.json(
        {
          error: 'Server config missing. SUPABASE_URL and SUPABASE_ANON_KEY must be set (auto-injected in Supabase Cloud; for local dev set in .env or Dashboard → Edge Functions → Secrets).',
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || typeof authHeader !== 'string') {
      return Response.json(
        {
          error: 'Missing Authorization header. Ensure you are logged in as an expert and the client sends: Authorization: Bearer <access_token>.',
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return Response.json(
        { error: 'Authorization header is empty. Send a valid JWT: Bearer <your_access_token>.' },
        { status: 401, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      return Response.json(
        {
          error: 'Invalid or expired token. Please sign in again.',
          details: authError.message,
        },
        { status: 401, headers: corsHeaders }
      );
    }
    if (!user) {
      return Response.json(
        { error: 'Invalid or expired token. Please sign in again.' },
        { status: 401, headers: corsHeaders }
      );
    }

    const { data: expert, error: expertError } = await supabase
      .from('experts')
      .select('id, status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (expertError) {
      return Response.json(
        { error: 'Failed to fetch expert profile.', details: expertError.message },
        { status: 500, headers: corsHeaders }
      );
    }
    if (!expert) {
      return Response.json({ error: 'Expert not found for this account.' }, { status: 403, headers: corsHeaders });
    }

    const expertUuid = expert.id == null ? '' : String(expert.id).trim();
    if (!expertUuid) {
      return Response.json(
        { error: 'Invalid expert id from database.', details: 'expert.id is empty' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Temporarily allow pending, verified, OR approved so you can test immediately
    const allowedStatuses = ['pending', 'verified', 'approved'];
    if (!allowedStatuses.includes(String(expert.status).toLowerCase())) {
      return Response.json(
        { error: `Expert status '${expert.status}' is not allowed to recharge. Allowed: pending, verified, approved.` },
        { status: 403, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => ({}));
    const amountRupees = Number(body?.amount);
    const amountPaise = Math.round(amountRupees * 100);
    const minPaise = 100;
    const maxPaise = 100000 * 100;

    if (!Number.isFinite(amountPaise) || amountPaise < minPaise || amountPaise > maxPaise) {
      return Response.json({ error: 'Invalid amount. Send amount in rupees (e.g. 500, 1000). Min ₹1, max ₹1,00,000.' }, { status: 400, headers: corsHeaders });
    }

    const receipt = `w_${Date.now()}`;
    let order: { id: string };
    try {
      order = await createRazorpayOrder(amountPaise, expertUuid, receipt);
    } catch (razorpayErr) {
      const message = razorpayErr instanceof Error ? razorpayErr.message : String(razorpayErr);
      return Response.json(
        { error: 'Razorpay error.', details: message },
        { status: 502, headers: corsHeaders }
      );
    }

    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    return Response.json({
      order_id: order.id,
      amount_paise: amountPaise,
      currency: 'INR',
      key_id: keyId,
    }, { headers: corsHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: 'Server error.', details: message }, { status: 500, headers: corsHeaders });
  }
});
