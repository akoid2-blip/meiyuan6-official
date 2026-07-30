-- Enterprise V1.3 Phase 4 — Realtime publication
-- Run after 001-005. Idempotent publication membership.
do $$
declare t text;
begin
  foreach t in array array['orders','order_rooms','payments','services','housekeeping_tasks','room_locks','guest_profiles','templates','property_settings','audit_logs'] loop
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I',t);
    end if;
  end loop;
end $$;
