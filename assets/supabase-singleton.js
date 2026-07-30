(() => {
  "use strict";
  let client = null;
  let fingerprint = "";

  function config() { return window.MEIYUAN6_CLOUD_CONFIG || {}; }
  function configured() {
    const c = config();
    return Boolean(c.enabled && c.supabaseUrl && c.supabasePublishableKey && window.supabase?.createClient);
  }
  function getClient(options = {}) {
    if (!configured()) return null;
    const c = config();
    const nextFingerprint = `${c.supabaseUrl}|${c.supabasePublishableKey}`;
    if (client && fingerprint === nextFingerprint) return client;
    if (client && fingerprint !== nextFingerprint) {
      console.warn("[Supabase Singleton] runtime config changed; keeping the original client for session safety");
      return client;
    }
    client = window.supabase.createClient(c.supabaseUrl, c.supabasePublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      realtime: { params: { eventsPerSecond: 10 } },
      ...options
    });
    fingerprint = nextFingerprint;
    window.__MEIYUAN6_SUPABASE_CLIENT__ = client;
    document.dispatchEvent(new CustomEvent("meiyuan6:supabase-client-ready"));
    return client;
  }
  function peek() { return client; }
  window.Meiyuan6Supabase = Object.freeze({ getClient, peek, configured });
})();
