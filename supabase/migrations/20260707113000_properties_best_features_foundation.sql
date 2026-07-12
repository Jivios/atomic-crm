create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  title text not null,

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'active',
        'reserved',
        'under_offer',
        'sold',
        'rented',
        'withdrawn',
        'archived'
      )
    ),

  listing_type text not null default 'sale'
    check (listing_type in ('sale', 'rent')),

  property_type text not null default 'apartment'
    check (
      property_type in (
        'apartment',
        'maisonette',
        'detached_house',
        'villa',
        'land',
        'commercial',
        'office',
        'store',
        'other'
      )
    ),

  price numeric(14, 2) null check (price is null or price >= 0),
  currency text not null default 'EUR',

  address text null,
  city text null default 'Αθήνα',
  area text null,
  postal_code text null,
  latitude numeric(10, 7) null,
  longitude numeric(10, 7) null,

  bedrooms integer null check (bedrooms is null or bedrooms >= 0),
  bathrooms numeric(4, 1) null check (bathrooms is null or bathrooms >= 0),
  size_sqm numeric(10, 2) null check (size_sqm is null or size_sqm >= 0),
  plot_sqm numeric(10, 2) null check (plot_sqm is null or plot_sqm >= 0),
  floor text null,
  construction_year integer null,
  renovation_year integer null,
  heating_type text null,
  orientation text null,
  parking_spaces integer null check (parking_spaces is null or parking_spaces >= 0),

  -- Greek legal / documentation fields
  kaek text null
    check (
      kaek is null
      or kaek ~ '^[0-9]{12}/[0-9]+/[0-9]+$'
    ),

  pea_required boolean not null default true,
  pea_certificate_number text null,
  pea_energy_class text null,
  pea_issue_date date null,
  pea_expires_at date null,

  htk_status text not null default 'missing'
    check (htk_status in ('missing', 'pending', 'complete', 'not_required')),
  htk_certificate_number text null,
  htk_completion_certificate_expires_at date null,
  responsible_engineer_name text null,

  arbitrary_settlement_status text not null default 'unknown'
    check (
      arbitrary_settlement_status in (
        'unknown',
        'not_needed',
        'pending',
        'completed'
      )
    ),

  title_deed_available boolean not null default false,
  building_permit_available boolean not null default false,
  topographic_diagram_available boolean not null default false,
  floor_plan_available boolean not null default false,
  thousandths_table_available boolean not null default false,
  enfia_available boolean not null default false,

  -- Owner / agent
  owner_name text null,
  owner_phone text null,
  owner_email text null,
  assigned_agent_name text null,

  -- Marketing / portal readiness
  headline_el text null,
  headline_en text null,
  description text null,
  notes text null,

  portal_status text not null default 'not_published'
    check (
      portal_status in (
        'not_published',
        'ready',
        'published_manual',
        'published_xe',
        'published_partner',
        'paused'
      )
    ),

  last_vendor_report_sent_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_activity (
  id uuid primary key default gen_random_uuid(),

  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  action text not null
    check (
      action in (
        'created',
        'updated',
        'status_changed',
        'price_changed',
        'note_added',
        'document_added',
        'viewing_logged',
        'offer_added',
        'vendor_report_sent',
        'calendar_event_linked',
        'client_linked',
        'deal_linked',
        'portal_status_changed',
        'archived'
      )
    ),

  message text,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create table if not exists public.property_price_history (
  id uuid primary key default gen_random_uuid(),

  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  old_price numeric(14, 2) null,
  new_price numeric(14, 2) not null check (new_price >= 0),
  reason text null,

  created_at timestamptz not null default now()
);

create table if not exists public.property_documents (
  id uuid primary key default gen_random_uuid(),

  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  document_type text not null
    check (
      document_type in (
        'title_deed',
        'pea',
        'htk',
        'building_permit',
        'topographic',
        'floor_plan',
        'thousandths_table',
        'enfia',
        'settlement_declaration',
        'photo',
        'brochure',
        'other'
      )
    ),

  file_name text not null,
  storage_path text not null,
  notes text null,

  created_at timestamptz not null default now()
);

create table if not exists public.property_viewings (
  id uuid primary key default gen_random_uuid(),

  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  calendar_event_id uuid null references public.calendar_events(id) on delete set null,

  viewing_at timestamptz null,
  buyer_name text null,
  buyer_email text null,
  buyer_phone text null,

  interest_level text null
    check (
      interest_level is null
      or interest_level in ('low', 'medium', 'high', 'very_high')
    ),

  buyer_feedback text null,
  price_feedback numeric(14, 2) null check (price_feedback is null or price_feedback >= 0),
  next_step text null,

  created_at timestamptz not null default now()
);

create table if not exists public.property_offers (
  id uuid primary key default gen_random_uuid(),

  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  buyer_name text null,
  buyer_email text null,
  amount numeric(14, 2) not null check (amount >= 0),
  currency text not null default 'EUR',

  status text not null default 'received'
    check (status in ('received', 'countered', 'accepted', 'rejected', 'withdrawn')),

  conditions text null,
  notes text null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_user_created_idx
  on public.properties (user_id, created_at desc);

create index if not exists properties_user_status_idx
  on public.properties (user_id, status);

create index if not exists properties_user_area_idx
  on public.properties (user_id, area);

create index if not exists properties_user_city_idx
  on public.properties (user_id, city);

create index if not exists properties_user_listing_type_idx
  on public.properties (user_id, listing_type);

create index if not exists property_activity_property_created_idx
  on public.property_activity (property_id, created_at desc);

create index if not exists property_activity_user_created_idx
  on public.property_activity (user_id, created_at desc);

create index if not exists property_price_history_property_created_idx
  on public.property_price_history (property_id, created_at desc);

create index if not exists property_documents_property_created_idx
  on public.property_documents (property_id, created_at desc);

create index if not exists property_viewings_property_created_idx
  on public.property_viewings (property_id, created_at desc);

create index if not exists property_offers_property_created_idx
  on public.property_offers (property_id, created_at desc);

create or replace function public.set_properties_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;

create trigger properties_set_updated_at
before update on public.properties
for each row
execute function public.set_properties_updated_at();

create or replace function public.set_property_offers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists property_offers_set_updated_at on public.property_offers;

create trigger property_offers_set_updated_at
before update on public.property_offers
for each row
execute function public.set_property_offers_updated_at();

alter table public.properties enable row level security;
alter table public.property_activity enable row level security;
alter table public.property_price_history enable row level security;
alter table public.property_documents enable row level security;
alter table public.property_viewings enable row level security;
alter table public.property_offers enable row level security;

drop policy if exists "properties_select_own" on public.properties;
drop policy if exists "properties_insert_own" on public.properties;
drop policy if exists "properties_update_own" on public.properties;
drop policy if exists "properties_delete_own" on public.properties;

create policy "properties_select_own"
on public.properties
for select
using (user_id = auth.uid());

create policy "properties_insert_own"
on public.properties
for insert
with check (user_id = auth.uid());

create policy "properties_update_own"
on public.properties
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "properties_delete_own"
on public.properties
for delete
using (user_id = auth.uid());

drop policy if exists "property_activity_select_own" on public.property_activity;
drop policy if exists "property_activity_insert_own" on public.property_activity;

create policy "property_activity_select_own"
on public.property_activity
for select
using (user_id = auth.uid());

create policy "property_activity_insert_own"
on public.property_activity
for insert
with check (user_id = auth.uid());

drop policy if exists "property_price_history_select_own" on public.property_price_history;
drop policy if exists "property_price_history_insert_own" on public.property_price_history;

create policy "property_price_history_select_own"
on public.property_price_history
for select
using (user_id = auth.uid());

create policy "property_price_history_insert_own"
on public.property_price_history
for insert
with check (user_id = auth.uid());

drop policy if exists "property_documents_select_own" on public.property_documents;
drop policy if exists "property_documents_insert_own" on public.property_documents;
drop policy if exists "property_documents_update_own" on public.property_documents;
drop policy if exists "property_documents_delete_own" on public.property_documents;

create policy "property_documents_select_own"
on public.property_documents
for select
using (user_id = auth.uid());

create policy "property_documents_insert_own"
on public.property_documents
for insert
with check (user_id = auth.uid());

create policy "property_documents_update_own"
on public.property_documents
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "property_documents_delete_own"
on public.property_documents
for delete
using (user_id = auth.uid());

drop policy if exists "property_viewings_select_own" on public.property_viewings;
drop policy if exists "property_viewings_insert_own" on public.property_viewings;
drop policy if exists "property_viewings_update_own" on public.property_viewings;

create policy "property_viewings_select_own"
on public.property_viewings
for select
using (user_id = auth.uid());

create policy "property_viewings_insert_own"
on public.property_viewings
for insert
with check (user_id = auth.uid());

create policy "property_viewings_update_own"
on public.property_viewings
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "property_offers_select_own" on public.property_offers;
drop policy if exists "property_offers_insert_own" on public.property_offers;
drop policy if exists "property_offers_update_own" on public.property_offers;

create policy "property_offers_select_own"
on public.property_offers
for select
using (user_id = auth.uid());

create policy "property_offers_insert_own"
on public.property_offers
for insert
with check (user_id = auth.uid());

create policy "property_offers_update_own"
on public.property_offers
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());
