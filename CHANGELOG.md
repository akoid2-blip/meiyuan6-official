# Enterprise V1.2 Build 2A RC4 Hotfix 7

## Template Workspace Layout Optimization

- 重構模板中心桌機工作台：上方工具列、訂單預覽選擇、編輯／預覽雙欄、下方分類變數。
- 可用變數改為分類收合，降低右側壅擠與多重內層滾動。
- 手機新增「編輯模板／即時預覽／可用變數」頁籤。
- 手機新增固定底部儲存、複製及刪除操作列。
- 保留智慧變數替換、即時預覽及點擊插入功能。

# CHANGELOG

## Enterprise V1.2 Build 2A RC4 Hotfix 7 — Order Action Layout Optimization

- 桌機訂單表格移除右側操作欄，主要訂單資料恢復完整可讀寬度。
- 每筆訂單下方新增獨立操作列，按鈕可依畫面寬度自動換行。
- 手機收合卡片的操作區移至明細最下方，主要操作、輔助操作與刪除操作保持清楚分區。
- 刪除固定置於操作區最後並使用警示樣式。
- 保留既有生命週期、付款、LINE、日期／房間調整及合法狀態限制。
- Storage Schema 維持 12；本版仍為 QA Candidate，未 LOCK、非 Official Stable。

## Enterprise V1.2 Build 2A RC4 Hotfix 4 — Automatic Deposit Check-in Verification

- 入住管理的「訂金」核對項目會依有效訂金收款及訂單付款狀態自動勾選。
- 支援已核帳訂金、舊版預收訂金，以及已付訂金／已付全額的有效訂單狀態。
- 自動核對項目以「自動」標籤顯示並禁止手動取消。
- 無訂金、已全額退款或付款未完成時不會自動勾選。
- Storage Schema 維持 12；本版仍為 QA Candidate，未 LOCK、非 Official Stable。

## RC4 Hotfix 3 — Management Search & Mobile Accordion

- 訂單、入住、收款管理新增即時搜尋與結果筆數。
- 手機版三個管理區改為單筆收合卡片與獨立滾動。
- 桌機原有表格與功能保持不變。

# CHANGELOG

## Enterprise V1.2 Build 2A RC4 Hotfix 2 — Mobile UX & Smart Template

- 新增訂單選擇入住日期後，自動帶入隔日退房日期。
- 使用者手動修改退房日期後，系統尊重手動值；日期不合法時仍自動修正。
- 手機表單驗證失敗時，自動捲動、聚焦並標示第一個錯誤欄位。
- 早餐及叫車通知支援訂單資料自動變數替換。
- 模板中心新增可用變數面板、點擊插入、訂單選擇及即時預覽。
- 複製模板改為複製已套用變數後的實際通知文字。
- 缺少變數資料時顯示「（尚未提供）」，避免原始變數被直接送出。
- Storage Schema 維持 12；本版不是 Official Stable，尚未 LOCK。

## Enterprise V1.2 Build 2A RC4 Hotfix 1 — 2026-07-26

### Fixed
- Corrected login screen version label from A4 RC3 to RC4 Hotfix 1.
- Corrected sidebar version label from A4 RC3 to RC4 Hotfix 1.
- Corrected backup export metadata from RC3 Hotfix 2 to RC4 Hotfix 1.
- Kept storage schema at 12; no booking data migration is required.

## Enterprise V1.2 Build 2A RC4 — 2026-07-26

### Integrated
- Milestone A4 RC3 Mobile & Responsive Integration.
- RC3 Hotfix 1 Accounting & Guest Profile.
- RC3 Hotfix 2 Guest Search & Mobile Accordion.

### Packaging
- Shortened the archive root directory to `Meiyuan6_Admin_RC4`.
- Moved historical QA reports to `docs/qa` and shortened filenames.
- Removed repeated long release names from internal paths to prevent Windows Explorer error 0x80010135.

### Status
- RC4 Integration QA.
- Not Official Stable.
