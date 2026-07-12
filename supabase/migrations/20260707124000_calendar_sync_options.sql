alter table public.calendar_events
  add column if not exists sync_target text not null default 'crm_google'
    check (sync_target in ('crm_only', 'crm_google'));

alter table public.calendar_events
  add column if not exists reminder_minutes integer not null default 30
    check (reminder_minutes in (0, 15, 30, 60, 1440));

alter table public.calendar_events
  drop constraint if exists calendar_events_sync_status_check;

alter table public.calendar_events
  add constraint calendar_events_sync_status_check
  check (sync_status in ('synced', 'pending', 'error', 'local_only'));

update public.calendar_events
set sync_target = 'crm_google'
where sync_target is null;

update public.calendar_events
set reminder_minutes = 30
where reminder_minutes is null;
