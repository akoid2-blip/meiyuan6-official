# RC2.1 Debug QA

## 前置確認

- [ ] 目前分支為 `cloudflare-test`
- [ ] 部署包含本套件的 `admin/config.yml`
- [ ] 已備份原始 `admin/config.yml`
- [ ] `data/hero.json` 未出現在 GitHub Desktop 的變更清單

## 測試步驟

1. 開啟 CMS 後台並登入。
2. 進入「首頁內容」→「首頁主視覺」。
3. 確認是否仍出現 React #130。
4. 若編輯器正常，確認畫面只顯示英文眉標、主標題、副標題、主視覺文案。
5. **不要儲存或發布。**
6. 記錄網址、測試時間、瀏覽器及結果。

## 結果紀錄

| 項目 | 結果 |
|---|---|
| CMS 可登入 | 待測 |
| Hero Entry 可開啟 | 待測 |
| React #130 | 待測 |
| 四個文字欄位可顯示 | 待測 |
| `hero.json` 未變更 | 待測 |

## 通過標準

此 Debug 版的「通過」只表示移除 `slides` 後 Hero Editor 能正常渲染，不能代表 CMS Schema 已正式修復，也不能作為 Official Stable 發布依據。
