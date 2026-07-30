-- Enterprise V1.3 Phase 7 HF1 verification
select
  to_regprocedure('public.current_property_id()') is not null as current_property_id_exists,
  to_regprocedure('public.current_role()') is not null as current_role_exists,
  to_regclass('public.migration_runs') is not null as migration_runs_exists,
  (
    select count(*) = 2
    from pg_policies
    where schemaname = 'public'
      and tablename = 'migration_runs'
      and policyname in ('migration_owner_manager_select','migration_owner_insert')
  ) as migration_policies_complete;
