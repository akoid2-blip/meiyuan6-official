-- Revision and updated_at guard.
create or replace function public.touch_revision() returns trigger language plpgsql as $$
begin new.updated_at=now(); if tg_op='UPDATE' then new.revision=old.revision+1; end if; return new; end $$;
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin
 foreach t in array array['orders','payments','services','housekeeping_tasks','room_locks'] loop
  execute format('drop trigger if exists %I on public.%I', 'trg_'||t||'_revision',t);
  execute format('create trigger %I before update on public.%I for each row execute function public.touch_revision()', 'trg_'||t||'_revision',t);
 end loop;
 foreach t in array array['properties','user_profiles','rooms','guest_profiles','templates','property_settings'] loop
  execute format('drop trigger if exists %I on public.%I', 'trg_'||t||'_updated',t);
  execute format('create trigger %I before update on public.%I for each row execute function public.touch_updated_at()', 'trg_'||t||'_updated',t);
 end loop;
end $$;
