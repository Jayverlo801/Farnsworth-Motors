-- Farnsworth Motors — inventory schema
-- Apply with: supabase db push (or run in the SQL editor).
-- The site reads through PostgREST with the anon key (read-only).

create table if not exists public.vehicles (
  id             text primary key,                  -- Farnsworth record no, e.g. 'FM-0107'
  slug           text unique not null,
  year           integer not null,
  make           text not null,
  model          text not null,
  trim           text,
  vin            text not null,
  mileage        integer not null,
  drivetrain     text not null,
  engine         text not null,
  exterior_color text not null,
  interior_color text not null,
  price          integer not null,
  title_status   text not null check (title_status in ('rebuilt', 'clean')),
  status         text not null check (status in ('available', 'pending', 'sold')),
  featured       boolean default false,
  description    text not null default '',
  features       jsonb not null default '[]',
  location       text not null default 'Salt Lake City, UT',
  date_listed    date not null default current_date,
  -- VehicleRecord (see src/lib/vehicles/types.ts): acquisition,
  -- damageClassification, structuralAffected, mechanicalAffected,
  -- repairSummary, partsReplaced[{name,oem,partNumber?}],
  -- inspectionStatus, documentation[{label,url}]
  record         jsonb not null,
  -- VehicleMedia: { hero?, gallery[], before[], repair[], after[] }
  media          jsonb not null default '{"gallery":[],"before":[],"repair":[],"after":[]}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists vehicles_status_idx on public.vehicles (status);
create index if not exists vehicles_featured_idx on public.vehicles (featured) where featured;

-- The Farnsworth Standard, enforced at the database too: a structurally
-- affected vehicle can never carry status 'available'.
alter table public.vehicles
  drop constraint if exists vehicles_structural_standard;
alter table public.vehicles
  add constraint vehicles_structural_standard
  check (not (status = 'available' and (record->>'structuralAffected')::boolean is true));

alter table public.vehicles enable row level security;

drop policy if exists "public read" on public.vehicles;
create policy "public read" on public.vehicles
  for select using (true);
