# Owner Bootstrap

1. Create the first user in Supabase Authentication.
2. Run migrations 001 through 004.
3. Update that user's `user_profiles` row with the seeded property ID, role `owner`, and `is_active=true`.
4. Configure `MEIYUAN6_CLOUD_CONFIG` with `enabled:true`, `authEnabled:true`, Supabase URL and publishable key.
5. Never expose the service-role key in browser files.
