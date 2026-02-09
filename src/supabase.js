import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// अगर URL नहीं मिलेगा तो यह लाइन एरर देगी, जो अभी हो रहा है
export const supabase = createClient(supabaseUrl, supabaseKey)