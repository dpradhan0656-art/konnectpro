/**
 * Maps Supabase Auth users to `experts` rows (same DB as Kshatr web).
 * Primary match: `experts.user_id` === auth user id (same as web ExpertLogin / ExpertDashboard).
 * Secondary: if no row by user_id but an expert row exists for the same email, surface a clear message
 * (profile not linked to this Google session yet).
 */

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {import('@supabase/supabase-js').User} user
 * @returns {Promise<{ ok: true, expert: object, matchedBy: 'user_id' } | { ok: false, reason: string, message?: string, expert?: object }>}
 */
export async function validateExpertAccess(supabase, user) {
  const userId = user.id;
  const email = user.email?.trim().toLowerCase() ?? '';

  const { data: expert, error } = await supabase
    .from('experts')
    .select('id, status, name, email, user_id')
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

  const authEmail = user.email?.trim() ?? '';
  const emailCandidates = [...new Set([authEmail, email].filter(Boolean))];

  /* Email fallback: may return no rows if RLS hides other experts’ emails (expected). */
  if (emailCandidates.length > 0) {
    const { data: byEmailRows, error: emailErr } = await supabase
      .from('experts')
      .select('id, status, email')
      .in('email', emailCandidates)
      .limit(1);

    if (emailErr) throw emailErr;

    const byEmail = byEmailRows?.[0];

    if (byEmail) {
      return {
        ok: false,
        reason: 'email_exists_unlinked',
        message:
          'An expert profile exists for this email but is not linked to this Google sign-in. Contact support to link your Google account.',
      };
    }
  }

  return {
    ok: false,
    reason: 'no_profile',
    message: 'No expert profile found for this account. Complete expert registration on the web first.',
  };
}
