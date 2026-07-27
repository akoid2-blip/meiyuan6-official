# Enterprise V1.2 Build 2A RC6 Release Guard Hotfix 3

本版修正接送／叫車服務誤自動建立，以及尾款結清後加收費用仍顯示待核帳的帳務一致性問題。Storage Schema 維持 v12。

# Meiyuan6 Booking Admin — Enterprise V1.2 Build 2A RC6 Release Candidate

本封裝為 **RC6 Release Candidate**，以 `RC6 Data Integrity Hotfix 2` 為程式基準完成版本凍結與發布封裝。

## 發布狀態

- Release：RC6 Release Candidate
- Storage Schema：v12
- Feature Freeze：已生效
- Version Freeze：已生效
- Official Stable：否
- 後續僅接受 P0／P1、資安、文件及封裝修正

## RC6 核心內容

- 訂單、入住、收款與旅客資料統一 Accordion 管理介面
- Unified Service Engine 與 `services[]` 同步
- 早餐代訂、送餐費用、寄放行李、代客叫車與特殊需求
- 收款、退款、加收費用與帳務摘要
- Dashboard Automation、Housekeeping Workflow
- Notification Center 與 Audit Log
- Backup／Restore、JSON Import／Export
- Storage Schema v12 相容機制

## Data Integrity 修正

- 備份匯入前驗證 Schema v12、必要欄位、資料型別與唯一 ID
- 驗證收付款及房務任務的 `orderId` 關聯
- 匯入前建立快照，失敗時回復原資料
- `roomLocks` 匯入正規化與房號、類型、日期驗證
- 嚴格日曆日期驗證，拒絕不存在日期與錯誤閏年日期

## 驗收狀態

- JavaScript syntax：Pass
- ZIP integrity：Pass
- SHA-256 manifest：Pass
- Static regression：Pass
- Mobile Accordion acceptance：Pass（使用者實機確認）
- Storage Schema v12：Pass
- P0：0
- P1：0
- P2：0（目前封裝基準）

## 使用方式

解壓縮後開啟 `index.html`。部署時需上傳根目錄全部內容，並保留 `assets` 相對路徑。

> 本版為 Release Candidate，尚未宣告 Official Stable。


## RC6 Release Guard Hotfix 2
系統設定新增「系統健康」，可執行 Runtime Integrity 檢查並查看 P0／P1／P2、健康分數與 Release Ready 狀態。Storage Schema 維持 v12。
