# QA Report — Enterprise V1.2 Build 2A RC4 Hotfix 8

## Static QA

- PASS：桌機收款狀態改用 `adjustedTotal` 判定，與手機版一致。
- PASS：未收款／部分收款／已結清三段狀態邏輯。
- PASS：已結清且無異常溢收時，一般正向待核帳收款自動轉為已核帳。
- PASS：加收費用排除於一般自動核帳，避免重複實收。
- PASS：手機模板清單 flex 容器改為 stretch，卡片寬度 100%。
- PASS：JavaScript syntax、VERSION JSON、ZIP 與 SHA-256 完整性。

## Device QA

- 待部署後驗證 iPhone Safari、Android Chrome 與 iPad Safari 的實際寬度及觸控操作。

## Status

RC4 Hotfix 8 QA Candidate. Not Official Stable. Not LOCKED.
