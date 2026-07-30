(() => {
  "use strict";
  const state = {
    mode: "local", requestedMode: "local", configured: false, online: navigator.onLine,
    authenticated: false, cloudData: "disabled", cloudReady: false,
    orderCloud: "unknown", sync: "disabled", syncing: false,
    realtime: "disabled", realtimeReady: false,
    migration: "pending", repository: "local", health: "unknown",
    queue: 0, failed: 0, conflicts: 0, lastSyncAt: "",
    lastError: "", source: "boot", updatedAt: new Date().toISOString()
  };
  const snapshot = () => Object.freeze({ ...state });
  function recompute() {
    state.cloudReady = Boolean(
      state.configured && state.online && state.authenticated &&
      ["ready", "healthy"].includes(state.cloudData)
    );
    state.realtimeReady = state.realtime === "ready" || state.realtime === "connected";
    state.syncing = state.sync === "syncing" || state.sync === "connecting";
  }
  function patch(next = {}, source = "unknown") {
    Object.assign(state, next, { updatedAt: new Date().toISOString(), source });
    recompute();
    document.dispatchEvent(new CustomEvent("meiyuan6:cloud-status", { detail: snapshot() }));
    return snapshot();
  }
  function deriveMode({ requestedMode, configured, online, authenticated, cloudHealthy, fallbackAllowed = true }) {
    if (requestedMode !== "cloud" || !configured) return "local";
    if (online && authenticated && cloudHealthy) return "cloud";
    return fallbackAllowed ? "hybrid" : "local";
  }
  function refresh(source = "refresh") {
    const rt = window.Meiyuan6Realtime?.getStatus?.() || window.Meiyuan6Realtime?.status?.() || {};
    const q = window.Meiyuan6OfflineGuard?.status?.() || {};
    return patch({
      online: navigator.onLine,
      realtime: rt.connected ? "ready" : (rt.status || state.realtime),
      sync: rt.status || state.sync,
      lastSyncAt: rt.lastSyncAt || state.lastSyncAt,
      queue: Number(q.pending || 0), failed: Number(q.failed || 0), conflicts: Number(q.conflicts || 0),
      lastError: rt.error || state.lastError
    }, source);
  }
  window.addEventListener("online", () => patch({ online: true }, "browser"));
  window.addEventListener("offline", () => patch({ online: false, mode: "hybrid", sync: "offline", realtime: "offline" }, "browser"));
  document.addEventListener("meiyuan6:auth-ready", e => patch({ authenticated: e.detail?.authenticated === true }, "auth"));
  document.addEventListener("meiyuan6:sync-status", e => {
    const d = e.detail || {};
    patch({
      sync: d.status || "unknown",
      realtime: d.connected ? "ready" : (d.status || "unknown"),
      lastSyncAt: d.lastSyncAt || state.lastSyncAt,
      queue: Number(d.pending || state.queue || 0),
      lastError: d.error || ""
    }, "realtime");
  });
  document.addEventListener("meiyuan6:queue-change", e => patch({
    queue: Number(e.detail?.pending || 0), failed: Number(e.detail?.failed || 0), conflicts: Number(e.detail?.conflicts || 0)
  }, "queue"));
  document.addEventListener("meiyuan6:conflict-change", e => patch({ conflicts: Number(e.detail?.conflicts || 0) }, "conflict"));
  document.addEventListener("meiyuan6:order-cloud-state", e => patch({ orderCloud: e.detail?.status || "unknown" }, "orders"));
  window.Meiyuan6CloudStatus = Object.freeze({ getStatus: snapshot, update: patch, deriveMode, refresh });
})();
