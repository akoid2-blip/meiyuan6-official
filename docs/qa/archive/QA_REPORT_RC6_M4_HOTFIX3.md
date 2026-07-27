# RC6 M4 Hotfix 3 QA Report

## Scope
- 早餐送餐金額欄位
- 訂單 ↔ 住宿服務費用同步
- 帳務最新應收整合

## Static QA
- [x] HTML 欄位存在
- [x] 舊資料預設 fee=0
- [x] 早餐服務 fee 與 paymentStatus 同步
- [x] paymentSummary 納入有效住宿服務費用
- [x] JavaScript syntax check
- [x] Storage Schema v12 unchanged

## Acceptance Pending
- [ ] Browser: 新增早餐與送餐金額後，住宿服務顯示相同費用
- [ ] Browser: 收款管理最新應收增加相同金額
- [ ] Browser: 修改／清除金額後不重複計算

Status: Static QA Pass / Browser Acceptance Pending
