# RC4 Hotfix 4 QA Report

- Version: Enterprise V1.2 Build 2A RC4 Hotfix 4
- Scope: Automatic deposit check-in verification
- Status: QA Candidate; not Official Stable; not LOCKED

## Static QA

- PASS: JavaScript syntax check.
- PASS: VERSION.json parsing and RC4 Hotfix 4 consistency.
- PASS: ZIP internal SHA-256 manifest.
- PASS: Storage Schema remains 12.

## Logic QA scenarios

- PASS: Verified positive deposit record automatically checks 入住管理／訂金.
- PASS: Legacy opening deposit with remaining net receipt automatically checks 訂金.
- PASS: Paid-deposit/full-payment order with positive deposit and net receipt automatically checks 訂金.
- PASS: Fully refunded or zero-deposit order does not automatically check 訂金.
- PASS: Other check-in checklist items remain manually editable.

## Device acceptance

- Pending: iPhone Safari, Android Chrome, iPad Safari and desktop operational acceptance with production data.
