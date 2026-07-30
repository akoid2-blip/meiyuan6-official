(() => {
  "use strict";
  const supplied = window.MEIYUAN6_CLOUD_CONFIG || {};
  window.MEIYUAN6_CLOUD_CONFIG = Object.freeze({
    enabled: supplied.enabled === true,
    mode: supplied.mode === "cloud" ? "cloud" : "local",
    supabaseUrl: String(supplied.supabaseUrl || ""),
    supabasePublishableKey: String(supplied.supabasePublishableKey || ""),
    propertyId: String(supplied.propertyId || "00000000-0000-0000-0000-000000000001"),
    schemaVersion: 12,
    environment: String(supplied.environment || "development"),
    realtimeEnabled: supplied.realtimeEnabled === true,
    realtimeDebounceMs: Math.max(250, Number(supplied.realtimeDebounceMs || 800)),
    realtimeReconnectMs: Math.max(1000, Number(supplied.realtimeReconnectMs || 5000)),
    offlineQueueEnabled: supplied.offlineQueueEnabled !== false,
    offlineQueueMaxItems: Math.max(10, Number(supplied.offlineQueueMaxItems || 100)),
    conflictGuardEnabled: supplied.conflictGuardEnabled !== false,
    highRiskOfflineGuard: supplied.highRiskOfflineGuard !== false,
    migrationEnabled: supplied.migrationEnabled === true,
    cloudDataEnabled: supplied.cloudDataEnabled === true,
    authEnabled: supplied.authEnabled === true,
    allowLocalFallback: supplied.allowLocalFallback !== false,
    passwordResetRedirect: String(supplied.passwordResetRedirect || location.origin + location.pathname)
  });
})();
