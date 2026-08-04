# Production V365.5.3 RC2 CMS Schema Fix — QA Report

## 修復內容

- 後台分支固定為 `cloudflare-test`。
- Decap CMS 固定版本 `3.8.0`。
- 關閉編輯器預覽與預覽連結。
- 發布模式暫改為 `simple`，排除 Editorial Workflow 對單檔 JSON 編輯的干擾。
- 所有 `image` widget 改為穩定的圖片路徑文字欄位。
- Hero 輪播保留 list 排序，清單順序就是前台播放順序。
- 移除 list summary 模板，降低 Entry 編輯器 React 渲染衝突。

## 驗證結果

- PASS JSON: data/hero.json
- PASS HERO ORDER: 6 slides
- PASS JSON: data/rooms.json
- PASS JSON: data/facilities.json
- PASS JSON: data/attractions.json
- PASS JSON: data/policies.json
- PASS JSON: data/faq.json
- PASS JSON: data/site.json
- PASS JSON: data/seo.json
- PASS JSON: data/news.json
- PASS JSON: data/blog.json

- PASS：所有 CMS JSON 可解析，頂層欄位與 Schema 對應。
