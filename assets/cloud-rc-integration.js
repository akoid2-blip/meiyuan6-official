(() => {
  "use strict";
  const REQUIRED_MIGRATIONS = Object.freeze([
    "001_cloud_foundation_schema.sql",
    "002_rls_baseline.sql",
    "003_revision_triggers.sql",
    "004_authentication_role_guard.sql",
    "005_schema_v12_migration_support.sql",
    "006_realtime_sync.sql",
    "007_offline_conflict_guard.sql"
  ]);

  const state = {
    phase: "Enterprise V1.3 Phase 7 — Cloud RC1 Integration",
    checkedAt: null,
    environment: "staging",
    status: "pending",
    blockers: [],
    warnings: [],
    checks: {}
  };

  function isValidSupabaseUrl(value) {
    return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(String(value || ""));
  }

  function hasPublishableKey(value) {
    const key = String(value || "");
    return key.length >= 20 && !/service_role|secret/i.test(key);
  }

  function evaluate() {
    const config = window.MEIYUAN6_CLOUD_CONFIG || {};
    const cloud = window.Meiyuan6Cloud;
    const auth = window.Meiyuan6Auth;
    const realtime = window.Meiyuan6Realtime;
    const offline = window.Meiyuan6OfflineGuard;

    state.checkedAt = new Date().toISOString();
    state.environment = config.environment || "staging";
    state.blockers = [];
    state.warnings = [];
    state.checks = {
      schemaV12: config.schemaVersion === 12,
      supabaseLibrary: Boolean(window.supabase?.createClient),
      projectUrl: isValidSupabaseUrl(config.supabaseUrl),
      publishableKey: hasPublishableKey(config.supabasePublishableKey),
      cloudFoundation: Boolean(cloud),
      authLayer: Boolean(auth),
      realtimeLayer: Boolean(realtime),
      offlineConflictLayer: Boolean(offline),
      localFallback: config.allowLocalFallback !== false,
      cloudExplicitlyEnabled: config.enabled === true && config.mode === "cloud",
      authExplicitlyEnabled: config.authEnabled === true,
      migrationExplicitlyEnabled: config.migrationEnabled === true,
      realtimeExplicitlyEnabled: config.realtimeEnabled === true
    };

    if (!state.checks.schemaV12) state.blockers.push("Storage Schema 必須維持 v12");
    if (!state.checks.supabaseLibrary) state.blockers.push("Supabase Client 尚未載入");
    if (!state.checks.cloudFoundation) state.blockers.push("Cloud Foundation 尚未載入");
    if (!state.checks.authLayer) state.blockers.push("Authentication Layer 尚未載入");
    if (!state.checks.realtimeLayer) state.blockers.push("Realtime Layer 尚未載入");
    if (!state.checks.offlineConflictLayer) state.blockers.push("Offline／Conflict Guard 尚未載入");
    if (!state.checks.localFallback) state.blockers.push("Local Safe Fallback 不可關閉");

    if (!state.checks.projectUrl) state.warnings.push("尚未填入 Supabase Project URL");
    if (!state.checks.publishableKey) state.warnings.push("尚未填入 Supabase Publishable Key");
    if (!state.checks.cloudExplicitlyEnabled) state.warnings.push("Cloud Mode 尚未啟用");
    if (!state.checks.authExplicitlyEnabled) state.warnings.push("Cloud Auth 尚未啟用");
    if (!state.checks.migrationExplicitlyEnabled) state.warnings.push("Migration 尚未啟用");
    if (!state.checks.realtimeExplicitlyEnabled) state.warnings.push("Realtime 尚未啟用");

    if (state.blockers.length) state.status = "blocked";
    else if (state.warnings.length) state.status = "local-safe";
    else state.status = "staging-ready";

    render();
    document.dispatchEvent(new CustomEvent("meiyuan6:integration-check", { detail: snapshot() }));
    return snapshot();
  }

  function snapshot() {
    return JSON.parse(JSON.stringify({
      ...state,
      requiredMigrations: REQUIRED_MIGRATIONS
    }));
  }

  function render() {
    let badge = document.getElementById("cloudRcIntegrationStatus");
    if (!badge) {
      badge = document.createElement("button");
      badge.type = "button";
      badge.id = "cloudRcIntegrationStatus";
      badge.className = "cloud-rc-integration-status";
      badge.addEventListener("click", () => {
        const details = [
          `狀態：${state.status}`,
          ...state.blockers.map(x => `阻擋：${x}`),
          ...state.warnings.map(x => `待設定：${x}`)
        ].join("\n");
        window.alert(details);
      });
      document.body.appendChild(badge);
    }
    const labels = {
      blocked: "RC1 整合阻擋",
      "local-safe": "RC1 本機安全模式",
      "staging-ready": "RC1 Staging Ready",
      pending: "RC1 檢查中"
    };
    badge.textContent = labels[state.status] || state.status;
    badge.dataset.status = state.status;
    badge.title = [...state.blockers, ...state.warnings].join("；") || "Cloud RC1 整合條件已完成";
  }

  window.Meiyuan6Integration = Object.freeze({
    state,
    requiredMigrations: REQUIRED_MIGRATIONS,
    evaluate,
    snapshot
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", evaluate, { once: true });
  } else {
    evaluate();
  }
})();
