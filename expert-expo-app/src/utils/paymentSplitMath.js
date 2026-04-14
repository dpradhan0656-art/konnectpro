export const TIER1_LIMIT_INR = 1999;
export const TIER1_KSHATRYX_RATE = 0.19;
export const TIER2_KSHATRYX_RATE = 0.05;

function toAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** @param {object} booking */
export function computeKshatryxSplit(booking) {
  const totalAmount = toAmount(
    booking?.final_amount ?? booking?.total_amount ?? booking?.amount ?? booking?.expert_payout
  );
  const tier1Base = Math.min(totalAmount, TIER1_LIMIT_INR);
  const tier2Base = Math.max(totalAmount - TIER1_LIMIT_INR, 0);
  const tier1CommissionRaw = tier1Base * TIER1_KSHATRYX_RATE;
  const tier2CommissionRaw = tier2Base * TIER2_KSHATRYX_RATE;
  const commissionRounded = Math.round(tier1CommissionRaw + tier2CommissionRaw);
  const expertShare = Math.round(totalAmount - commissionRounded);
  const effectiveRatePct = totalAmount > 0 ? (commissionRounded / totalAmount) * 100 : 0;

  return {
    totalAmount,
    tier1Base,
    tier2Base,
    tier1RatePct: TIER1_KSHATRYX_RATE * 100,
    tier2RatePct: TIER2_KSHATRYX_RATE * 100,
    tier1Commission: Math.round(tier1CommissionRaw),
    tier2Commission: Math.round(tier2CommissionRaw),
    expertShare,
    kshatryxShare: commissionRounded,
    effectiveKshatryxRatePct: Number(effectiveRatePct.toFixed(2)),
  };
}
