# Enterprise V1.3 Phase 10 RC3-A Hotfix 1

## Housekeeping Checkout Trigger Fix

- Reconciles housekeeping tasks for every Cloud order whose lifecycle is already `已退房`.
- Creates a deterministic task ID: `HK-<order-id>-<room-id>`.
- Prevents duplicates by both deterministic ID and `orderId + room` relationship.
- Runs reconciliation after authenticated housekeeping hydration.
- Ensures editing and saving an already checked-out order also creates missing tasks.
- Immediately updates LocalStorage and the housekeeping dashboard.
- Forces one Cloud write only when reconciliation creates missing tasks.
- Converts `HH:mm` scheduled checkout values to valid Supabase timestamps.
