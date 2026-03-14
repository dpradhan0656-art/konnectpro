# Platform Income & Payments (Apna Hunar / Kshatr)

## Abhi software me income ke sources

### 1. Customer se payment (✅ Ab enable hai)

- **Offline:** Customer "Pay After Service" choose karta hai → Expert kaam karke cash leta hai → Job complete par **platform fee expert ke wallet se cut hota hai** (prepaid balance chahiye).
- **Online:** Customer "Pay Online" choose karta hai → Razorpay se pay karta hai → Paisa **aapke Razorpay account** me aata hai → Job complete par expert ko unka hissa wallet me credit hota hai, **platform fee aapke paas rehti hai**.

**Conclusion:** Aapki income = **platform_fee** har completed job par (database me `bookings.platform_fee` + `process_job_payout` me logic). Online payment ab **ON** hai, isliye Razorpay test transaction bhi kar sakte ho (Checkout → Pay Online).

---

### 2. Expert prepaid wallet (aapki income) – ✅ Razorpay recharge live

- Expert **Razorpay se wallet recharge** kar sakta hai (Partner App → Add Money → Razorpay).
- **Flow:** Add Money → preset (₹500 / ₹1000 / ₹2000) ya custom amount → Proceed to Pay → Razorpay checkout → success par `experts.wallet_balance` update + `wallet_transactions` me "Wallet Recharge via Razorpay" entry.
- Backend: Supabase Edge Functions **create-wallet-order** (Razorpay order create) aur **confirm-wallet-recharge** (payment verify, wallet update). Deploy & secrets: see **docs/EXPERT_WALLET_RECHARGE_RAZORPAY.md**.
- Optional: Dispatch par assignment me check – sirf wahi experts dikhein jinke `wallet_balance >= minimum` (e.g. ₹500).

---

## Summary

| Source              | Status        | Kya karna hai |
|---------------------|---------------|----------------|
| Customer online pay | ✅ Enabled    | Checkout par "Pay Online" dikhega, Razorpay test kar sakte ho. |
| Platform fee (jobs) | ✅ Already in DB | `process_job_payout` me platform_fee cut / retain ho raha hai. |
| Expert wallet top-up (Razorpay) | ✅ Implemented | Partner App → Add Money. Deploy Edge Functions + set RAZORPAY_KEY_SECRET (see EXPERT_WALLET_RECHARGE_RAZORPAY.md). |

---

## Razorpay test transaction

1. Checkout par jao (cart me kuch add karke).
2. Payment method me **"Pay Online"** choose karo.
3. "Pay & Book Now" click karo → Razorpay popup open hoga.
4. Test mode me test card use karke payment complete karo.

Agar Razorpay Live mode me "Order ID required" aaye to Razorpay dashboard se Orders API enable karke backend (Edge Function) se order create karna padega; test mode me direct amount bhejna kaam karta hai.
