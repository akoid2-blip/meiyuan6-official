-- Enterprise V1.3 Phase 2 — Authentication & Role Guard
-- Requires migrations 001-003.

alter table public.user_profiles
  drop constraint if exists user_profiles_role_check;
alter table public.user_profiles
  add constraint user_profiles_role_check check (role in ('owner','manager','frontdesk','housekeeping','viewer'));

create or replace function public.handle_new_auth_user() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  -- New Auth users remain inactive until an Owner assigns a property and role.
  insert into public.user_profiles(id, property_id, display_name, role, is_active)
  values(new.id, null, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)), 'viewer', false)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Let an authenticated user read only their own profile even before activation.
drop policy if exists profiles_read on public.user_profiles;
create policy profiles_read_self_or_property on public.user_profiles for select to authenticated
using (id=auth.uid() or property_id=public.current_property_id());

-- Housekeeping receives limited operational update access.
drop policy if exists housekeeping_tasks_update on public.housekeeping_tasks;
create policy housekeeping_tasks_update on public.housekeeping_tasks for update to authenticated
using (property_id=public.current_property_id() and public.current_role() in ('owner','manager','frontdesk','housekeeping'))
with check (property_id=public.current_property_id());

-- Properties and profiles remain owner-managed; audit remains append-only.
comment on function public.handle_new_auth_user() is 'Creates an inactive viewer profile. Owner activation is required.';
