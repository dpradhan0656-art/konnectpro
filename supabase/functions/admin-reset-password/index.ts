import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return Response.json({ error: 'Invalid or expired token' }, { status: 401, headers: corsHeaders });
    }

    const { data: adminRow } = await supabaseClient.from('app_admin').select('user_id').eq('user_id', user.id).limit(1).single();
    if (!adminRow) {
      return Response.json({ error: 'Not authorized. Admin access required.' }, { status: 403, headers: corsHeaders });
    }

    const { user_id, new_password } = await req.json();
    if (!user_id || !new_password || typeof new_password !== 'string' || new_password.length < 6) {
      return Response.json({ error: 'user_id and new_password (min 6 chars) required' }, { status: 400, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user_id, { password: new_password });

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 400, headers: corsHeaders });
    }

    return Response.json({ success: true, message: 'Password updated successfully' }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500, headers: corsHeaders });
  }
});
