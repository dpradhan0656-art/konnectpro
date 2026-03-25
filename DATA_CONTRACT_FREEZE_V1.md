# Kshatryx Data Contract Freeze (V1)

Date: 2026-03-24  
Owner: Tech Co-Founder / Engineering  
Scope: Web app + Expert app + Supabase integration contracts

## 1) Final Schema & Status Matrix (Frozen)

This freeze is based on current live code paths and Supabase RLS/migrations.

### 1.1 `bookings` (Canonical contract for insert/update/read)

| Field | Type (expected) | Status |
|---|---|---|
| `id` | `bigint` (as per payout function overload fix) | Read-only |
| `user_id` | `uuid` (auth user) | Required on insert |
| `expert_id` | expert FK | Nullable, assigned later |
| `area_head_id` | area head FK | Nullable, assigned later |
| `service_name` | text | Required |
| `total_amount` | numeric | Required |
| `booking_date` | date/text | Required (customer selection date) |
| `scheduled_date` | date/text | Optional (can mirror `booking_date`) |
| `scheduled_time` | time/text | Optional |
| `address` | text | Required |
| `latitude` | numeric | Optional |
| `longitude` | numeric | Optional |
| `city` | text | Required (`kshatr_user_city` fallback `Jabalpur`) |
| `status` | enum-like text | Required |
| `payment_mode` | enum-like text | Required |
| `payment_method` | enum-like text | Required |
| `payment_status` | enum-like text | Required |
| `razorpay_payment_id` | text | Nullable |
| `is_remote_booking` | boolean | Optional (default false) |
| `contact_name` | text | Optional (required when remote booking true) |
| `contact_phone` | text | Optional (required when remote booking true) |

#### Booking status values (frozen)
- `pending`
- `assigned`
- `accepted`
- `in_progress`
- `completed`
- `cancelled`

#### Booking status flow (frozen)
`pending -> assigned -> accepted -> in_progress -> completed`  
`cancelled` can terminate from non-completed states.

#### Payment values (frozen)
- `payment_mode`: `online_prepaid` | `cash_after_service`
- `payment_method`: `online` | `cash`
- `payment_status`: `paid` | `pending` | `failed` (allowed for failures)

---

### 1.2 `experts` status values (frozen)
- `pending`
- `approved`
- `rejected`
- `verified` (allowed in wallet order edge function)

---

### 1.3 `wallet_transactions` (canonical)

RLS and server-side payout/recharge paths are aligned on:

| Field | Type | Status |
|---|---|---|
| `user_id` | FK id (expert.id / area_head.id) | Required |
| `user_type` | `expert` / `area_head` | Required |
| `amount` | numeric | Required |
| `transaction_type` | `credit` / `debit` | Required |
| `reason` | text key | Required |
| `description` | text | Optional |
| `booking_id` | booking FK | Optional |

> Freeze note: canonical wallet identity is `user_id + user_type` (not `expert_id`).

---

## 2) Checkout vs BookingModal Payload Diff (Locked)

## 2.1 Current state diff

| Contract Area | `Checkout.jsx` | `BookingModal.jsx` | Decision |
|---|---|---|---|
| Amount column | `total_amount` | `price` | Use `total_amount` only |
| Booking status case | `pending` | `Confirmed` / `Pending` | Lowercase status set only |
| Payment mode | `online_prepaid` / `cash_after_service` | `online` / `cash` | Use Checkout values |
| Date fields | `booking_date` (+ also `scheduled_date`) | `scheduled_date` only | Keep `booking_date` mandatory; mirror to `scheduled_date` |
| City | writes `city` from localStorage | no city write | `city` required in all inserts |
| Transaction id fields | `razorpay_payment_id` | `transaction_id` + `razorpay_payment_id` | Keep `razorpay_payment_id`; deprecate `transaction_id` |
| Commission fields in insert | none | `company_commission`, `expert_earnings` | Do not write from client insert path |

## 2.2 Canonical booking insert payload (lock)

All customer booking inserts must emit:

- `user_id`
- `service_name`
- `total_amount`
- `booking_date`
- `scheduled_date` (same as booking date unless separate slot needed)
- `scheduled_time` (when available)
- `address`
- `latitude`
- `longitude`
- `city`
- `status: 'pending'`
- `payment_mode` (`online_prepaid` or `cash_after_service`)
- `payment_method` (`online` or `cash`)
- `payment_status` (`paid` or `pending` or `failed`)
- `razorpay_payment_id` (nullable)
- `is_remote_booking`
- `contact_name` (conditional)
- `contact_phone` (conditional)

## 2.3 Explicitly blocked keys/values (lock)

Do not send from client booking insert:

- `price` (replace with `total_amount`)
- `status: 'Confirmed'` or `'Pending'` (uppercase variants blocked)
- `payment_mode: 'online'` or `'cash'` (legacy blocked)
- `transaction_id` (legacy duplicate of razorpay id)
- `company_commission` and `expert_earnings` from client side

---

## 3) Implementation Guardrails for Block 2

- Create one shared booking payload builder and use it from both Checkout and BookingModal.
- Centralize enums as constants to prevent future case mismatch.
- Normalize city via shared utility before insert.
- Add one validation gate before insert to reject blocked keys/values.

---

## 4) Sign-off

This file is the V1 freeze reference for all next implementation steps (Block 2 onward).  
Any schema/value changes after this point require version bump (`V2`) and explicit approval.
