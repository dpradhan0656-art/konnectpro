import { supabase } from '../lib/supabase';

/**
 * @param {string | number} expertId — public.experts.id
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function fetchExpertProfileMaster(expertId) {
  if (expertId == null || expertId === '') return null;
  const { data, error } = await supabase
    .from('expert_profile_master')
    .select('*')
    .eq('expert_id', String(expertId))
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

/**
 * @param {string | number} expertId
 * @param {Record<string, string | null | undefined>} fields
 */
export async function upsertExpertProfileMaster(expertId, fields) {
  if (expertId == null || expertId === '') throw new Error('expertId is required.');
  const id = String(expertId);
  let existing = null;
  try {
    existing = await fetchExpertProfileMaster(id);
  } catch {
    existing = null;
  }
  const row = {
    expert_id: id,
    residential_address: existing?.residential_address ?? null,
    bank_account_number: existing?.bank_account_number ?? null,
    ifsc_code: existing?.ifsc_code ?? null,
    bank_account_holder_name: existing?.bank_account_holder_name ?? null,
    pan_number: existing?.pan_number ?? null,
    aadhar_card_photo_url: existing?.aadhar_card_photo_url ?? null,
    ...Object.fromEntries(
      Object.entries(fields)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, typeof v === 'string' && v.trim() === '' ? null : v])
    ),
  };
  const { error } = await supabase.from('expert_profile_master').upsert(row, { onConflict: 'expert_id' });
  if (error) throw error;
}
