import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Short localized strings for push (title + body template with {service}) */
const PUSH_COPY: Record<string, { title: string; body: string }> = {
  en: { title: 'New job assigned', body: '{service} — open the app to accept.' },
  hi: { title: 'नया काम मिला', body: '{service} — स्वीकार करने के लिए ऐप खोलें।' },
  mr: { title: 'नवीन काम आले', body: '{service} — स्वीकार करण्यासाठी अॅप उघडा.' },
  gu: { title: 'નવું કામ મળ્યું', body: '{service} — સ્વીકારવા એપ ખોલો.' },
  bn: { title: 'নতুন কাজ এসেছে', body: '{service} — গ্রহণ করতে অ্যাপ খুলুন।' },
  ta: { title: 'புதிய வேலை', body: '{service} — ஏற்க செயலியைத் திறக்கவும்.' },
  te: { title: 'కొత్త పని', body: '{service} — అంగీకరించడానికి యాప్ తెరవండి.' },
  kn: { title: 'ಹೊಸ ಕೆಲಸ', body: '{service} — ಸ್ವೀಕರಿಸಲು ಅಪ್ಲಿಕೇಶನ್ ತೆರೆಯಿರಿ.' },
  ml: { title: 'പുതിയ ജോലി', body: '{service} — സ്വീകരിക്കാൻ ആപ്പ് തുറക്കുക.' },
  pa: { title: 'ਨਵਾਂ ਕੰਮ', body: '{service} — ਸਵੀਕਾਰ ਕਰਨ ਲਈ ਐਪ ਖੋਲ੍ਹੋ।' },
  ur: { title: 'نیا کام', body: '{service} — قبول کرنے کے لیے ایپ کھولیں۔' },
  or: { title: 'ନୂଆ କାମ', body: '{service} — ଗ୍ରହଣ ପାଇଁ ଆପ୍ ଖୋଲନ୍ତୁ।' },
  as: { title: 'নতুন কাম', body: '{service} — গ্ৰহণ কৰিবলৈ এপ খোলক।' },
  ne: { title: 'नयाँ काम', body: '{service} — स्वीकार गर्न एप खोल्नुहोस्।' },
  sd: { title: 'نئون ڪم', body: '{service} — قبول ڪرڻ لاءِ ايپ کوليو۔' },
  mai: { title: 'नबका काज', body: '{service} — स्वीकार करबाक लेल एप खोलू।' },
  ks: { title: 'نٔو کأم', body: '{service} — منظور کرنٕ باپتٕ ایپ کھولیو۔' },
  kok: { title: 'नवे काम', body: '{service} — स्वीकाराक अॅप उगडात.' },
};

function resolveCopy(lang: string | null | undefined, serviceName: string) {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  const pack = PUSH_COPY[code] || PUSH_COPY.en;
  return {
    title: pack.title,
    body: pack.body.replace(/\{service\}/g, serviceName || 'Service'),
  };
}

async function isAppAdmin(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  userEmail: string | undefined
): Promise<boolean> {
  const { data, error } = await supabaseAdmin.from('app_admin').select('user_id').eq('user_id', userId).maybeSingle();
  if (!error && data?.user_id) return true;

  const raw = Deno.env.get('SUPERADMIN_EMAILS') || '';
  const allow = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const email = (userEmail || '').trim().toLowerCase();
  if (email && allow.includes(email)) return true;

  const single = (Deno.env.get('SUPERADMIN_EMAIL') || '').trim().toLowerCase();
  if (single && email === single) return true;

  return false;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'Missing Authorization' }, { status: 401, headers: corsHeaders });
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();
    if (authErr || !user) {
      return Response.json({ error: 'Invalid session' }, { status: 401, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const adminOk = await isAppAdmin(supabaseAdmin, user.id, user.email ?? undefined);
    if (!adminOk) {
      return Response.json({ error: 'Admin only' }, { status: 403, headers: corsHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const bookingId = body?.booking_id;
    const expertId = body?.expert_id;
    if (!bookingId || !expertId) {
      return Response.json({ error: 'booking_id and expert_id required' }, { status: 400, headers: corsHeaders });
    }

    const { data: booking, error: bErr } = await supabaseAdmin
      .from('bookings')
      .select('id, service_name, expert_id, status')
      .eq('id', bookingId)
      .maybeSingle();
    if (bErr || !booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404, headers: corsHeaders });
    }
    if (String(booking.expert_id) !== String(expertId)) {
      return Response.json({ error: 'expert_id does not match booking' }, { status: 400, headers: corsHeaders });
    }

    const { data: expert, error: eErr } = await supabaseAdmin
      .from('experts')
      .select('id, expo_push_token, expo_ui_lang, name')
      .eq('id', expertId)
      .maybeSingle();
    if (eErr || !expert) {
      return Response.json({ error: 'Expert not found' }, { status: 404, headers: corsHeaders });
    }

    const token = expert.expo_push_token?.trim();
    if (!token) {
      return Response.json({ ok: true, skipped: true, reason: 'no_expo_push_token' }, { headers: corsHeaders });
    }

    const serviceName = String(booking.service_name || 'Service');
    const { title, body: msgBody } = resolveCopy(expert.expo_ui_lang, serviceName);

    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title,
        body: msgBody,
        sound: 'default',
        priority: 'high',
        channelId: 'assignments',
        data: { bookingId: String(bookingId), type: 'assignment' },
      }),
    });

    const expoJson = (await expoRes.json().catch(() => ({}))) as {
      data?: Array<{ status?: string; message?: string }>;
      errors?: unknown;
    };
    if (!expoRes.ok) {
      return Response.json(
        { error: 'Expo push failed', details: expoJson },
        { status: 502, headers: corsHeaders }
      );
    }

    const tickets = Array.isArray(expoJson?.data) ? expoJson.data : [];
    const hasErr = tickets.some((t) => t?.status === 'error');
    if (hasErr) {
      return Response.json({ ok: false, expo: expoJson }, { status: 502, headers: corsHeaders });
    }

    return Response.json({ ok: true, expo: expoJson }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500, headers: corsHeaders });
  }
});
