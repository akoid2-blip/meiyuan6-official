const fs = require("fs");
const vm = require("vm");
const path = require("path");

const servicePath = path.resolve(__dirname, "../../assets/data-consistency-service.js");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(servicePath, "utf8"), context);
const service = context.window.Meiyuan6DataConsistency;

function equal(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, received ${actual}`);
}

const order = {
  id: "QA-39000",
  total: 39000,
  openingPaid: 19000,
  paid: 0,
  services: []
};
let financials = service.selectFinancials(order, []);
equal(financials.orderTotal, 39000, "order total");
equal(financials.paidAmount, 19000, "opening paid amount");
equal(financials.remainingAmount, 20000, "opening remaining amount");
equal(financials.paymentStatus, "部分收款", "partial status");
equal(service.selectCheckinPaymentState(order, []).depositComplete, true, "deposit checklist");

const payments = [
  { id: "P1", orderId: order.id, type: "尾款", amount: 10000, verified: true },
  { id: "P2", orderId: order.id, type: "退款", amount: -5000, verified: true },
  { id: "P3", orderId: order.id, type: "加收費用", amount: 2000, verified: true }
];
financials = service.selectFinancials(order, payments);
equal(financials.adjustedTotal, 41000, "adjusted total");
equal(financials.paidAmount, 24000, "payment and refund net");
equal(financials.remainingAmount, 17000, "adjusted remaining amount");
equal(service.deriveOpeningPaid(order, 24000, payments), 19000, "opening paid derivation");

const settledPayments = [{ id: "P4", orderId: order.id, type: "尾款", amount: 20000, verified: true }];
financials = service.selectFinancials(order, settledPayments);
equal(financials.remainingAmount, 0, "settled remaining amount");
equal(financials.paymentStatus, "已收款", "settled status");
equal(service.selectCheckinPaymentState(order, settledPayments).balanceComplete, true, "balance checklist");

service.synchronizeOrder(order, []);
equal(order.paid, 19000, "compatibility paid projection");
equal(order.paymentStatus, "部分收款", "compatibility payment status");

const appSource = fs.readFileSync(path.resolve(__dirname, "../../assets/app.js"), "utf8");
if (!appSource.includes("const cleaning=tasks.filter(t=>t.date===iso&&HOUSEKEEPING_ACTIVE_STATUSES.has(t.status))")) {
  throw new Error("calendar housekeeping must use active status selector");
}
if (/const cleaning=tasks\.filter\(t=>t\.date===iso&&t\.status!==["']已完成["']\)/.test(appSource)) {
  throw new Error("calendar housekeeping still includes cancelled history");
}

const realtimeSource = fs.readFileSync(path.resolve(__dirname, "../../assets/realtime-sync.js"), "utf8");
const migrationSource = fs.readFileSync(path.resolve(__dirname, "../../assets/schema-v12-cloud-migration.js"), "utf8");
const repositorySource = fs.readFileSync(path.resolve(__dirname, "../../assets/data-repository.js"), "utf8");
const indexSource = fs.readFileSync(path.resolve(__dirname, "../../index.html"), "utf8");
const styleSource = fs.readFileSync(path.resolve(__dirname, "../../assets/style.css"), "utf8");
if (!realtimeSource.includes('if(e.code==="REVISION_CONFLICT"&&navigator.onLine)')) {
  throw new Error("realtime revision conflict recovery is missing");
}
if (!realtimeSource.includes("if(e.queueItemId)window.Meiyuan6OfflineGuard?.remove(e.queueItemId)")) {
  throw new Error("stale conflict queue item is not removed");
}
if (!realtimeSource.includes("result=await pull()")) {
  throw new Error("successful push does not refresh cloud revisions");
}
if (!realtimeSource.includes("if(sameBusinessRow(table,row,rr))continue")) {
  throw new Error("unchanged stale rows still block independent payment writes");
}
if (!realtimeSource.includes("data=await guardConflicts(c,snapshot)")) {
  throw new Error("filtered conflict-safe payload is not transmitted");
}
if (!realtimeSource.includes('payments:["order_id","transaction_type","amount"')) {
  throw new Error("payment business fields are missing from conflict comparison");
}
if (!appSource.includes("逾期未結清｜${order.name}")) {
  throw new Error("dashboard overdue receivable alert is missing");
}
if (!appSource.includes("const overdue=isReceivableOverdue(o),urgent=")) {
  throw new Error("overdue receivables are not based on the checkout deadline");
}
if (!appSource.includes('settings.checkoutTime||"11:00"')) {
  throw new Error("checkout-day 11:00 deadline fallback is missing");
}
if (!appSource.includes("function isReceivableOverdue(order,now=Date.now())")) {
  throw new Error("time-aware receivable overdue selector is missing");
}
if (!appSource.includes('receivableDeadline(a.order)-receivableDeadline(b.order)')) {
  throw new Error("overdue receivables are not sorted before upcoming reminders");
}
if (!appSource.includes("const selectedPaymentOrder=paymentSelect?.value||paymentSelect?.dataset.selectedOrderId")) {
  throw new Error("payment order selection is not preserved across renders");
}
if (!appSource.includes('$("#paymentOrder").dataset.selectedOrderId=order.id')) {
  throw new Error("payment order changes are not persisted");
}
if (!appSource.includes("updatePaymentDialogSummary({suggestAmount:true})")) {
  throw new Error("payment fields do not react to order selection");
}
if (!appSource.includes("住宿日期<strong>${esc(order.checkin)}～${esc(order.checkout)}")) {
  throw new Error("selected order stay dates are missing from payment summary");
}
if (!appSource.includes('class="order-summary-stay"')) {
  throw new Error("collapsed order cards do not expose stay dates");
}
if (!appSource.includes('$("#taxiDate").value=checkin;$("#taxiDate").dataset.autoDate="1"')) {
  throw new Error("taxi date does not follow the check-in date automatically");
}
if (!appSource.includes("function pendingOrderServices(order)")) {
  throw new Error("dashboard service todo selector is missing");
}
if (!appSource.includes("taxi.date||order.checkin")) {
  throw new Error("legacy taxi todo does not backfill a missing date");
}
if (!appSource.includes('if(!storedPayments.some(item=>item.id===payment.id))throw new Error("本機付款紀錄寫入失敗")')) {
  throw new Error("payment save does not verify durable local persistence");
}
if (!appSource.includes('submitButton.textContent="儲存中…"')) {
  throw new Error("payment save does not prevent duplicate submission");
}
if (!appSource.includes('persist({skipRealtime:true})')) {
  throw new Error("payment save still triggers the stale full-snapshot realtime path");
}
if (!appSource.includes('cloudRepository.write("payments",[payment],{deleteMissing:false})')) {
  throw new Error("payment save does not use the dedicated cloud payment repository");
}
if (!appSource.includes('cloudRepository.read("payments",[])')) {
  throw new Error("payment save does not read back the payments table");
}
if (!appSource.includes("雲端 payments 回讀未確認此筆收款")) {
  throw new Error("payment save reports success without cloud read-back verification");
}
if (!realtimeSource.includes("for(let attempt=0;attempt<5&&!recovered;attempt+=1)")) {
  throw new Error("conflict recovery does not drain stale queue items before the new payment");
}
if (!realtimeSource.includes("await flushQueue();") || !realtimeSource.includes("result=await pull();")) {
  throw new Error("conflict recovery does not push pending payment and verify by pulling again");
}
if (!realtimeSource.includes('const order=["orders","payments","order_rooms"')) {
  throw new Error("auxiliary order-room writes can still block payment persistence");
}
if (!realtimeSource.includes('order_rooms:"order_id,room_id"')) {
  throw new Error("order_rooms upsert is missing its composite conflict target");
}
if (!realtimeSource.includes('{code:"TABLE_WRITE_FAILED",table:t}')) {
  throw new Error("cloud table write failures do not identify the blocking table");
}
if (!appSource.includes("function normalizeTemplates(raw)")) {
  throw new Error("template storage does not normalize cloud and local values");
}
if (!appSource.includes("return {...defaultTemplates,...custom}")) {
  throw new Error("the template list does not retain the required default entries");
}
if (!realtimeSource.includes('[t.title,String(t.content||"")]')) {
  throw new Error("cloud templates are not restored as editable strings");
}
if (!appSource.includes("revision:existing?Math.max(1,Number(existing.revision||1))+1:1")) {
  throw new Error("edited services do not advance their cloud revision");
}
if (!realtimeSource.includes("revision:Number(x.revision||1),createdAt:x.created_at,updatedAt:x.updated_at")) {
  throw new Error("service revisions are lost during cloud hydration");
}
if (!migrationSource.includes("revision:Number(s.revision||1),created_at:s.createdAt")) {
  throw new Error("service revisions are not written to the cloud");
}
if (!appSource.includes("function trackPendingServiceWrites()")) {
  throw new Error("service changes are not protected before background sync");
}
if (!appSource.includes('localStorage.setItem("my6_pending_service_writes"')) {
  throw new Error("pending service changes are not stored durably");
}
if (!realtimeSource.includes("function preservePendingServices(local)")) {
  throw new Error("cloud hydration can still overwrite a pending service change");
}
if (!realtimeSource.includes("preservePendingServices(toLocal(await fetchAll()))")) {
  throw new Error("realtime pull does not merge pending service changes");
}
if (!appSource.includes("const pageViewState=new Map()")) {
  throw new Error("per-page scroll and expanded-card state is missing");
}
if (!appSource.includes("rememberPageView(current)") || !appSource.includes("restorePageView(page)")) {
  throw new Error("page navigation does not restore the previous working position");
}
const stayDateSummaryCount = (appSource.match(/class="order-summary-stay"/g) || []).length;
if (stayDateSummaryCount < 4) {
  throw new Error("check-in, payment, service, and order summaries do not all show stay dates");
}
if (!appSource.includes('service.paymentStatus="已收款"')) {
  throw new Error("settled orders do not automatically settle their service charges");
}
if (!appSource.includes("p.verified=true;p.verifiedAt=now;p.updatedAt=now;p.revision=")) {
  throw new Error("settled orders do not durably verify pending payment records");
}
if (!appSource.includes("const settlementChanged=autoVerifyAllSettledPayments()")) {
  throw new Error("cloud hydration does not reconcile settled payment and service statuses");
}
if (!repositorySource.includes("order.count ?? order.guests ?? order.guestCount ?? 1")) {
  throw new Error("order repository does not persist the canonical guest count");
}
if (!migrationSource.includes("o.count??o.guests??o.guestCount??1")) {
  throw new Error("cloud migration does not persist the canonical guest count");
}
if (!appSource.includes("o.revision=Math.max(1,Number(previous.revision||1))+1")) {
  throw new Error("editing an order does not advance its cloud revision");
}
if (!indexSource.includes('id="guestCount" type="number" inputmode="numeric" min="1" step="1"')) {
  throw new Error("guest count does not expose native increment and decrement controls");
}
if (appSource.includes('setupEnterpriseNumberInput("#guestCount"')) {
  throw new Error("guest count still has duplicate input handlers");
}
if (appSource.includes('dataset.clearOnFocus="1"')) {
  throw new Error("guest count is still cleared before arrow-key or spinner editing");
}
if (!indexSource.includes("訂單生命週期") || !indexSource.includes('type="hidden" id="workflowStatus"') || !indexSource.includes('type="hidden" id="orderStatus"')) {
  throw new Error("duplicate manually editable order status controls were not consolidated");
}
if (!indexSource.includes('id="workflowStatusPreview"') || !indexSource.includes('id="paymentStatusPreview"')) {
  throw new Error("automatic workflow and payment status summaries are missing");
}
if (!appSource.includes("window.editHousekeepingStaff=id=>")) {
  throw new Error("housekeeping staff cannot be edited");
}
if (!appSource.includes("tasks.filter(task=>task.assignee===oldName).forEach(task=>task.assignee=staff.name)")) {
  throw new Error("renaming housekeeping staff does not preserve existing assignments");
}
if (!appSource.includes("window.deleteHousekeepingStaff=id=>")) {
  throw new Error("housekeeping staff cannot be deleted");
}
if (!appSource.includes("仍有 ${assigned.length} 筆進行中工作，請先重新指派")) {
  throw new Error("deleting assigned housekeeping staff is not guarded");
}
if (!appSource.includes('to==="已入住"&&todayISO<o.checkin')) {
  throw new Error("future orders can still be completed as checked in");
}
if (!appSource.includes('to==="已退房"&&todayISO<o.checkout')) {
  throw new Error("future orders can still be completed as checked out");
}
if (!appSource.includes("function repairImpossibleFutureLifecycleOrders()")) {
  throw new Error("impossible future lifecycle data is not repaired");
}
if (!appSource.includes('transitionLifecycle(o,"已入住","入住管理")')) {
  throw new Error("manual check-in completion does not update the canonical lifecycle");
}
if (!appSource.includes('o.checklist["完成入住"]=true')) {
  throw new Error("successful check-in does not automatically complete the checklist");
}
if (!styleSource.includes(".order-mobile-card .workflow-action{grid-column:1/-1")) {
  throw new Error("mobile lifecycle action is not presented as a primary full-width action");
}
if (!styleSource.includes(".checkin-card .checklist .check-item:last-child{grid-column:1/-1")) {
  throw new Error("mobile check-in completion control is not emphasized");
}
if (!appSource.includes("function trackPendingSettingsWrite()")) {
  throw new Error("settings changes are not protected before background sync");
}
if (!realtimeSource.includes("function preservePendingSettings(local)")) {
  throw new Error("cloud hydration can overwrite pending settings changes");
}
if (!realtimeSource.includes("if(!order){remaining.push(item);return;}")) {
  throw new Error("pending service changes are discarded when a cloud order is temporarily absent");
}
if (!appSource.includes("if(navigator.onLine&&window.Meiyuan6Realtime?.push)await window.Meiyuan6Realtime.push()")) {
  throw new Error("service saves do not wait for an immediate cloud confirmation attempt");
}
if (!appSource.includes('await cloudRepository.write("settings",settings)')) {
  throw new Error("settings saves do not commit directly to the cloud repository");
}
if (!appSource.includes('window.open(customerLineUrl,"_blank","noopener,noreferrer")')) {
  throw new Error("official LINE actions do not open the configured web URL");
}
if (!appSource.includes("package=com.linecorp.lineoa") || !appSource.includes("chat\\.line\\.biz")) {
  throw new Error("mobile official LINE actions do not target the Official Account management app or website");
}
if (!appSource.includes('OFFICIAL_LINE_CHAT_URL="https://chat.line.biz/Ue28fc4caf7d40782abdf10059e3dabc0"')) {
  throw new Error("desktop and iPhone official LINE actions do not target the configured chat manager");
}
if (appSource.includes('protocolFrame.src="line://"') || appSource.includes('LINE_MANAGER_LOGIN_URL') || appSource.includes("https://line.me/R/ti/p/")) {
  throw new Error("official LINE actions can still launch the LINE app or ignore the configured URL");
}

console.log("DATA_CONSISTENCY_TESTS=PASS");
