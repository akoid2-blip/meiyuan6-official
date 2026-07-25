# 眉原六訂房管理系統

Enterprise V1.2 Build 2A — Milestone A3 RC1

本版新增房號鎖定、編輯、解除、日曆標示、衝突阻擋及操作稽核。

# 眉原六民宿｜Enterprise 訂房管理系統

## Enterprise V1.2 Build 2A — Milestone A2 RC1

本版完成 Enterprise UI Design System：

- 全站統一 SVG Icon Design System
- 統一 Button、Icon-only Button、Badge、Card 與 Dialog 操作語意
- 模板中心移除重複的「編輯內容」按鈕
- 模板內容維持於右側欄位直接編輯
- 「改標題」僅修改模板標題
- 桌機、平板、手機響應式介面保留

直接開啟 `index.html` 即可測試。


## A4 RC2
本版修正生命週期資料持久化、合法流轉一致性與重複房務任務，並套用 Enterprise UI v1.0 Official Design Lock。
## A4 RC2 Hotfix — Payment Integrity Control

本版本以 A4 RC2 為基準，正式加入收款完整性控制：

- 一張訂單一列的收款總覽
- 訂單預收訂金自動顯示
- 防止重複收付款
- 防止超收及超額退款
- 已收淨額、已退款、剩餘應收及核帳狀態自動計算
- 點擊「明細」可查看該訂單完整收付款流水

此版本仍屬 Release Candidate Hotfix，需完成瀏覽器驗收與 Level 2 深度 QA 後才能標記為 Official Stable。



## Milestone A4 RC2 Hotfix 2 — Additional Charge Control

加收費用為獨立應收調整：不受原始訂單金額限制，但必須填寫分類及說明。系統以「原始訂單金額＋加收費用」計算最新應收總額，一般收款仍不得超過剩餘應收。


## Milestone A4 RC3 — Mobile & Responsive Integration

本版本以 RC2 Hotfix 2 為基準，完成手機端操作流程整合。手機訂單與收款使用卡片介面；收款／退款／加收費用及房況調整採單欄底部抽屜。手機房況異動必須透過「調整日期／房間」並通過日期、鎖房、衝突與狀態驗證。桌機拖曳功能保留。

### 驗收狀態

- Milestone A4 RC3 LOCK
- Enterprise V1.2 Build 2A LOCK
- 非 Official Stable
