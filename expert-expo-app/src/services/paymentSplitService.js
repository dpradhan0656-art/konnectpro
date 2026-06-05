/**
 * Gross payment split (Razorpay India, integer paise).
 *
 * Business rule (post-Bhenaji shutdown, May 2026):
 *   Expert  80%
 *   Kshatryx (DeepakHQ pool) 20%
 *
 * Field-partner ("Bhenaji") layer retired. Area-head commission is the only
 * sub-distribution, decided by super admin in DeepakHQ → Area Commanders.
 * The configured commander rate is a percentage of the Kshatryx pool,
 * not of the gross job amount.
 *
 * Mirrors: ../../../src/services/paymentSplitService.js (repo root)
 * Edge mirror: supabase/functions/_shared/paymentSplitService.ts
 */

export const EXPERT_GROSS_BPS = 8000;
export const KSHATRYX_GROSS_BPS = 2000;
export const PARTNER_GROSS_BPS = 0;
export const BPS_DENOMINATOR = 10000;
export const MAX_AREA_HEAD_COMMISSION_PCT = 49;
export const LEGACY_PLATFORM_COMBINED_BPS = KSHATRYX_GROSS_BPS;

function assertNonNegativeIntegerPaise(n) {
  const x = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(x) || x < 0 || !Number.isInteger(x)) {
    throw new Error('Amount (paise) must be a non-negative integer');
  }
  return x;
}

function clampAreaHeadCommissionPct(pct) {
  if (pct == null || pct === '') return 0;
  const x = typeof pct === 'number' ? pct : Number(pct);
  if (!Number.isFinite(x) || x <= 0) return 0;
  return Math.min(x, MAX_AREA_HEAD_COMMISSION_PCT);
}

/**
 * @param {number} totalPaise
 * @param {number|undefined|null} [areaHeadCommissionPercentage]
 */
export function splitGrossPaymentPaise(totalPaise, areaHeadCommissionPercentage) {
  const total = assertNonNegativeIntegerPaise(totalPaise);

  const expertPaise = Math.floor((total * EXPERT_GROSS_BPS) / BPS_DENOMINATOR);
  const kshatryxPoolPaise = total - expertPaise;

  const pct = clampAreaHeadCommissionPct(areaHeadCommissionPercentage);
  let areaHeadPaise = 0;
  if (pct > 0) {
    areaHeadPaise = Math.floor((kshatryxPoolPaise * pct) / 100);
  }
  const kshatryxPaise = kshatryxPoolPaise - areaHeadPaise;

  return {
    totalPaise: total,
    expertPaise,
    kshatryxPaise,
    partnerPaise: 0,
    areaHeadPaise,
    partnerPoolPaise: 0,
    expertBps: EXPERT_GROSS_BPS,
    kshatryxBps: KSHATRYX_GROSS_BPS,
    partnerBps: PARTNER_GROSS_BPS,
  };
}

/** Legacy two-bucket shape (platform = 20% kshatryx pool). */
export function splitPaymentAmountPaise(totalPaise, areaHeadCommissionPercentage) {
  const s = splitGrossPaymentPaise(totalPaise, areaHeadCommissionPercentage);
  return {
    totalPaise: s.totalPaise,
    platformPaise: s.kshatryxPaise + s.areaHeadPaise,
    expertPaise: s.expertPaise,
    platformBps: LEGACY_PLATFORM_COMBINED_BPS,
  };
}

export function splitGrossPaymentRupees(totalRupees, areaHeadCommissionPercentage) {
  const r = typeof totalRupees === 'number' ? totalRupees : Number(totalRupees);
  if (!Number.isFinite(r) || r < 0) {
    throw new Error('Amount (rupees) must be a non-negative finite number');
  }
  const totalPaise = Math.round(r * 100);
  return { totalRupees: r, ...splitGrossPaymentPaise(totalPaise, areaHeadCommissionPercentage) };
}

export function splitPaymentAmountRupees(totalRupees, areaHeadCommissionPercentage) {
  const r = typeof totalRupees === 'number' ? totalRupees : Number(totalRupees);
  if (!Number.isFinite(r) || r < 0) {
    throw new Error('Amount (rupees) must be a non-negative finite number');
  }
  const totalPaise = Math.round(r * 100);
  return { totalRupees: r, ...splitPaymentAmountPaise(totalPaise, areaHeadCommissionPercentage) };
}
