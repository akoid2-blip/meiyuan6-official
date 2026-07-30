# Schema v12 Cloud Migration Guide

1. 建立遷移前 JSON 備份。
2. 執行資料驗證，P0/P1 必須為 0。
3. 產生轉換預覽並核對各資料表筆數。
4. 建立 Supabase、執行 001–005 SQL。
5. 設定 Project URL、Publishable Key，將 migrationEnabled 設為 true。
6. Owner 登入後執行受控匯入。
7. 核對訂單、收款、退款、房務與 Audit 筆數。

Phase 3 不會刪除 localStorage，也不會自動切換 Cloud Mode。
