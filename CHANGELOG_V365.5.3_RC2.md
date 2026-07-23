# Production V365.5.3 Enterprise Dynamic CMS RC2

日期：2026-07-23

## 修復內容

- 將原本位於 `<head>` 的內嵌互動控制程式拆分為 `assets/js/site-ui.js`。
- 修復首頁 Hero 輪播，預設每 6 秒自動切換。
- 修復房型圖片輪播、自動切換與上一張／下一張按鈕。
- 修復住宿須知、訂房政策與 FAQ 展開／收合。
- 移除 CMS 與 UI 控制器對 Accordion 的重複事件綁定，避免一次點擊切換兩次而看似無反應。
- 加入觸控滑動、頁面隱藏暫停、滑鼠停留暫停與減少動態效果偏好支援。
- 補強 ARIA 狀態、手機選單、LINE Modal、浮動按鈕及淡入動畫初始化。
- 保留既有 Decap CMS、JSON 資料結構、品牌版型、內容與 SEO 設定。

## 根本原因

RC1 同時存在文件層級 Accordion 委派事件，以及 `cms-content.js` 直接綁定事件。CMS 載入後，同一次點擊會連續切換兩次 `open` 狀態，因此住宿須知看似無法收合。互動控制程式又內嵌於 `<head>`，與 CMS 非同步更新生命週期耦合，造成輪播重新初始化不穩定。

## RC2 架構

- `assets/js/cms-content.js`：只負責 CMS JSON 載入與畫面資料渲染。
- `assets/js/site-ui.js`：統一負責所有前端互動與 CMS 更新後重新初始化。
