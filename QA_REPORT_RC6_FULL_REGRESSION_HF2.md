# Enterprise V1.2 Build 2A RC6 — Full Regression QA Hotfix 2 QA Report

## Scope

Mobile single-open Accordion correction for:

- 訂單管理
- 入住管理
- 收款管理
- 旅客資料

## Static Verification

- All four outer mobile cards have a dedicated `data-accordion-scope`.
- Global toggle handler closes other open cards in the same scope.
- Restore logic permits at most one restored card per scope.
- Nested payment-detail accordion is not included in the outer payment-card scope.
- Search result with one item retains automatic expansion.
- Storage Schema remains v12.

## Result

Static QA: PASS  
Mobile browser acceptance: PENDING  
Official Stable: NO
