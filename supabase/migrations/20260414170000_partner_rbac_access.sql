-- Partner RBAC hardening for /partner-dashboard access.
-- Adds identity + role fields to business_partners and enables scoped self-read policy.

alter table if exists public.business_partners
  add column if not exists email text,
  add column if not exists user_id uuid,
  add column if not exists access_role text not null default 'partner',
  add column if not exists assigned_area text;

comment on column public.business_partners.email is
  'Partner login email used for access mapping to Supabase auth user.';
comment on column public.business_partners.user_id is
  'Supabase auth user id linked after first successful partner login.';
comment on column public.business_partners.access_role is
  'RBAC role for partner portal access. Only access_role=partner can open /partner-dashboard.';
comment on column public.business_partners.assigned_area is
  'Human readable area scope assigned to this partner.';

create unique index if not exists business_partners_email_unique_idx
  on public.business_partners (lower(email))
  where email is not null;

create unique index if not exists business_partners_user_id_unique_idx
  on public.business_partners (user_id)
  where user_id is not null;

alter table if exists public.business_partners
  drop constraint if exists business_partners_access_role_check;

alter table if exists public.business_partners
  add constraint business_partners_access_role_check
  check (access_role in ('partner'));

-- Existing admin policy keeps full access for app_admin users.
drop policy if exists "business_partners_partner_self_read" on public.business_partners;
create policy "business_partners_partner_self_read"
  on public.business_partners
  for select
  using (
    auth.uid() is not null
    and user_id = auth.uid()
    and active_status = true
    and access_role = 'partner'
  );
