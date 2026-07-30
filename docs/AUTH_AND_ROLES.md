# Authentication & Roles

Phase 2 adds Supabase email/password authentication and role guards.

Roles: Owner, Manager, Frontdesk, Housekeeping, Viewer. New Auth users are created as inactive Viewer profiles and cannot enter the system until an Owner assigns `property_id`, role and `is_active=true`.

The browser contains only the Supabase URL and publishable key. Never place a secret/service-role key in this package. Core booking data remains in Local Mode during Phase 2.
