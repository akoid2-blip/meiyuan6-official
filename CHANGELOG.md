# RC6 Full Regression QA Hotfix 1 — 2026-07-27

- 修正早餐服務費用未同步回訂單 `breakfast.fee` 的問題。
- 修正負數退款無法觸發大額退款通知的問題。
- 啟用已完成／已忽略通知保留天數設定。
- 通知自動清除與顯示保留改為兩套獨立規則。
- 通知中心今日數量改採本地日期，避免 UTC 跨日誤差。
- README、VERSION、登入頁、側欄與匯出版本標示同步更新。
- 歷史 QA 文件集中移至 `docs/qa/archive/`。
- Storage Schema 維持 v12。

# RC6 Service Management Refactor M4 Hotfix 4 — 2026-07-27

- 縮小桌機側欄品牌、選單、版本資訊與登出按鈕間距。
- 一般桌機高度下側欄改為整頁顯示，避免不必要的內部捲動。
- 較矮視窗仍保留安全捲動，避免選單被裁切。
- 通知中心收合卡片進一步縮小標題、狀態、時間與內容留白。
- 更新登入頁、側欄、備份及稽核匯出版本標示為 Hotfix 4。
- Storage Schema 維持 v12。

# RC6 Service Management Refactor M4 Hotfix 3 — 2026-07-27

- 早餐加值服務新增送餐金額欄位。
- 送餐金額同步建立／更新「早餐代訂」住宿服務 fee。
- 金額大於 0 時，住宿服務收款狀態預設為未收款；金額為 0 時為免費。
- 住宿服務費用納入帳務最新應收與剩餘應收。
- 修正 readOrderForm 提前 return，導致訂單服務欄位未同步的問題。
- Storage Schema 維持 v12。

## Enterprise V1.2 Build 2A RC6 — Service Management Refactor M4 Hotfix 2 (2026-07-27)

### Fixed
- 修正「寄放行李」未列入住宿服務型別，遭誤轉成「特殊需求」並於每次渲染重複建立的問題。
- 啟動時自動辨識並清理相同住宿服務重複紀錄，保留單一有效資料。
- 住宿服務卡片縮為緊湊摘要，展開後才顯示操作。
- 房務管理前三個進行中流程維持操作卡片；已完成改為獨立緊湊清單。
- 稽核中心桌機版改為單列資訊：模組、動作、摘要、操作人與時間。

### Compatibility
- Storage Schema 維持 v12。
- Development Hotfix，尚未宣告 Official Stable。

# Enterprise V1.2 Build 2A RC6 — Service Management Refactor M4 Hotfix 1

- 新增統一 Notification Engine 與通知中心。
- 自動產生訂單、帳務、住宿服務、房務及大額退款通知。
- 支援未讀、已讀、已完成、已忽略與優先等級篩選。
- Dashboard 新增通知摘要與近期通知。
- 通知狀態異動寫入 Audit Log。
- 新增通知門檻與保留設定。
- 完整備份加入 notificationState；Storage Schema 維持 v12。

# CHANGELOG

## Enterprise V1.2 Build 2A RC6 — Development Build / Audit Log M3 (2026-07-27)

### Added
- 全域 Audit Log 資料層與自動差異偵測。
- 稽核中心、搜尋、模組篩選、日期篩選與 JSON 匯出。
- 訂單完整時間軸入口。
- Dashboard 最近操作與今日稽核摘要。
- 備份／還原納入稽核紀錄。

### Compatibility
- Storage Schema 維持 v12。
- 本版仍為 Development Build，未宣告 Official Stable。

## Enterprise V1.2 Build 2A RC6 — Development Build / Dashboard Automation M1 (2026-07-27)

- 將 RC6 Service Management M2 QA Hotfix 1 整合回 RC6 主線。
- Dashboard 服務待辦依日期與時間排序，增加逾期提示與直接處理入口。
- 待收款提醒改用 Payment Summary，包含加收費用、退款與淨收款。
- 修正早餐／叫車同步只尋找 legacy ID 而造成重複服務的問題。
- 同類核心服務建立主要紀錄與去重規則。
- 修正備份匯出版本資訊。
- Storage Schema 維持 v12；非 Official Stable。

# Enterprise V1.2 Build 2A RC5.1 — Payment Record Description & Flexible Charge Method

- 登記收款新增選填收款說明（備註）。
- 退款新增必填退款原因與退款說明。
- 加收費用解除收款方式鎖定，保留使用者選擇。
- 帳務明細同步呈現付款方式、退款原因與說明。
- Storage Schema 維持 12。

# CHANGELOG

## Enterprise V1.2 Build 2A RC5 — Unified Management UI (2026-07-27)

- 將訂單、入住、收款、旅客管理統一為共用 Accordion Card UI。
- 桌機主要管理介面由表格改為可收合卡片。
- 四個管理模組預設收合，搜尋結果僅一筆時自動展開。
- 統一展開提示、卡片 Header、Body、Actions 與 Responsive 行為。
- 保留收款第二層帳務明細與既有業務邏輯。
- Storage Schema 維持 12，無資料遷移。

## Enterprise V1.2 Build 2A RC4 Hotfix 9 — Collapsible Order & Payment Action Layout

- 收款管理移除右側無表頭的明細欄，表頭與資料統一為 10 欄。
- 每筆收款資料下方新增操作列，集中放置查看明細及登記收款／退款。
- 收款帳務明細改為在該筆操作列下方展開／收合。
- 桌機訂單操作列預設收合，並在狀態欄提供展開／收合按鈕。
- 搜尋僅剩一筆訂單時，桌機訂單操作列自動展開。
- README、VERSION、UI 與備份版本資訊更新為 RC4 Hotfix 9。
- Storage Schema 維持 12；本版仍為 QA Candidate，未 LOCK、非 Official Stable。

# Enterprise V1.2 Build 2A RC4 Hotfix 8

## Payment Status & Mobile Template Width

- 修正桌機收款管理的狀態判定，統一顯示「未收款／部分收款／已結清」，並與手機版使用相同應收基準。
- 帳款已結清且無異常溢收時，普通收款紀錄中的待核帳項目會自動轉為已核帳。
- 加收費用維持原有獨立核帳邏輯，避免自動核帳造成重複實收。
- 手機模板清單卡片改為滿版寬度，修正 flex 版面因 `align-items:start` 造成的內容寬度縮限。
- Storage Schema 維持 12；本版仍為 QA Candidate，未 LOCK、非 Official Stable。

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

## Enterprise V1.2 Build 2A RC6 — Service Management Milestone 1 (2026-07-27)

### Added
- 新增獨立「住宿服務」管理頁。
- 統一服務類型：早餐代訂、接送／叫車、提前入住、延後退房、加床、寵物住宿、特殊需求。
- 每筆服務支援處理狀態、費用、收款狀態、日期、時間與備註。
- 新增服務搜尋、處理狀態篩選與收款狀態篩選。
- 新增服務建立、編輯與刪除操作。

### Compatibility
- Storage Schema 維持 v12。
- 保留既有 breakfast、taxi、earlyCheckin、lateCheckout 欄位與通知模板。
- 舊資料載入時自動映射為統一 services 清單，不破壞既有訂單資料。
- 服務費用不會自動改變訂單應收，需入帳時仍由收款管理的「加收費用」處理。

### Status
- RC6 開發里程碑，尚未宣告 Official Stable。

## Enterprise V1.2 Build 2A RC6 — Service Management Milestone 2 (2026-07-27)

### Added
- 訂單來源新增「親朋好友」。
- 住宿服務依早餐、接送／叫車、加床、寵物住宿與特殊需求顯示專屬欄位。
- 住宿服務卡片新增來源訂單快速入口；入住管理新增住宿服務按鈕。
- 車型改為下拉選項：一般轎車、五人座 SUV、七人座、九人座、無障礙車與其他。

### Changed
- 早餐服務日期預設為入住日後一天。
- 退房送站預設退房日；入住接送預設入住日；仍可選自訂日期。
- 數字欄位保留上下箭頭，聚焦時自動選取原數值，並停用聚焦時的滑鼠滾輪誤改。
- 入住核對項目改為局部更新，不再觸發整張卡片收合。
- 所有主要收合卡片在重新渲染後恢復原展開狀態。

### Compatibility
- Storage Schema 維持 v12。
- 既有 services 資料若沒有 details 欄位，會以空物件向下相容。
- 舊版 breakfast、taxi、earlyCheckin 與 lateCheckout 欄位繼續保留。

### Status
- RC6 開發里程碑，尚未宣告 Official Stable。

## Enterprise V1.2 Build 2A RC6 — Service Management M2 QA Hotfix 1 (2026-07-27)

### Fixed
- Dashboard service reminders now read the unified `services` module instead of legacy breakfast/taxi fields.
- Desktop order action rows preserve their expanded state after re-rendering.
- Desktop payment detail rows preserve their expanded state after re-rendering.
- Legacy breakfast and taxi migration now stores structured service details.
- Order breakfast/taxi fields and unified services now synchronize in both directions.
- Login and sidebar version labels updated to RC6 Service M2 QA Hotfix 1.

### Compatibility
- Storage Schema remains v12.
- Existing order, payment and service records remain backward compatible.
- Development hotfix only; not Official Stable.


## RC6 Development Build — Housekeeping Workflow M2
- 退房自動建立房務工作，Storage Schema 維持 v12。
- 房務流程擴充為待清掃、清掃中、已暫停、待檢查、已完成。
- 新增房務指派、優先等級、暫停／繼續、主管確認。
- 顯示下次入住旅客與急件提醒。
- 房務完成後同步訂單 Workflow 為可入住。
- 房務管理與 Dashboard 待辦數量同步。


## RC6 Service Management Refactor M4 Hotfix 1
- 模板中心變數分類預設收合，採單一展開 Accordion。
- 通知中心卡片改為單一展開 Accordion。
- 稽核中心改為每批 20 筆載入，顯示已載入／總筆數。
- 稽核 KPI 可點擊快速套用今日、帳務、房務或全部篩選。
- 房務編輯視窗縮至 80vh 並壓縮欄位間距。
- 住宿服務卡片採單一展開 Accordion。
- 訂單寄放行李、提前入住、延後退房自動補建為統一住宿服務紀錄。
- Storage Schema 維持 v12。
