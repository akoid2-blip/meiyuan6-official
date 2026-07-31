const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const repository = read("assets/data-repository.js");
const realtime = read("assets/realtime-sync.js");
const app = read("assets/app.js");
const migration = read("supabase/migrations/009_p1_independent_cloud_datasets.sql");

const requireText = (source, token, message) => {
  if (!source.includes(token)) throw new Error(message);
};

requireText(migration, "create table if not exists public.checkin_checklists", "checklist table missing");
requireText(migration, "create table if not exists public.shortcuts", "shortcuts table missing");
requireText(migration, "upsert_checkin_checklist", "atomic checklist RPC missing");
requireText(migration, "CHECKLIST_REVISION_CONFLICT", "checklist revision conflict guard missing");
requireText(migration, "alter publication supabase_realtime add table public.checkin_checklists", "checklists not added to Realtime");
requireText(migration, "alter publication supabase_realtime add table public.shortcuts", "shortcuts not added to Realtime");

requireText(repository, "async writeChecklist(orderId, checklist", "checklist repository write missing");
requireText(repository, 'case "checklists": return this.readChecklists()', "checklist repository read missing");
requireText(repository, "async writeTemplate(title, content", "single-template repository write missing");
requireText(repository, "async deleteTemplate(title)", "single-template repository delete missing");
requireText(repository, 'case "shortcuts": return this.readShortcuts()', "shortcut repository read missing");
requireText(repository, 'case "shortcuts": return this.writeShortcuts(value, options)', "shortcut repository write missing");

requireText(realtime, '"checkin_checklists","shortcuts"', "P1 tables missing from Realtime subscription");
requireText(realtime, "preservePendingChecklists", "pending checklist protection missing");
requireText(realtime, "preservePendingTemplates", "pending template protection missing");
requireText(realtime, "preservePendingShortcuts", "pending shortcut protection missing");
if (/const order=\[[^\]]*"templates"/s.test(realtime)) {
  throw new Error("templates still use the unsafe full-snapshot transmit path");
}
if (/const order=\[[^\]]*"checkin_checklists"/s.test(realtime)) {
  throw new Error("checklists still use the unsafe full-snapshot transmit path");
}
if (/const order=\[[^\]]*"shortcuts"/s.test(realtime)) {
  throw new Error("shortcuts still use the unsafe full-snapshot transmit path");
}

requireText(app, "Template cloud read-back mismatch", "template read-back confirmation missing");
requireText(app, "Shortcut cloud read-back mismatch", "shortcut read-back confirmation missing");
requireText(app, "CHECKLIST_REVISION_CONFLICT", "checklist conflict recovery missing");
requireText(app, "flushPendingP1Writes", "offline P1 retry flow missing");

console.log("P1_CLOUD_DATASETS_TESTS=PASS");
