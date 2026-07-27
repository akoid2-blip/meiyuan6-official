# QA Report — Enterprise V1.2 Build 2A RC4 Hotfix 9

## Scope
- 收款明細操作列重構
- 桌機訂單收合操作
- README 與版本一致性

## Static QA
- JavaScript syntax：PASS
- VERSION.json：PASS
- HTML duplicate IDs：PASS
- 收款表頭／資料欄數：PASS（10 欄）
- 收款明細操作列 colspan：PASS（10）
- ZIP integrity：PASS
- Internal SHA-256：PASS

## Functional logic review
- 收款資料列下方顯示操作列：PASS
- 查看明細可展開／收合：PASS
- 登記收款／退款可從操作列開啟：PASS
- 桌機訂單操作列預設收合：PASS
- 單筆搜尋自動展開：PASS
- 手機訂單收合卡片維持：PASS

## Device acceptance
需於 iPhone Safari、Android Chrome、iPad Safari 與桌機瀏覽器進行實機驗收。

## Status
RC4 Hotfix 9 QA Candidate。尚未 LOCK，非 Official Stable。
