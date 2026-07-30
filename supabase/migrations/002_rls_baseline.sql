-- RLS baseline: deny by default, permit active members of the same property.
create or replace function public.current_property_id() returns uuid language sql stable security definer set search_path=public as $$
  select property_id from public.user_profiles where id = auth.uid() and is_active = true
$$;
create or replace function public.current_role() returns text language sql stable security definer set search_path=public as $$
  select role from public.user_profiles where id = auth.uid() and is_active = true
$$;
revoke all on function public.current_property_id() from public; grant execute on function public.current_property_id() to authenticated;
revoke all on function public.current_role() from public; grant execute on function public.current_role() to authenticated;

do $$ declare t text; begin
  foreach t in array array['properties','user_profiles','rooms','orders','order_rooms','payments','services','housekeeping_tasks','room_locks','guest_profiles','templates','property_settings','audit_logs'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;
create policy properties_read on public.properties for select to authenticated using (id=public.current_property_id());
create policy profiles_read on public.user_profiles for select to authenticated using (property_id=public.current_property_id());
create policy profiles_owner_manage on public.user_profiles for all to authenticated using (property_id=public.current_property_id() and public.current_role()='owner') with check (property_id=public.current_property_id() and public.current_role()='owner');

do $$ declare t text; begin
  foreach t in array array['rooms','orders','order_rooms','payments','services','housekeeping_tasks','room_locks','guest_profiles','templates','property_settings'] loop
    execute format('create policy %I on public.%I for select to authenticated using (property_id=public.current_property_id())', t||'_read',t);
    execute format('create policy %I on public.%I for insert to authenticated with check (property_id=public.current_property_id() and public.current_role() in (''owner'',''manager'',''frontdesk''))', t||'_insert',t);
    execute format('create policy %I on public.%I for update to authenticated using (property_id=public.current_property_id() and public.current_role() in (''owner'',''manager'',''frontdesk'')) with check (property_id=public.current_property_id())', t||'_update',t);
    execute format('create policy %I on public.%I for delete to authenticated using (property_id=public.current_property_id() and public.current_role() in (''owner'',''manager''))', t||'_delete',t);
  end loop;
end $$;
create policy audit_read on public.audit_logs for select to authenticated using (property_id=public.current_property_id() and public.current_role() in ('owner','manager'));
create policy audit_insert on public.audit_logs for insert to authenticated with check (property_id=public.current_property_id());
-- No UPDATE or DELETE policy for audit_logs: append-only.
