# Enterprise V1.2 Build 2A — Milestone A2 RC1 QA

## Functional QA
- PASS：一般訂房預設模式。
- PASS：一般訂房不可儲存過去入住日期。
- PASS：補登模式可解除入住日期最小值限制。
- PASS：補登原因未填時阻止儲存。
- PASS：首次儲存自動建立補登時間。
- PASS：編輯補登訂單時保留補登時間。
- PASS：過去日曆格可直接開啟補登表單。

## Data QA
- PASS：orderType、isBackfill、backfillReason、backfillTime、backfillOperator 正規化與持久化。
- PASS：舊資料缺少 A2 欄位時自動轉為一般訂房。
- PASS：日期仍使用 YYYY-MM-DD，未改動 A1 日期核心。

## UI QA
- PASS：補登欄位僅在補登模式顯示。
- PASS：訂單列表顯示補登 Badge 與補登摘要。
- PASS：過去日期保留視覺區隔，但可進入補登流程。

## Business QA
- PASS：一般訂房與補登訂房規則分離。
- PASS：補登資料可編輯、取消並進入既有營運流程。
- 待人工瀏覽器驗收：桌機與手機表單操作、localStorage 實際儲存及重新載入。

## Static Checks
- PASS：Node.js JavaScript syntax check。
- PASS：ZIP integrity check。
