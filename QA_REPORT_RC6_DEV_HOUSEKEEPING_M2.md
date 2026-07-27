# RC6 Development Build — Housekeeping Workflow M2 QA Report

## 結果
Static QA Pass / Browser Acceptance Pending

## 已驗證
- ZIP 專案結構完整。
- JavaScript `node --check` 通過。
- Storage Schema 維持 v12。
- 退房任務保留訂單、房間、旅客與退房時間關聯。
- 房務流程支援待清掃、清掃中、已暫停、待檢查、已完成。
- 暫停／繼續不會遺失開始時間。
- 主管確認後，訂單 Workflow 同步為可入住。
- 房務卡顯示房務人員、優先等級及下次入住資訊。
- 桌機與手機響應式樣式已建立。

## 待人工驗收
- 實際瀏覽器點擊全部房務流程。
- 手機按鈕尺寸與卡片捲動。
- 多房訂單退房後，每房各建立一筆房務任務。
- 同日退房與入住的急件顯示。

本版不可宣告 Official Stable。
