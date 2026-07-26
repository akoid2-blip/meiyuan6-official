(() => {
"use strict";
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const DAY = 86400000;
const localISO = date => {
 const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");
 return `${y}-${m}-${d}`;
};
const todayISO = localISO(new Date());
const compareISO = (a,b) => String(a).localeCompare(String(b));
const isPastDate = iso => compareISO(iso,todayISO)<0;
const WORKFLOW_STATES=["建立","已確認","入住","退房","待清掃","清掃中","完成清掃","可入住"];
const LIFECYCLE_STATES=["詢問中","待確認","已確認","已入住","已退房","已取消","No Show"];
const LIFECYCLE_NEXT={"詢問中":["待確認","已確認","已取消"],"待確認":["已確認","已取消"],"已確認":["已入住","已取消","No Show"],"已入住":["已退房"],"已退房":[],"已取消":[],"No Show":[]};
const NON_OCCUPYING_STATES=new Set(["已取消","No Show"]);
const WORKFLOW_NEXT={"建立":"已確認","已確認":"入住","入住":"退房","退房":"待清掃","待清掃":"清掃中","清掃中":"完成清掃","完成清掃":"可入住"};
const LOCK_TYPES={maintenance:"維修中",unavailable:"暫停出租",service:"保養中"};
const LOCK_ICONS={maintenance:"settings",unavailable:"lock",service:"sparkles"};
const fmtDate = d => d ? new Date(d+"T00:00:00").toLocaleDateString("zh-TW",{month:"numeric",day:"numeric",weekday:"short"}) : "-";
const money = n => "NT$" + Number(n||0).toLocaleString("zh-TW");
const moneyNumber = value => Number(String(value??"").replace(/[^0-9.-]/g,"")) || 0;
const formatMoneyInput = value => moneyNumber(value).toLocaleString("zh-TW");
const uid = p => p + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();
const addDays = (iso,n) => {
 const [y,m,d]=String(iso).split("-").map(Number);
 const date=new Date(y,m-1,d);
 date.setDate(date.getDate()+n);
 return localISO(date);
};
const daysBetween = (a,b) => {
 const [ay,am,ad]=String(a).split("-").map(Number);
 const [by,bm,bd]=String(b).split("-").map(Number);
 return Math.round((new Date(by,bm-1,bd)-new Date(ay,am-1,ad))/DAY);
};
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

const ICON_PATHS={
 home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
 clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/>',
 login:'<path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/>',
 logout:'<path d="M14 17l5-5-5-5M19 12H7"/><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5"/>',
 wallet:'<path d="M3 7h16a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V7Z"/><path d="M3 7l13-4v4M16 12h5v4h-5a2 2 0 0 1 0-4Z"/>',
 sparkles:'<path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z"/><path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14ZM19 13l.6 1.4L21 15l-1.4.6L19 17l-.6-1.4L17 15l1.4-.6L19 13Z"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 'file-text':'<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/>',
 chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.14.35.2.72.2 1.1H21v4h-1.4c0 .38-.06.75-.2 1.1Z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
 trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/>',
 save:'<path d="M5 3h12l3 3v15H4V3z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>', copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><rect x="3" y="3" width="12" height="12" rx="2"/>',
 lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 x:'<path d="M6 6l12 12M18 6 6 18"/>', 'chevron-left':'<path d="m15 18-6-6 6-6"/>', 'chevron-right':'<path d="m9 18 6-6-6-6"/>',
 'arrow-right':'<path d="M5 12h14M13 6l6 6-6 6"/>', check:'<path d="m5 12 4 4L19 6"/>', play:'<path d="m8 5 11 7-11 7Z"/>',
 message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',
 refresh:'<path d="M20 7h-6V1M4 17h6v6"/><path d="M5.1 9A8 8 0 0 1 18.5 5.5L20 7M4 17l1.5 1.5A8 8 0 0 0 18.9 15"/>',
 external:'<path d="M14 3h7v7M10 14 21 3"/><path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6"/>',
};
const uiIcon=name=>`<svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]||ICON_PATHS['file-text']}</svg>`;
function applyStaticIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{if(el.querySelector(':scope > .ui-icon'))return;el.insertAdjacentHTML('afterbegin',uiIcon(el.dataset.icon));});}

const roomMaster=[
 {id:"R1",name:"和室六人房（大和室）",capacity:6},
 {id:"R2",name:"和室四人房（168）",capacity:4},
 {id:"R3",name:"樓中樓四人房（101）",capacity:4},
 {id:"R4",name:"雙人房（102）",capacity:2},
 {id:"R5",name:"雙人房（201）",capacity:2},
 {id:"R6",name:"三人房（202）",capacity:3},
 {id:"R7",name:"雙人房（203A）",capacity:2},
 {id:"R8",name:"雙人房（203B）",capacity:2},
 {id:"R9",name:"和室雙人房",capacity:2}
];
const roomName = id => roomMaster.find(r=>r.id===id)?.name || id;

const defaultTemplates = {
 "入住須知":`🌿 眉原六民宿｜入住須知

親愛的貴賓您好，感謝您選擇入住眉原六民宿。

一、入住與退房
・入住時間：15:00 後。
・退房時間：11:00 前。
・18:00 後抵達請提前通知，抵達前約 30 分鐘請聯繫管家。
・提早入住或延後退房須事先確認，每小時 NT$1,500，最多 3 小時。

二、住宿規範
・實際入住人數須與訂單一致。
・22:00 後請降低音量。
・全館禁菸，不得聚賭或從事違法行為。

三、餐飲
・眉原六為純住宿服務，不提供早餐。
・如由管家協助代訂早餐，以訂單確認內容為準。
・請避免室內燒烤及高油煙料理。

四、Wi-Fi
網路名稱：deco_be25_Guest
密碼：liou6868

祝您入住愉快。`,
 "早餐通知":`您好，您的早餐代訂資料如下：
日期：{{早餐日期}}
早餐店：{{早餐店}}
份數：{{早餐份數}}
送餐天數：{{送餐天數}} 天
每日送達時間：{{送達時間}}
如需調整，請提前與管家聯繫。`,
 "叫車通知":`您好，您的叫車預約資料如下：
日期：{{叫車日期}}
時間：{{叫車時間}}
上車地點：{{上車地點}}
目的地：{{目的地}}
人數／車型：{{人數}}／{{車型}}
車資：{{車資}}`,
 "寵物入住須知":`寵物入住清潔費為 NT$500／隻，最多 4 隻。請自備糧食及尿布，寵物不得上沙發及床鋪；大型犬請使用牽繩或籠具。`,
 "全館包棟":`全館包棟適用 16～27 人，系統將自動鎖定全部住宿單位。`,
 "小包棟":`小包棟適用 8～15 人，住宿單位依訂單勾選內容為準。`
};

const defaultSettings={
 propertyName:"眉原六民宿", lineUrl:"https://lin.ee/933tuhU", fullCapacity:"16～27 人", smallCapacity:"8～15 人",
 checkinTime:"15:00", checkoutTime:"11:00", hourlyFee:1500, petFee:500,
 registrationDate:"中華民國115年3月25日", registrationDocNo:"府官產自第1150061145號",
 registrationLicense:"南投縣民宿1311", insuranceCompany:"新光產物保險", insurancePolicy:"131915AHP0000257",
 insuranceStart:"2026-03-11T12:00", insuranceEnd:"2027-03-11T12:00"
};
const defaultShortcuts=[
 {icon:"🏛️",name:"觀光署旅宿網",url:"https://www.taiwanstay.net.tw/TSA/web_page/TSA010100.jsp"},
 {icon:"💬",name:"眉原六官方 LINE",url:"https://lin.ee/933tuhU"},
 {icon:"📍",name:"Google 地圖",url:"https://www.google.com/maps/search/?api=1&query=眉原六民宿"},
 {icon:"✉️",name:"Gmail",url:"https://mail.google.com/"},
 {icon:"🌐",name:"眉原六官網",url:"https://meiyuan6.tw/"}
];
const seedOrders=[
 {id:"MY6-260801",name:"陳小姐",phone:"0912-345-678",checkin:addDays(todayISO,1),checkout:addDays(todayISO,3),package:"小包棟（8～15人）",rooms:["R1","R2","R4"],count:10,source:"官方 LINE",status:"已付訂金",total:28000,paid:10000,note:"預計 16:00 抵達",breakfast:{date:addDays(todayISO,2),shop:"在地早餐店",qty:10,days:2,delivery:"08:00",done:false},taxi:{date:"",time:"",pickup:"",destination:"",guests:0,type:"",fare:0,done:false},earlyCheckin:"",lateCheckout:"",luggageStorage:true,checklist:{}},
 {id:"MY6-260802",name:"林先生",phone:"0988-123-456",checkin:addDays(todayISO,4),checkout:addDays(todayISO,5),package:"一般訂房",rooms:["R3","R6"],count:7,source:"電話",status:"已確認",total:12000,paid:0,note:"有長輩同行",breakfast:{date:"",shop:"",qty:0,days:0,delivery:"",done:false},taxi:{date:addDays(todayISO,5),time:"11:30",pickup:"眉原六民宿",destination:"埔里轉運站",guests:4,type:"一般計程車",fare:400,done:false},earlyCheckin:"",lateCheckout:"12:00",luggageStorage:false,checklist:{}}
];
const seedTasks=[];

const STORAGE_SCHEMA_VERSION = 12;

function safeJSON(key, fallback){
 try{
   const raw = localStorage.getItem(key);
   return raw ? JSON.parse(raw) : fallback;
 }catch(error){
   console.warn("LocalStorage parse failed:", key, error);
   return fallback;
 }
}
function validISO(value, fallback){
 return /^\d{4}-\d{2}-\d{2}$/.test(String(value||"")) ? String(value) : fallback;
}
function normalizeRoomIds(value){
 let raw = Array.isArray(value) ? value : (value ? [value] : []);
 const names = new Map(roomMaster.flatMap(r => [[r.id,r.id],[r.name,r.id]]));
 return [...new Set(raw.map(x=>{
   if(typeof x==="object" && x) x = x.id || x.roomId || x.name || x.unitName;
   return names.get(String(x)) || String(x);
 }).filter(id=>roomMaster.some(r=>r.id===id)))];
}
function normalizeOrder(raw, index=0){
 const fallbackIn = addDays(todayISO, index+1);
 const checkin = validISO(raw?.checkin || raw?.checkIn || raw?.arrivalDate || raw?.startDate, fallbackIn);
 let checkout = validISO(raw?.checkout || raw?.checkOut || raw?.departureDate || raw?.endDate, addDays(checkin,1));
 if(checkout<=checkin) checkout=addDays(checkin,1);

 let rooms = normalizeRoomIds(raw?.rooms || raw?.roomIds || raw?.unitIds || raw?.selectedUnits || raw?.accommodationUnits);
 const pkg = String(raw?.package || raw?.packageType || raw?.bookingType || "一般訂房");
 if(pkg.includes("全館")) rooms=roomMaster.map(r=>r.id);
 if(!rooms.length) rooms=[roomMaster[index % roomMaster.length].id];

 const total = Number(raw?.total ?? raw?.totalAmount ?? raw?.amount ?? 0) || 0;
 const paid = Math.max(0, Number(raw?.paid ?? raw?.paidAmount ?? raw?.deposit ?? 0) || 0);

 return {
   id:String(raw?.id || raw?.orderId || raw?.bookingId || `MY6-M${Date.now().toString().slice(-6)}${index}`),
   name:String(raw?.name || raw?.guestName || raw?.customerName || "未命名旅客"),
   phone:String(raw?.phone || raw?.guestPhone || raw?.mobile || ""),
   checkin, checkout, package:pkg, rooms,
   count:Math.max(1,Number(raw?.count ?? raw?.guestCount ?? raw?.guests ?? raw?.people ?? 1)||1),
   source:String(raw?.source || raw?.orderSource || "官方 LINE"),
   status:String(raw?.status || "已確認"),
   lifecycleStatus:LIFECYCLE_STATES.includes(String(raw?.lifecycleStatus)) ? String(raw.lifecycleStatus) : ({"已入住":"已入住","已退房":"已退房","已取消":"已取消","No Show":"No Show"}[String(raw?.status)] || (["詢問中","待確認","已確認"].includes(String(raw?.status)) ? String(raw.status) : "已確認")),
   lifecycleHistory:Array.isArray(raw?.lifecycleHistory) ? raw.lifecycleHistory.filter(x=>x && LIFECYCLE_STATES.includes(String(x.to))).map(x=>({from:String(x.from||""),to:String(x.to),operator:String(x.operator||"系統"),time:String(x.time||new Date().toISOString())})) : [],
   workflowStatus:WORKFLOW_STATES.includes(String(raw?.workflowStatus)) ? String(raw.workflowStatus) : ({"已入住":"入住","已退房":"待清掃"}[String(raw?.status)] || "已確認"),
   orderType:raw?.orderType==="backfill" ? "backfill" : "normal",
   isBackfill:Boolean(raw?.isBackfill || raw?.orderType==="backfill"),
   backfillReason:String(raw?.backfillReason || ""),
   backfillTime:String(raw?.backfillTime || ""),
   backfillOperator:String(raw?.backfillOperator || ""),
   total, paid:Math.min(paid,total || paid),
   openingPaid:Math.max(0,Number(raw?.openingPaid ?? raw?.initialPaid ?? 0)||0),
   note:String(raw?.note || raw?.notes || ""),
   breakfast:{
     date:validISO(raw?.breakfast?.date || raw?.breakfastDate, ""),
     shop:String(raw?.breakfast?.shop || raw?.breakfastShop || ""),
     qty:Math.max(0,Number(raw?.breakfast?.qty ?? raw?.breakfastQty ?? 0)||0),
     days:Math.max(0,Number(raw?.breakfast?.days ?? raw?.breakfastDays ?? ((raw?.breakfast?.qty||raw?.breakfastQty)?1:0))||0),
     delivery:String(raw?.breakfast?.delivery || raw?.breakfastDelivery || ""),
     done:Boolean(raw?.breakfast?.done ?? raw?.breakfastDone)
   },
   taxi:{
     date:validISO(raw?.taxi?.date || raw?.taxiDate, ""),
     time:String(raw?.taxi?.time || raw?.taxiTime || ""),
     pickup:String(raw?.taxi?.pickup || raw?.taxiPickup || ""),
     destination:String(raw?.taxi?.destination || raw?.taxiDestination || ""),
     guests:Math.max(0,Number(raw?.taxi?.guests ?? raw?.taxiGuests ?? 0)||0),
     type:String(raw?.taxi?.type || raw?.taxiType || ""),
     fare:Math.max(0,Number(raw?.taxi?.fare ?? raw?.taxiFare ?? 0)||0),
     done:Boolean(raw?.taxi?.done ?? raw?.taxiDone)
   },
   earlyCheckin:String(raw?.earlyCheckin || ""),
   lateCheckout:String(raw?.lateCheckout || ""),
   luggageStorage:Boolean(raw?.luggageStorage),
   checklist:(raw?.checklist && typeof raw.checklist==="object") ? raw.checklist : {}
 };
}
function normalizeTask(raw,index=0){
 const legacyStatus=String(raw?.status || "待清掃");
 return {
   id:String(raw?.id || `T-M${index}`),
   date:validISO(raw?.date,todayISO),
   room:normalizeRoomIds(raw?.room || raw?.roomId || raw?.unitId)[0] || roomMaster[index%roomMaster.length].id,
   title:String(raw?.title || raw?.task || "退房清潔"),
   status:({"尚未安排":"待清掃","已安排":"待清掃","清潔中":"清掃中","待複查":"清掃中","完成":"已完成"}[legacyStatus] || (['待清掃','清掃中','已完成'].includes(legacyStatus)?legacyStatus:'待清掃')),
   assignee:String(raw?.assignee || raw?.staff || ""),
   note:String(raw?.note || ""),
   orderId:String(raw?.orderId || ""),
   guest:String(raw?.guest || ""),
   checkoutAt:String(raw?.checkoutAt || ""),
   scheduledCheckout:String(raw?.scheduledCheckout || ""),
   startedAt:String(raw?.startedAt || ""),
   completedAt:String(raw?.completedAt || "")
 };
}

function normalizePayment(raw,index=0){
 const type=String(raw?.type||"訂金");
 const rawAmount=Math.abs(Number(raw?.amount)||0);
 const amount=type==="退款" ? -rawAmount : rawAmount;
 return {
   id:String(raw?.id||`P-M${index}-${Date.now().toString(36)}`),
   date:validISO(raw?.date,todayISO),
   orderId:String(raw?.orderId||""),
   type,method:String(raw?.method||"現金"),amount,
   category:String(raw?.category||""),
   description:String(raw?.description||raw?.note||""),
   verified:Boolean(raw?.verified),
   createdAt:String(raw?.createdAt||new Date().toISOString()),
   operator:String(raw?.operator||"管理員")
 };
}
function paymentRecords(orderId){return payments.filter(p=>p.orderId===orderId);}
function recordedPaymentNet(orderId){
 return paymentRecords(orderId).reduce((sum,p)=>{
   if(p.type==="加收費用") return sum+(p.verified&&p.amount>0?p.amount:0);
   return sum+p.amount;
 },0);
}
function paymentSummary(order){
 const records=paymentRecords(order.id);
 const opening=Math.max(0,Number(order.openingPaid)||0);
 const chargeRecords=records.filter(p=>p.type==="加收費用"&&p.amount>0);
 const additionalCharges=chargeRecords.reduce((s,p)=>s+p.amount,0);
 const settledChargeRecords=chargeRecords.filter(p=>p.verified);
 const settledAdditionalCharges=settledChargeRecords.reduce((s,p)=>s+p.amount,0);
 const receiptRecords=records.filter(p=>p.type!=="加收費用"&&p.amount>0);
 const receipts=receiptRecords.reduce((s,p)=>s+p.amount,0);
 const refunds=Math.abs(records.filter(p=>p.amount<0).reduce((s,p)=>s+p.amount,0));
 const depositRecords=receiptRecords.filter(p=>p.type==="訂金").reduce((s,p)=>s+p.amount,0);
 const adjustedTotal=Math.max(0,Number(order.total||0)+additionalCharges);
 const net=Math.max(0,opening+receipts+settledAdditionalCharges-refunds);
 const remaining=Math.max(0,adjustedTotal-net);
 const over=Math.max(0,net-adjustedTotal);
 return {opening,receipts,refunds,deposit:opening+depositRecords,additionalCharges,settledAdditionalCharges,adjustedTotal,net,remaining,over,records,chargeRecords,settledChargeRecords,receiptRecords};
}
function syncOrderPaid(order){const summary=paymentSummary(order);order.paid=Math.min(summary.adjustedTotal,summary.net);}
function reconcileOpeningPaid(){
 orders.forEach(order=>{
   const recorded=recordedPaymentNet(order.id);
   if(!Number.isFinite(Number(order.openingPaid)) || (Number(order.openingPaid)===0 && Number(order.paid)>Math.max(0,recorded))){
     order.openingPaid=Math.max(0,Number(order.paid||0)-Math.max(0,recorded));
   }
   syncOrderPaid(order);
 });
}
function migrateLegacyDuplicateChargePayments(){
 const removeIds=new Set();
 payments.filter(p=>p.type==="加收費用"&&p.verified&&p.amount>0).forEach(charge=>{
   const duplicate=payments.find(p=>!removeIds.has(p.id)&&p.orderId===charge.orderId&&p.date===charge.date&&p.type==="尾款"&&p.amount===charge.amount&&p.verified);
   if(duplicate)removeIds.add(duplicate.id);
 });
 if(removeIds.size)payments=payments.filter(p=>!removeIds.has(p.id));
 return removeIds.size;
}
function upsertGuestProfileFromOrder(order){
 const phone=String(order?.phone||"").trim();
 if(!phone)return;
 const current=(guestProfiles[phone]&&typeof guestProfiles[phone]==="object")?guestProfiles[phone]:{};
 guestProfiles[phone]={...current,name:String(order.name||current.name||"未命名旅客"),phone,note:current.note||String(order.note||"")};
}
function syncGuestProfilesFromOrders(){orders.forEach(upsertGuestProfileFromOrder);}
const storedOrders = safeJSON("my6_orders", null);
let orders=(Array.isArray(storedOrders) && storedOrders.length ? storedOrders : seedOrders).map(normalizeOrder);
let payments=(Array.isArray(safeJSON("my6_payments",[])) ? safeJSON("my6_payments",[]) : []).map(normalizePayment);
let tasks=(Array.isArray(safeJSON("my6_tasks",null)) ? safeJSON("my6_tasks",null) : seedTasks).map(normalizeTask).filter(t=>t.orderId);
let guestProfiles=safeJSON("my6_guest_profiles",{});
let settings={...defaultSettings,...safeJSON("my6_settings",{})};
let shortcuts=Array.isArray(safeJSON("my6_shortcuts",null)) ? safeJSON("my6_shortcuts",null) : defaultShortcuts;
const storedTemplates=safeJSON("my6_templates",null);
let templates=(storedTemplates && typeof storedTemplates==="object" && Object.keys(storedTemplates).length) ? storedTemplates : {...defaultTemplates};
let selectedTemplate=Object.keys(templates)[0] || "";
let roomLocks=(Array.isArray(safeJSON("my6_room_locks",[])) ? safeJSON("my6_room_locks",[]) : []).map((x,i)=>({
 id:String(x?.id||`L${i}`),room:normalizeRoomIds(x?.room||x?.roomId)[0]||roomMaster[0].id,
 type:LOCK_TYPES[x?.type]?x.type:"maintenance",start:validISO(x?.start,todayISO),end:validISO(x?.end,todayISO),
 reason:String(x?.reason||""),operator:String(x?.operator||x?.lockOperator||""),
 createdAt:String(x?.createdAt||x?.lockTime||new Date().toISOString()),updatedAt:String(x?.updatedAt||""),
 history:Array.isArray(x?.history)?x.history:[]
}));
let calDate=new Date();
reconcileOpeningPaid();

try{
 const oldVersion=Number(localStorage.getItem("my6_schema_version")||0);
 if(oldVersion<STORAGE_SCHEMA_VERSION){
   localStorage.setItem("my6_legacy_backup_"+Date.now(), JSON.stringify({
     orders:storedOrders,
     payments:safeJSON("my6_payments",[]),
     tasks:safeJSON("my6_tasks",[]),
     guestProfiles:safeJSON("my6_guest_profiles",{}),
     settings:safeJSON("my6_settings",{}),
     shortcuts:safeJSON("my6_shortcuts",[]),
     templates:safeJSON("my6_templates",{}),
     roomLocks:safeJSON("my6_room_locks",[])
   }));
   migrateLegacyDuplicateChargePayments();
   syncGuestProfilesFromOrders();
   localStorage.setItem("my6_schema_version",String(STORAGE_SCHEMA_VERSION));
   localStorage.setItem("my6_payments",JSON.stringify(payments));
   localStorage.setItem("my6_guest_profiles",JSON.stringify(guestProfiles));
 }
}catch(error){ console.warn("Schema backup failed",error); }

function persist(){
 orders=orders.map(normalizeOrder);
 payments=payments.map(normalizePayment);
 reconcileOpeningPaid();
 tasks=tasks.map(normalizeTask);
 syncGuestProfilesFromOrders();
 localStorage.setItem("my6_schema_version",String(STORAGE_SCHEMA_VERSION));
 localStorage.setItem("my6_orders",JSON.stringify(orders));
 localStorage.setItem("my6_payments",JSON.stringify(payments));
 localStorage.setItem("my6_tasks",JSON.stringify(tasks));
 localStorage.setItem("my6_guest_profiles",JSON.stringify(guestProfiles));
 localStorage.setItem("my6_settings",JSON.stringify(settings));
 localStorage.setItem("my6_templates",JSON.stringify(templates));
 localStorage.setItem("my6_shortcuts",JSON.stringify(shortcuts));
 localStorage.setItem("my6_room_locks",JSON.stringify(roomLocks));
}
function toast(msg){
 const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.classList.remove("show"),2200);
}
function statusClass(s){ return s==="暫時保留"?"hold":(["已付訂金","已付全額"].includes(s)?"paid":"confirmed"); }
function lifecycleStatus(o){return LIFECYCLE_STATES.includes(o?.lifecycleStatus)?o.lifecycleStatus:({"已入住":"已入住","已退房":"已退房","已取消":"已取消"}[o?.status]||(["詢問中","待確認","已確認"].includes(o?.status)?o.status:"已確認"));}
function activeOrders(){ return orders.filter(o=>o && !NON_OCCUPYING_STATES.has(lifecycleStatus(o))); }
function lifecycleClass(s){return ({"詢問中":"gray","待確認":"gold","已確認":"green","已入住":"green","已退房":"gray","已取消":"red","No Show":"red"}[s]||"gray");}
function ensureCheckoutTasks(o){
 const checkoutAt=new Date().toISOString();
 orderRooms(o).forEach(room=>{
   const exists=tasks.some(t=>t.orderId===o.id&&t.room===room&&t.title==="退房清潔"&&t.status!=="已完成");
   if(!exists)tasks.push({id:uid("T"),date:o.checkout,room,title:"退房清潔",status:"待清掃",assignee:"",note:"",orderId:o.id,guest:o.name,checkoutAt,scheduledCheckout:o.lateCheckout||settings.checkoutTime||"11:00",startedAt:"",completedAt:""});
 });
}
function appendLifecycleHistory(o,from,to,operator="系統"){
 o.lifecycleHistory=Array.isArray(o.lifecycleHistory)?o.lifecycleHistory:[];
 o.lifecycleHistory.push({from:from||"",to,operator:operator||"系統",time:new Date().toISOString()});
 o.lifecycleStatus=to;
 if(to==="已入住"){o.status="已入住";o.workflowStatus="入住";o.checklist=o.checklist||{};o.checklist["完成入住"]=true;}
 if(to==="已退房"){o.status="已退房";o.workflowStatus="待清掃";ensureCheckoutTasks(o);}
 if(to==="已取消")o.status="已取消";
 if(to==="No Show")o.status="No Show";
}
function transitionLifecycle(o,to,operator="系統",options={}){
 const from=lifecycleStatus(o);
 if(to===from)return {ok:true,changed:false};
 if(!options.force && !(LIFECYCLE_NEXT[from]||[]).includes(to))return {ok:false,message:`不允許由「${from}」直接變更為「${to}」`};
 appendLifecycleHistory(o,from,to,operator);
 return {ok:true,changed:true};
}
function lifecycleHistoryText(o){const h=Array.isArray(o.lifecycleHistory)?o.lifecycleHistory:[];return h.slice(-5).reverse().map(x=>`${x.from||"建立"}→${x.to}・${new Date(x.time).toLocaleString("zh-TW",{hour12:false})}・${x.operator||"系統"}`).join("\n");}
function orderRooms(o){ return normalizeRoomIds(o?.rooms); }
function activeLocksFor(room,start,end){
 return roomLocks.filter(l=>l.room===room && start<=l.end && end>l.start);
}
function lockConflict(candidate){
 return orderRooms(candidate).flatMap(room=>activeLocksFor(room,candidate.checkin,candidate.checkout).map(lock=>({room,lock})));
}
function hasConflict(candidate,ignoreId=""){
 const candidateRooms=orderRooms(candidate);
 return activeOrders().some(o=>o.id!==ignoreId && candidate.checkin<o.checkout && candidate.checkout>o.checkin && candidateRooms.some(r=>orderRooms(o).includes(r)));
}
function validateBookingRules(candidate,ignoreId=""){
 if(candidate.orderType!=="backfill" && isPastDate(candidate.checkin)) return "過去日期不可建立一般訂單，請改用補登訂房。";
 if(candidate.orderType==="backfill" && !candidate.backfillReason.trim()) return "補登訂房必須填寫補登原因。";
 const locks=lockConflict(candidate);
 if(locks.length){const first=locks[0];return `${roomName(first.room)}於 ${first.lock.start}～${first.lock.end}為${LOCK_TYPES[first.lock.type]}，不可建立訂單。`;}
 if(hasConflict(candidate,ignoreId)) return "房況衝突：所選日期已有相同住宿單位被占用。";
 return "";
}
function serviceTags(o){
 const a=[]; if(o.breakfast?.qty) a.push(`早餐 ${o.breakfast.qty}份／${o.breakfast.days||1}天${o.breakfast.done?"✓":""}`);
 if(o.taxi?.date) a.push(`叫車${o.taxi.done?"✓":""}`); if(o.earlyCheckin)a.push("提早入住"); if(o.lateCheckout)a.push("延後退房"); if(o.luggageStorage)a.push("寄放行李");
 return a;
}
function navigate(page){
 $$(".page").forEach(x=>x.classList.toggle("active",x.id===page));
 $$("#nav button").forEach(x=>x.classList.toggle("active",x.dataset.page===page));
 const b=$(`#nav button[data-page="${page}"]`); $("#pageTitle").textContent=b?.textContent||"系統";
 window.scrollTo({top:0,behavior:"smooth"});
}
function safeRender(name,fn){
 try{ fn(); }
 catch(error){
   console.error("Render failed:",name,error);
   if(name==="calendar" && $("#calendarGrid")){
     $("#calendarGrid").innerHTML=`<div class="calendar-error"><strong>房況日曆載入失敗</strong><p>${esc(error.message)}</p><button onclick="location.reload()">${uiIcon("refresh")}重新載入</button></div>`;
   }
 }
}
function renderAll(){
 safeRender("dashboard",renderDashboard);
 safeRender("calendar",renderCalendar);
 safeRender("roomLocks",renderRoomLocks);
 safeRender("orders",renderOrders);
 safeRender("checkin",renderCheckin);
 safeRender("payments",renderPayments);
 safeRender("tasks",renderTasks);
 safeRender("guests",renderGuests);
 safeRender("templates",renderTemplates);
 safeRender("reports",renderReports);
 safeRender("settings",renderSettings);
}

let weatherLoaded=false;
function weatherLabel(code){
 const map={0:"晴朗",1:"大致晴朗",2:"局部多雲",3:"陰天",45:"有霧",48:"霧凇",51:"毛毛雨",53:"毛毛雨",55:"較強毛毛雨",61:"小雨",63:"中雨",65:"大雨",80:"陣雨",81:"陣雨",82:"強陣雨",95:"雷雨",96:"雷雨伴冰雹",99:"強雷雨伴冰雹"};
 return map[code]||"天氣變化";
}
function weatherIcon(code){
 if(code===0)return "☀️";
 if([1,2].includes(code))return "🌤️";
 if(code===3)return "☁️";
 if([45,48].includes(code))return "🌫️";
 if([51,53,55,61,63,65,80,81,82].includes(code))return "🌧️";
 if([95,96,99].includes(code))return "⛈️";
 return "🌡️";
}
async function loadPuliWeather(){
 if(weatherLoaded||!$("#weatherCardBody"))return; weatherLoaded=true;
 try{
   const url="https://api.open-meteo.com/v1/forecast?latitude=23.9664&longitude=120.9695&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTaipei&forecast_days=1";
   const r=await fetch(url,{cache:"no-store"}); if(!r.ok)throw new Error("weather"); const d=await r.json();
   const updated=new Intl.DateTimeFormat("zh-TW",{hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date());
   $("#weatherCardBody").innerHTML=`<span class="weather-icon" aria-hidden="true">${weatherIcon(d.current.weather_code)}</span><span class="weather-temp">${Math.round(d.current.temperature_2m)}°</span><span class="weather-condition">${weatherLabel(d.current.weather_code)}</span><span>最高 ${Math.round(d.daily.temperature_2m_max[0])}°</span><span>最低 ${Math.round(d.daily.temperature_2m_min[0])}°</span><span>降雨 ${d.daily.precipitation_probability_max[0]??0}%</span><span class="weather-updated">${updated} 更新</span>`;
   $("#weatherStatus").textContent="即時";
 }catch(error){
   $("#weatherStatus").textContent="無法更新"; $("#weatherStatus").className="badge gray";
   $("#weatherCardBody").innerHTML='<span class="weather-icon" aria-hidden="true">🌡️</span><span class="weather-temp">--°</span><span class="weather-condition">無法取得即時天氣</span><span>請確認網路</span><span>埔里地區</span><span>稍後重試</span><span class="weather-updated">尚未更新</span>';
 }
}
function renderDashboard(){
 const today=activeOrders().filter(o=>todayISO>=o.checkin&&todayISO<o.checkout);
 const inList=activeOrders().filter(o=>o.checkin===todayISO), outList=activeOrders().filter(o=>o.checkout===todayISO);
 const occupied=new Set(today.flatMap(o=>orderRooms(o))).size;
 const due=inList.reduce((s,o)=>s+paymentSummary(o).remaining,0);
 const paidToday=Math.max(0,payments.filter(p=>p.date===todayISO).reduce((s,p)=>{
   if(p.type==="加收費用")return s+(p.verified&&p.amount>0?p.amount:0);
   return s+p.amount;
 },0));
 const pendingCleaning=tasks.filter(t=>t.date<=todayISO&&t.status!=="已完成").length;
 const alerts=getAlerts();
 $("#statCheckin").textContent=inList.length; $("#statCheckout").textContent=outList.length;
 $("#statGuests").textContent=today.reduce((s,o)=>s+Number(o.count||0),0)+" 人";
 $("#statOccupancy").textContent=Math.round(occupied/roomMaster.length*100)+"%";
 $("#statDue").textContent=money(due); $("#statPaid").textContent=money(paidToday);
 $("#statCleaning").textContent=pendingCleaning; $("#statAlerts").textContent=alerts.length;
 const ops=[...inList.map(o=>({title:`入住｜${o.name}`,sub:`${o.count} 人・${orderRooms(o).map(roomName).join("、")}`})),
 ...outList.map(o=>({title:`退房｜${o.name}`,sub:`${orderRooms(o).map(roomName).join("、")}`})),
 ...tasks.filter(t=>t.date===todayISO&&t.status!=="已完成").map(t=>({title:`房務｜${roomName(t.room)}`,sub:`${t.title}・${t.status}`}))];
 $("#dailyOperations").innerHTML=ops.map(x=>`<div class="list-item"><div><strong>${esc(x.title)}</strong><small>${esc(x.sub)}</small></div></div>`).join("")||'<div class="empty">今日沒有排定工作。</div>';
 $("#alertList").innerHTML=alerts.map(a=>`<div class="list-item"><div><strong>${esc(a.title)}</strong><small>${esc(a.detail)}</small></div><span class="badge ${a.level}">${esc(a.label)}</span></div>`).join("")||'<div class="empty">目前沒有營運提醒。</div>';
 const lineQueue=[...inList.map(o=>({id:o.id,title:`入住提醒｜${o.name}`,detail:`今日 ${settings.checkinTime} 後入住`})),...activeOrders().filter(o=>o.checkin===addDays(todayISO,1)).map(o=>({id:o.id,title:`入住前通知｜${o.name}`,detail:`明日入住・${o.count} 人`})),...activeOrders().filter(o=>o.breakfast?.date===addDays(todayISO,1)&&o.breakfast?.qty&&!o.breakfast.done).map(o=>({id:o.id,title:`早餐確認｜${o.name}`,detail:`明日 ${o.breakfast.delivery||"待確認"}・${o.breakfast.qty} 份／${o.breakfast.days||1} 天`}))].slice(0,8);
 $("#lineQueueCount").textContent=`${lineQueue.length} 則`;
 $("#lineQueue").innerHTML=lineQueue.map(x=>`<div class="list-item"><div><strong>${esc(x.title)}</strong><small>${esc(x.detail)}</small></div><button class="line-action official-line-button" title="聯絡眉原六官方 LINE" onclick="window.copyLineMessage('${x.id}')">${uiIcon("message")}官方 LINE</button></div>`).join("")||'<div class="empty">今日沒有待發 LINE。</div>';
 loadPuliWeather();
 $("#shortcutGrid").innerHTML=shortcuts.map(s=>`<a class="shortcut-card" href="${esc(s.url)}" target="_blank" rel="noopener"><span class="icon">${esc(s.icon)}</span><span>${esc(s.name)}</span></a>`).join("");
 const upcoming=activeOrders().filter(o=>o.checkin>=todayISO).sort((a,b)=>a.checkin.localeCompare(b.checkin)).slice(0,6);
 $("#upcomingList").innerHTML=upcoming.map(o=>`<div class="list-item"><div><strong>${esc(o.name)}｜${fmtDate(o.checkin)}</strong><small>${esc(o.package)}・${o.count} 人</small></div><span class="badge ${statusClass(o.status)==="paid"?"green":"gold"}">${esc(o.status)}</span></div>`).join("")||'<div class="empty">目前沒有近期入住。</div>';
 const todos=activeOrders().flatMap(o=>{
   const a=[]; if(o.breakfast?.qty&&!o.breakfast.done)a.push(`${o.name}｜早餐 ${o.breakfast.qty} 份／${o.breakfast.days||1} 天`);
   if(o.taxi?.date&&!o.taxi.done)a.push(`${o.name}｜${o.taxi.date} ${o.taxi.time} 叫車`);
   return a;
 });
 $("#serviceTodoList").innerHTML=todos.map(t=>`<div class="list-item"><strong>${esc(t)}</strong><span class="badge gold">待處理</span></div>`).join("")||'<div class="empty">目前沒有服務待辦。</div>';
}
function getAlerts(){
 const a=[];
 const end=new Date(settings.insuranceEnd); const diff=Math.ceil((end-new Date())/DAY);
 if(diff<0)a.push({title:"保險已到期",detail:`到期時間：${settings.insuranceEnd.replace("T"," ")}`,level:"red",label:"已逾期"});
 else if(diff<=7)a.push({title:"保險即將到期",detail:`剩餘 ${diff} 天`,level:"red",label:"7 天內"});
 else if(diff<=30)a.push({title:"保險到期提醒",detail:`剩餘 ${diff} 天`,level:"gold",label:"30 天內"});
 else if(diff<=90)a.push({title:"保險到期提醒",detail:`剩餘 ${diff} 天`,level:"gold",label:"90 天內"});
 activeOrders().filter(o=>o.checkin>=todayISO&&o.paid<o.total).slice(0,5).forEach(o=>a.push({title:`${o.name} 尚有待收款`,detail:`入住 ${o.checkin}・未收 ${money(o.total-o.paid)}`,level:"gold",label:"待收款"}));
 return a;
}

function orderActionButtons(o){
 const terminal=["已取消","No Show"].includes(lifecycleStatus(o));
 return `<button onclick="window.editOrder('${o.id}')">${uiIcon("edit")}編輯</button>${!terminal?`<button onclick="window.openCalendarAdjust('${o.id}')">${uiIcon("calendar")}調整日期／房間</button>`:""}${(LIFECYCLE_NEXT[lifecycleStatus(o)]||[]).length?`<button class="workflow-action" onclick="window.advanceLifecycle('${o.id}')">${uiIcon("arrow-right")}變更狀態</button>`:""}${WORKFLOW_NEXT[o.workflowStatus]?`<button class="workflow-action" onclick="window.advanceOrderWorkflow('${o.id}')">${uiIcon("arrow-right")}${esc(WORKFLOW_NEXT[o.workflowStatus])}</button>`:""}<button onclick="window.openPaymentForOrder('${o.id}')">${uiIcon("wallet")}收款</button><button class="official-line-button" onclick="window.copyLineMessage('${o.id}')">${uiIcon("message")}官方 LINE</button><button onclick="window.deleteOrder('${o.id}')">${uiIcon("trash")}刪除</button>`;
}
function renderOrderMobileCards(list){
 const box=$("#orderMobileList");if(!box)return;
 box.innerHTML=list.map(o=>{const p=paymentSummary(o);return `<article class="order-mobile-card"><div class="mobile-card-head"><div><strong>${esc(o.name)}</strong><span>${esc(o.id)}・${esc(o.phone)}</span></div><span class="badge ${lifecycleClass(lifecycleStatus(o))}">${esc(lifecycleStatus(o))}</span></div><dl><div><dt>住宿日期</dt><dd>${o.checkin}～${o.checkout}</dd></div><div><dt>方案</dt><dd>${esc(o.package)}</dd></div><div class="wide"><dt>房間</dt><dd>${orderRooms(o).map(roomName).map(esc).join("、")}</dd></div><div><dt>最新應收</dt><dd>${money(p.adjustedTotal)}</dd></div><div><dt>剩餘應收</dt><dd>${money(p.remaining)}</dd></div><div class="wide"><dt>服務</dt><dd>${serviceTags(o).map(esc).join("、")||"—"}</dd></div></dl><div class="mobile-card-actions">${orderActionButtons(o)}</div></article>`}).join("")||'<div class="empty">沒有符合條件的訂單。</div>';
 applyStaticIcons(box);
}
function renderOrders(){
 const q=$("#orderSearch")?.value.trim().toLowerCase()||"", st=$("#statusFilter")?.value||"";
 const list=orders.filter(o=>(!st||lifecycleStatus(o)===st)&&(!q||[o.id,o.name,o.phone].join(" ").toLowerCase().includes(q))).sort((a,b)=>b.checkin.localeCompare(a.checkin));
 renderOrderMobileCards(list);
 $("#orderTableBody").innerHTML=list.map(o=>`<tr>
 <td><strong>${esc(o.id)}</strong>${o.isBackfill?`<span class="badge backfill" title="補登原因：${esc(o.backfillReason)}">補登</span>`:""}<span class="guest-detail">${esc(o.source)}</span>${o.isBackfill?`<span class="guest-detail backfill-meta">原因：${esc(o.backfillReason)}${o.backfillOperator?`・人員：${esc(o.backfillOperator)}`:""}${o.backfillTime?`・時間：${esc(new Date(o.backfillTime).toLocaleString("zh-TW",{hour12:false}))}`:""}</span>`:""}</td>
 <td><strong>${esc(o.name)}</strong><span class="guest-detail">${esc(o.phone)}</span></td>
 <td>${o.checkin}<br>至 ${o.checkout}</td>
 <td>${esc(o.package)}<span class="guest-detail">${orderRooms(o).map(roomName).map(esc).join("、")}</span></td>
 <td><div class="service-tags">${serviceTags(o).map(x=>`<span>${esc(x)}</span>`).join("")||"-"}</div></td>
 <td class="money-cell"><strong>${money(o.total)}</strong><span class="guest-detail">已收 ${money(o.paid)}・未收 ${money(Math.max(0,o.total-o.paid))}</span><div class="money-progress"><i style="width:${Math.min(100,o.total?o.paid/o.total*100:0)}%"></i></div></td>
 <td><span class="badge ${lifecycleClass(lifecycleStatus(o))}" title="${esc(lifecycleHistoryText(o))}">${esc(lifecycleStatus(o))}</span><span class="workflow-badge">${esc(o.workflowStatus)}</span>${(o.lifecycleHistory||[]).length?`<span class="guest-detail">歷程 ${(o.lifecycleHistory||[]).length} 筆</span>`:""}</td>
 <td><div class="table-actions">${orderActionButtons(o)}</div></td>
 </tr>`).join("")||'<tr><td colspan="8">沒有符合條件的訂單。</td></tr>';
 $("#paymentOrder").innerHTML=orders.filter(o=>!["已取消","No Show"].includes(lifecycleStatus(o))).map(o=>{const p=paymentSummary(o);return `<option value="${o.id}">${o.id}｜${esc(o.name)}｜剩餘 ${money(p.remaining)}</option>`}).join("");
 updatePaymentDialogSummary();
}
function openOrder(o=null,presetDate="",presetType="normal"){
 $("#orderForm").reset(); $("#orderId").value=o?.id||""; $("#orderDialogTitle").textContent=o?"編輯訂單":"新增訂單";
 $("#guestName").value=o?.name||""; $("#guestPhone").value=o?.phone||"";
 $("#orderType").value=o?.orderType||(presetType==="backfill"?"backfill":"normal"); $("#backfillReason").value=o?.backfillReason||""; $("#backfillTime").value=o?.backfillTime?new Date(o.backfillTime).toLocaleString("zh-TW",{hour12:false}):"儲存時自動記錄"; $("#backfillOperator").value=o?.backfillOperator||""; toggleBackfillFields();
 const initialCheckin=o?.checkin||presetDate||todayISO; $("#checkinDate").value=initialCheckin; $("#checkoutDate").value=o?.checkout||addDays(initialCheckin,1);
 $("#packageType").value=o?.package||"一般訂房"; $("#workflowStatus").value=o?.workflowStatus||"建立";
 const lifecycleSelect=$("#lifecycleStatus");
 if(lifecycleSelect){
   const current=lifecycleStatus(o||{status:"詢問中"});
   const allowed=o?[current,...(LIFECYCLE_NEXT[current]||[])]:LIFECYCLE_STATES;
   lifecycleSelect.innerHTML=allowed.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("");
   lifecycleSelect.value=current;
   lifecycleSelect.disabled=!!o && !(LIFECYCLE_NEXT[current]||[]).length;
 }
 if($("#lifecycleOperator")) $("#lifecycleOperator").value=""; $("#guestCount").value=o?.count||2; $("#guestCount").dataset.clearOnFocus="1"; $("#orderSource").value=o?.source||"官方 LINE"; $("#orderStatus").value=o?.status||"詢問中";
 $("#orderTotal").value=formatMoneyInput(o?.total||0); $("#orderPaid").value=formatMoneyInput(o?.paid||0); $("#orderNote").value=o?.note||"";
 $("#breakfastDate").value=o?.breakfast?.date||""; $("#breakfastShop").value=o?.breakfast?.shop||""; $("#breakfastQty").value=o?.breakfast?.qty||0; $("#breakfastDays").value=o?.breakfast?.days||0; $("#breakfastDelivery").value=o?.breakfast?.delivery||""; $("#breakfastDone").checked=!!o?.breakfast?.done;
 $("#taxiDate").value=o?.taxi?.date||""; $("#taxiTime").value=o?.taxi?.time||""; $("#taxiPickup").value=o?.taxi?.pickup||""; $("#taxiDestination").value=o?.taxi?.destination||""; $("#taxiGuests").value=o?.taxi?.guests||0; $("#taxiType").value=o?.taxi?.type||""; $("#taxiFare").value=formatMoneyInput(o?.taxi?.fare||0); $("#taxiDone").checked=!!o?.taxi?.done;
 $("#earlyCheckin").value=o?.earlyCheckin||""; $("#lateCheckout").value=o?.lateCheckout||""; $("#luggageStorage").checked=!!o?.luggageStorage;
 $$('input[name="roomChoice"]').forEach(x=>x.checked=(o?.rooms||[]).includes(x.value));
 handlePackageChange(); $("#conflictWarning").classList.add("hidden"); $("#orderDialog").showModal();
}
function toggleBackfillFields(){
 const backfill=$("#orderType")?.value==="backfill";
 $("#backfillFields")?.classList.toggle("hidden",!backfill);
 if($("#checkinDate")) $("#checkinDate").min=backfill?"":todayISO;
}
$("#orderType")?.addEventListener("change",toggleBackfillFields);
function handlePackageChange(){
 const full=$("#packageType").value.startsWith("全館");
 $$('input[name="roomChoice"]').forEach(x=>{ if(full)x.checked=true; x.disabled=full; });
}
function setupMoneyInputs(){
 ["orderTotal","orderPaid","taxiFare","paymentAmount"].forEach(id=>{
   const input=$("#"+id); if(!input||input.dataset.moneyReady==="1")return;
   input.dataset.moneyReady="1"; input.classList.add("amount-input");
   input.addEventListener("focus",()=>{input.value=moneyNumber(input.value)?String(moneyNumber(input.value)):"";input.select();});
   input.addEventListener("input",()=>{input.value=String(input.value||"").replace(/[^0-9]/g,"").replace(/^0+(?=\d)/,"");});
   input.addEventListener("blur",()=>{input.value=formatMoneyInput(input.value);});
 });
}
setupMoneyInputs();
function setupPeopleInput(){
 const input=$("#guestCount");
 if(!input||input.dataset.peopleReady==="1")return;
 input.dataset.peopleReady="1";
 input.addEventListener("focus",()=>{
   if(input.dataset.clearOnFocus==="1"){
     input.value="";
     input.dataset.clearOnFocus="0";
   }
 });
 input.addEventListener("input",()=>{input.value=String(input.value||"").replace(/[^0-9]/g,"").replace(/^0+(?=\d)/,"");});
 input.addEventListener("blur",()=>{if(input.value!=="")input.value=String(Math.max(1,Number(input.value)||1));});
}
setupPeopleInput();

function readOrderForm(){
 const rooms=$$('input[name="roomChoice"]:checked').map(x=>x.value);
 return {id:$("#orderId").value||("MY6-"+Date.now().toString().slice(-8)),name:$("#guestName").value.trim(),phone:$("#guestPhone").value.trim(),
 checkin:$("#checkinDate").value,checkout:$("#checkoutDate").value,package:$("#packageType").value,rooms,count:+$("#guestCount").value,source:$("#orderSource").value,status:$("#orderStatus").value,
 workflowStatus:$("#workflowStatus").value,lifecycleStatus:$("#lifecycleStatus")?.value||"詢問中",lifecycleOperator:$("#lifecycleOperator")?.value.trim()||"系統",lifecycleHistory:orders.find(o=>o.id===$("#orderId").value)?.lifecycleHistory||[],orderType:$("#orderType").value,isBackfill:$("#orderType").value==="backfill",backfillReason:$("#backfillReason").value.trim(),backfillTime:orders.find(o=>o.id===$("#orderId").value)?.backfillTime||"",backfillOperator:$("#backfillOperator").value.trim(),
 total:moneyNumber($("#orderTotal").value),paid:moneyNumber($("#orderPaid").value),note:$("#orderNote").value.trim(),
 breakfast:{date:$("#breakfastDate").value,shop:$("#breakfastShop").value.trim(),qty:+$("#breakfastQty").value,days:+$("#breakfastDays").value,delivery:$("#breakfastDelivery").value,done:$("#breakfastDone").checked},
 taxi:{date:$("#taxiDate").value,time:$("#taxiTime").value,pickup:$("#taxiPickup").value.trim(),destination:$("#taxiDestination").value.trim(),guests:+$("#taxiGuests").value,type:$("#taxiType").value.trim(),fare:moneyNumber($("#taxiFare").value),done:$("#taxiDone").checked},
 earlyCheckin:$("#earlyCheckin").value,lateCheckout:$("#lateCheckout").value,luggageStorage:$("#luggageStorage").checked,checklist:orders.find(o=>o.id===$("#orderId").value)?.checklist||{}};
}
$("#orderForm").addEventListener("submit",e=>{
 e.preventDefault(); const o=readOrderForm();
 if(!o.rooms.length)return toast("請至少選擇一個住宿單位");
 if(!Number.isFinite(o.count)||o.count<1)return toast("入住人數至少為 1 人");
 if(o.breakfast.qty>0 && o.breakfast.days<1)return toast("有預訂早餐時，送餐天數至少為 1 天");
 if(o.checkout<=o.checkin)return toast("退房日期必須晚於入住日期");
 const ruleError=validateBookingRules(o,o.id); if(ruleError){$("#conflictWarning").textContent=ruleError;$("#conflictWarning").classList.remove("hidden");return;}
 if(o.isBackfill&&!o.backfillTime)o.backfillTime=new Date().toISOString();
 const i=orders.findIndex(x=>x.id===o.id); const previous=i>=0?orders[i]:null;
 const recordedNet=recordedPaymentNet(o.id);
 o.openingPaid=Math.max(0,o.paid-recordedNet);
 const editedSummary=paymentSummary({...o,openingPaid:o.openingPaid});
 if(o.paid>editedSummary.adjustedTotal)return toast("已收金額不可超過最新應收總額");
 if(editedSummary.net>editedSummary.adjustedTotal)return toast("原始訂單金額不可低於扣除加收費用後的已收淨額");
 if(previous){
   const from=lifecycleStatus(previous);
   o.lifecycleHistory=Array.isArray(previous.lifecycleHistory)?[...previous.lifecycleHistory]:[];
   o.lifecycleStatus=from;
   const target=$("#lifecycleStatus")?.value||from;
   const result=transitionLifecycle(o,target,o.lifecycleOperator);
   if(!result.ok)return toast(result.message);
 }else{
   o.lifecycleHistory=[];
   appendLifecycleHistory(o,"",o.lifecycleStatus,o.lifecycleOperator);
 }
 delete o.lifecycleOperator;
 if(i>=0)orders[i]=o;else orders.push(o); upsertGuestProfileFromOrder(o);persist();$("#orderDialog").close();renderAll();toast(o.isBackfill?"補登訂單與旅客資料已儲存":"訂單已儲存");
});
window.editOrder=id=>openOrder(orders.find(o=>o.id===id));
window.openOrderFromCalendar=id=>{
 const nav=$(`[data-page="orders"]`);
 if(nav) nav.click();
 const order=orders.find(o=>o.id===id);
 if(order) setTimeout(()=>openOrder(order),0);
};
window.openNewOrderFromCalendar=(date,type="normal")=>{
 const nav=$(`[data-page="orders"]`);
 if(nav) nav.click();
 setTimeout(()=>openOrder(null,date,type),0);
};
window.deleteOrder=id=>{ if(confirm("確定刪除此訂單？")){orders=orders.filter(o=>o.id!==id);persist();renderAll();toast("訂單已刪除");}};

window.advanceLifecycle=id=>{
 const o=orders.find(x=>x.id===id);if(!o)return;const from=lifecycleStatus(o);const allowed=LIFECYCLE_NEXT[from]||[];if(!allowed.length)return toast("此訂單已無可用的下一狀態");
 const menu=allowed.map((x,i)=>`${i+1}. ${x}`).join("\n");const pick=prompt(`目前狀態：${from}\n請輸入編號：\n${menu}`,"1");if(pick===null)return;const to=allowed[Number(pick)-1];if(!to)return toast("狀態選擇無效");
 const operator=prompt("請輸入操作人員", "管理員")||"管理員";if(!confirm(`確認將 ${o.name} 由「${from}」更新為「${to}」？`))return;
 const result=transitionLifecycle(o,to,operator);
 if(!result.ok)return toast(result.message);
 persist();renderAll();toast(`訂單狀態已更新：${to}`);
};
window.advanceOrderWorkflow=id=>{
 const o=orders.find(x=>x.id===id);if(!o)return;const next=WORKFLOW_NEXT[o.workflowStatus];if(!next)return;
 if(!confirm(`確認將 ${o.name} 的流程由「${o.workflowStatus}」更新為「${next}」？`))return;
 o.workflowStatus=next;
 if(next==="入住"){
   const result=transitionLifecycle(o,"已入住","營運流程");
   if(!result.ok)return toast(result.message);
 }
 if(next==="退房"||next==="待清掃"){
   const result=transitionLifecycle(o,"已退房","營運流程");
   if(!result.ok)return toast(result.message);
   o.workflowStatus="待清掃";
 }
 persist();renderAll();toast(`流程已更新：${o.workflowStatus}`);
};
window.checkInOrder=id=>{
 const o=orders.find(x=>x.id===id); if(!o)return;
 if(!confirm(`確認 ${o.name} 已完成入住？`))return;
 const result=transitionLifecycle(o,"已入住","管理員");
 if(!result.ok)return toast(result.message);
 persist();renderAll();toast("已完成入住登記");
};
window.checkoutOrder=id=>{
 const o=orders.find(x=>x.id===id); if(!o)return;
 if(!confirm(`確認 ${o.name} 已退房？系統將自動建立房務清掃工作。`))return;
 const result=transitionLifecycle(o,"已退房","管理員");
 if(!result.ok)return toast(result.message);
 persist();renderAll();navigate("housekeeping");toast("退房完成，房務任務已建立");
};
const LINE_MANAGER_LOGIN_URL="https://tw.linebiz.com/login/";
function openOfficialLine(){
 const customerLineUrl=(settings.lineUrl||"https://lin.ee/933tuhU").trim();
 if(!/^https?:\/\//i.test(customerLineUrl)){toast("LINE 網址設定不正確");return;}
 const ua=navigator.userAgent||"";
 const isPhoneOrTablet=/Android|iPhone|iPad|iPod/i.test(ua);
 // iPadOS 13+ may identify Safari as Macintosh when "Request Desktop Website" is enabled.
 const isIPadOS=/Macintosh/i.test(ua) && navigator.maxTouchPoints>1;
 if(isPhoneOrTablet || isIPadOS){
   // Phone/iPad: always use the homestay customer LINE link, never the LINE OA manager site.
   window.location.assign(customerLineUrl);
   return;
 }

 // Desktop: try the installed LINE client first. If the browser does not
 // hand off to the app, open LINE Official Account Manager's stable login page.
 const fallbackWindow=window.open("about:blank","_blank");
 if(fallbackWindow){
   try{fallbackWindow.opener=null;fallbackWindow.document.title="正在開啟 LINE 官方帳號管理後台…";}catch(_error){}
 }
 let appOpened=false;
 const markAppOpened=()=>{if(document.hidden)appOpened=true;};
 document.addEventListener("visibilitychange",markAppOpened,{once:true});
 const protocolFrame=document.createElement("iframe");
 protocolFrame.hidden=true;
 protocolFrame.setAttribute("aria-hidden","true");
 protocolFrame.src="line://";
 document.body.appendChild(protocolFrame);

 window.setTimeout(()=>{
   protocolFrame.remove();
   document.removeEventListener("visibilitychange",markAppOpened);
   if(appOpened){
     if(fallbackWindow&&!fallbackWindow.closed)fallbackWindow.close();
     return;
   }
   if(fallbackWindow&&!fallbackWindow.closed){
     fallbackWindow.location.replace(LINE_MANAGER_LOGIN_URL);
   }else{
     window.open(LINE_MANAGER_LOGIN_URL,"_blank","noopener,noreferrer");
   }
 },1200);
}
window.copyLineMessage=async id=>{
 const o=orders.find(x=>x.id===id); const msg=`眉原六民宿訂房確認\n旅客：${o.name}\n入住：${o.checkin}\n退房：${o.checkout}\n方案：${o.package}\n房間：${orderRooms(o).map(roomName).join("、")}\n人數：${o.count}\nWi-Fi：deco_be25_Guest／liou6868\n${o.note?"備註："+o.note:""}`;
 try{await navigator.clipboard.writeText(msg);toast("LINE 訊息已複製");}catch{prompt("請複製以下訊息",msg);}
 openOfficialLine();
};

let dragInfo=null;
let suppressCalendarClickUntil=0;
let touchDragState=null;
function clearTouchDragVisuals(){
  $$(".calendar-cell.drag-over",$("#calendarGrid")).forEach(cell=>cell.classList.remove("drag-over"));
  $$(".event.touch-dragging",$("#calendarGrid")).forEach(el=>el.classList.remove("touch-dragging"));
}
function installTouchCalendarDrag(){
  const grid=$("#calendarGrid");
  if(window.matchMedia("(max-width: 900px)").matches)return;
  if(!grid||!("PointerEvent" in window))return;
  $$(".event",grid).forEach(eventEl=>{
    eventEl.addEventListener("pointerdown",e=>{
      if(e.pointerType==="mouse"||e.button!==0)return;
      const handle=e.target.closest(".resize-handle");
      const mode=handle?.dataset.mode||"move";
      const startX=e.clientX,startY=e.clientY;
      const state={pointerId:e.pointerId,eventEl,id:eventEl.dataset.id,mode,startX,startY,active:false,targetDate:null,timer:null};
      touchDragState=state;
      state.timer=setTimeout(()=>{
        if(touchDragState!==state)return;
        state.active=true;
        dragInfo={id:state.id,mode:state.mode};
        suppressCalendarClickUntil=Date.now()+800;
        eventEl.classList.add("touch-dragging");
        try{eventEl.setPointerCapture(e.pointerId);}catch{}
        if(navigator.vibrate)navigator.vibrate(20);
        toast(mode==="move"?"拖曳至新的入住日期":"拖曳至新的日期");
      },380);
    });
    eventEl.addEventListener("pointermove",e=>{
      const state=touchDragState;
      if(!state||state.eventEl!==eventEl||state.pointerId!==e.pointerId)return;
      const moved=Math.hypot(e.clientX-state.startX,e.clientY-state.startY);
      if(!state.active){
        if(moved>10){clearTimeout(state.timer);touchDragState=null;}
        return;
      }
      e.preventDefault();
      clearTouchDragVisuals();
      eventEl.classList.add("touch-dragging");
      const hit=document.elementFromPoint(e.clientX,e.clientY);
      const cell=hit?.closest?.(".calendar-cell[data-date]");
      if(cell){cell.classList.add("drag-over");state.targetDate=cell.dataset.date;}else state.targetDate=null;
    },{passive:false});
    const finish=e=>{
      const state=touchDragState;
      if(!state||state.eventEl!==eventEl||state.pointerId!==e.pointerId)return;
      clearTimeout(state.timer);
      if(state.active){
        e.preventDefault();
        suppressCalendarClickUntil=Date.now()+800;
        const date=state.targetDate;
        clearTouchDragVisuals();
        touchDragState=null;
        if(date)applyCalendarDrop(date);else toast("未移動：請拖曳到日曆日期格");
      }else touchDragState=null;
    };
    eventEl.addEventListener("pointerup",finish,{passive:false});
    eventEl.addEventListener("pointercancel",finish,{passive:false});
  });
}
function calendarOrderSummary(o){
 const rooms=orderRooms(o);
 if(o.package.startsWith("全館"))return `全館包棟｜${rooms.length} 間`;
 if(o.package.startsWith("小包棟"))return `小包棟｜${rooms.length} 間`;
 const labels=rooms.map(id=>{const n=roomName(id);const roomNo=n.match(/（([^）]+)）/);return roomNo?roomNo[1]:n.replace(/（.*?）/g,"");});
 return labels.join("、")||"未指定房間";
}
function buildCalendarLanes(rangeStart,rangeEnd){
 const visible=activeOrders().filter(o=>o.checkin<rangeEnd&&o.checkout>rangeStart).sort((a,b)=>a.checkin.localeCompare(b.checkin)||a.checkout.localeCompare(b.checkout)||a.id.localeCompare(b.id));
 const laneEnds=[];
 const laneById=new Map();
 visible.forEach(o=>{
   let lane=laneEnds.findIndex(end=>end<=o.checkin);
   if(lane<0){lane=laneEnds.length;laneEnds.push(o.checkout);}else laneEnds[lane]=o.checkout;
   laneById.set(o.id,lane);
 });
 return {visible,laneById,laneCount:laneEnds.length};
}
function renderCalendar(){
 if(!$("#calendarGrid")) return;
 const y=calDate.getFullYear(),m=calDate.getMonth(); $("#calendarTitle").textContent=`${y} 年 ${m+1} 月`;
 const startMonth=new Date(y,m,1), start=new Date(y,m,1-startMonth.getDay());
 const rangeStart=localISO(start), rangeEnd=addDays(rangeStart,42);
 const {visible,laneById,laneCount}=buildCalendarLanes(rangeStart,rangeEnd);
 let html=["日","一","二","三","四","五","六"].map(d=>`<div class="calendar-cell head">${d}</div>`).join("");
 for(let i=0;i<42;i++){
   const d=new Date(start);d.setDate(start.getDate()+i);const iso=localISO(d),muted=d.getMonth()!==m;
   const byLane=new Map(visible.filter(o=>iso>=o.checkin&&iso<o.checkout).map(o=>[laneById.get(o.id),o]));
   let events="";
   for(let lane=0;lane<laneCount;lane++){
     const o=byLane.get(lane);
     if(!o){events+='<div class="event-placeholder" aria-hidden="true"></div>';continue;}
     const first=iso===o.checkin,last=iso===addDays(o.checkout,-1);
     const segment=first&&last?"single":first?"first":last?"last":"middle";
     events+=`<div class="event ${statusClass(o.status)} event-${segment}" draggable="${window.matchMedia("(min-width: 901px)").matches}" data-id="${o.id}" data-mode="move" data-lane="${lane}" role="button" tabindex="0" title="開啟訂單：${esc(o.name)}｜${esc(calendarOrderSummary(o))}">
       ${first?`<span class="resize-handle" draggable="${window.matchMedia("(min-width: 901px)").matches}" data-id="${o.id}" data-mode="start" title="調整入住日期"></span>`:`<span class="event-spacer"></span>`}
       <span class="event-content"><span class="event-name">${esc(o.name)}</span><span class="event-room">${esc(calendarOrderSummary(o))}</span></span>
       ${last?`<span class="resize-handle" draggable="${window.matchMedia("(min-width: 901px)").matches}" data-id="${o.id}" data-mode="end" title="調整退房日期"></span>`:`<span class="event-spacer"></span>`}
     </div>`;
   }
   const dayLocks=roomLocks.filter(l=>iso>=l.start&&iso<=l.end);
   const lockHtml=dayLocks.length?`<button class="calendar-lock" type="button" data-lock-date="${iso}" title="${esc(dayLocks.map(l=>`${roomName(l.room)} ${LOCK_TYPES[l.type]}：${l.reason}${l.operator?`（${l.operator}）`:""}`).join("｜"))}">${uiIcon("lock")}${dayLocks.length} 房鎖定</button>`:"";
   const cleaning=tasks.filter(t=>t.date===iso&&t.status!=="已完成");
   const cleaningHtml=cleaning.length?`<div class="calendar-housekeeping" title="房務工作">🧹 ${cleaning.map(t=>roomName(t.room).match(/（([^）]+)）/)?.[1]||roomName(t.room)).join("、")}</div>`:"";
   html+=`<div class="calendar-cell ${muted?"muted ":""}${iso===todayISO?"today ":""}${isPastDate(iso)?"past":""}" data-date="${iso}"><div class="day-num">${d.getDate()}${iso===todayISO?`<span class="today-badge">今日</span>`:""}</div>${events}${lockHtml}${cleaningHtml}</div>`;
 }
 $("#calendarGrid").innerHTML=html;
 $$(".event,.resize-handle",$("#calendarGrid")).forEach(el=>el.addEventListener("dragstart",e=>{
   dragInfo={id:el.dataset.id,mode:el.dataset.mode||"move"}; e.dataTransfer.effectAllowed="move"; e.stopPropagation();
 }));
 $$(".event",$("#calendarGrid")).forEach(el=>{
   el.addEventListener("click",e=>{
     if(Date.now()<suppressCalendarClickUntil){e.preventDefault();e.stopPropagation();return;}
     if(e.target.classList.contains("resize-handle")) return;
     window.matchMedia("(max-width: 900px)").matches?window.openCalendarAdjust(el.dataset.id):window.openOrderFromCalendar(el.dataset.id);
   });
   el.addEventListener("keydown",e=>{
     if(e.key==="Enter"||e.key===" "){
       e.preventDefault();
       window.matchMedia("(max-width: 900px)").matches?window.openCalendarAdjust(el.dataset.id):window.openOrderFromCalendar(el.dataset.id);
     }
   });
 });
 $$(".calendar-lock",$("#calendarGrid")).forEach(btn=>btn.addEventListener("click",e=>{e.stopPropagation();const day=btn.dataset.lockDate;const matches=roomLocks.filter(l=>day>=l.start&&day<=l.end);if(matches.length===1)return window.editRoomLock(matches[0].id);navigate("calendar");toast(matches.map(l=>`${roomName(l.room)}：${LOCK_TYPES[l.type]}`).join("、"));}));
 $$(".calendar-cell[data-date]",$("#calendarGrid")).forEach(cell=>{
   cell.setAttribute("role","button");
   cell.setAttribute("tabindex","0");
   const past=isPastDate(cell.dataset.date); cell.title=past?`補登 ${cell.dataset.date} 歷史訂單`:`新增 ${cell.dataset.date} 入住訂單`;
   cell.addEventListener("click",e=>{
     if(Date.now()<suppressCalendarClickUntil){e.preventDefault();return;}
     if(e.target.closest(".event,.calendar-housekeeping,.calendar-lock"))return;
     if(past)return window.openNewOrderFromCalendar(cell.dataset.date,"backfill"); window.openNewOrderFromCalendar(cell.dataset.date);
   });
   cell.addEventListener("keydown",e=>{
     if((e.key==="Enter"||e.key===" ")&&!e.target.closest(".event,.calendar-lock")){e.preventDefault();if(past)return window.openNewOrderFromCalendar(cell.dataset.date,"backfill");window.openNewOrderFromCalendar(cell.dataset.date);}
   });
   cell.addEventListener("dragover",e=>{if(past)return;e.preventDefault();cell.classList.add("drag-over")});
   cell.addEventListener("dragleave",()=>cell.classList.remove("drag-over"));
   cell.addEventListener("drop",e=>{e.preventDefault();e.stopPropagation();cell.classList.remove("drag-over");applyCalendarDrop(cell.dataset.date);});
 });
 installTouchCalendarDrag();
}
window.openCalendarAdjust=id=>{
 const o=orders.find(x=>x.id===id);if(!o)return;
 if(["已取消","No Show","已退房"].includes(lifecycleStatus(o)))return toast("此訂單狀態不可調整日期或房間");
 $("#calendarAdjustOrderId").value=o.id;$("#calendarAdjustOrderLabel").textContent=`${o.id}｜${o.name}`;
 $("#calendarAdjustCheckin").value=o.checkin;$("#calendarAdjustCheckout").value=o.checkout;
 $("#calendarAdjustCheckin").min=todayISO;$("#calendarAdjustCheckout").min=addDays(todayISO,1);
 $("#calendarAdjustRooms").innerHTML=roomMaster.map(r=>`<label class="check-item"><input type="checkbox" value="${r.id}" ${orderRooms(o).includes(r.id)?"checked":""}><span>${esc(r.name)}</span></label>`).join("");
 $("#calendarAdjustWarning").classList.add("hidden");$("#calendarAdjustDialog").showModal();
};
$("#calendarAdjustForm")?.addEventListener("submit",e=>{
 e.preventDefault();const id=$("#calendarAdjustOrderId").value,o=orders.find(x=>x.id===id);if(!o)return toast("找不到訂單");
 if(["已取消","No Show","已退房"].includes(lifecycleStatus(o)))return toast("此訂單狀態不可調整");
 const rooms=$$("#calendarAdjustRooms input:checked").map(x=>x.value);
 const next={...o,checkin:$("#calendarAdjustCheckin").value,checkout:$("#calendarAdjustCheckout").value,rooms};
 let error="";if(!next.checkin||!next.checkout)error="請完整選擇入住與退房日期";else if(next.checkout<=next.checkin)error="退房日期必須晚於入住日期";else if(!rooms.length)error="請至少選擇一個住宿單位";else error=validateBookingRules(next,o.id);
 const warning=$("#calendarAdjustWarning");if(error){warning.textContent=error;warning.classList.remove("hidden");return toast(error);}
 Object.assign(o,next);persist();$("#calendarAdjustDialog").close();renderAll();toast("日期與房間已更新");
});
function applyCalendarDrop(date){
 if(!dragInfo)return; if(isPastDate(date))return toast("過去日期不可拖曳建立一般房況"); const o=orders.find(x=>x.id===dragInfo.id); if(!o)return; const next={...o,rooms:[...o.rooms]};
 if(dragInfo.mode==="move"){const nights=daysBetween(o.checkin,o.checkout);next.checkin=date;next.checkout=addDays(date,nights);}
 if(dragInfo.mode==="start"){if(date>=o.checkout)return toast("入住日期必須早於退房日期");next.checkin=date;}
 if(dragInfo.mode==="end"){const checkout=addDays(date,1);if(checkout<=o.checkin)return toast("退房日期必須晚於入住日期");next.checkout=checkout;}
 const ruleError=validateBookingRules(next,o.id);if(ruleError)return toast(`拖曳失敗：${ruleError}`);
 Object.assign(o,next);persist();renderAll();toast("房況日期已更新");
}

function renderRoomLocks(){
 const box=$("#roomLockList");if(!box)return;
 box.innerHTML=roomLocks.slice().sort((a,b)=>a.start.localeCompare(b.start)).map(l=>`<div class="room-lock-item">
 <div><strong>${uiIcon(LOCK_ICONS[l.type]||"lock")}${LOCK_TYPES[l.type]}｜${esc(roomName(l.room))}</strong>
 <small>${l.start}～${l.end}${l.reason?`｜${esc(l.reason)}`:""}${l.operator?`｜操作：${esc(l.operator)}`:""}｜建立：${formatRecordTime(l.createdAt)}</small></div>
 <div class="room-lock-actions"><button onclick="window.editRoomLock('${l.id}')">${uiIcon("edit")}編輯</button><button onclick="window.deleteRoomLock('${l.id}')">${uiIcon("x")}解除</button></div>
 </div>`).join("")||'<div class="empty">目前沒有房號鎖定。</div>';
}
function openRoomLock(lock=null,start=todayISO,room=""){
 $("#roomLockForm").reset();
 $("#lockId").value=lock?.id||"";
 $("#roomLockDialogTitle").textContent=lock?"編輯房號鎖定":"新增房號鎖定";
 $("#lockSubmitLabel").textContent=lock?"儲存修改":"建立鎖定";
 $("#lockRoom").value=lock?.room||room||roomMaster[0].id;
 $("#lockType").value=lock?.type||"maintenance";
 $("#lockStart").value=lock?.start||start;
 $("#lockEnd").value=lock?.end||start;
 $("#lockReason").value=lock?.reason||"";
 $("#lockOperator").value=lock?.operator||"";
 $("#roomLockDialog").showModal();
}
window.editRoomLock=id=>{const lock=roomLocks.find(x=>x.id===id);if(lock)openRoomLock(lock);};
window.deleteRoomLock=id=>{
 const lock=roomLocks.find(x=>x.id===id);if(!lock)return;
 if(!confirm(`確定解除 ${roomName(lock.room)} ${lock.start}～${lock.end} 的房號鎖定？`))return;
 roomLocks=roomLocks.filter(x=>x.id!==id);
 const audit=Array.isArray(safeJSON("my6_room_lock_audit",[]))?safeJSON("my6_room_lock_audit",[]): [];
 audit.push({action:"解除",lockId:lock.id,room:lock.room,start:lock.start,end:lock.end,reason:lock.reason,operator:lock.operator,time:new Date().toISOString()});
 localStorage.setItem("my6_room_lock_audit",JSON.stringify(audit));
 persist();renderAll();toast("房號鎖定已解除");
};
$("#roomLockForm")?.addEventListener("submit",e=>{
 e.preventDefault();
 const id=$("#lockId").value;
 const current=id?roomLocks.find(x=>x.id===id):null;
 const lock={
   id:id||uid("L"),room:$("#lockRoom").value,type:$("#lockType").value,start:$("#lockStart").value,end:$("#lockEnd").value,
   reason:$("#lockReason").value.trim(),operator:$("#lockOperator").value.trim(),
   createdAt:current?.createdAt||new Date().toISOString(),updatedAt:current?new Date().toISOString():"",
   history:[...(current?.history||[])]
 };
 if(!lock.reason)return toast("請填寫鎖定原因");
 if(lock.end<lock.start)return toast("迄日不可早於起日");
 const overlap=roomLocks.some(x=>x.id!==lock.id&&x.room===lock.room&&lock.start<=x.end&&lock.end>=x.start);
 if(overlap)return toast("此房號在選定期間已有鎖定紀錄");
 const conflict=activeOrders().some(o=>orderRooms(o).includes(lock.room)&&o.checkin<=lock.end&&o.checkout>lock.start);
 if(conflict)return toast("鎖定期間已有訂單，請先調整訂單");
 const action=current?"修改":"建立";
 if(current){
   lock.history.push({action:"修改",before:{room:current.room,type:current.type,start:current.start,end:current.end,reason:current.reason,operator:current.operator},time:lock.updatedAt});
   roomLocks=roomLocks.map(x=>x.id===lock.id?lock:x);
 }else roomLocks.push(lock);
 const audit=Array.isArray(safeJSON("my6_room_lock_audit",[]))?safeJSON("my6_room_lock_audit",[]): [];
 audit.push({action,lockId:lock.id,room:lock.room,start:lock.start,end:lock.end,reason:lock.reason,operator:lock.operator,time:new Date().toISOString()});
 localStorage.setItem("my6_room_lock_audit",JSON.stringify(audit));
 persist();$("#roomLockDialog").close();renderAll();toast(`房號鎖定已${action}`);
});
function renderCheckin(){
 const list=activeOrders().filter(o=>o.checkout>=todayISO).sort((a,b)=>a.checkin.localeCompare(b.checkin));
 const items=["身分確認","訂金","尾款","入住須知","LINE","導航","WiFi","完成入住"];
 $("#checkinList").innerHTML=list.map(o=>`<article class="checkin-card"><div class="panel-head"><div><strong>${esc(o.name)}｜${o.checkin} 入住</strong><p class="section-note">${esc(o.package)}｜${o.count} 人｜${orderRooms(o).map(roomName).map(esc).join("、")}</p></div><button class="official-line-button" title="聯絡眉原六官方 LINE" onclick="window.copyLineMessage('${o.id}')">${uiIcon("message")}官方 LINE</button></div><div class="checklist">${items.map(x=>`<label class="check-item"><input type="checkbox" ${o.checklist?.[x]?"checked":""} onchange="window.toggleCheck('${o.id}','${x}',this.checked)"> ${x}</label>`).join("")}</div></article>`).join("")||'<div class="empty">目前沒有待入住訂單。</div>';
}
window.toggleCheck=(id,key,val)=>{const o=orders.find(x=>x.id===id);o.checklist=o.checklist||{};o.checklist[key]=val;if(key==="完成入住"&&val)o.status="已入住";persist();renderAll();};

function paymentStatus(summary,total){
 if(summary.over>0)return '<span class="badge red">異常帳款</span>';
 if(summary.net===0)return '<span class="badge gray">未收款</span>';
 if(summary.net>=Number(total||0))return '<span class="badge green">已結清</span>';
 return `<span class="badge gold">部分收款</span>`;
}
function paymentDetailRows(order){
 const summary=paymentSummary(order);
 const opening=summary.opening>0?`<tr><td>—</td><td>訂單預收訂金</td><td>訂單建立時帶入</td><td>${money(summary.opening)}</td><td><span class="badge green">已納入</span></td></tr>`:"";
 const records=summary.records.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).map(p=>{
   const detail=p.type==="加收費用" ? `${esc(p.category||"其他")}｜${esc(p.description||"未填說明")}` : esc(p.description||p.method);
   return `<tr><td>${esc(p.date)}</td><td>${esc(p.type)}</td><td>${detail}</td><td class="${p.amount<0?'amount-negative':(p.type==='加收費用'?'amount-charge':'')}">${p.amount<0?'-':''}${money(Math.abs(p.amount))}</td><td>${p.verified?'<span class="badge green">已核帳</span>':'<span class="badge gold">待核帳</span>'}</td></tr>`;
 }).join("");
 return opening+records||'<tr><td colspan="5">尚無收付款紀錄。</td></tr>';
}
function paymentRecordCards(order){
 const summary=paymentSummary(order);const items=[];if(summary.opening>0)items.push(`<div class="payment-record-card"><span>訂單預收訂金</span><strong>${money(summary.opening)}</strong><small>訂單建立時帶入・已納入</small></div>`);
 summary.records.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).forEach(p=>items.push(`<div class="payment-record-card"><span>${esc(p.date)}・${esc(p.type)}</span><strong class="${p.amount<0?'amount-negative':''}">${p.amount<0?'-':''}${money(Math.abs(p.amount))}</strong><small>${p.type==="加收費用"?`${esc(p.category||"其他")}｜${esc(p.description||"")}`:esc(p.method)}・${p.verified?"已核帳":"待核帳"}</small></div>`));return items.join("")||'<div class="empty">尚無收付款紀錄。</div>';
}
function renderPaymentMobileCards(){const box=$("#paymentMobileList");if(!box)return;box.innerHTML=orders.slice().sort((a,b)=>b.checkin.localeCompare(a.checkin)).map(o=>{const p=paymentSummary(o);return `<article class="payment-mobile-card"><div class="mobile-card-head"><div><strong>${esc(o.name)}</strong><span>${esc(o.id)}</span></div><span>${paymentStatus(p)}</span></div><div class="payment-mobile-summary"><div><span>原始訂單</span><strong>${money(o.total)}</strong></div><div><span>加收費用</span><strong>+${money(p.additionalCharges)}</strong></div><div><span>最新應收</span><strong>${money(p.adjustedTotal)}</strong></div><div><span>已收淨額</span><strong>${money(p.net)}</strong></div><div><span>已退款</span><strong>${money(p.refunds)}</strong></div><div><span>剩餘應收</span><strong>${money(p.remaining)}</strong></div></div><details><summary>查看帳務明細</summary><div class="payment-record-list">${paymentRecordCards(o)}</div></details><div class="mobile-card-actions"><button class="primary" onclick="window.openPaymentForOrder('${o.id}')">${uiIcon("wallet")}登記收款／退款</button></div></article>`}).join("")||'<div class="empty">尚無訂單。</div>';applyStaticIcons(box);}
window.openPaymentForOrder=id=>{navigate("payments");$("#paymentForm").reset();$("#paymentDate").value=todayISO;renderOrders();$("#paymentOrder").value=id;$("#paymentDescription").value="";updatePaymentDialogSummary();$("#paymentDialog").showModal();};
function renderPayments(){
 renderPaymentMobileCards();
 const rows=orders.slice().sort((a,b)=>b.checkin.localeCompare(a.checkin)).map(o=>{
   const p=paymentSummary(o);
   return `<tr class="payment-order-row"><td>${esc(o.id)}</td><td>${esc(o.name)}</td><td>${money(o.total)}</td><td>${money(p.additionalCharges)}</td><td>${money(p.adjustedTotal)}</td><td>${money(p.deposit)}</td><td>${money(p.net)}</td><td>${money(p.refunds)}</td><td>${money(p.remaining)}</td><td>${paymentStatus(p)}</td><td><button type="button" class="compact-button" data-icon="file-text" onclick="window.togglePaymentDetail('${o.id}')">明細</button></td></tr><tr id="payment-detail-${o.id}" class="payment-detail-row hidden"><td colspan="11"><div class="payment-detail-wrap"><div class="payment-summary-inline"><span>原始訂單<strong>${money(o.total)}</strong></span><span>加收費用<strong>+${money(p.additionalCharges)}</strong></span><span>最新應收<strong>${money(p.adjustedTotal)}</strong></span><span>預收訂金<strong>${money(p.deposit)}</strong></span><span>已收淨額<strong>${money(p.net)}</strong></span><span>已退款<strong>${money(p.refunds)}</strong></span><span>剩餘應收<strong>${money(p.remaining)}</strong></span></div><div class="table-wrap"><table class="payment-detail-table"><thead><tr><th>日期</th><th>類型</th><th>方式／說明</th><th>金額</th><th>核帳</th></tr></thead><tbody>${paymentDetailRows(o)}</tbody></table></div></div></td></tr>`;
 }).join("");
 $("#paymentTableBody").innerHTML=rows||'<tr><td colspan="11">尚無訂單。</td></tr>';
 applyStaticIcons($("#payments"));
}
window.togglePaymentDetail=id=>{const row=document.getElementById(`payment-detail-${id}`);if(row)row.classList.toggle("hidden");};
function updatePaymentTypeFields(){
 const isCharge=$("#paymentType").value==="加收費用";
 const fields=$("#additionalChargeFields");
 if(fields)fields.classList.toggle("hidden",!isCharge);
 $("#paymentCategory").required=isCharge;
 $("#paymentDescription").required=isCharge;
 $("#paymentMethod").disabled=isCharge;
 if(isCharge)$("#paymentMethod").value="其他";
}
function updatePaymentDialogSummary(){
 const order=orders.find(o=>o.id===$("#paymentOrder").value);
 const box=$("#paymentDialogSummary");
 if(!order||!box)return;
 const p=paymentSummary(order);
 box.innerHTML=`<span>原始訂單<strong>${money(order.total)}</strong></span><span>加收費用<strong>+${money(p.additionalCharges)}</strong></span><span>最新應收<strong>${money(p.adjustedTotal)}</strong></span><span>預收訂金<strong>${money(p.deposit)}</strong></span><span>已收淨額<strong>${money(p.net)}</strong></span><span>剩餘應收<strong>${money(p.remaining)}</strong></span><span>可退款上限<strong>${money(p.net)}</strong></span>`;
 updatePaymentTypeFields();
}
$("#paymentOrder").addEventListener("change",updatePaymentDialogSummary);
$("#paymentType").addEventListener("change",updatePaymentDialogSummary);
$("#paymentForm").addEventListener("submit",e=>{
 e.preventDefault();
 const id=$("#paymentOrder").value,order=orders.find(x=>x.id===id);
 const raw=Math.abs(moneyNumber($("#paymentAmount").value));
 const type=$("#paymentType").value,method=$("#paymentMethod").value,date=$("#paymentDate").value;
 const category=$("#paymentCategory").value.trim();
 const description=$("#paymentDescription").value.trim();
 if(!order)return toast("找不到指定訂單");
 if(raw<=0)return toast(type==="加收費用"?"加收金額必須大於 0":"收款金額必須大於 0");
 const summary=paymentSummary(order);
 if(type==="加收費用"){
   if(!category)return toast("請選擇加收費用分類");
   if(description.length<2)return toast("請填寫至少 2 個字的加收費用說明");
 }else if(type!=="退款" && raw>summary.remaining){
   return toast(`本次收款超過剩餘應收，最多可收 ${money(summary.remaining)}`);
 }
 if(type==="退款" && raw>summary.net)return toast(`退款超過目前已收淨額，最多可退 ${money(summary.net)}`);
 const duplicate=payments.some(p=>p.orderId===id&&p.date===date&&p.type===type&&Math.abs(p.amount)===raw&&(type==="加收費用" ? p.category===category&&p.description===description : p.method===method));
 if(duplicate)return toast(type==="加收費用"?"偵測到相同加收費用，已阻止重複建立":"偵測到相同收付款紀錄，已阻止重複入帳");
 const amount=type==="退款"?-raw:raw;
 payments.push(normalizePayment({id:uid("P"),date,orderId:id,type,method:type==="加收費用"?"—":method,amount,category,description,verified:$("#paymentVerified").value==="true",createdAt:new Date().toISOString(),operator:"管理員"}));
 syncOrderPaid(order);
 const updated=paymentSummary(order);
 if(type==="加收費用"&&updated.remaining>0&&order.status==="已付全額"&&!['已入住','已退房','已取消','No Show'].includes(lifecycleStatus(order)))order.status=updated.net>0?"已付訂金":"已確認";
 else if(type!=="加收費用"&&type!=="退款"&&updated.remaining===0&&!['已入住','已退房','已取消','No Show'].includes(lifecycleStatus(order)))order.status="已付全額";
 else if(type==="訂金"&&!['已入住','已退房','已取消','No Show'].includes(lifecycleStatus(order)))order.status="已付訂金";
 persist();$("#paymentDialog").close();renderAll();toast(type==="加收費用"?"加收費用已建立":(type==="退款"?"退款已登記":"收款已登記"));
});

function roomOperationalStatus(room){
 const active=orders.some(o=>o.status==="已入住"&&orderRooms(o).includes(room));
 if(active)return "入住中";
 const roomTasks=tasks.filter(t=>t.room===room&&t.status!=="已完成").sort((a,b)=>b.date.localeCompare(a.date));
 if(roomTasks.some(t=>t.status==="清掃中"))return "清掃中";
 if(roomTasks.some(t=>t.status==="待清掃"))return "待清掃";
 return "可入住";
}
function formatRecordTime(value){
 if(!value)return "—";
 const d=new Date(value);
 return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("zh-TW",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false});
}
function linkedHousekeepingTasks(){
 return tasks.filter(t=>t.orderId && orders.some(o=>o.id===t.orderId));
}
function renderTasks(){
 const linked=linkedHousekeepingTasks();
 const statuses=roomMaster.map(r=>({room:r,status:roomOperationalStatus(r.id)}));
 const count=status=>statuses.filter(x=>x.status===status).length;
 $("#hkOccupied").textContent=count("入住中"); $("#hkPending").textContent=count("待清掃");
 $("#hkCleaning").textContent=count("清掃中"); $("#hkReady").textContent=count("可入住");
 $("#roomStatusGrid").innerHTML=statuses.map(x=>`<article class="room-status-card status-${x.status}"><strong>${esc(x.room.name)}</strong><span>${x.status}</span></article>`).join("");
 const groups=[["待清掃",["待清掃"]],["清掃中",["清掃中"]],["已完成",["已完成"]]];
 $("#taskBoard").innerHTML=groups.map(([g,sts])=>`<div class="task-column"><h4>${g}</h4>${linked.filter(t=>sts.includes(t.status)).sort((a,b)=>(b.checkoutAt||b.date).localeCompare(a.checkoutAt||a.date)).map(t=>{
   const o=orders.find(x=>x.id===t.orderId);
   const checkoutTime=t.scheduledCheckout||o?.lateCheckout||settings.checkoutTime||"11:00";
   const action=t.status==="待清掃"?`<button class="primary" onclick="window.advanceTask('${t.id}')">${uiIcon("play")}開始清掃</button>`:t.status==="清掃中"?`<button class="primary" onclick="window.advanceTask('${t.id}')">${uiIcon("check")}完成清掃</button>`:"";
   return `<article class="task-card housekeeping-record"><div class="task-card-head"><div><strong>${esc(roomName(t.room))}</strong><span class="task-order-id">${esc(t.orderId)}</span></div><span class="badge ${t.status==="已完成"?"green":t.status==="待清掃"?"gold":"gray"}">${esc(t.status)}</span></div><div class="housekeeping-guest">${esc(t.guest||o?.name||"未命名旅客")}</div><div class="housekeeping-meta"><span>退房：${esc(t.date)} ${esc(checkoutTime)}</span><span>房務：${esc(t.assignee||"尚未指派")}</span><span>開始：${formatRecordTime(t.startedAt)}</span><span>完成：${formatRecordTime(t.completedAt)}</span></div>${t.note?`<div class="task-note">${esc(t.note)}</div>`:""}<div class="task-actions">${action}<button onclick="window.editTask('${t.id}')">${uiIcon("edit")}編輯紀錄</button></div></article>`;
 }).join("")||"<small>目前沒有由退房產生的房務工作</small>"}</div>`).join("");
}
window.advanceTask=id=>{
 const t=tasks.find(x=>x.id===id); if(!t||!t.orderId)return;
 if(t.status==="待清掃"){
   t.status="清掃中"; const linkedOrder=orders.find(o=>o.id===t.orderId); if(linkedOrder)linkedOrder.workflowStatus="清掃中";
   if(!t.startedAt)t.startedAt=new Date().toISOString();
   persist();renderAll();toast("已開始清掃");return;
 }
 if(t.status==="清掃中"){
   if(!confirm(`確認 ${roomName(t.room)} 已完成清掃並可入住？`))return;
   t.status="已完成"; const linkedOrder=orders.find(o=>o.id===t.orderId); if(linkedOrder)linkedOrder.workflowStatus="完成清掃";
   t.completedAt=new Date().toISOString();
   persist();renderAll();toast("清掃完成，房間已恢復可入住");
 }
};
window.editTask=id=>{
 const t=tasks.find(x=>x.id===id); if(!t||!t.orderId)return;
 const o=orders.find(x=>x.id===t.orderId);
 $("#taskForm").dataset.editId=id;
 $("#taskDate").value=t.date;
 $("#taskRoomLabel").value=roomName(t.room);
 $("#taskGuest").value=t.guest||o?.name||"";
 $("#taskCheckout").value=t.scheduledCheckout||o?.lateCheckout||settings.checkoutTime||"11:00";
 $("#taskStatus").value=t.status;
 $("#taskAssignee").value=t.assignee||"";
 $("#taskStarted").value=formatRecordTime(t.startedAt);
 $("#taskCompleted").value=formatRecordTime(t.completedAt);
 $("#taskNote").value=t.note||"";
 $("#taskDialog").showModal();
};
$("#taskForm").addEventListener("submit",e=>{
 e.preventDefault();
 const editId=e.currentTarget.dataset.editId;
 const t=tasks.find(x=>x.id===editId);
 if(!t||!t.orderId)return;
 const previous=t.status;
 t.status=$("#taskStatus").value;
 t.assignee=$("#taskAssignee").value.trim();
 t.note=$("#taskNote").value.trim();
 if(t.status==="清掃中"&&!t.startedAt)t.startedAt=new Date().toISOString();
 if(t.status==="已完成"&&!t.completedAt)t.completedAt=new Date().toISOString();
 if(t.status==="待清掃"){t.startedAt="";t.completedAt="";}
 if(previous==="已完成"&&t.status!=="已完成")t.completedAt="";
 delete e.currentTarget.dataset.editId;
 persist();$("#taskDialog").close();renderAll();toast("房務紀錄已更新");
});

function buildGuestMap(){
 const map={};orders.filter(o=>o&&!NON_OCCUPYING_STATES.has(lifecycleStatus(o))).forEach(o=>{const phone=String(o.phone||"").trim();if(!phone)return;if(!map[phone])map[phone]={name:o.name,phone,count:0,total:0,last:"",note:""};const g=map[phone];g.count++;g.total+=paymentSummary(o).adjustedTotal;g.last=g.last>o.checkin?g.last:o.checkin;if(o.note)g.note=o.note;});
 Object.keys(map).forEach(p=>Object.assign(map[p],guestProfiles[p]||{}));return map;
}
function guestSearchText(g){
 return [g.name,g.phone,g.line,g.email,g.plate,g.pet,g.note,g.last].map(v=>String(v||"").toLocaleLowerCase("zh-TW")).join(" ");
}
function renderGuests(){
 const allGuests=Object.values(buildGuestMap()).sort((a,b)=>String(b.last||"").localeCompare(String(a.last||""),"zh-TW")||String(a.name||"").localeCompare(String(b.name||""),"zh-TW"));
 const query=String($("#guestSearch")?.value||"").trim().toLocaleLowerCase("zh-TW");
 const guests=query?allGuests.filter(g=>guestSearchText(g).includes(query)):allGuests;
 const count=$("#guestResultCount");
 if(count)count.textContent=query?`找到 ${guests.length}／${allGuests.length} 筆`:`共 ${allGuests.length} 筆`;
 $("#guestTableBody").innerHTML=guests.map(g=>`<tr><td><strong>${esc(g.name)}</strong>${g.line?`<span class="guest-detail">LINE：${esc(g.line)}</span>`:""}</td><td>${esc(g.phone)}${g.email?`<span class="guest-detail">${esc(g.email)}</span>`:""}</td><td>${g.count}</td><td>${money(g.total)}</td><td>${esc(g.last||"-")}</td><td>${esc(g.note||"-")}${g.plate?`<span class="guest-detail">車牌：${esc(g.plate)}</span>`:""}</td><td><button class="guest-edit-btn" onclick="window.editGuest('${esc(g.phone)}')">${uiIcon("edit")}編輯旅客</button></td></tr>`).join("")||`<tr><td colspan="7">${query?"找不到符合條件的旅客資料。":"尚無旅客資料。"}</td></tr>`;
 const mobile=$("#guestMobileList");
 if(mobile)mobile.innerHTML=guests.map((g,index)=>`<details class="guest-mobile-card"${query&&guests.length===1?" open":""}><summary class="guest-mobile-summary"><span class="guest-mobile-identity"><strong>${esc(g.name)}</strong><span>${esc(g.phone)}</span></span><span class="guest-mobile-summary-meta"><span>${esc(g.last||"尚無日期")}</span><span class="guest-expand-label" aria-hidden="true">展開</span></span></summary><div class="guest-mobile-body"><dl><div><dt>LINE</dt><dd>${esc(g.line||"-")}</dd></div><div><dt>E-mail</dt><dd>${esc(g.email||"-")}</dd></div><div><dt>入住次數</dt><dd>${g.count}</dd></div><div><dt>累計消費</dt><dd>${money(g.total)}</dd></div><div><dt>最近入住</dt><dd>${esc(g.last||"-")}</dd></div><div><dt>車牌</dt><dd>${esc(g.plate||"-")}</dd></div><div><dt>寵物資料</dt><dd>${esc(g.pet||"-")}</dd></div><div class="wide"><dt>備註</dt><dd>${esc(g.note||"-")}</dd></div></dl><button class="guest-edit-btn guest-mobile-edit" onclick="window.editGuest('${esc(g.phone)}')">${uiIcon("edit")}編輯旅客</button></div></details>`).join("")||`<div class="empty">${query?"找不到符合條件的旅客資料。":"尚無旅客資料。"}</div>`;
}
window.editGuest=phone=>{const g=buildGuestMap()[phone];$("#guestOriginalPhone").value=phone;$("#profileName").value=g.name||"";$("#profilePhone").value=g.phone||"";$("#profileLine").value=g.line||"";$("#profileEmail").value=g.email||"";$("#profilePlate").value=g.plate||"";$("#profilePet").value=g.pet||"";$("#profileNote").value=g.note||"";$("#guestDialog").showModal();};
$("#guestForm").addEventListener("submit",e=>{e.preventDefault();const old=$("#guestOriginalPhone").value,phone=$("#profilePhone").value.trim(),p={name:$("#profileName").value.trim(),phone,line:$("#profileLine").value.trim(),email:$("#profileEmail").value.trim(),plate:$("#profilePlate").value.trim(),pet:$("#profilePet").value.trim(),note:$("#profileNote").value.trim()};orders.forEach(o=>{if(o.phone===old){o.phone=phone;o.name=p.name;}});delete guestProfiles[old];guestProfiles[phone]=p;persist();$("#guestDialog").close();renderAll();toast("旅客資料已更新");});

function selectTemplate(name){
 if(!templates[name])return;
 selectedTemplate=name;
 $("#templateTitle").textContent=name;
 $("#templateContent").value=templates[name];
 $$(".template-item").forEach(el=>el.classList.toggle("active",el.dataset.template===name));
}
function renderTemplates(){
 const names=Object.keys(templates);
 if(!names.length){templates={"新模板":"請輸入模板內容。"};selectedTemplate="新模板";persist();}
 if(!templates[selectedTemplate])selectedTemplate=Object.keys(templates)[0];
 $("#templateList").innerHTML=Object.keys(templates).map(k=>`<div class="template-item ${k===selectedTemplate?"active":""}" data-template="${esc(k)}"><span>${esc(k)}</span><div class="template-item-actions"><button type="button" class="template-rename-btn" aria-label="修改 ${esc(k)} 標題">${uiIcon("edit")}改標題</button></div></div>`).join("");
 $$(".template-item").forEach(el=>{
   el.onclick=e=>{if(e.target.closest("button"))return;selectTemplate(el.dataset.template);};
   el.querySelector(".template-rename-btn").onclick=e=>{e.stopPropagation();renameTemplate(el.dataset.template);};
 });
 selectTemplate(selectedTemplate);
}
function renameTemplate(oldName){
 if(!templates[oldName])return;
 const raw=prompt("請輸入新的模板標題：",oldName);
 const newName=String(raw||"").trim();
 if(!newName||newName===oldName)return;
 if(templates[newName])return toast("已有相同標題的模板");
 const rebuilt={};Object.keys(templates).forEach(name=>{rebuilt[name===oldName?newName:name]=templates[name];});
 templates=rebuilt;if(selectedTemplate===oldName)selectedTemplate=newName;persist();renderTemplates();toast("模板標題已更新");
}
function addTemplate(){
 const raw=prompt("請輸入新模板名稱：", "新模板");
 const name=String(raw||"").trim();
 if(!name)return;
 if(templates[name])return toast("模板名稱已存在");
 templates[name]="請輸入模板內容。";selectedTemplate=name;persist();renderTemplates();toast("模板已新增");
}
function saveCurrentTemplate(){
 if(!selectedTemplate||!templates[selectedTemplate])return toast("請先選擇模板");
 templates[selectedTemplate]=$("#templateContent").value;persist();renderTemplates();toast("模板已儲存");
}
function deleteCurrentTemplate(){
 if(!selectedTemplate||!templates[selectedTemplate])return;
 if(Object.keys(templates).length<=1)return toast("至少需保留一個模板");
 if(!confirm(`確定刪除模板「${selectedTemplate}」？`))return;
 delete templates[selectedTemplate];selectedTemplate=Object.keys(templates)[0];persist();renderTemplates();toast("模板已刪除");
}

function renderReports(){
 const month=todayISO.slice(0,7),list=activeOrders().filter(o=>o.checkin.startsWith(month));$("#reportOrders").textContent=list.length;$("#reportNights").textContent=list.reduce((s,o)=>s+daysBetween(o.checkin,o.checkout),0);$("#reportAvg").textContent=money(list.length?list.reduce((s,o)=>s+o.total,0)/list.length:0);
 const counts={};activeOrders().forEach(o=>counts[o.phone]=(counts[o.phone]||0)+1);const vals=Object.values(counts);$("#reportRepeat").textContent=(vals.length?Math.round(vals.filter(v=>v>1).length/vals.length*100):0)+"%";
 const src={};activeOrders().forEach(o=>src[o.source]=(src[o.source]||0)+1);const max=Math.max(1,...Object.values(src));$("#sourceBars").innerHTML=Object.entries(src).map(([k,v])=>`<div class="bar-row"><span>${esc(k)}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><strong>${v}</strong></div>`).join("")||'<div class="empty">尚無資料。</div>';
}
function renderSettings(){
 const map={settingPropertyName:"propertyName",settingLineUrl:"lineUrl",settingFullCapacity:"fullCapacity",settingSmallCapacity:"smallCapacity",settingCheckinTime:"checkinTime",settingCheckoutTime:"checkoutTime",settingHourlyFee:"hourlyFee",settingPetFee:"petFee",registrationDate:"registrationDate",registrationDocNo:"registrationDocNo",registrationLicense:"registrationLicense",insuranceCompany:"insuranceCompany",insurancePolicy:"insurancePolicy",insuranceStart:"insuranceStart",insuranceEnd:"insuranceEnd"};
 Object.entries(map).forEach(([id,key])=>{const el=$("#"+id);if(el)el.value=settings[key]??"";});
 $("#shortcutEditor").innerHTML=shortcuts.map((s,i)=>`<div class="shortcut-edit-row" data-index="${i}"><label>圖示<input class="icon-input" value="${esc(s.icon)}"></label><label>名稱<input class="name-input" value="${esc(s.name)}"></label><label class="url">網址<input class="url-input" value="${esc(s.url)}"></label><button class="danger" type="button" onclick="window.removeShortcut(${i})">${uiIcon("trash")}刪除</button></div>`).join("");
}
function saveSettingsFields(){
 Object.assign(settings,{propertyName:$("#settingPropertyName").value.trim(),lineUrl:$("#settingLineUrl").value.trim(),fullCapacity:$("#settingFullCapacity").value.trim(),smallCapacity:$("#settingSmallCapacity").value.trim(),checkinTime:$("#settingCheckinTime").value,checkoutTime:$("#settingCheckoutTime").value,hourlyFee:+$("#settingHourlyFee").value,petFee:+$("#settingPetFee").value});persist();renderAll();toast("基本設定已儲存");
}
function saveRegistration(){
 Object.assign(settings,{registrationDate:$("#registrationDate").value.trim(),registrationDocNo:$("#registrationDocNo").value.trim(),registrationLicense:$("#registrationLicense").value.trim(),insuranceCompany:$("#insuranceCompany").value.trim(),insurancePolicy:$("#insurancePolicy").value.trim(),insuranceStart:$("#insuranceStart").value,insuranceEnd:$("#insuranceEnd").value});persist();renderAll();toast("登記與保險資料已儲存");
}
window.removeShortcut=i=>{shortcuts.splice(i,1);renderSettings();};
function collectShortcuts(){shortcuts=$$(".shortcut-edit-row").map(r=>({icon:$(".icon-input",r).value.trim()||"🔗",name:$(".name-input",r).value.trim()||"未命名",url:$(".url-input",r).value.trim()||"#"}));persist();renderAll();toast("快捷中心已儲存");}

function exportBackup(){
 const data={version:"Enterprise V1.2 Build 2A RC4 Hotfix 1",schema:STORAGE_SCHEMA_VERSION,exportedAt:new Date().toISOString(),orders,payments,tasks,roomLocks,guestProfiles,settings,shortcuts,templates};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`Meiyuan6_PMS_Backup_${todayISO}.json`;a.click();URL.revokeObjectURL(a.href);
}
async function importBackup(file){
 try{const data=JSON.parse(await file.text());orders=(Array.isArray(data.orders)?data.orders:[]).map(normalizeOrder);payments=(Array.isArray(data.payments)?data.payments:[]).map(normalizePayment);tasks=(Array.isArray(data.tasks)?data.tasks:[]).map(normalizeTask).filter(t=>t.orderId);guestProfiles=data.guestProfiles||{};settings={...defaultSettings,...(data.settings||{})};shortcuts=data.shortcuts||defaultShortcuts;templates=(data.templates && typeof data.templates==="object" && Object.keys(data.templates).length) ? data.templates : {...defaultTemplates};roomLocks=Array.isArray(data.roomLocks)?data.roomLocks:[];selectedTemplate=Object.keys(templates)[0]||"";persist();renderAll();toast("備份已匯入");}catch{toast("備份檔格式錯誤");}
}

function init(){
 applyStaticIcons();
 $("#todayText").textContent=new Date().toLocaleDateString("zh-TW",{year:"numeric",month:"long",day:"numeric",weekday:"long"});
 $("#roomCheckboxes").innerHTML=roomMaster.map(r=>`<label class="checkbox-item"><input type="checkbox" name="roomChoice" value="${r.id}"><span>${esc(r.name)}（${r.capacity} 人）</span></label>`).join("");
 $("#lockRoom").innerHTML=roomMaster.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join("");
 $("#paymentDate").value=todayISO;
 $("#loginForm").onsubmit=e=>{e.preventDefault();if($("#loginUser").value==="admin"&&$("#loginPass").value==="123456"){$("#loginView").classList.add("hidden");$("#appView").classList.remove("hidden");renderAll();}else toast("帳號或密碼錯誤");};
 $("#logoutBtn").onclick=()=>location.reload();
 $$("#nav button").forEach(b=>b.onclick=()=>navigate(b.dataset.page));$$("[data-page-jump]").forEach(b=>b.onclick=()=>navigate(b.dataset.pageJump));
 $("#quickAddOrder").onclick=$("#addOrderBtn").onclick=()=>openOrder();
$("#addRoomLockBtn")?.addEventListener("click",()=>openRoomLock());$("#packageType").onchange=handlePackageChange;
 $("#orderSearch").oninput=renderOrders;$("#statusFilter").onchange=renderOrders;
 $("#guestSearch")?.addEventListener("input",renderGuests);
 $("#clearGuestSearch")?.addEventListener("click",()=>{const input=$("#guestSearch");if(input){input.value="";input.focus();}renderGuests();});
 $("#addPaymentBtn").onclick=()=>{$("#paymentForm").reset();$("#paymentDate").value=todayISO;$("#paymentDescription").value="";renderOrders();updatePaymentDialogSummary();$("#paymentDialog").showModal();};
 $$("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).close());
 $("#prevMonth").onclick=()=>{calDate.setMonth(calDate.getMonth()-1);renderCalendar();};$("#nextMonth").onclick=()=>{calDate.setMonth(calDate.getMonth()+1);renderCalendar();};$("#calendarToday").onclick=()=>{calDate=new Date();renderCalendar();};
 $("#addTemplateBtn").onclick=addTemplate;
 $("#saveTemplateBtn").onclick=saveCurrentTemplate;
 $("#deleteTemplateBtn").onclick=deleteCurrentTemplate;
 $("#copyTemplateBtn").onclick=async()=>{try{await navigator.clipboard.writeText($("#templateContent").value);toast("模板已複製");}catch{prompt("請複製",$("#templateContent").value);}};
 $("#copyWifiBtn").onclick=async()=>{const t="眉原六民宿 Wi-Fi\nSSID：deco_be25_Guest\n密碼：liou6868";try{await navigator.clipboard.writeText(t);toast("Wi-Fi 資料已複製");}catch{prompt("請複製",t);}};
 $("#openSettingsBtn").onclick=()=>navigate("settings");
 $$(".settings-tabs button").forEach(b=>b.onclick=()=>{$$(".settings-tabs button").forEach(x=>x.classList.toggle("active",x===b));$$(".settings-pane").forEach(p=>p.classList.toggle("active",p.dataset.pane===b.dataset.settingsTab));});
 $("#saveSettings").onclick=saveSettingsFields;$("#resetSettings").onclick=()=>{settings={...defaultSettings};persist();renderAll();toast("已恢復預設設定");};$("#saveRegistration").onclick=saveRegistration;
 $("#addShortcut").onclick=()=>{shortcuts.push({icon:"🔗",name:"新快捷",url:"https://"});renderSettings();};$("#saveShortcuts").onclick=collectShortcuts;
 $("#openOfficialLine").onclick=openOfficialLine;
 $("#exportData").onclick=exportBackup;$("#importData").onchange=e=>e.target.files[0]&&importBackup(e.target.files[0]);
 $("#resetDemoData").onclick=()=>{if(confirm("確定重設全部資料？")){orders=structuredClone(seedOrders).map(normalizeOrder);payments=[];tasks=structuredClone(seedTasks).map(normalizeTask);guestProfiles={};settings={...defaultSettings};shortcuts=structuredClone(defaultShortcuts);templates={...defaultTemplates};roomLocks=[];selectedTemplate=Object.keys(templates)[0];persist();renderAll();toast("已重設為示範資料");}};
 renderAll();
}
document.addEventListener("DOMContentLoaded",init);
})();