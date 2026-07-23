# Production V365.5.3 Enterprise Dynamic CMS RC2

- 修復 Hero 與房型輪播。
- 修復住宿須知／訂房政策／FAQ 收合。
- 新增統一前端控制器 `assets/js/site-ui.js`。
- 移除 CMS Accordion 重複事件綁定。

# CHANGELOG

## V365.4.0 — 2026-07-21
- 升級為企業級動態 CMS 架構。
- 新增 Hero、房型、設施、政策、FAQ、景點、消息、文章、聯絡資訊與 SEO 管理。
- 新增媒體庫、草稿／審核／發布流程。
- 新增 Git 版本紀錄、回復基礎、部署與操作紀錄說明。
- 保留 V365.2.2 品牌版型。

## 2026-07-21 — Uploaded homepage integration
- Integrated the user-supplied `index(20).html` as the production root `index.html`.
- Preserved all supplied layout, content, responsive behavior, LINE modal, navigation, facilities and attraction updates.
- Archived the preceding V365.4 homepage at `backup/index_before_uploaded_merge.html` for rollback.
- Regenerated QA records, manifest and package SHA256.

## V365.5 Enterprise Dynamic CMS Edition
- Preserved Editorial Workflow.
- Unified CMS image URLs as root-relative paths.
- Added dedicated CMS upload folder.
- Connected frontend facilities, attractions, rooms, SEO, hero, policies, FAQ, news and blog to JSON data with embedded-content fallback.
