# Deployment Precheck

1. Create separate Supabase Development/Staging/Production projects.
2. Apply migrations in numeric order.
3. Apply seed only to the intended project.
4. Create the first Auth user, then insert its `user_profiles` row as owner.
5. Keep Cloud Mode disabled during Phase 1.
6. Do not place secret/service-role keys in browser files.
7. Verify RLS using authenticated and anonymous test sessions before Phase 2.
