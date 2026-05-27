import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function assertAdmin(req: Request, supabaseUrl: string, anonKey: string, serviceKey: string) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders });

  const supabaseClient = createClient(supabaseUrl, anonKey);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
  if (authError || !user) throw new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401, headers: corsHeaders });

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const { data: adminRow } = await supabaseAdmin
    .from('app_admin')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!adminRow) throw new Response(JSON.stringify({ error: 'Not authorized. Admin access required.' }), { status: 403, headers: corsHeaders });

  return { supabaseAdmin, adminUser: user };
}

async function findUserByEmail(supabaseAdmin: ReturnType<typeof createClient>, email: string) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data?.users?.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (!data?.users || data.users.length < 1000) break;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseServiceKey) {
      return Response.json({ error: 'Server misconfigured: SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500, headers: corsHeaders });
    }

    const { supabaseAdmin } = await assertAdmin(req, supabaseUrl, supabaseAnonKey, supabaseServiceKey);
    const { expert_id, email, password } = await req.json();
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!expert_id || !cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return Response.json({ error: 'expert_id and valid email are required' }, { status: 400, headers: corsHeaders });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return Response.json({ error: 'password min 8 chars required' }, { status: 400, headers: corsHeaders });
    }

    const { data: expert, error: expertError } = await supabaseAdmin
      .from('experts')
      .select('id, name, email, user_id')
      .eq('id', expert_id)
      .maybeSingle();
    if (expertError) throw expertError;
    if (!expert) {
      return Response.json({ error: 'Expert row not found' }, { status: 404, headers: corsHeaders });
    }

    let authUserId = expert.user_id as string | null;
    if (authUserId) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: { role: 'expert', expert_id: String(expert_id), default_password_set: true },
      });
      if (error) throw error;
    } else {
      let createdUser = null;
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: { role: 'expert', expert_id: String(expert_id), default_password_set: true },
      });

      if (createError) {
        const existing = await findUserByEmail(supabaseAdmin, cleanEmail);
        if (existing) {
          return Response.json(
            {
              error:
                'An auth user with this email already exists but is not linked to this expert. Link/verify the account manually before approval to avoid resetting another user password.',
            },
            { status: 409, headers: corsHeaders }
          );
        }
        throw createError;
      } else {
        createdUser = createData.user;
      }

      authUserId = createdUser?.id ?? null;
      if (!authUserId) throw new Error('Could not resolve auth user id.');
    }

    const { error: linkError } = await supabaseAdmin
      .from('experts')
      .update({ user_id: authUserId, email: cleanEmail })
      .eq('id', expert_id);
    if (linkError) throw linkError;

    return Response.json(
      { success: true, user_id: authUserId, email: cleanEmail, default_password_set: true },
      { headers: corsHeaders }
    );
  } catch (err) {
    if (err instanceof Response) return err;
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500, headers: corsHeaders });
  }
});
