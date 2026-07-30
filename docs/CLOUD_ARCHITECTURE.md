# Cloud Architecture — Phase 1

- RC6 UI and business logic remain unchanged.
- Storage Schema remains v12.
- Default runtime is Local Mode.
- `assets/cloud-config.js` contains non-secret browser configuration only.
- Supabase service-role keys and database passwords must never be stored in this package.
- Phase 1 supplies schema, RLS, revision triggers, seed data, repository contracts and runtime health checks.
- Authentication, migration, Realtime subscription and cloud writes are intentionally deferred.
