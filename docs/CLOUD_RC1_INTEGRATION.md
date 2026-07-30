# Cloud RC1 Integration

## 啟用順序

1. 建立 Supabase Staging 專案。
2. 依序執行 `supabase/migrations/001` 至 `007`。
3. 執行 `supabase/seed/001_property_and_rooms.sql`。
4. 建立第一位 Auth 使用者。
5. 依 `OWNER_BOOTSTRAP.md` 啟用 Owner。
6. 將 Project URL 與 Publishable Key 填入 `assets/cloud-runtime-config.js`。
7. 第一輪僅啟用 `enabled`、`mode: cloud`、`authEnabled`。
8. 完成登入與 RLS 驗證後，再啟用 `migrationEnabled`。
9. 完成 v12 備份、預覽與對帳後，再啟用 `realtimeEnabled`。
10. 完成雙裝置、離線重連與衝突測試，才可升級 Official Stable。

## 禁止

- 不得將 Service Role Key 放入任何前端檔案。
- 不得在遷移驗證前刪除 localStorage v12。
- 不得在 RLS 尚未驗證時啟用正式營運資料。
- 不得跳過 Migration 001～007 的順序。
