# Expert Wallet Recharge (Razorpay) – Deploy & Config

Experts can recharge their prepaid wallet via Razorpay from the Partner App. This uses two Supabase Edge Functions and your **existing Live Razorpay keys**.

---

## 1. Prerequisites

- Razorpay **Live** Key ID and Key Secret (same as used for customer checkout).
- Frontend already has `VITE_RAZORPAY_KEY_ID` in `.env` for the checkout script.
- Supabase project with Edge Functions enabled.

---

## 2. Set Edge Function secrets (Supabase Dashboard)

Edge Functions need the **Razorpay secret** and Key ID to create orders and verify payments. Do **not** put the secret in frontend env.

1. Open **Supabase Dashboard** → your project → **Project Settings** (gear) → **Edge Functions**.
2. Under **Secrets**, add:

   | Name                   | Value                     | Notes                          |
   |------------------------|---------------------------|--------------------------------|
   | `RAZORPAY_KEY_ID`      | `rzp_live_xxxxxxxx`      | Same as `VITE_RAZORPAY_KEY_ID` |
   | `RAZORPAY_KEY_SECRET`  | Your Razorpay Live Secret | From Razorpay Dashboard        |

3. Save. These are injected as `Deno.env.get('RAZORPAY_KEY_ID')` and `Deno.env.get('RAZORPAY_KEY_SECRET')` in the functions.

**Do I need to add SUPABASE_URL and SUPABASE_ANON_KEY?**  
**No.** When the function runs in **Supabase Cloud** (deployed via `supabase functions deploy`), the platform automatically injects `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. You only need to set these manually if you run Edge Functions **locally** (e.g. `supabase functions serve`) and they are not in your local `.env`.

---

## 3. Deploy the two Edge Functions

From the project root (where `supabase` folder lives):

```bash
# Login if needed
npx supabase login

# Link project (if not already)
npx supabase link --project-ref YOUR_PROJECT_REF

# Deploy both functions
npx supabase functions deploy create-wallet-order
npx supabase functions deploy confirm-wallet-recharge
```

Or deploy all functions:

```bash
npx supabase functions deploy
```

After deploy, the frontend calls:

- `https://<PROJECT_REF>.supabase.co/functions/v1/create-wallet-order`
- `https://<PROJECT_REF>.supabase.co/functions/v1/confirm-wallet-recharge`

The Supabase JS client (`supabase.functions.invoke('create-wallet-order', ...)`) uses the project URL and anon key from your app env, so no URL change is needed in code.

---

## 4. Frontend env (already in place)

In `.env` you should have:

- `VITE_SUPABASE_URL` – Supabase project URL
- `VITE_SUPABASE_ANON_KEY` – Anon key
- `VITE_RAZORPAY_KEY_ID` – Razorpay **Live** Key ID (used for opening the Razorpay checkout script; same as in Edge Function secret)

No extra frontend env is required for wallet recharge.

---

## 5. Flow summary

1. Expert opens Partner App → **Add Money** → selects ₹500 / ₹1000 / ₹2000 or enters custom amount → **Proceed to Pay**.
2. Frontend calls **create-wallet-order** with `{ amount: <rupees> }`. Function creates a Razorpay order and returns `order_id`, `amount_paise`, `currency`, `key_id`.
3. Frontend opens Razorpay checkout with `order_id` and the key. Expert pays.
4. On success, frontend calls **confirm-wallet-recharge** with `order_id` and `razorpay_payment_id`. Function verifies the payment with Razorpay, then:
   - Updates `experts.wallet_balance`
   - Inserts a row in `wallet_transactions` with reason `wallet_recharge`, description `Wallet Recharge via Razorpay`.
5. Partner App refreshes wallet balance and transaction list.

---

## 6. Database

- **experts.wallet_balance** – updated by `confirm-wallet-recharge` (service role).
- **wallet_transactions** – one row per recharge: `user_id` (expert id), `user_type: 'expert'`, `transaction_type: 'credit'`, `reason: 'wallet_recharge'`, `description: 'Wallet Recharge via Razorpay'`, `booking_id: null`.

No new tables or migrations are required; existing RLS is bypassed by the Edge Function using the service role for the update and insert.

---

## 7. Troubleshooting

- **401 Unauthorized (OPTIONS 200, POST 401)**  
  - The function returns 401 when the **Authorization** header is missing or the **token is invalid/expired**.  
  - The frontend must call the function **while the expert is logged in**; `supabase.functions.invoke()` automatically sends the session’s `Authorization: Bearer <access_token>`.  
  - Ensure the user has signed in (e.g. Expert Login or Google) before opening the Add Money modal and that the session hasn’t expired. If the error persists, check Edge Function logs for the exact message (`Missing Authorization header` vs `Invalid or expired token` and optional `details`).  
  - **Do not** add `SUPABASE_URL` / `SUPABASE_ANON_KEY` to Edge Function secrets for Cloud; they are auto-injected. Only set them for local dev if needed.
- **“Could not create payment order”** – Check Edge Function logs (Supabase Dashboard → Edge Functions → Logs). Ensure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set and are **Live** keys.
- **“Payment not captured” / “Order ID mismatch”** – Confirm you’re using the same Razorpay account (Live) in both dashboard and secrets; avoid mixing test and live keys.
- **Recharge succeeds but balance not updating** – Check `confirm-wallet-recharge` logs and that the function can update `experts` and insert into `wallet_transactions` (service role has permission).
