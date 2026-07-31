# Enterprise V1.3 RC3-B HF29 P1 修正 QA

日期：2026-07-31  
基準：HF28  
修正版：HF29 P1 Fix

## 修正內容

1. 入住清單
   - 從 `property_settings.settings` 整包 JSON 移至 `checkin_checklists` 獨立資料表。
   - 每張訂單各自保存，加入 revision 與原子 RPC 衝突檢查。
   - 發生版本衝突時，先讀取最新資料、合併本次操作，再安全重試。
   - pending write 可阻止舊 Realtime 快照回蓋。

2. 模板
   - 新增單筆模板 Repository 寫入與刪除。
   - 儲存後立即從雲端 read-back 確認。
   - 新增、修改、改名及刪除都有 pending 保護及重新連線重試。
   - 已移除模板的整份 Realtime snapshot 寫入路徑。

3. 常用快捷
   - 新增 `shortcuts` 雲端資料表、RLS、revision 與 Realtime。
   - 每筆快捷使用穩定 ID。
   - 儲存後進行雲端 read-back 比對。
   - 離線或初次 migration 時保留本機資料，連線後自動補寫。

## QA 結果

- JavaScript 語法檢查：通過。
- `DATA_CONSISTENCY_TESTS=PASS`。
- `P1_CLOUD_DATASETS_TESTS=PASS`。
- 入住勾選後重新載入：保留。
- 模板修改後重新載入：保留。
- 快捷中心修改後重新載入：保留。
- 390 × 844 手機版入住勾選：保留。
- 瀏覽器 JavaScript error／warning：0。

## 部署必要步驟

部署新版前，必須先執行：

`supabase/migrations/009_p1_independent_cloud_datasets.sql`

若未執行 migration，Realtime 讀取新增資料表時會顯示同步錯誤。

## 尚需實際環境驗證

- 兩個真實 Supabase 登入工作階段同時修改不同入住訂單。
- 同一筆入住清單的 revision conflict 實際合併。
- 離線修改後重新連線重送。
- 跨裝置模板及快捷中心 Realtime。
