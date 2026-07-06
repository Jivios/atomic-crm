create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean not null default false,

  event_type text not null default 'meeting'
    check (event_type in ('viewing', 'valuation', 'follow_up', 'meeting', 'task')),

  status text not null default 'active'
    check (status in ('active', 'completed', 'cancelled', 'deleted')),

  location text,
  description text,

  contact_id uuid null,
  property_id uuid null,
  deal_id uuid null,
  partner_user_id uuid null,

  google_event_id text unique,
  google_html_link text,

  sync_status text not null default 'pending'
    check (sync_status in ('synced', 'pending', 'error')),

  deleted_at timestamptz null,
  deleted_source text null
    check (deleted_source is null or deleted_source in ('crm', 'google')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint calendar_events_end_after_start check (end_at > start_at)
);

create table if not exists public.calendar_event_activity (
  id uuid primary key default gen_random_uuid(),

  calendar_event_id uuid not null references public.calendar_events(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  action text not null
    check (
      action in (
        'created',
        'updated',
        'completed',
        'reopened',
        'deleted',
        'cancelled',
        'restored',
        'google_deleted',
        'google_synced',
        'google_sync_error'
      )
    ),

  message text,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists calendar_events_user_start_idx
  on public.calendar_events (user_id, start_at);

create index if not exists calendar_events_user_status_start_idx
  on public.calendar_events (user_id, status, start_at);

create index if not exists calendar_events_google_event_id_idx
  on public.calendar_events (google_event_id);

create index if not exists calendar_event_activity_event_created_idx
  on public.calendar_event_activity (calendar_event_id, created_at desc);

create index if not exists calendar_event_activity_user_created_idx
  on public.calendar_event_activity (user_id, created_at desc);

create or replace function public.set_calendar_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists calendar_events_set_updated_at on public.calendar_events;

create trigger calendar_events_set_updated_at
before update on public.calendar_events
for each row
execute function public.set_calendar_events_updated_at();

alter table public.calendar_events enable row level security;
alter table public.calendar_event_activity enable row level security;

drop policy if exists "calendar_events_select_own" on public.calendar_events;
drop policy if exists "calendar_events_insert_own" on public.calendar_events;
drop policy if exists "calendar_events_update_own" on public.calendar_events;
drop policy if exists "calendar_events_delete_own" on public.calendar_events;

create policy "calendar_events_select_own"
on public.calendar_events
for select
using (user_id = auth.uid());

create policy "calendar_events_insert_own"
on public.calendar_events
for insert
with check (user_id = auth.uid());

create policy "calendar_events_update_own"
on public.calendar_events
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "calendar_events_delete_own"
on public.calendar_events
for delete
using (user_id = auth.uid());

drop policy if exists "calendar_event_activity_select_own" on public.calendar_event_activity;
drop policy if exists "calendar_event_activity_insert_own" on public.calendar_event_activity;

create policy "calendar_event_activity_select_own"
on public.calendar_event_activity
for select
using (user_id = auth.uid());

create policy "calendar_event_activity_insert_own"
on public.calendar_event_activity
for insert
with check (user_id = auth.uid());
