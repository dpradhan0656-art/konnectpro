/**
 * Gross payment split (Razorpay India, integer paise).
 * Business rule: Expert 81% + Kshatryx 9.5% + partner pool 9.5% (= 100%).
 * Partner pool remainder (after flooring Kshatryx & expert) stays in the pool; optional area-head
 * commission (max 9.5% of gross) is deducted only from that pool.
 *
 * Mirrors: expert-expo-app/src/services/paymentSplitService.js, supabase/functions/_shared/paymentSplitService.ts
 */

export const EXPERT_GROSS_BPS = 8100;
export const KSHATRYX_GROSS_BPS = 950;
export const PARTNER_GROSS_BPS = 950;
export const BPS_DENOMINATOR = 10000;
export const MAX_AREA_HEAD_COMMISSION_PCT = 9.5;

/** Legacy name: combined platform take (9.5% + 9.5% = 19%) */
export const LEGACY_PLATFORM_COMBINED_BPS = KSHATRYX_GROSS_BPS + PARTNER_GROSS_BPS;

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
 * Canonical four-way split on gross job total (paise).
 *
 * @param {number} totalPaise
 * @param {number|undefined|null} [areaHeadCommissionPercentage] — percent of gross for area head (capped at 9.5%; taken only from partner pool)
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

  const kshatryxPaise = Math.floor((total * KSHATRYX_GROSS_BPS) / BPS_DENOMINATOR);
  const expertPaise = Math.floor((total * EXPERT_GROSS_BPS) / BPS_DENOMINATOR);
  const partnerPoolPaise = total - kshatryxPaise - expertPaise;

  const pct = clampAreaHeadCommissionPct(areaHeadCommissionPercentage);
  let areaHeadPaise = 0;
  if (pct > 0) {
    areaHeadPaise = Math.floor((total * pct) / 100);
    if (areaHeadPaise > partnerPoolPaise) areaHeadPaise = partnerPoolPaise;
  }
  const partnerPaise = partnerPoolPaise - areaHeadPaise;

  return {
    totalPaise: total,
    expertPaise,
    kshatryxPaise,
    partnerPaise,
    areaHeadPaise,
    partnerPoolPaise,
    expertBps: EXPERT_GROSS_BPS,
    kshatryxBps: KSHATRYX_GROSS_BPS,
    partnerBps: PARTNER_GROSS_BPS,
  };
}

/**
 * Back-compat: older two-bucket shape (platform = Kshatryx + Partner pool = 19%).
 *
 * @param {number} totalPaise
 * @param {number|undefined|null} [areaHeadCommissionPercentage]
 */
export function splitPaymentAmountPaise(totalPaise, areaHeadCommissionPercentage) {
  const s = splitGrossPaymentPaise(totalPaise, areaHeadCommissionPercentage);
  return {
    totalPaise: s.totalPaise,
    platformPaise: s.kshatryxPaise + s.partnerPaise + s.areaHeadPaise,
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
