-- Enterprise V1.3 RC3-B HF29
-- P1 fix: move mutable check-in state and shortcuts out of property_settings JSON.

create table if not exists public.checkin_checklists (
  property_id uuid not null references public.properties(id) on delete cascade,
  order_id text not null references public.orders(id) on delete cascade,
  checklist jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (property_id, order_id)
);

create table if not exists public.shortcuts (
  id text not null,
  property_id uuid not null references public.properties(id) on delete cascade,
  icon text not null default '🔗',
  name text not null default '',
  url text not null default '',
  sort_order integer not null default 0,
  revision integer not null default 1,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (property_id, id)
);

create index if not exists idx_checkin_checklists_order
  on public.checkin_checklists(property_id, order_id);
create index if not exists idx_shortcuts_sort
  on public.shortcuts(property_id, sort_order);

-- One-time migration from the legacy property_settings JSON.
insert into public.checkin_checklists(property_id, order_id, checklist)
select ps.property_id, legacy.key, legacy.value
from public.property_settings ps
cross join lateral jsonb_each(coalesce(ps.settings->'checkinChecklists', '{}'::jsonb)) legacy
join public.orders o on o.property_id=ps.property_id and o.id=legacy.key
on conflict (property_id, order_id) do nothing;

drop trigger if exists trg_checkin_checklists_revision on public.checkin_checklists;
create trigger trg_checkin_checklists_revision
before update on public.checkin_checklists
for each row execute function public.touch_revision();

drop trigger if exists trg_shortcuts_revision on public.shortcuts;
create trigger trg_shortcuts_revision
before update on public.shortcuts
for each row execute function public.touch_revision();

alter table public.checkin_checklists enable row level security;
alter table public.shortcuts enable row level security;

drop policy if exists checkin_checklists_read on public.checkin_checklists;
create policy checkin_checklists_read on public.checkin_checklists
for select to authenticated using (property_id=public.current_property_id());
drop policy if exists checkin_checklists_insert on public.checkin_checklists;
create policy checkin_checklists_insert on public.checkin_checklists
for insert to authenticated with check (
  property_id=public.current_property_id()
  and public.current_role() in ('owner','manager','frontdesk')
);
drop policy if exists checkin_checklists_update on public.checkin_checklists;
create policy checkin_checklists_update on public.checkin_checklists
for update to authenticated using (
  property_id=public.current_property_id()
  and public.current_role() in ('owner','manager','frontdesk')
) with check (property_id=public.current_property_id());

drop policy if exists shortcuts_read on public.shortcuts;
create policy shortcuts_read on public.shortcuts
for select to authenticated using (property_id=public.current_property_id());
drop policy if exists shortcuts_insert on public.shortcuts;
create policy shortcuts_insert on public.shortcuts
for insert to authenticated with check (
  property_id=public.current_property_id()
  and public.current_role() in ('owner','manager')
);
drop policy if exists shortcuts_update on public.shortcuts;
create policy shortcuts_update on public.shortcuts
for update to authenticated using (
  property_id=public.current_property_id()
  and public.current_role() in ('owner','manager')
) with check (property_id=public.current_property_id());
drop policy if exists shortcuts_delete on public.shortcuts;
create policy shortcuts_delete on public.shortcuts
for delete to authenticated using (
  property_id=public.current_property_id()
  and public.current_role() in ('owner','manager')
);

create or replace function public.upsert_checkin_checklist(
  p_property_id uuid,
  p_order_id text,
  p_checklist jsonb,
  p_expected_revision integer default 0
) returns public.checkin_checklists
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_row public.checkin_checklists;
  saved_row public.checkin_checklists;
begin
  select * into current_row
  from public.checkin_checklists
  where property_id = p_property_id and order_id = p_order_id
  for update;

  if found then
    if current_row.revision <> p_expected_revision then
      raise exception 'CHECKLIST_REVISION_CONFLICT:%:%',
        current_row.revision, p_expected_revision
        using errcode = '40001';
    end if;
    update public.checkin_checklists
       set checklist = coalesce(p_checklist, '{}'::jsonb),
           updated_by = auth.uid()
     where property_id = p_property_id and order_id = p_order_id
     returning * into saved_row;
  else
    if p_expected_revision <> 0 then
      raise exception 'CHECKLIST_REVISION_CONFLICT:0:%', p_expected_revision
        using errcode = '40001';
    end if;
    insert into public.checkin_checklists(
      property_id, order_id, checklist, updated_by
    ) values (
      p_property_id, p_order_id, coalesce(p_checklist, '{}'::jsonb), auth.uid()
    ) returning * into saved_row;
  end if;

  return saved_row;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='checkin_checklists'
  ) then
    alter publication supabase_realtime add table public.checkin_checklists;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='shortcuts'
  ) then
    alter publication supabase_realtime add table public.shortcuts;
  end if;
end $$;
