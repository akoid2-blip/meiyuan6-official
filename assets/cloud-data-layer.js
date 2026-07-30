(() => {
  "use strict";
  const state = {
    phase: "Enterprise V1.3 Phase 10 RC2-D Cloud Status Center",
    status: "checking", checkedAt: null, health: null, error: ""
  };
  let checking = false;
  async function check() {
    if (checking) return snapshot();
    checking = true; state.checkedAt = new Date().toISOString(); state.error = "";
    try {
      if (!window.Meiyuan6Data) throw new Error("Cloud Data Layer 尚未載入");
      state.health = await window.Meiyuan6Data.health();
      if (!state.health.local?.ok) state.status = "local-error";
      else if (!state.health.cloud?.ok) state.status = state.health.cloud?.authenticated === false ? "waiting-auth" : "cloud-unavailable";
      else if (!state.health.cloudDataEnabled) state.status = "readiness-only";
      else state.status = "cloud-data-ready";
      window.Meiyuan6CloudStatus?.update?.({
        configured: Boolean(state.health.configured ?? window.Meiyuan6Cloud?.state?.configured),
        authenticated: state.health.cloud?.authenticated === true,
        cloudData: state.health.cloud?.ok ? "ready" : (state.health.cloudDataEnabled ? "fallback" : "disabled"),
        health: state.health.cloud?.ok ? "healthy" : "degraded",
        lastError: state.health.cloud?.ok ? "" : (state.health.cloud?.reason || "")
      }, "cloud-data-layer");
    } catch (error) { state.status = "error"; state.error = error.message || String(error); }
    finally { checking = false; }
    render();
    document.dispatchEvent(new CustomEvent("meiyuan6:cloud-data-health", { detail: snapshot() }));
    return snapshot();
  }
  function snapshot() { return JSON.parse(JSON.stringify(state)); }
  function render() {
    let el = document.getElementById("cloudDataLayerStatus");
    if (!el) {
      el = document.createElement("button"); el.id = "cloudDataLayerStatus"; el.type = "button"; el.className = "cloud-data-layer-status";
      el.onclick = () => { const c = window.Meiyuan6CloudStatus?.getStatus?.() || {}; window.alert([
        "Enterprise Cloud Status", `Mode：${c.mode || "unknown"}`, `Cloud：${c.cloudReady ? "Ready" : "Not Ready"}`,
        `Auth：${c.authenticated ? "已登入" : "未登入"}`, `Network：${c.online ? "Online" : "Offline"}`,
        `Realtime：${c.realtime || "unknown"}`, `Queue：${c.queue || 0}`, c.lastError ? `錯誤：${c.lastError}` : ""
      ].filter(Boolean).join("\n")); };
      document.body.appendChild(el);
    }
    const central = window.Meiyuan6CloudStatus?.getStatus?.() || {};
    let displayStatus = state.status;
    if (central.cloudReady) displayStatus = "cloud-data-ready";
    else if (central.configured && !central.authenticated) displayStatus = "waiting-auth";
    else if (!central.online) displayStatus = "offline";
    const labels = {checking:"Data Layer 檢查中","waiting-auth":"Cloud 等待登入",offline:"Cloud Offline","local-error":"Local Data 異常","cloud-unavailable":"Cloud Data 未連線","readiness-only":"Cloud Data Layer Ready","cloud-data-ready":"Cloud Data Ready",error:"Data Layer 錯誤"};
    el.textContent = labels[displayStatus] || displayStatus; el.dataset.status = displayStatus;
    el.title = central.lastError || state.error || state.health?.cloud?.reason || "Enterprise Cloud Status";
  }
  window.Meiyuan6CloudDataLayer = Object.freeze({ state, check, snapshot });
  document.addEventListener("meiyuan6:cloud-status", render);
  document.addEventListener("meiyuan6:auth-ready", e => { render(); if (e.detail?.authenticated === true) setTimeout(check, 80); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(check, 450), { once: true }); else setTimeout(check, 450);
})();
