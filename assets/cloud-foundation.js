(() => {
  "use strict";
  const config = window.MEIYUAN6_CLOUD_CONFIG || {};
  const state = { phase: "Enterprise V1.3 Phase 9 Stage 2 RC2", schemaVersion: 12, requestedMode: config.mode || "local", effectiveMode: "local", configured: false, ready: false, warnings: [], checkedAt: null };
  function validateConfig() {
    state.warnings = [];
    const urlOk = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.supabaseUrl || "");
    const keyOk = typeof config.supabasePublishableKey === "string" && config.supabasePublishableKey.length >= 20;
    state.configured = Boolean(config.enabled && urlOk && keyOk);
    if (config.enabled && !urlOk) state.warnings.push("Supabase URL 尚未設定或格式不正確");
    if (config.enabled && !keyOk) state.warnings.push("Supabase Publishable Key 尚未設定");
    return { ...state };
  }
  async function health() {
    validateConfig();
    const local = await window.Meiyuan6Repositories.repositoryFactory.get("local").health();
    let cloud = { ok: false, authenticated: false, reason: "Cloud 尚未設定" };
    if (state.configured) cloud = await window.Meiyuan6Repositories.repositoryFactory.get("cloud").health();
    state.effectiveMode = window.Meiyuan6CloudStatus.deriveMode({ requestedMode: state.requestedMode, configured: state.configured, online: navigator.onLine, authenticated: cloud.authenticated === true, cloudHealthy: cloud.ok === true, fallbackAllowed: config.allowLocalFallback !== false });
    state.ready = true; state.checkedAt = new Date().toISOString();
    window.Meiyuan6CloudStatus.update({ mode: state.effectiveMode, requestedMode: state.requestedMode, configured: state.configured, authenticated: cloud.authenticated === true, cloudData: cloud.ok ? "ready" : (state.configured ? "fallback" : "disabled"), repository: state.effectiveMode, health: cloud.ok ? "healthy" : (local.ok ? "degraded" : "error"), migration: localStorage.getItem("my6_cloud_migration_status") ? "completed" : "pending", lastError: cloud.ok ? "" : (cloud.reason || "") }, "foundation");
    return { ...state, localStorage: local, cloud, cloudWriteEnabled: Boolean(config.cloudDataEnabled && state.effectiveMode !== "local"), realtimeEnabled: Boolean(config.realtimeEnabled && state.effectiveMode !== "local") };
  }
  window.Meiyuan6Cloud = Object.freeze({ config, state, validateConfig, health, refresh: health });
  validateConfig();
  document.addEventListener("DOMContentLoaded", () => health().catch(error => console.error("[Cloud Foundation]", error)));
})();
