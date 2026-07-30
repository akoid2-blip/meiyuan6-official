-- Enterprise V1.3 Phase 9 Stage 2 — preserve full application order payload
alter table public.orders add column if not exists app_payload jsonb not null default '{}'::jsonb;
comment on column public.orders.app_payload is 'Full backward-compatible booking-admin order payload; canonical query fields remain in dedicated columns.';
