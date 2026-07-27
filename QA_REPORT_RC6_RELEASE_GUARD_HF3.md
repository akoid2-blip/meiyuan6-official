# QA Report — RC6 Release Guard Hotfix 3

## Scope

1. Service Lifecycle Lazy Create
2. Additional Charge Auto Reconciliation
3. Storage Schema compatibility

## Static verification

- PASS：新增訂單不再由退房日期自動填入叫車日期。
- PASS：無叫車內容時，`taxi` 會正規化為空資料，不建立 `legacy-taxi` 服務。
- PASS：只有叫車日期與至少一項實際叫車內容同時存在時才同步服務。
- PASS：加收費用不再計入已收淨額，避免尾款與加收費用重複計算。
- PASS：剩餘應收為 NT$0 且無超收時，正額待核帳紀錄包含加收費用會自動標記為已核帳。
- PASS：Storage Schema 維持 v12。

## Required browser acceptance

- 建立一筆沒有叫車需求的新訂單，訂單卡服務欄應顯示「—」。
- 編輯該訂單時，接送／叫車欄位應保持空白。
- 建立 NT$1,000 加收費用（待核帳），再收取包含該費用的尾款至剩餘應收 NT$0；帳務明細應顯示「已核帳」。
- 最新應收、已收淨額及剩餘應收不得因核帳動作重複增加。

## Result

Static QA: PASS
Runtime acceptance: Pending user browser verification
P0: 0
P1: 0 (static)
P2: 0 (static)
