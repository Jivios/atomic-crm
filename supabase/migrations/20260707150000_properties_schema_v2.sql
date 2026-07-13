-- Home Direct CRM — Properties Schema v2
-- Safety principles:
-- - Additive only
-- - No DROP TABLE
-- - No TRUNCATE
-- - No destructive data changes
-- - Compatible with an existing early properties table
-- - UI is not touched by this migration

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties
  add column if not exists internal_code text,
  add column if not exists category text not null default 'residential'
    check (category in ('residential', 'land', 'commercial', 'other')),
  add column if not exists subtype text not null default 'apartment',
  add column if not exists listing_type text not null default 'sale'
    check (listing_type in ('sale', 'rent', 'sale_or_rent')),
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'active', 'reserved', 'under_offer', 'sold', 'rented', 'withdrawn', 'archived')),
  add column if not exists price numeric(14, 2) check (price is null or price >= 0),
  add column if not exists currency text not null default 'EUR',
  add column if not exists price_per_sqm numeric(14, 2) check (price_per_sqm is null or price_per_sqm >= 0),
  add column if not exists common_expenses numeric(14, 2) check (common_expenses is null or common_expenses >= 0),
  add column if not exists available_from date,
  add column if not exists exclusive boolean not null default false,
  add column if not exists exclusivity_expires_at date,
  add column if not exists commission_percent numeric(5, 2) check (commission_percent is null or commission_percent >= 0),
  add column if not exists commission_notes text,

  add column if not exists country text not null default 'Greece',
  add column if not exists region text,
  add column if not exists city text default 'Αθήνα',
  add column if not exists municipality text,
  add column if not exists area text,
  add column if not exists neighborhood text,
  add column if not exists address text,
  add column if not exists postal_code text,
  add column if not exists latitude numeric(10, 7),
  add column if not exists longitude numeric(10, 7),
  add column if not exists hide_exact_address boolean not null default true,
  add column if not exists distance_from_sea_meters integer check (distance_from_sea_meters is null or distance_from_sea_meters >= 0),

  add column if not exists built_sqm numeric(10, 2) check (built_sqm is null or built_sqm >= 0),
  add column if not exists plot_sqm numeric(10, 2) check (plot_sqm is null or plot_sqm >= 0),
  add column if not exists usable_sqm numeric(10, 2) check (usable_sqm is null or usable_sqm >= 0),
  add column if not exists gross_sqm numeric(10, 2) check (gross_sqm is null or gross_sqm >= 0),

  add column if not exists headline_el text,
  add column if not exists headline_en text,
  add column if not exists description_el text,
  add column if not exists description_en text,
  add column if not exists private_notes text,
  add column if not exists portal_status text not null default 'not_published'
    check (portal_status in ('not_published', 'ready', 'published_manual', 'published_xe', 'published_partner', 'paused')),
  add column if not exists portal_reference text,
  add column if not exists ai_description_status text not null default 'not_generated'
    check (ai_description_status in ('not_generated', 'generated', 'approved')),
  add column if not exists last_vendor_report_sent_at timestamptz,

  add column if not exists owner_name text,
  add column if not exists owner_phone text,
  add column if not exists owner_email text,
  add column if not exists assigned_agent_name text,
  add column if not exists owner_contact_id uuid,
  add column if not exists assigned_agent_id uuid;

create table if not exists public.property_residential_details (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  floor text,
  total_floors integer check (total_floors is null or total_floors >= 0),
  level_count integer check (level_count is null or level_count >= 0),
  is_floor_maisonette boolean not null default false,
  has_independent_entrance boolean not null default false,

  bedrooms integer check (bedrooms is null or bedrooms >= 0),
  master_bedrooms integer check (master_bedrooms is null or master_bedrooms >= 0),
  bathrooms numeric(4, 1) check (bathrooms is null or bathrooms >= 0),
  wc integer check (wc is null or wc >= 0),
  kitchens integer check (kitchens is null or kitchens >= 0),
  kitchen_type text check (kitchen_type is null or kitchen_type in ('separate', 'open_plan', 'other')),
  living_rooms integer check (living_rooms is null or living_rooms >= 0),

  construction_year integer,
  renovation_year integer,
  condition text check (condition is null or condition in ('new_build', 'renovated', 'excellent', 'good', 'needs_renovation', 'under_construction', 'under_renovation')),
  energy_class text check (energy_class is null or energy_class in ('A+', 'A', 'B+', 'B', 'C', 'D', 'E', 'F', 'G', 'under_issue', 'exempt')),

  heating_type text check (heating_type is null or heating_type in ('autonomous', 'individual', 'central', 'underfloor', 'none', 'other')),
  heating_medium text check (heating_medium is null or heating_medium in ('oil', 'natural_gas', 'electricity', 'heat_pump', 'wood_pellet', 'other')),
  air_conditioning boolean not null default false,
  solar_water_heater boolean not null default false,
  boiler boolean not null default false,
  fireplace_count integer check (fireplace_count is null or fireplace_count >= 0),
  night_power boolean not null default false,
  three_phase_power boolean not null default false,

  flooring_type text check (flooring_type is null or flooring_type in ('marble', 'tile', 'wood', 'laminate', 'mosaic', 'industrial', 'other')),
  frame_type text check (frame_type is null or frame_type in ('aluminum', 'pvc', 'wood', 'other')),
  glazing_type text check (glazing_type is null or glazing_type in ('single', 'double', 'triple')),
  screens boolean not null default false,

  parking_spaces integer check (parking_spaces is null or parking_spaces >= 0),
  parking_type text check (parking_type is null or parking_type in ('none', 'open', 'closed', 'pilotis', 'garage', 'underground')),
  storage_sqm numeric(10, 2) check (storage_sqm is null or storage_sqm >= 0),
  elevator boolean not null default false,
  balcony boolean not null default false,
  balcony_sqm numeric(10, 2) check (balcony_sqm is null or balcony_sqm >= 0),
  veranda_sqm numeric(10, 2) check (veranda_sqm is null or veranda_sqm >= 0),

  orientation text,
  view_type text,
  accessibility boolean not null default false,
  pets_allowed boolean not null default false,
  residential_features text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_land_details (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  land_sqm numeric(12, 2) check (land_sqm is null or land_sqm >= 0),
  building_factor numeric(8, 4) check (building_factor is null or building_factor >= 0),
  coverage_percent numeric(5, 2) check (coverage_percent is null or coverage_percent >= 0),
  allowed_build_sqm numeric(12, 2) check (allowed_build_sqm is null or allowed_build_sqm >= 0),
  remaining_build_sqm numeric(12, 2) check (remaining_build_sqm is null or remaining_build_sqm >= 0),

  in_city_plan boolean,
  in_settlement boolean,
  frontage_meters numeric(10, 2) check (frontage_meters is null or frontage_meters >= 0),
  road_access boolean,
  slope_type text check (slope_type is null or slope_type in ('flat', 'sloping', 'amphitheatrical', 'other')),
  corner boolean not null default false,
  buildable boolean,
  complete_and_buildable boolean,
  fenced boolean not null default false,

  electricity_available boolean not null default false,
  water_available boolean not null default false,
  drilling_available boolean not null default false,
  sewage_available boolean not null default false,

  land_use text,
  land_features text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_commercial_details (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  commercial_subtype text,
  floor text,
  levels integer check (levels is null or levels >= 0),
  rooms integer check (rooms is null or rooms >= 0),
  offices_count integer check (offices_count is null or offices_count >= 0),
  wc integer check (wc is null or wc >= 0),
  kitchen boolean not null default false,

  height_meters numeric(8, 2) check (height_meters is null or height_meters >= 0),
  mezzanine_sqm numeric(10, 2) check (mezzanine_sqm is null or mezzanine_sqm >= 0),
  frontage_meters numeric(10, 2) check (frontage_meters is null or frontage_meters >= 0),
  showcase_length_meters numeric(10, 2) check (showcase_length_meters is null or showcase_length_meters >= 0),

  corner boolean not null default false,
  front_facing boolean not null default false,
  loading_ramp boolean not null default false,
  crane_bridge boolean not null default false,
  three_phase_power boolean not null default false,
  power_capacity_kva numeric(10, 2) check (power_capacity_kva is null or power_capacity_kva >= 0),
  industrial_floor boolean not null default false,
  fire_detection boolean not null default false,
  fire_suppression boolean not null default false,
  cameras boolean not null default false,
  special_sewage boolean not null default false,

  energy_class text check (energy_class is null or energy_class in ('A+', 'A', 'B+', 'B', 'C', 'D', 'E', 'F', 'G', 'under_issue', 'exempt')),
  suitable_for text[] not null default '{}',
  commercial_features text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_investment_details (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  is_investment boolean not null default false,
  is_leased boolean not null default false,
  monthly_rent numeric(14, 2) check (monthly_rent is null or monthly_rent >= 0),
  lease_expires_at date,
  yield_percent numeric(6, 2) check (yield_percent is null or yield_percent >= 0),
  short_term_rental_license boolean not null default false,
  ama_number text,
  eot_license_number text,
  tenant_name text,
  investment_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_legal_details (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  kaek text check (kaek is null or kaek ~ '^[0-9]{12}/[0-9]+/[0-9]+$'),

  pea_required boolean not null default true,
  pea_certificate_number text,
  pea_energy_class text,
  pea_issue_date date,
  pea_expires_at date,
  pea_exempt_reason text,

  htk_status text not null default 'missing'
    check (htk_status in ('missing', 'pending', 'complete', 'not_required')),
  htk_certificate_number text,
  htk_completion_certificate_expires_at date,
  responsible_engineer_name text,

  arbitrary_settlement_status text not null default 'unknown'
    check (arbitrary_settlement_status in ('unknown', 'not_needed', 'pending', 'completed')),
  arbitrary_settlement_law text,

  building_permit_number text,
  building_permit_available boolean not null default false,
  title_deed_available boolean not null default false,
  topographic_diagram_available boolean not null default false,
  floor_plan_available boolean not null default false,
  thousandths_table_available boolean not null default false,
  enfia_available boolean not null default false,
  tax_clearance_available boolean not null default false,

  legal_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  media_type text not null default 'photo'
    check (media_type in ('photo', 'floor_plan', 'video', 'virtual_tour', 'matterport', 'brochure', 'other')),
  file_name text,
  storage_path text,
  external_url text,
  is_main boolean not null default false,
  sort_order integer not null default 0,
  caption text,

  created_at timestamptz not null default now()
);

create table if not exists public.property_documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  document_type text not null default 'other'
    check (document_type in ('title_deed', 'pea', 'htk', 'building_permit', 'topographic', 'floor_plan', 'thousandths_table', 'enfia', 'settlement_declaration', 'tax_clearance', 'lease', 'contract', 'brochure', 'other')),
  file_name text not null,
  storage_path text not null,
  issue_date date,
  expires_at date,
  notes text,

  created_at timestamptz not null default now()
);

alter table public.property_documents
  add column if not exists issue_date date,
  add column if not exists expires_at date;

create table if not exists public.property_price_history (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  old_price numeric(14, 2) check (old_price is null or old_price >= 0),
  new_price numeric(14, 2) not null check (new_price >= 0),
  reason text,

  created_at timestamptz not null default now()
);

create table if not exists public.property_viewings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  calendar_event_id uuid,
  viewing_at timestamptz,
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  interest_level text check (interest_level is null or interest_level in ('low', 'medium', 'high', 'very_high')),
  buyer_feedback text,
  price_feedback numeric(14, 2) check (price_feedback is null or price_feedback >= 0),
  next_step text,

  created_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'calendar_events'
  )
  and not exists (
    select 1
    from pg_constraint
    where conname = 'property_viewings_calendar_event_id_fkey'
  ) then
    alter table public.property_viewings
      add constraint property_viewings_calendar_event_id_fkey
      foreign key (calendar_event_id)
      references public.calendar_events(id)
      on delete set null;
  end if;
end $$;

create table if not exists public.property_offers (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  buyer_name text,
  buyer_email text,
  amount numeric(14, 2) not null check (amount >= 0),
  currency text not null default 'EUR',
  status text not null default 'received'
    check (status in ('received', 'countered', 'accepted', 'rejected', 'withdrawn')),
  conditions text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_activity (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  action text not null
    check (action in ('created', 'updated', 'status_changed', 'price_changed', 'note_added', 'document_added', 'media_added', 'viewing_logged', 'offer_added', 'vendor_report_sent', 'calendar_event_linked', 'client_linked', 'deal_linked', 'portal_status_changed', 'archived')),
  message text,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
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
for each row execute function public.set_updated_at();

drop trigger if exists property_residential_details_set_updated_at on public.property_residential_details;
create trigger property_residential_details_set_updated_at
before update on public.property_residential_details
for each row execute function public.set_updated_at();

drop trigger if exists property_land_details_set_updated_at on public.property_land_details;
create trigger property_land_details_set_updated_at
before update on public.property_land_details
for each row execute function public.set_updated_at();

drop trigger if exists property_commercial_details_set_updated_at on public.property_commercial_details;
create trigger property_commercial_details_set_updated_at
before update on public.property_commercial_details
for each row execute function public.set_updated_at();

drop trigger if exists property_investment_details_set_updated_at on public.property_investment_details;
create trigger property_investment_details_set_updated_at
before update on public.property_investment_details
for each row execute function public.set_updated_at();

drop trigger if exists property_legal_details_set_updated_at on public.property_legal_details;
create trigger property_legal_details_set_updated_at
before update on public.property_legal_details
for each row execute function public.set_updated_at();

drop trigger if exists property_offers_set_updated_at on public.property_offers;
create trigger property_offers_set_updated_at
before update on public.property_offers
for each row execute function public.set_updated_at();

create index if not exists properties_user_created_idx on public.properties (user_id, created_at desc);
create index if not exists properties_user_status_idx on public.properties (user_id, status);
create index if not exists properties_user_category_subtype_idx on public.properties (user_id, category, subtype);
create index if not exists properties_user_area_idx on public.properties (user_id, area);
create index if not exists properties_user_city_idx on public.properties (user_id, city);
create index if not exists properties_user_listing_type_idx on public.properties (user_id, listing_type);
create index if not exists properties_user_portal_status_idx on public.properties (user_id, portal_status);

create index if not exists property_residential_details_user_idx on public.property_residential_details (user_id);
create index if not exists property_residential_details_features_gin_idx on public.property_residential_details using gin (residential_features);

create index if not exists property_land_details_user_idx on public.property_land_details (user_id);
create index if not exists property_land_details_features_gin_idx on public.property_land_details using gin (land_features);

create index if not exists property_commercial_details_user_idx on public.property_commercial_details (user_id);
create index if not exists property_commercial_details_suitable_for_gin_idx on public.property_commercial_details using gin (suitable_for);
create index if not exists property_commercial_details_features_gin_idx on public.property_commercial_details using gin (commercial_features);

create index if not exists property_legal_details_user_idx on public.property_legal_details (user_id);
create index if not exists property_legal_details_kaek_idx on public.property_legal_details (user_id, kaek);

create index if not exists property_media_property_sort_idx on public.property_media (property_id, sort_order, created_at);
create index if not exists property_documents_property_created_idx on public.property_documents (property_id, created_at desc);
create index if not exists property_price_history_property_created_idx on public.property_price_history (property_id, created_at desc);
create index if not exists property_viewings_property_created_idx on public.property_viewings (property_id, created_at desc);
create index if not exists property_offers_property_created_idx on public.property_offers (property_id, created_at desc);
create index if not exists property_activity_property_created_idx on public.property_activity (property_id, created_at desc);

alter table public.properties enable row level security;
alter table public.property_residential_details enable row level security;
alter table public.property_land_details enable row level security;
alter table public.property_commercial_details enable row level security;
alter table public.property_investment_details enable row level security;
alter table public.property_legal_details enable row level security;
alter table public.property_media enable row level security;
alter table public.property_documents enable row level security;
alter table public.property_price_history enable row level security;
alter table public.property_viewings enable row level security;
alter table public.property_offers enable row level security;
alter table public.property_activity enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'properties',
    'property_residential_details',
    'property_land_details',
    'property_commercial_details',
    'property_investment_details',
    'property_legal_details',
    'property_media',
    'property_documents',
    'property_viewings',
    'property_offers'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', table_name || '_v2_select_own', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_v2_insert_own', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_v2_update_own', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_v2_delete_own', table_name);

    execute format('create policy %I on public.%I for select using (user_id = auth.uid())', table_name || '_v2_select_own', table_name);
    execute format('create policy %I on public.%I for insert with check (user_id = auth.uid())', table_name || '_v2_insert_own', table_name);
    execute format('create policy %I on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', table_name || '_v2_update_own', table_name);
    execute format('create policy %I on public.%I for delete using (user_id = auth.uid())', table_name || '_v2_delete_own', table_name);
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'property_price_history',
    'property_activity'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', table_name || '_v2_select_own', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_v2_insert_own', table_name);

    execute format('create policy %I on public.%I for select using (user_id = auth.uid())', table_name || '_v2_select_own', table_name);
    execute format('create policy %I on public.%I for insert with check (user_id = auth.uid())', table_name || '_v2_insert_own', table_name);
  end loop;
end $$;
