-- Enterprise V1.3 Phase 1 — Cloud Foundation
-- Storage Schema compatibility: v12
create extension if not exists pgcrypto;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null, timezone text not null default 'Asia/Taipei',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  display_name text not null default '',
  role text not null check (role in ('owner','manager','frontdesk','housekeeping','viewer')),
  is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.rooms (
  id text primary key, property_id uuid not null references public.properties(id) on delete cascade,
  room_code text not null, room_name text not null, capacity integer not null check (capacity > 0),
  sort_order integer not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(property_id, room_code)
);
create table if not exists public.orders (
  id text primary key, property_id uuid not null references public.properties(id) on delete cascade,
  guest_name text not null, phone text not null default '', checkin_date date not null, checkout_date date not null,
  guest_count integer not null default 1 check (guest_count > 0), package_type text not null default '', order_type text not null default '',
  status text not null default '', total_amount numeric(12,2) not null default 0 check(total_amount >= 0),
  opening_paid numeric(12,2) not null default 0 check(opening_paid >= 0), source text not null default '', note text not null default '',
  backfill_reason text not null default '', created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  revision integer not null default 1 check(revision > 0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (checkout_date > checkin_date)
);
create table if not exists public.order_rooms (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade,
  order_id text not null references public.orders(id) on delete cascade, room_id text not null references public.rooms(id),
  created_at timestamptz not null default now(), unique(order_id, room_id)
);
create table if not exists public.payments (
  id text primary key, property_id uuid not null references public.properties(id) on delete cascade, order_id text not null references public.orders(id) on delete cascade,
  transaction_type text not null, amount numeric(12,2) not null check(amount >= 0), payment_method text not null default '',
  transaction_date date, description text not null default '', refund_reason text not null default '', verified boolean not null default false,
  verified_by uuid references auth.users(id), verified_at timestamptz, created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  revision integer not null default 1 check(revision > 0), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.services (
  id text primary key, property_id uuid not null references public.properties(id) on delete cascade, order_id text not null references public.orders(id) on delete cascade,
  service_type text not null, service_date date, service_time time, status text not null default '待安排', fee numeric(12,2) not null default 0 check(fee >= 0),
  payment_status text not null default '未收款', note text not null default '', details jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id), revision integer not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.housekeeping_tasks (
  id text primary key, property_id uuid not null references public.properties(id) on delete cascade, order_id text references public.orders(id) on delete set null,
  room_id text references public.rooms(id), task_date date, title text not null default '', status text not null default '', priority text not null default '',
  assignee text not null default '', inspector text not null default '', scheduled_checkout timestamptz, started_at timestamptz, paused_at timestamptz,
  inspected_at timestamptz, completed_at timestamptz, note text not null default '', revision integer not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.room_locks (
  id text primary key, property_id uuid not null references public.properties(id) on delete cascade, room_id text not null references public.rooms(id),
  start_date date not null, end_date date not null, lock_type text not null, reason text not null default '', created_by uuid references auth.users(id),
  revision integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(end_date >= start_date)
);
create table if not exists public.guest_profiles (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade, name text not null,
  phone text not null default '', email text not null default '', note text not null default '', last_order_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade, title text not null,
  category text not null default '', content text not null default '', sort_order integer not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(property_id,title)
);
create table if not exists public.property_settings (
  property_id uuid primary key references public.properties(id) on delete cascade, settings jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id), updated_at timestamptz not null default now()
);
create table if not exists public.audit_logs (
  id text primary key, property_id uuid not null references public.properties(id) on delete cascade, user_id uuid references auth.users(id),
  operator_name text not null default '', module text not null, action text not null check(action in ('建立','更新','刪除','核帳','收款','檢查','匯入','匯出','登入','登出')),
  target_id text, order_id text, guest_name text, room_name text, summary text not null default '', before_data jsonb, after_data jsonb,
  device_id text, revision integer, created_at timestamptz not null default now()
);
create index if not exists idx_orders_property_dates on public.orders(property_id,checkin_date,checkout_date);
create index if not exists idx_payments_property_order on public.payments(property_id,order_id);
create index if not exists idx_tasks_property_date on public.housekeeping_tasks(property_id,task_date);
create index if not exists idx_audit_property_created on public.audit_logs(property_id,created_at desc);
