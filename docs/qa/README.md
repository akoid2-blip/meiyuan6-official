# Enterprise V1.2 Build 2A RC4 Hotfix 4 — Automatic Deposit Check-in Verification

RC4 整合目前已完成的 Build 2A 功能，並將交付資料夾與 QA 文件名稱縮短，以避免 Windows 檔案總管解壓縮錯誤 `0x80010135：路徑太長`。

## 已整合功能

- 手機訂單與收款卡片介面。
- 手機收款、退款、加收費用與房況調整底部抽屜。
- 手機房況使用「調整日期／房間」，桌機保留拖曳。
- 日期衝突、房間鎖定、過期日期與合法狀態檢查。
- 已核帳加收費用直接列入實收，避免尾款與首頁今日已收重複計算。
- 補登訂單同步建立或更新旅客資料。
- 桌機與手機旅客搜尋。
- 手機旅客單筆收合與清單獨立滾動。
- Wi-Fi 保持獨立區塊，不受旅客搜尋或收合影響。

## 使用方式

解壓縮後直接開啟 `index.html`。部署時請上傳 `Meiyuan6_Admin_RC4_HF1` 資料夾內的全部內容，並保留 `assets` 相對路徑。

## 版本狀態

- Release Candidate：RC4 Hotfix 4
- Schema：12
- 非 Official Stable
- 本版需完成實機 iPhone Safari、Android Chrome 與 iPad 驗收後，才可進入後續 Stable 評估。

## Hotfix 1 修正
- 登入頁與側邊欄版本標示統一為 RC4 Hotfix 2。
- 備份匯出 JSON 的 `version` 欄位統一為 Enterprise V1.2 Build 2A RC4 Hotfix 2。
- 不變更資料 Schema，維持 Schema 12。
- 本版本仍為 Release Candidate，不是 Official Stable。


## RC4 Hotfix 2 功能摘要

- 新增訂單：入住日期預設自動帶入隔日退房。
- 手機表單：第一個錯誤欄位會自動捲動、聚焦及紅框提示。
- 智慧模板：早餐通知與叫車通知可從訂單自動填入變數。
- 模板中心：可選訂單預覽、點擊插入變數、即時顯示套用結果。
- 缺值規則：顯示「（尚未提供）」，不保留未替換的 `{{變數}}`。

本版本仍為 RC4 Hotfix 4 QA，尚未宣告 Official Stable 或 LOCK。

## RC4 Hotfix 4 — 入住管理訂金自動核對

- 訂單已有有效訂金，且訂金已核帳、由舊版預收款帶入，或訂單狀態已完成「已付訂金／已付全額」時，入住管理的「訂金」核對項目自動勾選。
- 自動勾選項目顯示「自動」標籤並鎖定，避免人工誤取消。
- 完全退款、無實收訂金或未完成付款狀態，不會自動勾選。
- Storage Schema 維持 12。
