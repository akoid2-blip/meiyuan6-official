# 眉原六民宿訂房後台 — Enterprise V1.2 Build 2A RC4 Hotfix 1

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

- Release Candidate：RC4 Hotfix 1
- Schema：12
- 非 Official Stable
- 本版需完成實機 iPhone Safari、Android Chrome 與 iPad 驗收後，才可進入後續 Stable 評估。

## Hotfix 1 修正
- 登入頁與側邊欄版本標示統一為 RC4 Hotfix 1。
- 備份匯出 JSON 的 `version` 欄位統一為 Enterprise V1.2 Build 2A RC4 Hotfix 1。
- 不變更資料 Schema，維持 Schema 12。
- 本版本仍為 Release Candidate，不是 Official Stable。
