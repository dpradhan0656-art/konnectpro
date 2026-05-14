/**
 * Gross split for Edge Functions / Razorpay Route.
 *
 * Business rule (post-Bhenaji shutdown, May 2026):
 *   Expert 80%, Kshatryx 20%.
 *
 * Field-partner ("Bhenaji") layer retired. Area-head commission is the only
 * sub-distribution and is deducted from the 20% Kshatryx pool (max 20%).
 *
 * Mirrors: src/services/paymentSplitService.js,
 *          expert-expo-app/src/services/paymentSplitService.js
 */

export const EXPERT_GROSS_BPS = 8000;
export const KSHATRYX_GROSS_BPS = 2000;
export const PARTNER_GROSS_BPS = 0;
export const BPS_DENOMINATOR = 10000;
export const MAX_AREA_HEAD_COMMISSION_PCT = 20;
export const LEGACY_PLATFORM_COMBINED_BPS = KSHATRYX_GROSS_BPS;

function assertNonNegativeIntegerPaise(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x) || x < 0 || !Number.isInteger(x)) {
    throw new Error("Amount (paise) must be a non-negative integer");
  }
  return x;
}

function clampAreaHeadCommissionPct(pct: unknown): number {
  if (pct == null || pct === "") return 0;
  const x = typeof pct === "number" ? pct : Number(pct);
  if (!Number.isFinite(x) || x <= 0) return 0;
  return Math.min(x, MAX_AREA_HEAD_COMMISSION_PCT);
}

export type GrossSplitPaise = {
  totalPaise: number;
  expertPaise: number;
  kshatryxPaise: number;
  partnerPaise: number;
  areaHeadPaise: number;
  partnerPoolPaise: number;
  expertBps: number;
  kshatryxBps: number;
  partnerBps: number;
};

export function splitGrossPaymentPaise(
  totalPaise: number,
  areaHeadCommissionPercentage?: number | null
): GrossSplitPaise {
  const total = assertNonNegativeIntegerPaise(totalPaise);
  const expertPaise = Math.floor((total * EXPERT_GROSS_BPS) / BPS_DENOMINATOR);
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
    partnerPaise: 0,
    areaHeadPaise,
    partnerPoolPaise: 0,
    expertBps: EXPERT_GROSS_BPS,
    kshatryxBps: KSHATRYX_GROSS_BPS,
    partnerBps: PARTNER_GROSS_BPS,
  };
}

export type LegacySplitPaiseResult = {
  totalPaise: number;
  platformPaise: number;
  expertPaise: number;
  platformBps: number;
};

export function splitPaymentAmountPaise(
  totalPaise: number,
  areaHeadCommissionPercentage?: number | null
): LegacySplitPaiseResult {
  const s = splitGrossPaymentPaise(totalPaise, areaHeadCommissionPercentage);
  return {
    totalPaise: s.totalPaise,
    platformPaise: s.kshatryxPaise + s.areaHeadPaise,
    expertPaise: s.expertPaise,
    platformBps: LEGACY_PLATFORM_COMBINED_BPS,
  };
}

export function splitGrossPaymentRupees(
  totalRupees: number,
  areaHeadCommissionPercentage?: number | null
): GrossSplitPaise & { totalRupees: number } {
  const r = typeof totalRupees === "number" ? totalRupees : Number(totalRupees);
  if (!Number.isFinite(r) || r < 0) {
    throw new Error("Amount (rupees) must be a non-negative finite number");
  }
  const totalPaise = Math.round(r * 100);
  return { totalRupees: r, ...splitGrossPaymentPaise(totalPaise, areaHeadCommissionPercentage) };
}

export function splitPaymentAmountRupees(
  totalRupees: number,
  areaHeadCommissionPercentage?: number | null
): LegacySplitPaiseResult & { totalRupees: number } {
  const r = typeof totalRupees === "number" ? totalRupees : Number(totalRupees);
  if (!Number.isFinite(r) || r < 0) {
    throw new Error("Amount (rupees) must be a non-negative finite number");
  }
  const totalPaise = Math.round(r * 100);
  return { totalRupees: r, ...splitPaymentAmountPaise(totalPaise, areaHeadCommissionPercentage) };
}
