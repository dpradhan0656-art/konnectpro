# Regression QA + Release Checklist

Date: 2026-03-24  
Scope: Payment hardening, booking flow unification, city normalization, wallet schema alignment

## A) Automated Verification (Completed)

- [x] Web production build passes: `npm run build`
- [x] Canonical booking service wired in both flows:
  - `src/pages/customer/Checkout.jsx`
  - `src/components/customer/BookingModal.jsx`
- [x] City normalization hard-lock wired across storage/filter/booking:
  - `src/lib/persistUserCity.js`
  - `src/lib/serviceCityUtils.js`
  - `src/context/LocationContext.jsx`
  - `src/pages/customer/Home.jsx`
  - `src/components/home/HomeHero.jsx`
- [x] Expert mobile wallet schema aligned to canonical wallet ledger fields:
  - `expert-expo-app/src/hooks/useExpertDashboard.js`

## B) Lint Status

- `npm run lint` currently fails due generated Android/Gradle asset JS being linted (outside app source).
- Targeted source edits compile in production build and do not break build pipeline.

## C) Payment Hardening Applied

- [x] Retry wrapper for edge function calls in expert wallet recharge flow (`PartnerApp`).
- [x] Retry on transient errors (network, 429, 5xx) for create/confirm wallet calls.
- [x] Better idempotency signal with `attempt_id` on create-order request.
- [x] Razorpay cancel/failure UX polish:
  - Modal dismiss handled with clear user message.
  - Failure and verification errors shown inline in recharge modal.
- [x] Edge functions hardened with retry on Razorpay API calls:
  - `supabase/functions/create-wallet-order/index.ts`
  - `supabase/functions/confirm-wallet-recharge/index.ts`

## D) Manual Smoke Test Matrix (Run Before Final Release)

## Customer
- [ ] Home page loads, location badge shows canonical city.
- [ ] GPS allow flow sets address and map pin correctly in Checkout.
- [ ] GPS deny flow still allows manual address + pin.
- [ ] Online payment success creates booking rows with canonical fields:
  - `total_amount`, `booking_date`, `city`, `status='pending'`, `payment_mode='online_prepaid'`, `payment_status='paid'`.
- [ ] Cash flow creates booking rows with:
  - `payment_mode='cash_after_service'`, `payment_method='cash'`, `payment_status='pending'`.

## Admin (DeepakHQ)
- [ ] Login auth check works (`app_admin` or superadmin email).
- [ ] Live Ops loads and can assign pending booking -> `assigned`.
- [ ] Dispatch tab status transitions and cancel flow work.

## Expert (Web)
- [ ] Recharge modal: success path updates wallet + ledger.
- [ ] Payment dismiss path shows safe feedback (no false success).
- [ ] Payment failure path shows retry-safe error.
- [ ] Complete job RPC still updates payouts.

## Expert (Expo app)
- [ ] Wallet transaction list loads from `wallet_transactions` using `user_id` + `user_type='expert'`.
- [ ] Recharge optimistic insert uses `transaction_type='credit'`, `reason='wallet_recharge'`.
- [ ] Dashboard load/refresh does not throw schema errors.

## Area Head
- [ ] Login and active status gate works.
- [ ] Territory booking radar loads.
- [ ] Earnings cards + recent transactions load correctly.

## E) APK / Build / Env Verification

## Web + Capacitor APK
- [ ] `npm run build`
- [ ] `npm run cap:sync`
- [ ] `npm run cap:android` then Android Studio Build APK
- [ ] Install `android/app/build/outputs/apk/debug/app-debug.apk` on device

## Expert Expo APK (EAS)
- [ ] `expert-expo-app/eas.json` present with `preview.android.buildType = "apk"`
- [ ] `expert-expo-app/app.json` android package = `com.kshatryx.expertapp`
- [ ] `cd expert-expo-app`
- [ ] `npm install -g eas-cli`
- [ ] `eas login`
- [ ] `eas build -p android --profile preview`

## Required Env Keys Check
- [ ] Root `.env` has:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_RAZORPAY_KEY_ID`
- [ ] `expert-expo-app/.env` has:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Supabase Edge Function Secrets have:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `SUPABASE_SERVICE_ROLE_KEY` (for confirm function)

## F) Go/No-Go Criteria

Release only if:
- [ ] Manual smoke tests in sections D and E pass.
- [ ] Wallet recharge success path verified on real Razorpay test payment.
- [ ] No booking insert mismatch between Checkout and BookingModal payload.
