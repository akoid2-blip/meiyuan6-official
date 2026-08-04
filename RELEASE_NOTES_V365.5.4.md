# Production V365.5.4 — Global Media Library Unification Fix

## 實際修正

- Decap CMS backend 固定寫入 `cloudflare-test` 測試分支。
- 全站統一使用 `assets/uploads`／`/assets/uploads`。
- 移除 6 個 Collection 的局部媒體資料夾覆寫。
- 保留所有既有圖片與原路徑，前台不需要修改。
- 將 145 個既有圖片來源建立為 129 個可選媒體庫檔案。
- 同內容、同檔名圖片採 SHA-256 去重；不同內容的同名圖片加上來源資料夾前綴。
- 新增 `data/media-index.json`，記錄來源、媒體庫位置與 SHA-256。

## 部署方式

將本資料夾內全部檔案覆蓋至 GitHub `cloudflare-test` 分支根目錄。請勿上傳最外層資料夾本身，也不要刪除 Repository 原有 `.git`。

## 驗收

部署完成後登入 `/admin/`，依序測試首頁、房型、周邊景點、網站與品牌設定、最新消息及部落格的圖片選擇器。所有圖片欄位應共用同一個媒體庫。
