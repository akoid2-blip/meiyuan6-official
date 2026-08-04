# QA Report — Production V365.5.3 Enterprise Dynamic CMS RC2

日期：2026-07-23

## 靜態檢查

- PASS：`assets/js/site-ui.js` JavaScript 語法檢查。
- PASS：`assets/js/cms-content.js` JavaScript 語法檢查。
- PASS：`index.html` 已載入 `cms-content.js` 後再載入 `site-ui.js`。
- PASS：CMS 控制器不再直接綁定 Accordion 點擊事件。
- PASS：Hero、房型及庭園輪播選擇器與現有 HTML 結構一致。
- PASS：住宿須知與訂房政策使用單一委派事件控制。
- PASS：所有 JSON 路徑及 CMS 架構保持不變。

## 功能驗收項目

部署至 `cloudflare-test` 後需確認：

1. Hero 每 6 秒切換，圓點同步更新。
2. 房型圖片自動切換，左右按鈕可操作。
3. 手機觸控左右滑動可切換 Hero 與房型。
4. 住宿須知可展開及收合，不會一次切換兩次。
5. 訂房政策及 FAQ 可正常展開及收合。
6. 手機選單、LINE、回頂端按鈕正常。
7. Console 無紅色 JavaScript Error。

## 狀態

RC2 修復包已完成靜態 QA；Cloudflare Pages 實機驗收待部署後執行。
