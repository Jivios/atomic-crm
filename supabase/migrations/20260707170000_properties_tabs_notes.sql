-- Home Direct CRM — Properties tabs, assignment, portal URLs, immutable notes
-- Additive only. No destructive changes.

alter table public.properties
  add column if not exists assignment_status text not null default 'not_assigned'
    check (assignment_status in ('not_assigned', 'assigned', 'exclusive', 'open_market', 'expired')),
  add column if not exists keys_status text not null default 'unknown'
    check (keys_status in ('unknown', 'no_keys', 'keys_in_office', 'keys_with_owner', 'keys_with_agent', 'lockbox')),
  add column if not exists keys_location text,
  add column if not exists assignment_started_at date,
  add column if not exists assignment_expires_at date,
  add column if not exists is_currently_leased boolean not null default false,
  add column if not exists leased_until date,
  add column if not exists current_monthly_rent numeric(14, 2) check (current_monthly_rent is null or current_monthly_rent >= 0),
  add column if not exists current_tenant_name text,
  add column if not exists spitogatos_url text,
  add column if not exists xe_url text,
  add column if not exists other_portal_url text,
  add column if not exists portal_notes text;

create table if not exists public.property_notes (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  note text not null check (char_length(trim(note)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists property_notes_property_created_idx
  on public.property_notes (property_id, created_at desc);

create index if not exists property_notes_user_created_idx
  on public.property_notes (user_id, created_at desc);

alter table public.property_notes enable row level security;

drop policy if exists property_notes_select_own on public.property_notes;
drop policy if exists property_notes_insert_own on public.property_notes;

create policy property_notes_select_own
on public.property_notes
for select
using (user_id = auth.uid());

create policy property_notes_insert_own
on public.property_notes
for insert
with check (user_id = auth.uid());

alter table public.property_viewings
  add column if not exists demand_reference text,
  add column if not exists source text,
  add column if not exists viewing_notes text;

create index if not exists property_viewings_demand_reference_idx
  on public.property_viewings (user_id, demand_reference);
