# QA REPORT — Milestone A4 RC3 Hotfix 1

## Scope

1. Verified additional-charge settlement accounting.
2. Dashboard daily receipt aggregation.
3. Legacy duplicate tail-payment migration.
4. Backfill-order guest profile synchronization.

## Static QA

- JavaScript syntax: PASS (`node --check assets/app.js`).
- Schema version: PASS (12).
- Official Stable flag: PASS (`false`).
- Existing mobile card and desktop drag/drop code retained: PASS.

## Accounting scenario QA

Scenario: original order NT$3,200; opening paid NT$3,200; verified additional charge NT$1,000.

Expected and implemented:

- Latest receivable: NT$4,200.
- Net received: NT$4,200.
- Remaining receivable: NT$0.
- Additional payment required: none.
- Dashboard today received from this transaction: NT$1,000.

Legacy scenario containing both a verified NT$1,000 additional charge and a verified NT$1,000 tail payment on the same order/date is migrated by removing the duplicate tail record after preserving a legacy backup.

## Guest profile QA

- New and edited backfill orders call guest-profile upsert: PASS.
- Existing profile enrichment fields are preserved: PASS.
- Historical backfill orders remain available in guest aggregation unless cancelled or No Show: PASS.

## Browser QA note

Automated Chromium launch was attempted, but this execution environment blocked navigation to both localhost and file URLs with `ERR_BLOCKED_BY_ADMINISTRATOR`. Therefore no claim of completed device Browser QA is made in this hotfix report. Existing RC3 responsive implementation was not removed.

## Status

RC3 Hotfix 1 QA completed for static and deterministic accounting logic. Not Official Stable.
