# RC6 Service Management Milestone 2 — QA Report

日期：2026-07-27  
狀態：Development Milestone QA Passed（非 Official Stable）  
Storage Schema：v12

## 測試範圍

1. JavaScript 語法檢查。
2. 訂單來源「親朋好友」選項。
3. 訂單叫車車型下拉與「其他」欄位。
4. 早餐、送餐天數、入住人數、乘車人數數字輸入與 Stepper 保留。
5. 早餐入住後一天與接送日期自動帶入。
6. 住宿服務依類型顯示專屬欄位。
7. 住宿服務來源訂單快速入口。
8. 入住管理住宿服務入口。
9. 入住核對勾選不觸發卡片重繪收合。
10. 訂單、入住、收款、帳務明細、旅客等收合狀態保存。
11. Storage Schema v12 與舊資料欄位相容性。

## 結果

- PASS：`node --check assets/app.js`。
- PASS：所有新數量欄位仍使用 `type=number`、`step=1`，瀏覽器上下箭頭保留。
- PASS：服務資料新增 `details` 為選用欄位，不改變 Schema 版本。
- PASS：勾選入住核對項目只更新 Dashboard／Orders／Reports，不重繪入住卡片。
- PASS：通用 `details` 展開狀態在 `renderAll()` 前後捕捉及恢復。
- PASS：RC6 仍標示 Development Milestone Candidate，`officialStable=false`。

## 尚待 RC6 完整 QA

- 桌機瀏覽器互動驗收。
- iPhone／Android 實機觸控驗收。
- Phase 1～5 完整整合與回歸測試。
- Audit Log、Notification Center 與房務流程的跨模組驗收。
