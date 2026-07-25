# QA REPORT — Milestone A4 RC2 Hotfix

## Payment Integrity Control

日期：2026-07-26  
基準：Enterprise V1.2 Build 2A — Milestone A4 RC2

### Static QA

- PASS：JavaScript 語法檢查（Node.js `--check`）
- PASS：ZIP 解壓與專案檔案完整性
- PASS：付款紀錄資料正規化
- PASS：既有訂單預收款遷移邏輯
- PASS：一訂單一列付款總覽
- PASS：付款明細展開結構
- PASS：重複收款阻擋條件
- PASS：超收阻擋條件
- PASS：超額退款阻擋條件
- PASS：訂單總額不可低於已收淨額
- PASS：LocalStorage／匯入資料正規化程式碼檢查

### Browser Acceptance Required

以下項目需由正式瀏覽器操作驗收：

1. 新增訂金後，已收淨額與剩餘應收即時更新。
2. 同一訂單相同日期、類型、方式與金額不得重複儲存。
3. 收款超過剩餘應收時顯示阻擋訊息。
4. 退款超過已收淨額時顯示阻擋訊息。
5. 原訂單內既有已收金額顯示為「訂單預收訂金」。
6. 重新整理、匯出及匯入後，付款摘要維持一致。
7. 桌機及手機版表格／明細展開顯示正常。

結論：Static QA 通過；尚未宣告 Official Stable。
