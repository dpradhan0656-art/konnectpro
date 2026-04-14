# Expert Expo App - Production Readiness Checklist

Use this checklist before every production release of `expert-expo-app`.

## 1) Data Model and Schema

| Item | Why it matters | Owner | Status | Notes |
|---|---|---|---|---|
| Confirm `experts` has `is_online` | Online toggle depends on it | Backend | TODO | Type should be boolean, default false |
| Confirm `experts` has `kyc_status` | Profile Identity badge uses it | Backend | TODO | Expected values: verified/approved vs pending |
| Confirm `experts` has `average_rating`, `total_reviews` | Reputation dashboard values | Backend | TODO | Numeric defaults should be 0 |
| Confirm `experts` has category + city fields | Rank badge calculation | Backend | TODO | Category/city naming must be standardized |
| Confirm `expert_reviews` table exists | Recent reviews section | Backend | TODO | Needed columns: expert_id, customer_name, rating, review_text, created_at |
| Confirm `wallet_transactions` table supports expert rows | Finance list + wallet audit trail | Backend | TODO | user_type='expert' convention |

## 2) Security and RLS Policies

| Item | Why it matters | Owner | Status | Notes |
|---|---|---|---|---|
| Expert can read only own profile row | Prevent profile data leaks | Backend | TODO | JWT user id mapping required |
| Expert can update only own `is_online` and safe profile fields | Prevent unauthorized writes | Backend | TODO | Explicit column-level guard recommended |
| Expert can read only own bookings | Protect customer/order data | Backend | TODO | Match on expert_id link |
| Expert can read only own wallet transactions | Financial privacy | Backend | TODO | Restrict by user_id + user_type |
| Email self-link migration applied in target env | Login auto-link flow | Backend | TODO | `20260414120000_experts_self_link_by_email_rls.sql` |

## 3) Auth and Redirect Integrity

| Item | Why it matters | Owner | Status | Notes |
|---|---|---|---|---|
| Supabase Redirect URLs include `expert-expo-app://auth/callback` | Required for Google OAuth return | Backend | TODO | Must match app scheme exactly |
| Google provider active in Supabase Auth | Required login provider | Backend | TODO | Verify web client config |
| `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` present for release profile | App cannot authenticate without these | DevOps | TODO | Local + EAS envs both |
| Manual test: login without force-close | Validate live auth state routing | QA | TODO | Must auto-route to tabs |

## 4) Finance and Withdrawal

| Item | Why it matters | Owner | Status | Notes |
|---|---|---|---|---|
| Confirm split logic parity (frontend/backend) | Trust and financial correctness | Product+Backend | TODO | Standard 81/19, medical 75/25 |
| Implement real withdrawal request API/table | Current flow is UI-only toast | Backend+App | TODO | Suggested table: withdrawal_requests |
| Add withdrawal status lifecycle UI | Visibility for expert | App | TODO | Requested / processing / paid / rejected |
| Verify wallet reconciliation jobs | Financial consistency | Backend | TODO | Balance vs ledger consistency checks |

## 5) Reputation and Ranking

| Item | Why it matters | Owner | Status | Notes |
|---|---|---|---|---|
| Ensure reviews are written on completed jobs | Feed profile reputation section | Backend | TODO | Source of truth must be automated |
| Replace fallback mock reviews in prod path | Real credibility | App | TODO | Show mock only when explicitly in dev |
| Move rank calculation to backend view/function | Deterministic ranking | Backend | TODO | Avoid frontend approximation |
| Define tie-break rules for same rating | Stable rank ordering | Product+Backend | TODO | e.g., completed_jobs desc, created_at asc |

## 6) UX and App Quality

| Item | Why it matters | Owner | Status | Notes |
|---|---|---|---|---|
| Standardize loading/empty/error states on all tabs | Predictable UX | App | TODO | Home / My Jobs / Finance / Profile |
| Add offline/no-network messaging | Better failure handling | App | TODO | Detect and show retry CTA |
| Validate language strings for new tabs | i18n consistency | App | TODO | Finance/Profile tab labels and copy |
| Accessibility pass for key buttons | Better usability and compliance | App | TODO | Focus labels for toggle/actions |

## 7) Push, Realtime, and Observability

| Item | Why it matters | Owner | Status | Notes |
|---|---|---|---|---|
| Confirm Expo Push project id in release env | Token registration reliability | DevOps | TODO | EAS project id availability |
| Validate bookings realtime under poor network | Assignment responsiveness | QA | TODO | Reconnect and missed-event behavior |
| Add crash/error monitoring (e.g. Sentry) | Faster production debugging | App+DevOps | TODO | Capture auth/finance/profile errors |
| Add critical analytics events | Measure funnel and failures | Product+App | TODO | login success/fail, withdraw tap, kyc updates |

## 8) Release Process

| Item | Why it matters | Owner | Status | Notes |
|---|---|---|---|---|
| Create release smoke test script | Repeatable quality gate | QA | TODO | APK install -> login -> all tabs |
| Verify release build uses correct env and commit | Traceability | DevOps | TODO | Keep build metadata |
| Keep rollback-ready previous APK | Safety during deployment | DevOps | TODO | Last known stable binary |
| Tag release commit in git | Auditable release history | Engineering | TODO | Example: `expert-app-v1.0.x` |

---

## Suggested status values

- TODO
- IN PROGRESS
- BLOCKED
- DONE

## Recommended immediate next 5 tasks

1. Apply/verify RLS policies and schema fields in production Supabase.
2. Implement real withdrawal request backend + app status UI.
3. Replace review mocks by ensuring `expert_reviews` pipeline is active.
4. Move category rank logic to backend endpoint/view.
5. Add crash monitoring + release smoke test checklist execution per build.
