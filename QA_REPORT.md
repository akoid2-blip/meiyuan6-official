# QA REPORT
## Enterprise V1.2 Build 1

### 靜態檢查
- [PASS] JavaScript 語法檢查。
- [PASS] HTML 結構解析。
- [PASS] 必要頁面與房務 DOM 元件存在。
- [PASS] ZIP 完整性測試。
- [PASS] SHA256 產生與核對。

### 功能邏輯檢查
- [PASS] 訂單可切換為已入住。
- [PASS] 已入住訂單顯示退房按鈕。
- [PASS] 退房後依房間建立待清掃任務。
- [PASS] 重複按退房不會建立重複未完成任務。
- [PASS] 房務狀態可依序前進。
- [PASS] 完成清掃後房間恢復可入住。
- [PASS] 房況日曆顯示未完成房務工作。
- [PASS] Dashboard 顯示待清潔數量。
- [PASS] LocalStorage Schema 4 與舊資料轉換。

### 實機驗收仍需確認
- iPhone Safari、iPad Safari 的操作與版面。
- Windows／Mac 桌機瀏覽器拖曳與 LINE 呼叫。
- 真實訂單的完整入住、退房、清掃流程。
