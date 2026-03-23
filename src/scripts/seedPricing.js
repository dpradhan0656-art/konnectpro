/**
 * Seed mock dynamic pricing for Jabalpur, Bhopal, Sagar, Jhansi.
 *
 * Prerequisites:
 *   - Run migration: `supabase/migrations/20250308100000_dynamic_pricing_schema.sql`
 *   - Env: VITE_SUPABASE_URL (or SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage (from repo root):
 *   npm run seed:pricing
 *
 * Uses service role to bypass RLS for inserts. Do not commit the service role key.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MOCK_CITIES = [
  { name: 'Jabalpur', state: 'Madhya Pradesh', is_active: true },
  { name: 'Bhopal', state: 'Madhya Pradesh', is_active: true },
  { name: 'Sagar', state: 'Madhya Pradesh', is_active: true },
  { name: 'Jhansi', state: 'Uttar Pradesh', is_active: true },
];

/** Per-city multiplier applied to each service base_price to build dynamic_price */
const CITY_MULTIPLIERS = {
  Jabalpur: 1.0,
  Bhopal: 1.08,
  Sagar: 0.95,
  Jhansi: 1.05,
};

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error(
      '[seedPricing] Missing VITE_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env / .env.local'
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('[seedPricing] Upserting cities...');
  const { data: upsertedCities, error: cityErr } = await supabase
    .from('cities')
    .upsert(MOCK_CITIES, { onConflict: 'name' })
    .select('id, name');

  if (cityErr) {
    console.error('[seedPricing] cities upsert failed:', cityErr.message);
    process.exit(1);
  }

  const cityByName = Object.fromEntries((upsertedCities || []).map((c) => [c.name, c.id]));

  console.log('[seedPricing] Loading active services...');
  const { data: services, error: svcErr } = await supabase
    .from('services')
    .select('id, name, base_price')
    .eq('is_active', true)
    .limit(20);

  if (svcErr) {
    console.error('[seedPricing] services select failed:', svcErr.message);
    process.exit(1);
  }

  if (!services?.length) {
    console.warn('[seedPricing] No active services found. Add services in admin, then re-run.');
    process.exit(0);
  }

  const rows = [];
  for (const city of MOCK_CITIES) {
    const cityId = cityByName[city.name];
    if (!cityId) {
      console.warn('[seedPricing] Missing city id for', city.name);
      continue;
    }
    const mult = CITY_MULTIPLIERS[city.name] ?? 1;
    for (const svc of services) {
      const base = Number(svc.base_price ?? 199);
      const dynamic = Math.max(99, Math.round(base * mult));
      const platformFee = Math.round(dynamic * 0.2 * 100) / 100;
      rows.push({
        city_id: cityId,
        service_id: svc.id,
        dynamic_price: dynamic,
        platform_fee: platformFee,
        is_surge_active: false,
        updated_at: new Date().toISOString(),
      });
    }
  }

  console.log('[seedPricing] Upserting', rows.length, 'city_service_pricing rows...');
  const { error: priceErr } = await supabase.from('city_service_pricing').upsert(rows, {
    onConflict: 'city_id,service_id',
  });

  if (priceErr) {
    console.error('[seedPricing] city_service_pricing upsert failed:', priceErr.message);
    process.exit(1);
  }

  console.log('[seedPricing] Done. Cities:', MOCK_CITIES.map((c) => c.name).join(', '));
  console.log('[seedPricing] Services linked:', services.length, '(each city × service).');
}

main().catch((e) => {
  console.error('[seedPricing] Fatal:', e);
  process.exit(1);
});
