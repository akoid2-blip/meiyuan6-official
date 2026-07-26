# Enterprise V1.2 Build 2A — Milestone A4 RC1 QA

## Scope
訂單生命週期、合法狀態流轉、狀態歷程、房況占用規則與退房房務串接。

## Static QA
- JavaScript syntax: PASS (`node --check`)
- Required lifecycle states present: PASS
- Legal transition map present: PASS
- Cancelled / No Show excluded from active occupancy: PASS
- Lifecycle history append-only record: PASS
- Checkout creates housekeeping task: PASS
- A1/A2/A3 source functions retained: PASS
- ZIP integrity: PASS

## Browser QA
待使用者於瀏覽器驗收後 Lock。
