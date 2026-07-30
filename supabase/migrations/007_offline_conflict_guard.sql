-- Enterprise V1.3 Phase 5 — Offline Cache & Conflict Guard
create table if not exists public.sync_operations (
 id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade,
 idempotency_key text not null, device_id text not null default '', payload_hash text not null default '',
 status text not null check(status in ('pending','completed','failed')), created_by uuid references auth.users(id),
 created_at timestamptz not null default now(), completed_at timestamptz, unique(property_id,idempotency_key)
);
alter table public.sync_operations enable row level security;
create policy sync_operations_read on public.sync_operations for select to authenticated using(property_id=public.current_property_id());
create policy sync_operations_insert on public.sync_operations for insert to authenticated with check(property_id=public.current_property_id());
create policy sync_operations_update on public.sync_operations for update to authenticated using(property_id=public.current_property_id()) with check(property_id=public.current_property_id());
create index if not exists idx_sync_operations_property_created on public.sync_operations(property_id,created_at desc);
