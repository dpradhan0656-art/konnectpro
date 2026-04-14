-- Store the on-site final collected amount entered by expert at completion time.
-- Used by Expert Expo App -> My Jobs -> Mark as Completed flow.

alter table if exists public.bookings
  add column if not exists final_amount numeric;

comment on column public.bookings.final_amount is
  'Final bill amount collected on-site (may differ from initial booked amount).';
