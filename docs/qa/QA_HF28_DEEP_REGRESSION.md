# Enterprise V1.3 RC3-B HF28 深度回歸 QA

日期：2026-07-30  
基準：`BookingAdmin_P10_RC3B_HF3_Stage1_HF28`  
結論：**HOLD（本機回歸通過，但尚不可判定為雲端穩定版）**

## 已通過

- 17 個資產 JavaScript 檔案語法檢查。
- 18 個 HTML 本機資源引用檢查。
- Data Consistency 自動測試：`DATA_CONSISTENCY_TESTS=PASS`。
- 桌機登入、首頁、訂單、入住、收款、住宿服務與模板中心可正常載入。
- 入住勾選後立即保留，等待 3 秒、切換模組、重新載入及重新登入後仍保留。
- 從入住管理切換到其他模組再返回，原展開卡片仍保持展開；兩張卡片可同時展開。
- 模板修改後，等待、切換模組與重新登入仍保留；即時預覽正確替換旅客與入住日期。
- 模板中心存在「複製並開啟官方 LINE」功能。
- 住宿服務備註修改後，等待與重新登入仍保留。
- 收款視窗切換訂單時，住宿日期、應收與剩餘金額會連動。
- 登記 NT$100 收款後，剩餘應收由 NT$12,400 更新為 NT$12,300，等待及重新登入後仍保留。
- 常用快捷中心的官方 LINE 聊天管理網址正確。
- 390 × 844 手機響應式畫面可操作，入住勾選、卡片展開、模板預覽與 LINE 按鈕正常。
- 本次瀏覽器操作未產生 JavaScript error 或 warning。

## 高風險問題

### P1-1：入住清單仍可能被另一台裝置覆蓋

所有入住清單狀態目前集中存放在 `property_settings.settings` 的單一 JSON 中。雲端儲存採整列 upsert，沒有逐筆合併、revision guard 或原子更新。兩台裝置同時編輯不同訂單時，較晚寫入的舊快照可能覆蓋另一台剛完成的修改。

證據：

- `assets/data-repository.js` 的 `writeSettings()` 直接 upsert 完整 settings。
- `property_settings` Schema 只有 `key`、`settings`、`updated_at`。
- revision trigger 未涵蓋 `property_settings`。

### P1-2：模板仍缺少雲端寫入保護

模板儲存仍以共用本機 `persist()` 為主，沒有單一模板的 Repository 寫入、pending-write 保護及雲端寫回確認。在真實 Realtime 環境中，舊雲端快照仍可能於儲存後覆蓋畫面，形成「短暫出現後消失」。

### P1-3：常用快捷中心不是雲端共用資料

`my6_shortcuts` 仍只存於 localStorage：

- 不在 Realtime 資料表清單。
- 沒有 Supabase shortcuts 資料表。
- 沒有 Repository read/write 流程。

官方 LINE 預設網址之所以一致，是程式在各裝置自行正規化；使用者新增或修改的快捷項目不會跨裝置同步。

## 尚未完成的實機雲端 QA

本機安全測試模式沒有實際 Owner/Admin Supabase 登入憑證，因此下列項目不能宣告通過：

- 真實 Supabase 寫入及重新讀取。
- 兩個登入工作階段的 Realtime 互相同步。
- Offline Queue 斷線後重送。
- revision conflict 的實際復原。
- Android／iPhone 的 Official Account 深層連結實機行為。

## 補充

- 展開卡片會跨模組切換保留，但重新載入頁面後不保留；若需求包含瀏覽器重新整理，仍需加入 UI 狀態儲存。
- 手機測試為 390 × 844 響應式 viewport，不等同真實 iPhone 或 Android 實機測試。

## 建議修正順序

1. 將入住 checklist 改為獨立雲端資料列，或使用原子合併 RPC 並加入 revision guard。
2. 模板加入 Repository 單筆寫入、pending-write 保護及雲端 read-back 確認。
3. 常用快捷建立雲端資料表及 Repository，停止只依賴 localStorage。
4. 使用兩個已登入工作階段完成 Cloud、Realtime、Offline、Retry 回歸。
5. P1 與實機雲端 QA 完成前，不將 HF28 標示為最終穩定版。
