# RC6 Service Management M2 QA Hotfix 1 — Regression QA Report

- Date: 2026-07-27
- Build: Enterprise V1.2 Build 2A RC6 Service Management M2 QA Hotfix 1
- Storage Schema: v12
- Status: Conditional Pass — Development Hotfix, not Official Stable

## Fixed verification

- PASS: Dashboard service queue reads unified `services` records.
- PASS: Breakfast reminders use structured service quantity, days, date and time.
- PASS: All pending service types can appear in Dashboard service tasks.
- PASS: Desktop order action-row state is retained across `renderAll()`.
- PASS: Desktop payment-detail state is retained across `renderAll()`.
- PASS: Native `<details>` state retention remains active.
- PASS: Legacy breakfast migration writes `shop`, `qty`, and `days` into `details`.
- PASS: Legacy taxi migration writes direction, vehicle, guests, pickup, and destination into `details`.
- PASS: Saving order breakfast/taxi fields updates legacy-backed unified services.
- PASS: Saving/deleting unified service updates corresponding legacy order fields.
- PASS: JavaScript syntax check passed.
- PASS: Storage Schema remains v12.

## Regression scope

- Order creation/editing
- Service creation/editing/deletion
- Dashboard service reminders
- Check-in accordion interaction
- Order desktop action rows
- Payment desktop detail rows
- Mobile `<details>` cards
- Legacy order compatibility

## Remaining acceptance

Browser-based manual testing on desktop and mobile is still required before RC6 final acceptance. This build must not be marked Official Stable.
