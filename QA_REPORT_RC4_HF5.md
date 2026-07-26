# RC4 Hotfix 5 QA Report

- Version: Enterprise V1.2 Build 2A RC4 Hotfix 5
- Date: 2026-07-27
- Status: QA Candidate / Not Official Stable / Not LOCKED

## Static QA

- PASS: JavaScript syntax validation.
- PASS: VERSION.json parsing and RC4 Hotfix 5 consistency.
- PASS: 訂單桌機表格已移除右側操作欄。
- PASS: 每筆訂單資訊列後皆產生 colspan=7 的獨立操作列。
- PASS: 操作按鈕保留原有事件與狀態條件。
- PASS: 手機卡片操作區維持於展開內容底部，支援兩欄／單欄響應式排列。
- PASS: ZIP internal path and SHA-256 integrity verification.

## Device Acceptance Required

- Desktop Chromium: verify long room names and all action buttons wrap correctly.
- iPhone Safari / Android Chrome: verify accordion actions, scrolling and delete-button placement.
- iPad Safari: verify portrait and landscape layout.
