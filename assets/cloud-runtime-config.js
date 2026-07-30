(() => {
  "use strict";
  // Enterprise V1.3 Phase 9 — Stage 1 Cloud Data Layer
  // Only Project URL and Publishable Key may be placed here.
  // Never place Service Role Key, database password, or secret key in browser files.
  window.MEIYUAN6_CLOUD_CONFIG = {
    enabled: true,
    mode: "cloud",
    environment: "staging",
    supabaseUrl: "https://bjkhunvtwkldogttnmsm.supabase.co",
    supabasePublishableKey: "sb_publishable_bPl8oTsVbUMUkpAvG0OZ5Q_XpmIU1RF",
    propertyId: "00000000-0000-0000-0000-000000000001",
    authEnabled: true,
    migrationEnabled: true,
    cloudDataEnabled: true,
    realtimeEnabled: true,
    offlineQueueEnabled: true,
    conflictGuardEnabled: true,
    highRiskOfflineGuard: true,
    allowLocalFallback: true,
    realtimeDebounceMs: 800,
    realtimeReconnectMs: 5000,
    offlineQueueMaxItems: 100
  };
})();
