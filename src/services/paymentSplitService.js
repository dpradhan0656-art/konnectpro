/**
 * Gross payment split (Razorpay India, integer paise).
 *
 * Business rule (post-Bhenaji shutdown, May 2026):
 *   Expert  80%
 *   Kshatryx (DeepakHQ pool) 20%
 *
 * Field-partner ("Bhenaji") layer has been retired. Area-head commission is the
 * only sub-distribution left and is decided per-head by the super admin in
 * DeepakHQ → Area Commanders. It is deducted from the 20% Kshatryx pool
 * (capped at 20%); Kshatryx keeps whatever remains.
 *
 * Legacy exports (`PARTNER_GROSS_BPS`, `partnerPaise`, `partnerPoolPaise`,
 * `partnerBps`) are kept zero-valued so old callers/migrations don't crash;
 * remove them once the historical DB rows are archived.
 *
 * Mirrors: expert-expo-app/src/services/paymentSplitService.js,
 *          supabase/functions/_shared/paymentSplitService.ts
 */

export const EXPERT_GROSS_BPS = 8000;
export const KSHATRYX_GROSS_BPS = 2000;
// Deprecated — kept at 0 only for back-compat with old callers/tests.
export const PARTNER_GROSS_BPS = 0;
export const BPS_DENOMINATOR = 10000;
export const MAX_AREA_HEAD_COMMISSION_PCT = 20;

/** Legacy: combined "platform take" = full Kshatryx pool (20%). */
export const LEGACY_PLATFORM_COMBINED_BPS = KSHATRYX_GROSS_BPS;

/**
 * @param {unknown} n
 * @returns {number}
 */
function assertNonNegativeIntegerPaise(n) {
  const x = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(x) || x < 0 || !Number.isInteger(x)) {
    throw new Error('Amount (paise) must be a non-negative integer');
  }
  return x;
}

/**
 * @param {unknown} pct
 * @returns {number}
 */
function clampAreaHeadCommissionPct(pct) {
  if (pct == null || pct === '') return 0;
  const x = typeof pct === 'number' ? pct : Number(pct);
  if (!Number.isFinite(x) || x <= 0) return 0;
  return Math.min(x, MAX_AREA_HEAD_COMMISSION_PCT);
}

/**
 * Canonical split on gross job total (paise).
 *
 * @param {number} totalPaise
 * @param {number|undefined|null} [areaHeadCommissionPercentage] — percent of gross for area head
 *        (0–20, capped; cut comes from the 20% Kshatryx pool so kshatryxPaise is reduced)
 * @returns {{
 *   totalPaise: number,
 *   expertPaise: number,
 *   kshatryxPaise: number,
 *   partnerPaise: number,
 *   areaHeadPaise: number,
 *   partnerPoolPaise: number,
 *   expertBps: number,
 *   kshatryxBps: number,
 *   partnerBps: number,
 * }}
 */
export function splitGrossPaymentPaise(totalPaise, areaHeadCommissionPercentage) {
  const total = assertNonNegativeIntegerPaise(totalPaise);

  const expertPaise = Math.floor((total * EXPERT_GROSS_BPS) / BPS_DENOMINATOR);
  // Kshatryx pool absorbs rounding remainder so 100% always reconciles.
  const kshatryxPoolPaise = total - expertPaise;

  const pct = clampAreaHeadCommissionPct(areaHeadCommissionPercentage);
  let areaHeadPaise = 0;
  if (pct > 0) {
    areaHeadPaise = Math.floor((total * pct) / 100);
    if (areaHeadPaise > kshatryxPoolPaise) areaHeadPaise = kshatryxPoolPaise;
  }
  const kshatryxPaise = kshatryxPoolPaise - areaHeadPaise;

  return {
    totalPaise: total,
    expertPaise,
    kshatryxPaise,
    // Legacy fields — partner layer retired; always 0 so old callers don't blow up.
    partnerPaise: 0,
    areaHeadPaise,
    partnerPoolPaise: 0,
    expertBps: EXPERT_GROSS_BPS,
    kshatryxBps: KSHATRYX_GROSS_BPS,
    partnerBps: PARTNER_GROSS_BPS,
  };
}

/**
 * Back-compat: older two-bucket shape (platform = Kshatryx pool + area-head cut = 20%).
 *
 * @param {number} totalPaise
 * @param {number|undefined|null} [areaHeadCommissionPercentage]
 */
export function splitPaymentAmountPaise(totalPaise, areaHeadCommissionPercentage) {
  const s = splitGrossPaymentPaise(totalPaise, areaHeadCommissionPercentage);
  return {
    totalPaise: s.totalPaise,
    platformPaise: s.kshatryxPaise + s.areaHeadPaise,
    expertPaise: s.expertPaise,
    platformBps: LEGACY_PLATFORM_COMBINED_BPS,
  };
}

/**
 * Legacy rupees entry → two-bucket shape (`platformPaise` + `expertPaise`).
 * @param {number} totalRupees
 * @param {number|undefined|null} [areaHeadCommissionPercentage]
 */
export function splitPaymentAmountRupees(totalRupees, areaHeadCommissionPercentage) {
  const r = typeof totalRupees === 'number' ? totalRupees : Number(totalRupees);
  if (!Number.isFinite(r) || r < 0) {
    throw new Error('Amount (rupees) must be a non-negative finite number');
  }
  const totalPaise = Math.round(r * 100);
  return { totalRupees: r, ...splitPaymentAmountPaise(totalPaise, areaHeadCommissionPercentage) };
}

/**
 * @param {number} totalRupees
 * @param {number|undefined|null} [areaHeadCommissionPercentage]
 */
export function splitGrossPaymentRupees(totalRupees, areaHeadCommissionPercentage) {
  const r = typeof totalRupees === 'number' ? totalRupees : Number(totalRupees);
  if (!Number.isFinite(r) || r < 0) {
    throw new Error('Amount (rupees) must be a non-negative finite number');
  }
  const totalPaise = Math.round(r * 100);
  return {
    totalRupees: r,
    ...splitGrossPaymentPaise(totalPaise, areaHeadCommissionPercentage),
  };
}
