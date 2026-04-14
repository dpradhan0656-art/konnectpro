export const STANDARD_EXPERT_SHARE = 0.81;
export const STANDARD_KSHATRYX_SHARE = 0.19;
export const MEDICAL_EXPERT_PARTNER_SHARE = 0.75;
export const MEDICAL_KSHATRYX_SHARE = 0.25;

function toAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function classifyMedical(booking) {
  const hay = [
    booking?.category,
    booking?.service_category,
    booking?.service_type,
    booking?.partner_module,
    booking?.service_name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return hay.includes('medical');
}

/**
 * @param {object} booking
 * @returns {{
 *  isMedical: boolean,
 *  totalAmount: number,
 *  expertShare: number,
 *  kshatryxShare: number,
 *  expertPct: number,
 *  kshatryxPct: number
 * }}
 */
export function computeKshatryxSplit(booking) {
  const totalAmount = toAmount(booking?.total_amount ?? booking?.amount ?? booking?.expert_payout);
  const isMedical = classifyMedical(booking);

  const expertPct = isMedical ? MEDICAL_EXPERT_PARTNER_SHARE : STANDARD_EXPERT_SHARE;
  const kshatryxPct = isMedical ? MEDICAL_KSHATRYX_SHARE : STANDARD_KSHATRYX_SHARE;

  const expertShare = totalAmount * expertPct;
  const kshatryxShare = totalAmount * kshatryxPct;

  return {
    isMedical,
    totalAmount,
    expertShare,
    kshatryxShare,
    expertPct: expertPct * 100,
    kshatryxPct: kshatryxPct * 100,
  };
}
