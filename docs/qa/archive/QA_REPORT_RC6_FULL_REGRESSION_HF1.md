# Enterprise V1.2 Build 2A RC6 — Full Regression QA Hotfix 1 QA Report

## 結論

Static QA Pass / Browser Acceptance Pending

## 修正驗證

| 項目 | 結果 |
|---|---|
| 早餐服務 `fee` 同步回 `order.breakfast.fee` | Pass |
| 大額退款以 `Math.abs(amount)` 判斷 | Pass |
| 已完成／已忽略通知保留天數 | Pass |
| 通知狀態自動清除天數 | Pass |
| 通知今日數量本地日期判斷 | Pass |
| Storage Schema v12 | Pass |
| JavaScript syntax | Pass |
| VERSION／README／CHANGELOG 一致性 | Pass |

## 待實機驗收

- 從住宿服務修改早餐送餐金額，再開啟並儲存訂單，金額不得歸零。
- 建立超過門檻的退款，Notification Center 應出現大額退款提醒。
- 調低通知保留天數後，逾期的已完成／已忽略通知應隱藏。
- 台灣時間午夜前後，「今日」通知數量應正確。
- 桌機、平板、手機版完整操作流程。

本版未宣告 Release Candidate 或 Official Stable。
