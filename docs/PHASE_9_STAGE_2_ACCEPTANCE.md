# Enterprise V1.3 Phase 9 — Stage 2 Order Cloud Integration RC1

## Scope
- Order Management 讀取接入 Meiyuan6Data Repository
- Order CRUD 寫入 Supabase `orders` + `order_rooms`
- 完整 application payload 保存在 `orders.app_payload`，避免既有欄位遺失
- Local Safe Fallback 與離線佇列沿用
- Local → Cloud Migration API：`Meiyuan6OrderCloud.promoteLocalOrders()`
- 桌機／手機 UI 不改版，維持既有相容性

## Required Supabase step
依序套用新增 migration：`supabase/migrations/008_order_cloud_integration.sql`。

## Test flow
1. 以本機 HTTP 伺服器開啟並登入。
2. Console 執行 `await Meiyuan6OrderCloud.promoteLocalOrders()` 完成首次遷移。
3. 新增、編輯、日期／房間調整、狀態變更、刪除訂單。
4. 重新整理，確認資料由 Cloud 回載。
5. 暫停網路後操作，確認 Local Fallback；恢復網路後重新同步。
