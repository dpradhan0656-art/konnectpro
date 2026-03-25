-- Additive setup for admin audit trail.
-- Safe to run once in Supabase SQL editor.

create table if not exists public.admin_action_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_user_id uuid null,
  actor_email text null,
  action text not null,
  entity_type text not null,
  entity_id text null,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_admin_action_logs_created_at
  on public.admin_action_logs (created_at desc);

create index if not exists idx_admin_action_logs_entity
  on public.admin_action_logs (entity_type, entity_id);

-- Basic permissive policy for authenticated admins.
-- Tighten later according to your RLS standards.
alter table public.admin_action_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_action_logs'
      and policyname = 'admin_action_logs_select_authenticated'
  ) then
    create policy admin_action_logs_select_authenticated
      on public.admin_action_logs
      for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_action_logs'
      and policyname = 'admin_action_logs_insert_authenticated'
  ) then
    create policy admin_action_logs_insert_authenticated
      on public.admin_action_logs
      for insert
      to authenticated
      with check (true);
  end if;
end $$;

