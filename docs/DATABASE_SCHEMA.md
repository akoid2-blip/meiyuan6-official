# Database Schema

Tables: properties, user_profiles, rooms, orders, order_rooms, payments, services, housekeeping_tasks, room_locks, guest_profiles, templates, property_settings, audit_logs.

All operational tables use `property_id`. Core mutable tables use `revision`, `updated_at`, and database triggers. Audit logs are append-only through RLS.
