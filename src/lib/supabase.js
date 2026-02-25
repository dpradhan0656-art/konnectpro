import { createClient } from '@supabase/supabase-js';

// 1. Environment Variables Load karna
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Error Check (Debugging ke liye)
if (!supabaseUrl || !supabaseKey) {
  console.error("🚨 Supabase URL or Key is MISSING! Check your .env file.");
}

// 3. Client Create karna
export const supabase = createClient(supabaseUrl, supabaseKey);