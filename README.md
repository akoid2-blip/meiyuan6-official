# Production V365.4 Enterprise Dynamic CMS Edition – Official Stable

基準：Production V365.2.2 Official Stable。此版本保留 Logo、品牌色、固定版型與 RWD，並新增 Decap CMS 管理介面。

## 後台入口
部署後前往 `/admin/`。首次使用須在 Netlify 啟用 Identity 與 Git Gateway，並邀請管理員帳號。

## 可管理內容
首頁主視覺、房型、館內設施、入住須知、訂房政策、FAQ、周邊景點、最新消息／優惠、部落格、聯絡資訊與 SEO。

## 品牌鎖定
Logo、品牌色、字型、Header、Footer、版型、CSS、JavaScript、動畫、RWD、浮動按鈕與 LINE 彈窗不在 CMS 編輯欄位中。

## 電子郵件
`data/site.json` 內 `show_email` 控制是否顯示；電子郵件尚未指定，因此預設關閉。
