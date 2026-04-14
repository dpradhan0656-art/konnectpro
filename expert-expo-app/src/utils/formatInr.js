/** Indian Rupee formatting — use literal ₹ so Android always renders correctly (avoid raw \\u escapes in JSX). */

export function formatInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '₹0';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}
