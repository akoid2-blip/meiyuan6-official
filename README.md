# Meiyuan6 Booking Admin

## Enterprise V1.3 Phase 9 — Stage 1 Cloud Data Layer

本階段建立統一資料存取層，不直接切換既有畫面的商業操作至雲端寫入。

### 新增
- `LocalRepository`
- `CloudRepository`
- `HybridRepository`
- Repository Factory
- Dataset Mapping
- Cloud Health Check
- Local Safe Fallback
- Local-to-Cloud Promotion API
- Cloud Data Layer 狀態顯示

### 支援資料集
- orders
- payments
- tasks
- roomLocks
- guestProfiles
- templates
- settings
- auditLogs（append-only）

### 安全預設
`assets/cloud-runtime-config.js`：

```js
cloudDataEnabled: false,
realtimeEnabled: false
```

因此本版本不會自動把現有 Local Storage 寫入 Supabase。

### 開發 API

```js
await Meiyuan6Data.health();
await Meiyuan6Data.read("orders", []);
await Meiyuan6Data.write("orders", orders);
await Meiyuan6Data.promoteLocalDataset("orders");
```

只有在 `cloudDataEnabled: true` 時，Hybrid Repository 才會執行雲端寫入。
