# Offline Cache & Conflict Guard

## Queue
Local changes are transformed into cloud payloads and stored in `my6_cloud_pending_queue_v1`. Identical payload hashes are deduplicated. Failed transmissions remain available for retry.

## Conflict rule
Before upsert, the client reads remote `revision` values for orders, payments, services, housekeeping tasks and room locks. A remote revision greater than the local revision blocks the write and records a conflict.

## High-risk offline guard
`Meiyuan6OfflineGuard.canCommit(risk)` blocks payment, refund, verification, deletion, settings and booking confirmation while offline. Phase 5 exposes the guard API; each operation flow can call it before confirmation.

## Drafts
Low-risk editing drafts can use `saveDraft`, `loadDraft` and `clearDraft`. Drafts are not official business records until successfully synchronized.
