# Enterprise V1.1 Phase 1 RC3.2.2 Hotfix QA Report

## LINE 官方帳號入口
- PASS：手機官方 LINE 使用設定中的 `lin.ee` 萬用連結。
- PASS：桌機先嘗試 `line://` 應用程式協定。
- PASS：桌機回退網址固定為 `https://tw.linebiz.com/login/`。
- PASS：專案未寫入含 `state`、`code_challenge` 或 OAuth callback 的一次性登入網址。
- PASS：所有 LINE 操作按鈕維持「🟢 官方 LINE」。
- PASS：未新增 LINE QR Code 或 LINE QR 彈窗。

## 回歸
- PASS：RC3.2.1 手機／桌機裝置判斷保留。
- PASS：RC3.2 天氣圖示與精簡天氣列保留。
- PASS：RC3.1 跨日固定軌道、事件固定高度及人數輸入 UX 保留。
- PASS：訂單拖曳、日期調整、衝突檢查與 LocalStorage 程式碼保留。

# Enterprise V1.1 Phase 1 RC3.2.1 Hotfix QA Report

## LINE UX 回歸
- PASS：官方 LINE 入口均顯示「🟢 官方 LINE」。
- PASS：LINE 入口未引用或顯示 LINE QR Code。
- PASS：手機流程直接導向設定中的官方 lin.ee 連結。
- PASS：桌機流程先嘗試 `line://` 協定。
- PASS：桌機未偵測到 App 切換時，1.2 秒後回退官方 LINE 網頁。
- PASS：瀏覽器阻擋預開分頁時，仍會以新分頁嘗試開啟網頁。
- PASS：複製訂單訊息後沿用相同 LINE 開啟流程。
- PASS：沒有新增 LINE QR 彈窗或遮罩。

## RC3.2／RC3.1 回歸
- PASS：天氣圖示與精簡天氣列保留。
- PASS：跨日訂單固定軌道與固定高度保留。
- PASS：入住人數首次聚焦清空 UX 保留。
- PASS：拖曳、日期調整與房況衝突檢查相關程式碼保留。

## 說明
桌機瀏覽器無法百分之百確認外部 App 是否成功開啟；此版本以頁面可見狀態判斷並提供官方網頁回退，避免操作中斷。
