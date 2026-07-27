# Enterprise V1.2 Build 2A RC6 — Full Regression QA Hotfix 1

本版以 RC6 Service Management Refactor M4 Hotfix 4 為基準，僅修正 Enterprise Full Regression QA 發現的資料同步、通知判斷與文件一致性問題。

## 本次修正

- 早餐代訂服務費用可由住宿服務正確同步回訂單 `breakfast.fee`，避免再次儲存訂單時送餐金額被重設為 NT$0。
- 大額退款提醒改以退款金額絕對值判斷，負數退款資料可正確觸發通知。
- 「已完成通知保留天數」正式生效：超過保留期的已完成／已忽略通知不再顯示。
- 「自動清除天數」仍負責清除更久以前的通知狀態資料，兩項設定用途已分離。
- 通知中心「今日」數量改以瀏覽器本地日期計算，避免 UTC 時差造成跨日誤判。
- 歷史 QA 文件移至 `docs/qa/archive/`，根目錄只保留本版 QA 與最終驗收文件。
- Storage Schema 維持 v12，沒有破壞性資料升級。

## 目前主要模組

- 訂單管理與生命週期
- 收款、退款與加收費用
- 統一住宿服務管理
- Dashboard Automation
- Housekeeping Workflow
- Audit Log
- Enterprise Notification Center
- 備份、還原與 Storage v12 相容機制

## QA 狀態

- JavaScript syntax：Pass
- ZIP integrity：Pass
- SHA-256 manifest：Pass
- Static regression：Pass
- Browser acceptance：Pending
- Official Stable：否

## 使用方式

解壓縮後開啟 `index.html`。部署時必須上傳資料夾全部內容，並保留 `assets` 相對路徑。
