# Implementation Plan: Security, Multi-City, Reliability

**Goal:** Fully secure app with RLS, token shift, multi-city serviceability, and reliability (error boundary + central handling).

---

## 1. Security

### 1.1 Row Level Security (RLS)

- **app_admin table:** One row per admin user (`user_id` = Supabase Auth UUID). Used by RLS to allow admin-level access. Add your admin user after first Supabase Auth sign-up.
- **Policies (by table):**
  - **categories** – Anon: SELECT where `is_active = true`. Admin: full (when `auth.uid()` in `app_admin`).
  - **services** – Same as categories. Admin: full.
  - **spotlight_offers** – Same. Anon: SELECT where `is_active = true`.
  - **admin_settings** – Anon: SELECT (app config). Admin: INSERT/UPDATE/DELETE.
  - **bookings** – Customer: INSERT with `user_id = auth.uid()`, SELECT own. Expert: SELECT/UPDATE where `expert_id` = own expert id. Admin: full.
  - **user_addresses** – User: SELECT/INSERT/UPDATE/DELETE where `user_id = auth.uid()`.
  - **experts** – Expert: SELECT/UPDATE own row (`user_id = auth.uid()`). Admin: full.
  - **area_heads** – Area head: SELECT own row. Admin: full.
  - **legal_pages** – Anon: SELECT. Admin: full.
  - **customers** – Admin: full (CRM).
  - **profiles** – User: SELECT/UPDATE own.
  - **wallet_transactions** – Expert/area head: SELECT own. Admin: full.
  - **withdrawal_requests** – Expert/area head: SELECT own. Admin: full.

**Note:** DeepakHQ currently uses passcode + localStorage. For full security, admin should log in via Supabase Auth (email/password) and that user’s UUID should be in `app_admin`. Passcode can remain as optional second factor in the UI. Migration only adds RLS; switching DeepakHQ to Supabase Auth is a separate frontend change (documented below).

### 1.2 WhatsApp Token (No Hardcoding)

- **Current:** Bearer token hardcoded in `20250302000000_whatsapp_booking_trigger.sql`.
- **New:** Token stored in **Supabase Vault**. Trigger reads from `vault.decrypted_secrets` (name: `whatsapp_bearer_token`). If secret is missing, WhatsApp call is skipped (no leak).
- **Action:** After applying migration, in Supabase Dashboard → Project Settings → Vault (or Database → Vault), create secret name `whatsapp_bearer_token` with your Meta token value.

---

## 2. Multi-City / Serviceability

### 2.1 Schema

- **services:** Add `service_cities` (text[], nullable). Meaning:
  - `NULL` or `{}` or `['all']` → service available in all cities.
  - Otherwise → available only in listed cities (e.g. `['jabalpur','indore']`). Comparison case-insensitive.
- **experts:** Already has `city`. Used for dispatch and (optional) “experts in your city” later. No schema change needed for experts.
- **spotlight_offers (optional):** Can add `offer_cities` later; for now offers remain all-city.

### 2.2 Frontend

- **User city:** Already in `localStorage` as `kshatr_user_city`. Normalize: trim, lowercase for comparison.
- **Home.jsx:** Fetch services (and offers if we add later) with optional filter by city. Either:
  - Client-side: fetch all active, filter by city in JS (simple; OK for moderate list size), or
  - Server-side: use RPC or filter with `service_cities` contains user city or `service_cities` is null/empty.
- **CategoryView.jsx:** Same: filter services by category and by user city (service_cities null/empty/all or contains current city).
- **Fallback:** If no city (e.g. user skipped location), show all services (treat as “all cities”).

Implementation choice: use Supabase filter `or(eq('service_cities', null), cs('service_cities', ['all']), contains('service_cities', [userCity]))` — actually Supabase uses `contains` for array: so we need “service_cities is null or 'all' = any(service_cities) or userCity = any(service_cities)”. In Supabase JS: `.or('service_cities.is.null,service_cities.cs.{all},service_cities.cs.{userCity}')` or similar. Check Supabase docs: for arrays, `contains` means superset. So “city in array” is: filter where array contains the user city. In PostgREST: `service_cities=cs.{jabalpur}` means service_cities contains the set {jabalpur}. So we need: (service_cities is null or service_cities = '{}') OR 'all' = ANY(service_cities) OR userCity = ANY(service_cities). In Supabase client we can do: .or('service_cities.is.null', 'service_cities.eq.[]', 'service_cities.contains.["all"]', 'service_cities.contains.[userCity]') - need to check exact syntax. Actually Supabase: .or('service_cities.is.null', 'service_cities.cs.{"all"}', 'service_cities.cs.{userCity}') - cs is "contains" for arrays. So we'll do two queries or one: get services where (service_cities is null or service_cities @> ['all'] or service_cities @> [userCity]). In SQL that's (service_cities is null or 'all' = ANY(service_cities) or userCity = ANY(service_cities)). In Supabase JS there's no single .or with array contains easily - we can use RPC or raw filter. Simpler: fetch all active services and filter in frontend by city (service_cities null/empty or includes 'all' or includes userCity). That way we don't need to expose complex filter and RLS stays simple. Done in implementation.

---

## 3. Reliability

- **Error boundary:** React Error Boundary component; wrap `<App>` or main layout so uncaught errors show a friendly message and optional “Reload”.
- **Central error handling:** Small util `reportError(message, error)` used in key flows (fetch, checkout, booking). Logs to console; can later send to Sentry. Replace critical `alert(err)` with user-friendly message + optional reportError.

---

## 4. File / Migration Checklist

| Item | File / Action |
|------|----------------|
| RLS + app_admin | `supabase/migrations/20250302100000_rls_policies.sql` |
| WhatsApp token from Vault | `supabase/migrations/20250302110000_whatsapp_trigger_vault.sql` |
| Multi-city columns | `supabase/migrations/20250302120000_multi_city_schema.sql` |
| Home + CategoryView filter by city | `src/pages/customer/Home.jsx`, `src/pages/customer/CategoryView.jsx` |
| Error boundary | `src/components/common/ErrorBoundary.jsx` |
| Central error util | `src/lib/errorHandling.js` |
| App wrap with ErrorBoundary | `src/App.jsx` |
| DeepakHQ: optional Supabase Auth | Document in this file; optional migration for `app_admin` seed. |

---

## 5. Post-Deploy Steps (Manual)

1. **Vault:** In Supabase Dashboard → Vault (or Project Settings), add secret name `whatsapp_bearer_token` with your Meta WhatsApp API token value.
2. **First admin:** In Supabase Dashboard → SQL Editor (run as service_role), add your admin user to `app_admin`:
   ```sql
   INSERT INTO app_admin (user_id) SELECT id FROM auth.users WHERE email = 'your-admin@example.com' LIMIT 1;
   ```
   Then log in to DeepakHQ with that email and password.
3. **Multi-city:** In DeepakHQ → Rate List & Services, use "Cities" field when adding/editing a service: e.g. `jabalpur, indore` or leave empty for all cities.
