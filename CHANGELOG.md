# Changelog

## Phase 10 RC3-A — 2026-07-29

- Checkout automation creates deterministic housekeeping tasks.
- Added Housekeeping Cloud hydration and write integration.
- Added fingerprint deduplication and authenticated startup hydration.
- Preserved RC2-D unified Cloud status behavior.

# CHANGELOG

## Enterprise V1.3 Phase 9 — Stage 1 Cloud Data Layer

### Added
- 統一 Repository 架構。
- Supabase CRUD 基礎。
- Local／Cloud／Hybrid Repository。
- Orders、Payments、Housekeeping、Room Locks、Guest Profiles、Templates、Settings、Audit Logs mapping。
- Cloud Data Health Check。
- Local Safe Fallback。
- Local-to-Cloud Promotion API。
- `cloudDataEnabled` 安全開關。

### Safety
- 不修改既有 `app.js` 商業流程。
- 不自動遷移 Local Storage。
- 不啟用 Cloud Write。
- 不啟用 Realtime。

## Phase 10 RC2-D
- Unified Cloud Status Center, Realtime auth retry, and badge state consistency.

## P10 RC3-A HF2 — 2026-07-29
- 恢復房務卡片 Accordion：各欄第一張展開，其餘預設收合。
- 手機與桌機同步套用，降低長清單高度。

## Phase 10 RC3-A HF3
- Added Bulk Housekeeping Manager with role guard, confirmation, safety skip, assignment, start and completion actions.

## Enterprise V1.3 Phase 10 RC3-B HF30 — 2026-07-31

- Synchronized the completed check-in checklist with the canonical order lifecycle.
- Restored single-open accordion behavior for check-in cards on desktop and mobile.
- Auto-verified pending positive charges when an order is settled or overpaid.
- Enforced stay-date boundaries for breakfast and taxi services.
