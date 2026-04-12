/**
 * Gross split for Edge Functions / Razorpay Route: Expert 81%, Kshatryx 9.5%, partner pool 9.5%.
 * Integer paise; rounding remainder stays in partner pool; optional area-head % (max 9.5 of gross)
 * is deducted only from that pool.
 */

export const EXPERT_GROSS_BPS = 8100;
export const KSHATRYX_GROSS_BPS = 950;
export const PARTNER_GROSS_BPS = 950;
export const BPS_DENOMINATOR = 10000;
export const MAX_AREA_HEAD_COMMISSION_PCT = 9.5;
export const LEGACY_PLATFORM_COMBINED_BPS = KSHATRYX_GROSS_BPS + PARTNER_GROSS_BPS;

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
    platformPaise: s.kshatryxPaise + s.partnerPaise + s.areaHeadPaise,
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
