# RC3-B Change Log

- 新增房務人員資料與工作量計算。
- 新增房務 Timeline 與操作時間紀錄。
- 批次開始、批次完成、批次指派均寫入房務 Audit。
- 房務建立採穩定 ID，並以房號限制單一有效任務。
- Cloud hydration 後執行去重並回寫清理結果。
- 所有資料變更持續透過既有 persist / Cloud Repository 自動同步。
