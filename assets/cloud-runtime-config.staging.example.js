// Copy required values into assets/cloud-runtime-config.js.
// Browser-safe values only.
window.MEIYUAN6_CLOUD_CONFIG = {
  enabled: true,
  mode: "cloud",
  environment: "staging",
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabasePublishableKey: "YOUR_PUBLISHABLE_KEY",
  propertyId: "00000000-0000-0000-0000-000000000001",
  authEnabled: true,
  migrationEnabled: false,
  cloudDataEnabled: false,
  realtimeEnabled: false,
  offlineQueueEnabled: true,
  conflictGuardEnabled: true,
  highRiskOfflineGuard: true,
  allowLocalFallback: true
};
