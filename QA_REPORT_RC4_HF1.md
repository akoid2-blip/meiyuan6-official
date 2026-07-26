# Enterprise V1.2 Build 2A RC4 Hotfix 1 QA Report

Date: 2026-07-26  
Status: RC4 Hotfix 1 QA / Not Official Stable

## Hotfix Scope
- Correct login-page release identification.
- Correct sidebar release identification.
- Correct exported backup metadata.
- Preserve Storage Schema 12 and all RC4 business functionality.

## Static QA
- JavaScript syntax: PASS
- VERSION.json parse: PASS
- Storage Schema remains 12: PASS
- Login label contains `RC4 Hotfix 1`: PASS
- Sidebar label contains `RC4 Hotfix 1`: PASS
- Backup export metadata contains `Enterprise V1.2 Build 2A RC4 Hotfix 1`: PASS
- Obsolete runtime labels `A4 RC3` and backup label `RC3 Hotfix 2`: REMOVED
- Required HTML/CSS/JavaScript asset references: PASS
- ZIP path length and integrity: PASS
- SHA-256 manifest: PASS

## Browser QA
- Desktop/mobile-profile Chromium launch succeeded, but navigation to localhost was blocked by the execution environment with `ERR_BLOCKED_BY_ADMINISTRATOR`; automated Browser QA remains pending and is not reported as PASS.
- iPhone Safari, Android Chrome and iPad Safari remain real-device acceptance items.
- This release must not be marked Official Stable or LOCKED until those real-device checks pass.

## Data Compatibility
- No schema migration is introduced.
- Existing RC4 LocalStorage data remains compatible under Schema 12.
- Import/export object structure is unchanged; only export release metadata is corrected.
