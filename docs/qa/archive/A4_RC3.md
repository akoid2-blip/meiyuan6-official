# QA REPORT — Enterprise V1.2 Build 2A Milestone A4 RC3

## Scope
Mobile & Responsive Integration based on Milestone A4 RC2 Hotfix 2.

## Static QA
- PASS: JavaScript syntax (`node --check assets/app.js`).
- PASS: Mobile order and payment containers exist and are rendered independently from desktop tables.
- PASS: Calendar adjustment dialog and submit validation are connected.
- PASS: Mobile touch drag installation is disabled at widths up to 900px.
- PASS: Desktop HTML5 drag remains enabled at widths above 900px.
- PASS: Existing payment integrity and additional-charge validation remain present.
- PASS: VERSION, CHANGELOG and README updated.

## Browser QA
Automated with headless Chromium 144 using an in-memory bundled build.

| Profile | Viewport | Result |
|---|---:|---|
| iPhone responsive | 390×844 | PASS — order cards, payment cards, no document-level horizontal overflow |
| iPhone responsive | 390×844 | PASS — calendar adjustment bottom sheet opens and remains usable |
| Android Chrome equivalent responsive | 390×844 | PASS — Chromium mobile layout and controls |
| iPad responsive | 820×1180 | PASS — payment responsive layout, no document-level horizontal overflow |
| Desktop Chromium | 1440×900 | PASS — desktop calendar layout retained |

Measured document widths matched viewport client widths in all profiles. Calendar itself keeps its own intentional horizontal scroll area on narrow screens.

## Functional Controls
- PASS: Order card actions include edit, date/room adjustment, lifecycle/workflow, payment and LINE.
- PASS: Terminal cancelled / No Show orders do not expose date/room adjustment.
- PASS: Already checked-out orders are rejected by the adjustment opener and submit handler.
- PASS: Adjustment rejects past check-in dates, invalid date order, empty room selection, room locks and room conflicts.
- PASS: General receipt remains limited by remaining receivable.
- PASS: Refund remains limited by collected net amount.
- PASS: Additional charge remains unrestricted by original order total but requires category and description.

## Lock
- Milestone A4 RC3 LOCK: PASS
- Enterprise V1.2 Build 2A LOCK: PASS
- Official Stable: NOT DECLARED
