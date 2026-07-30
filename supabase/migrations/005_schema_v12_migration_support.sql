-- Enterprise V1.3 Phase 7 Hotfix 1 — Migration Consistency Fix
-- Schema v12 Cloud Migration Support
-- Requires migrations 001-004.
-- Canonical authorization helpers:
--   public.current_property_id()
--   public.current_role()

create table if not exists public.migration_runs (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  source_schema integer not null check (source_schema = 12),
  device_id text,
  status text not null check (status in ('started','completed','failed','rolled_back')),
  counts jsonb not null default '{}'::jsonb,
  issues jsonb not null default '[]'::jsonb,
  started_by uuid references auth.users(id),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.migration_runs enable row level security;

-- Safe to rerun after an interrupted or partially failed Phase 3 migration.
drop policy if exists migration_owner_manager_select on public.migration_runs;
drop policy if exists migration_owner_insert on public.migration_runs;

create policy migration_owner_manager_select
on public.migration_runs
for select
to authenticated
using (
  public.current_property_id() = property_id
  and public.current_role() in ('owner','manager')
);

create policy migration_owner_insert
on public.migration_runs
for insert
to authenticated
with check (
  public.current_property_id() = property_id
  and public.current_role() = 'owner'
);

create index if not exists idx_migration_runs_property_started
on public.migration_runs(property_id, started_at desc);
