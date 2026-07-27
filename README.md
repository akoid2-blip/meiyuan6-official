# Enterprise V1.2 Build 2A RC6 — Development Build

## Milestone 3：Audit Log

本版延續 Dashboard Automation M1 與 Housekeeping Workflow M2，新增企業級全域稽核中心，作為 RC6 主線第三個里程碑。

### 本次完成
- 訂單、帳務、住宿服務、房務及系統設定異動自動寫入稽核紀錄。
- 每筆紀錄包含時間、操作人、模組、動作、訂單／房號／旅客與差異摘要。
- 訂單操作列新增「時間軸」，可直接查看該訂單完整歷程。
- 稽核中心支援關鍵字、模組與日期區間篩選。
- Dashboard 顯示今日操作、帳務異動、房務異動與最近紀錄。
- 支援匯出獨立 Audit Log JSON。
- 系統備份納入 auditLogs，匯入時可恢復。
- 稽核紀錄上限 3,000 筆，避免瀏覽器儲存無限制增長。
- Storage Schema 維持 v12，未進行破壞性升級。

### 版本狀態
- RC6 Development Build
- Service Management Refactor M4 Hotfix 4
- Static QA Pass / Browser Acceptance Pending
- 非 Official Stable
- 尚未 LOCK

### 部署
解壓縮後開啟 `index.html`。部署時請上傳資料夾全部內容並保留 `assets` 相對路徑。


## RC6 Milestone 4
已新增 Enterprise Notification Center；目前為 Development Build，需完成瀏覽器驗收與 Full Regression QA 後才能進入 Release Candidate。


## RC6 M4 Hotfix 3
- 修正寄放行李被誤判為特殊需求並重複產生。
- 住宿服務卡片改為緊湊版。
- 房務已完成紀錄改用獨立清單，避免第四欄向下過長。
- 稽核中心桌機版改成單列緊湊資訊。


## RC6 M4 Hotfix 3
- 訂單加值服務新增「送餐金額」。
- 送餐金額同步至早餐住宿服務的費用與收款狀態。
- 有效住宿服務費用納入最新應收與剩餘應收。
- 修正訂單表單儲存前未執行住宿服務同步的流程問題。
- Storage Schema 維持 v12。
