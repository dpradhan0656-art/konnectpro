/**
 * Maps Supabase Auth users to `experts` rows (same DB as Kshatr web).
 * Primary match: `experts.user_id` === auth user id (same as web ExpertLogin / ExpertDashboard).
 * Admin / area-head often create experts with `user_id` NULL but `email` set — first Google sign-in links the row
 * (requires RLS policies `experts_select_unlinked_matching_jwt_email` +
 * `experts_update_link_user_id_matching_email` in Supabase).
 */

const ACCESS_CHECK_TIMEOUT_MS = 25000;

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {import('@supabase/supabase-js').User} user
 * @returns {Promise<{ ok: true, expert: object, matchedBy: 'user_id' | 'email_auto_link' } | { ok: false, reason: string, message?: string, expert?: object }>}
 */
export async function validateExpertAccess(supabase, user) {
  return Promise.race([
    validateExpertAccessCore(supabase, user),
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              'Checking your expert profile timed out. Check your internet connection and try again.'
            )
          ),
        ACCESS_CHECK_TIMEOUT_MS
      )
    ),
  ]);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {import('@supabase/supabase-js').User} user
 */
async function validateExpertAccessCore(supabase, user) {
  const userId = user.id;
  const emailNorm = user.email?.trim().toLowerCase() ?? '';

  const { data: expert, error } = await supabase
    .from('experts')
    .select('id, status, name, email, user_id, is_online, category, kyc_status, created_at, average_rating, photo_url')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  if (expert?.status === 'approved') {
    return { ok: true, expert, matchedBy: 'user_id' };
  }

  if (expert && expert.status !== 'approved') {
    return {
      ok: false,
      reason: 'not_approved',
      expert,
      message: 'Your expert account is not approved yet. Contact admin.',
    };
  }

  // Row not linked yet: DeepakHQ / area head created expert with same email but user_id NULL.
  if (!emailNorm) {
    return {
      ok: false,
      reason: 'no_profile',
      message:
        'No expert profile found for this Google account. Ask admin to register you with the same email you use for Google, or complete expert registration on the web.',
    };
  }

  const { data: unlinkedRows, error: unlinkedErr } = await supabase
    .from('experts')
    .select('id, status, name, email, user_id, is_online, category, kyc_status, created_at, average_rating, photo_url')
    .is('user_id', null)
    .eq('email', emailNorm)
    .limit(1);

  if (unlinkedErr) throw unlinkedErr;

  const pendingLink = unlinkedRows?.[0];
  if (!pendingLink) {
    return {
      ok: false,
      reason: 'no_profile',
      message:
        'No expert profile found for this Google account. Ask admin to add you in DeepakHQ using this exact email, or complete expert registration on the web.',
    };
  }

  const { error: linkErr } = await supabase
    .from('experts')
    .update({ user_id: userId })
    .eq('id', pendingLink.id)
    .is('user_id', null);

  if (linkErr) {
    return {
      ok: false,
      reason: 'link_failed',
      message:
        'Expert profile exists but could not link to this Google sign-in. Ask admin to confirm your expert email matches your Google email exactly, and that Supabase RLS migration for expert self-link is applied.',
    };
  }

  const linked = { ...pendingLink, user_id: userId };

  if (linked.status === 'approved') {
    return { ok: true, expert: linked, matchedBy: 'email_auto_link' };
  }

  return {
    ok: false,
    reason: 'not_approved',
    expert: linked,
    message: 'Your expert account is not approved yet. Contact admin.',
  };
}
