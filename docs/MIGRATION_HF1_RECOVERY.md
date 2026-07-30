# Migration HF1 Recovery

目前資料庫曾執行舊版 Migration 005，並在第一個 Policy 建立時失敗。

這種失敗通常已完成：

- 建立 `public.migration_runs`
- 啟用 `migration_runs` 的 RLS

但尚未完成：

- `migration_owner_manager_select`
- `migration_owner_insert`

修正版 005 使用 `create table if not exists` 與 `drop policy if exists`，可直接重新執行，不需手動刪除資料表。

## 恢復順序

1. 不要重跑 001～004。
2. 執行修正版 005。
3. 執行 `supabase/verification/verify_phase7_hf1.sql`。
4. 確認四個結果均為 `true`。
5. 執行 006。
6. 執行 007。
7. 最後執行 Seed。
