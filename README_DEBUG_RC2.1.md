# Production V365.5.3 RC2.1 Debug Edition

> **除錯用途，並非正式修復完成版，不可合併為 Official Stable。**

## 目的

此版本用來定位 Decap CMS 的 Hero Entry 是否因 `slides` 清單欄位而觸發 React #130。

## 唯一的 Schema 變更

`admin/config.yml` 的 Hero collection 暫時只保留：

- `kicker`
- `title`
- `subtitle`
- `description`

`slides` 欄位已暫時從 CMS 編輯表單移除。

## 資料保護

- `data/hero.json` **沒有修改，也不包含在本套件中**。
- 原始 `hero.json` 的 `slides` 與六張照片仍會留在 JSON。
- 本套件不會刪除或重排任何 Hero 圖片。
- 原始 `hero.json` SHA256：
  `AA7C2D3536B23CE6B7F6D7CAEA1D7B7DBDE68DCCD93848ABCBEBB127A8300406`

## 安裝

1. 確認 GitHub Desktop 位於 `cloudflare-test` 分支。
2. 將套件內的 `admin/config.yml` 覆蓋專案內同名檔案。
3. Commit 建議：
   `Production V365.5.3 RC2.1 - Debug Hero schema`
4. Push，等待使用 CMS 的網站部署完成。
5. 用無痕視窗或清除快取後開啟後台。

## 判讀結果

- Hero 編輯頁正常：高度指向 `slides` widget 或其子欄位是觸發條件。
- Hero 編輯頁仍出現 React #130：問題不只在 `slides`，下一步應測試更小的 collection、載入版本或自訂後台程式。

## 注意

除錯期間不要在 Hero 編輯頁按「儲存／發布」。由於表單暫時沒有 `slides` 欄位，儲存可能重寫 JSON 並移除未建模欄位。完成判讀後，應還原正式 Schema 或安裝下一個診斷版本。
