# Enterprise V1.3 Phase 10 RC3-A

## Housekeeping Automation

- Added deterministic checkout-task generation (`HK-<order>-<room>`).
- Added `Meiyuan6HousekeepingCloud` API for hydration, flush, status and inspection.
- Added Cloud-authoritative housekeeping hydration after authenticated startup.
- Added fingerprint-based write deduplication to prevent sync loops.
- Preserved existing workflow, room status, Realtime and offline foundations.
