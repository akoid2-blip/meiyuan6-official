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
const WORKFLOW_STATES=["建立","已確認","入住","退房","待清掃","清掃中","待檢查","完成清掃","可入住"];
const LIFECYCLE_STATES=["詢問中","待確認","已確認","已入住","已退房","已取消","No Show"];
const LIFECYCLE_NEXT={"詢問中":["待確認","已確認","已取消"],"待確認":["已確認","已取消"],"已確認":["已入住","已取消","No Show"],"已入住":["已退房"],"已退房":[],"已取消":[],"No Show":[]};
const NON_OCCUPYING_STATES=new Set(["已取消","No Show"]);
const WORKFLOW_NEXT={"建立":"已確認","已確認":"入住","入住":"退房","退房":"待清掃","待清掃":"清掃中","清掃中":"待檢查","待檢查":"完成清掃","完成清掃":"可入住"};
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
 "早餐通知":`您好，{{旅客姓名}}：

您的早餐代訂資料如下：
訂單編號：{{訂單編號}}
住宿單位：{{住宿單位}}
入住日期：{{入住日期}}
退房日期：{{退房日期}}
早餐日期：{{早餐日期}}
早餐店：{{早餐店}}
早餐份數：{{早餐份數}}
送餐天數：{{送餐天數}} 天
每日送達時間：{{送達時間}}
聯絡電話：{{聯絡電話}}

如需調整，請提前與管家聯繫。`,
 "叫車通知":`您好，{{旅客姓名}}：

您的叫車預約資料如下：
訂單編號：{{訂單編號}}
住宿單位：{{住宿單位}}
叫車日期：{{叫車日期}}
叫車時間：{{叫車時間}}
上車地點：{{上車地點}}
目的地：{{目的地}}
乘車人數：{{乘車人數}}
車型：{{車型}}
預估車資：{{預估車資}}
聯絡電話：{{聯絡電話}}
備註：{{備註}}

如需調整，請提前與管家聯繫。`,
 "寵物入住須知":`寵物入住清潔費為 NT$500／隻，最多 4 隻。請自備糧食及尿布，寵物不得上沙發及床鋪；大型犬請使用牽繩或籠具。`,
 "全館包棟":`全館包棟適用 16～27 人，系統將自動鎖定全部住宿單位。`,
 "小包棟":`小包棟適用 8～15 人，住宿單位依訂單勾選內容為準。`
};

const TEMPLATE_VARIABLE_GROUPS={
 "旅客與訂單":["旅客姓名","聯絡電話","訂單編號","住宿單位","入住日期","退房日期","備註"],
 "早餐通知":["早餐日期","早餐店","早餐份數","送餐天數","送達時間"],
 "叫車通知":["叫車日期","叫車時間","上車地點","目的地","乘車人數","車型","預估車資"]
};
const TEMPLATE_COMMON_VARIABLES={
 "旅客與訂單":["旅客姓名","聯絡電話","訂單編號","住宿單位","入住日期","退房日期"],
 "早餐通知":["旅客姓名","早餐日期","早餐店","早餐份數","送餐天數","送達時間"],
 "叫車通知":["旅客姓名","叫車日期","叫車時間","上車地點","目的地","乘車人數","聯絡電話"]
};
const TEMPLATE_MISSING_VALUE="（尚未提供）";

const defaultSettings={
 propertyName:"眉原六民宿", lineUrl:"https://lin.ee/933tuhU", fullCapacity:"16～27 人", smallCapacity:"8～15 人",
 checkinTime:"15:00", checkoutTime:"11:00", hourlyFee:1500, petFee:500,
 registrationDate:"中華民國115年3月25日", registrationDocNo:"府官產自第1150061145號",
 registrationLicense:"南投縣民宿1311", insuranceCompany:"新光產物保險", insurancePolicy:"131915AHP0000257",
 insuranceStart:"2026-03-11T12:00", insuranceEnd:"2027-03-11T12:00",
 notificationLargeRefundThreshold:10000, notificationHousekeepingOverdueMinutes:120, notificationBreakfastReminderMinutes:30, notificationTaxiReminderMinutes:60, notificationRetentionDays:60, notificationAutoClearDays:90
};
const defaultShortcuts=[
 {icon:"🏛️",name:"觀光署旅宿網",url:"https://www.taiwanstay.net.tw/TSA/web_page/TSA010100.jsp"},
 {icon:"💬",name:"眉原六官方 LINE",url:"https://lin.ee/933tuhU"},
 {icon:"📍",name:"Google 地圖",url:"https://www.google.com/maps/search/?api=1&query=眉原六民宿"},
 {icon:"✉️",name:"Gmail",url:"https://mail.google.com/"},
 {icon:"🌐",name:"眉原六官網",url:"https://meiyuan6.tw/"}
];
const seedOrders=[
 {id:"MY6-260801",name:"陳小姐",phone:"0912-345-678",checkin:addDays(todayISO,1),checkout:addDays(todayISO,3),package:"小包棟（8～15人）",rooms:["R1","R2","R4"],count:10,source:"官方 LINE",status:"已付訂金",total:28000,paid:10000,note:"預計 16:00 抵達",breakfast:{date:addDays(todayISO,2),shop:"在地早餐店",qty:10,days:2,fee:0,delivery:"08:00",done:false},taxi:{date:"",time:"",pickup:"",destination:"",guests:0,type:"",fare:0,done:false},earlyCheckin:"",lateCheckout:"",luggageStorage:true,checklist:{}},
 {id:"MY6-260802",name:"林先生",phone:"0988-123-456",checkin:addDays(todayISO,4),checkout:addDays(todayISO,5),package:"一般訂房",rooms:["R3","R6"],count:7,source:"電話",status:"已確認",total:12000,paid:0,note:"有長輩同行",breakfast:{date:"",shop:"",qty:0,days:0,fee:0,delivery:"",done:false},taxi:{date:addDays(todayISO,5),time:"11:30",pickup:"眉原六民宿",destination:"埔里轉運站",guests:4,type:"一般計程車",fare:400,done:false},earlyCheckin:"",lateCheckout:"12:00",luggageStorage:false,checklist:{}}
];
const seedTasks=[];

const STORAGE_SCHEMA_VERSION = 12;
const SERVICE_TYPES=["早餐代訂","接送／叫車","提前入住","延後退房","加床","寵物住宿","寄放行李","特殊需求"];
const SERVICE_STATUSES=["待安排","已完成"];
const SERVICE_PAYMENT_STATUSES=["未收款","部分收款","已收款","免費"];
function normalizeService(raw,index=0){
 return {id:String(raw?.id||`S-${Date.now().toString(36)}-${index}`),type:SERVICE_TYPES.includes(String(raw?.type))?String(raw.type):"特殊需求",status:SERVICE_STATUSES.includes(String(raw?.status))?String(raw.status):"待安排",fee:Math.max(0,Number(raw?.fee||0)||0),paymentStatus:SERVICE_PAYMENT_STATUSES.includes(String(raw?.paymentStatus))?String(raw.paymentStatus):((Number(raw?.fee||0)||0)>0?"未收款":"免費"),date:validISO(raw?.date,""),time:String(raw?.time||""),note:String(raw?.note||""),details:(raw?.details&&typeof raw.details==="object"?{...raw.details}:{}),createdAt:String(raw?.createdAt||new Date().toISOString()),updatedAt:String(raw?.updatedAt||"")};
}
function legacyServices(raw){
 const list=[];
 if(raw?.breakfast && Number(raw.breakfast.qty)>0)list.push(normalizeService({id:"legacy-breakfast",type:"早餐代訂",status:raw.breakfast.done?"已完成":"待安排",fee:Math.max(0,Number(raw.breakfast.fee||0)||0),paymentStatus:Math.max(0,Number(raw.breakfast.fee||0)||0)>0?"未收款":"免費",date:raw.breakfast.date,time:raw.breakfast.delivery,note:"",details:{shop:String(raw.breakfast.shop||""),qty:Math.max(1,Number(raw.breakfast.qty)||1),days:Math.max(1,Number(raw.breakfast.days)||1)}},0));
 if(raw?.taxi && raw.taxi.date)list.push(normalizeService({id:"legacy-taxi",type:"接送／叫車",status:raw.taxi.done?"已完成":"待安排",fee:Number(raw.taxi.fare||0),paymentStatus:Number(raw.taxi.fare||0)>0?"未收款":"免費",date:raw.taxi.date,time:raw.taxi.time,note:"",details:{direction:raw.taxi.date===raw.checkin?"checkin":raw.taxi.date===raw.checkout?"checkout":"custom",vehicleType:String(raw.taxi.type||""),guests:Math.max(1,Number(raw.taxi.guests)||1),pickup:String(raw.taxi.pickup||""),destination:String(raw.taxi.destination||"")}},1));
 if(raw?.earlyCheckin)list.push(normalizeService({id:"legacy-early",type:"提前入住",status:"待安排",fee:0,paymentStatus:"免費",date:raw.checkin,time:raw.earlyCheckin,note:"由舊版訂單資料轉入"},2));
 if(raw?.lateCheckout)list.push(normalizeService({id:"legacy-late",type:"延後退房",status:"待安排",fee:0,paymentStatus:"免費",date:raw.checkout,time:raw.lateCheckout,note:"由舊版訂單資料轉入"},3));
 return list;
}

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
     fee:Math.max(0,Number(raw?.breakfast?.fee ?? raw?.breakfastFee ?? 0)||0),
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
   services:(Array.isArray(raw?.services)?raw.services:legacyServices(raw)).map(normalizeService),
   checklist:(raw?.checklist && typeof raw.checklist==="object") ? raw.checklist : {}
 };
}
function normalizeTask(raw,index=0){
 const legacyStatus=String(raw?.status || "待清掃");
 const mapped=({"尚未安排":"待清掃","已安排":"待清掃","清潔中":"清掃中","待複查":"待檢查","完成":"已完成","完成清掃":"已完成","暫停":"已暫停"}[legacyStatus] || legacyStatus);
 return {
   id:String(raw?.id || `T-M${index}`), date:validISO(raw?.date,todayISO),
   room:normalizeRoomIds(raw?.room || raw?.roomId || raw?.unitId)[0] || roomMaster[index%roomMaster.length].id,
   title:String(raw?.title || raw?.task || "退房清潔"),
   status:['待清掃','清掃中','已暫停','待檢查','已完成'].includes(mapped)?mapped:'待清掃',
   assignee:String(raw?.assignee || raw?.staff || ""), note:String(raw?.note || ""), orderId:String(raw?.orderId || ""), guest:String(raw?.guest || ""),
   checkoutAt:String(raw?.checkoutAt || ""), scheduledCheckout:String(raw?.scheduledCheckout || ""), startedAt:String(raw?.startedAt || ""), pausedAt:String(raw?.pausedAt || ""), inspectedAt:String(raw?.inspectedAt || ""), completedAt:String(raw?.completedAt || ""),
   priority:['高','一般','低'].includes(raw?.priority)?raw.priority:'一般', inspector:String(raw?.inspector || "")
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
   refundReason:String(raw?.refundReason||""),
   description:String(raw?.description||raw?.note||""),
   verified:Boolean(raw?.verified),
   createdAt:String(raw?.createdAt||new Date().toISOString()),
   operator:String(raw?.operator||"管理員")
 };
}
function paymentRecords(orderId){return payments.filter(p=>p.orderId===orderId);}
function recordedPaymentNet(orderId){
 return paymentRecords(orderId).reduce((sum,p)=>p.type==="加收費用"?sum:sum+p.amount,0);
}
function paymentSummary(order){
 const records=paymentRecords(order.id);
 const opening=Math.max(0,Number(order.openingPaid)||0);
 const chargeRecords=records.filter(p=>p.type==="加收費用"&&p.amount>0);
 const manualAdditionalCharges=chargeRecords.reduce((s,p)=>s+p.amount,0);
 const serviceCharges=(Array.isArray(order.services)?order.services:[]).filter(service=>service&&service.status!=="已取消"&&Number(service.fee||0)>0).reduce((sum,service)=>sum+Math.max(0,Number(service.fee||0)||0),0);
 const additionalCharges=manualAdditionalCharges+serviceCharges;
 const settledChargeRecords=chargeRecords.filter(p=>p.verified);
 const settledAdditionalCharges=settledChargeRecords.reduce((s,p)=>s+p.amount,0);
 const receiptRecords=records.filter(p=>p.type!=="加收費用"&&p.amount>0);
 const receipts=receiptRecords.reduce((s,p)=>s+p.amount,0);
 const refunds=Math.abs(records.filter(p=>p.amount<0).reduce((s,p)=>s+p.amount,0));
 const depositRecords=receiptRecords.filter(p=>p.type==="訂金").reduce((s,p)=>s+p.amount,0);
 const adjustedTotal=Math.max(0,Number(order.total||0)+additionalCharges);
 // 加收費用屬應收調整；核帳只代表已確認，不可再次計入已收淨額。
 const net=Math.max(0,opening+receipts-refunds);
 const remaining=Math.max(0,adjustedTotal-net);
 const over=Math.max(0,net-adjustedTotal);
 return {opening,receipts,refunds,deposit:opening+depositRecords,additionalCharges,manualAdditionalCharges,serviceCharges,settledAdditionalCharges,adjustedTotal,net,remaining,over,records,chargeRecords,settledChargeRecords,receiptRecords};
}
function autoVerifySettledPayments(order){
 const summary=paymentSummary(order);
 if(summary.remaining!==0||summary.over>0)return 0;
 let changed=0;
 summary.records.forEach(p=>{
   if(!p.verified&&p.amount>0){p.verified=true;changed+=1;}
 });
 return changed;
}
function autoVerifyAllSettledPayments(){return orders.reduce((sum,order)=>sum+autoVerifySettledPayments(order),0);}

function hasCompletedDeposit(order){
 const summary=paymentSummary(order);
 const verifiedDeposit=summary.receiptRecords.some(p=>p.type==="訂金"&&p.amount>0&&p.verified);
 const legacyOpening=summary.opening>0;
 const paidStatus=["已付訂金","已付全額","已入住","已退房"].includes(lifecycleStatus(order));
 return summary.deposit>0&&summary.net>0&&(verifiedDeposit||legacyOpening||paidStatus);
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
function normalizeRoomLock(x,index=0){
 return {
  id:String(x?.id||`L${index}`),room:normalizeRoomIds(x?.room||x?.roomId)[0]||roomMaster[0].id,
  type:LOCK_TYPES[x?.type]?x.type:"maintenance",start:validISO(x?.start,todayISO),end:validISO(x?.end,todayISO),
  reason:String(x?.reason||""),operator:String(x?.operator||x?.lockOperator||""),
  createdAt:String(x?.createdAt||x?.lockTime||new Date().toISOString()),updatedAt:String(x?.updatedAt||""),
  history:Array.isArray(x?.history)?x.history:[]
 };
}
let roomLocks=(Array.isArray(safeJSON("my6_room_locks",[])) ? safeJSON("my6_room_locks",[]) : []).map(normalizeRoomLock);
let auditLogs=Array.isArray(safeJSON("my6_audit_logs",[]))?safeJSON("my6_audit_logs",[]):[];
let notificationState=(safeJSON("my6_notification_state",{})&&typeof safeJSON("my6_notification_state",{})==="object")?safeJSON("my6_notification_state",{}):{};
let notifications=[];
let auditRecordingReady=true;
const AUDIT_LABELS={orders:"訂單",payments:"帳務",tasks:"房務",services:"住宿服務",settings:"系統設定"};
function auditTimestamp(){return new Date().toISOString();}
function auditOperator(entity,module){return String(entity?.operator||entity?.backfillOperator||entity?.assignee||entity?.inspector||(module==="房務"?"房務人員":"系統／目前使用者"));}
function auditSafeEntity(module,item){
 const x=structuredClone(item||{});
 if(module==="訂單"){delete x.services;delete x.breakfast;delete x.taxi;delete x.checklist;delete x.lifecycleHistory;}
 return x;
}
function flattenServices(list){return list.flatMap(o=>(o.services||[]).map(x=>({...x,orderId:o.id,guest:o.name})));}
function auditChangedFields(before,after){
 const keys=new Set([...Object.keys(before||{}),...Object.keys(after||{})]);
 return [...keys].filter(k=>JSON.stringify(before?.[k])!==JSON.stringify(after?.[k])).slice(0,8);
}
const AUDIT_FIELD_LABELS={status:"狀態",paid:"已收金額",total:"訂單金額",verified:"核帳狀態",amount:"金額",type:"類型",method:"收款方式",category:"費用類別",description:"說明",refundReason:"退款原因",checkin:"入住日期",checkout:"退房日期",room:"房間",plan:"方案",name:"旅客姓名",phone:"聯絡電話",guests:"入住人數",date:"日期",serviceDate:"服務日期",serviceTime:"服務時間",assignee:"負責人",priority:"優先順序",note:"備註",completed:"完成狀態"};
function auditMoney(v){const n=Number(v);return Number.isFinite(n)?money(n):auditValue(v);}
function auditValue(v,key=""){if(key==="verified")return v?"已核帳":"待核帳";if(key==="completed")return v?"已完成":"未完成";if(["amount","paid","total","fee","price"].includes(key))return auditMoney(v);if(Array.isArray(v))return v.join("、")||"—";if(v&&typeof v==="object")return "已更新";return String(v??"—");}
function auditEntityDescription(module,entity={}){
 if(module==="帳務"){const type=entity.type||"帳務紀錄",amount=auditMoney(Math.abs(Number(entity.amount)||0));const detail=entity.description||entity.refundReason||entity.category||"";return `${type}${amount!==money(0)?` ${amount}`:""}${detail?`（${detail}）`:""}`;}
 if(module==="住宿服務")return `${entity.type||entity.serviceType||"住宿服務"}${entity.serviceDate||entity.date?`｜${entity.serviceDate||entity.date}`:""}`;
 if(module==="房務")return `${entity.title||entity.taskType||entity.type||"房務工作"}${entity.room?`｜${roomName(entity.room)}`:""}`;
 if(module==="訂單")return `${entity.id||entity.orderId||"訂單"}${entity.name||entity.guest?`｜${entity.name||entity.guest}`:""}`;
 return entity.note||entity.title||"系統資料";
}
function auditSummary(action,before,after,module=""){
 const entity=after||before||{};
 if(action==="建立")return `建立${auditEntityDescription(module,entity)}`;
 if(action==="刪除")return `刪除${auditEntityDescription(module,entity)}`;
 const fields=auditChangedFields(before,after);
 return fields.length?fields.map(k=>`${AUDIT_FIELD_LABELS[k]||k}：${auditValue(before?.[k],k)} → ${auditValue(after?.[k],k)}`).join("；"):"內容已更新";
}
function auditSnapshotFromStorage(){
 const oldOrders=(Array.isArray(safeJSON("my6_orders",[]))?safeJSON("my6_orders",[]):[]).map(normalizeOrder);
 return {orders:oldOrders.map(x=>auditSafeEntity("訂單",x)),payments:(Array.isArray(safeJSON("my6_payments",[]))?safeJSON("my6_payments",[]):[]).map(normalizePayment),tasks:(Array.isArray(safeJSON("my6_tasks",[]))?safeJSON("my6_tasks",[]):[]).map(normalizeTask),services:flattenServices(oldOrders),settings:safeJSON("my6_settings",{})};
}
function auditCurrentSnapshot(){return {orders:orders.map(x=>auditSafeEntity("訂單",x)),payments:payments.map(normalizePayment),tasks:tasks.map(normalizeTask),services:flattenServices(orders),settings:{...settings}};}
function appendAuditRecord(module,action,id,before,after){
 const entity=after||before||{};const orderId=entity.orderId||entity.id||"";
 auditLogs.push({id:uid("A"),time:auditTimestamp(),operator:auditOperator(entity,module),module,action,targetId:String(id||orderId||""),orderId:String(entity.orderId||((module==="訂單")?entity.id:"")||""),room:String(entity.room||""),guest:String(entity.guest||entity.name||""),summary:auditSummary(action,before,after,module),before:before||null,after:after||null});
 if(auditLogs.length>3000)auditLogs=auditLogs.slice(-3000);
}
function recordAuditChanges(){
 if(!auditRecordingReady)return;const old=auditSnapshotFromStorage(),cur=auditCurrentSnapshot();
 for(const key of ["orders","payments","tasks","services"]){const module=AUDIT_LABELS[key],a=old[key],b=cur[key],am=new Map(a.map(x=>[String(x.id),x])),bm=new Map(b.map(x=>[String(x.id),x]));
  bm.forEach((x,id)=>{if(!am.has(id))appendAuditRecord(module,"建立",id,null,x);else if(JSON.stringify(am.get(id))!==JSON.stringify(x))appendAuditRecord(module,"修改",id,am.get(id),x);});
  am.forEach((x,id)=>{if(!bm.has(id))appendAuditRecord(module,"刪除",id,x,null);});}
 if(JSON.stringify(old.settings)!==JSON.stringify(cur.settings))appendAuditRecord("系統設定","修改","settings",old.settings,cur.settings);
}
let calDate=new Date();
reconcileOpeningPaid();
const autoVerifiedPaymentsOnLoad=autoVerifyAllSettledPayments();
if(autoVerifiedPaymentsOnLoad) localStorage.setItem("my6_payments",JSON.stringify(payments));

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
 autoVerifyAllSettledPayments();
 tasks=tasks.map(normalizeTask);
 recordAuditChanges();
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
 localStorage.setItem("my6_audit_logs",JSON.stringify(auditLogs));
 localStorage.setItem("my6_notification_state",JSON.stringify(notificationState));
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
   if(!exists)tasks.push({id:uid("T"),date:o.checkout,room,title:"退房清潔",status:"待清掃",assignee:"",note:"",orderId:o.id,guest:o.name,checkoutAt,scheduledCheckout:o.lateCheckout||settings.checkoutTime||"11:00",startedAt:"",pausedAt:"",inspectedAt:"",completedAt:"",priority:"一般",inspector:""});
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
 const list=Array.isArray(o.services)?o.services:legacyServices(o);
 const tags=list.map(s=>`${s.type}${s.status==="已完成"?"✓":""}`);
 if((o.services||[]).some(s=>s.type==="寄放行李"&&s.status!=="已取消")||o.luggageStorage)tags.push("寄放行李");
 return [...new Set(tags)];
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
const openDetailState=new Set();
const openOrderRowState=new Set();
const openPaymentDetailState=new Set();
function detailStateKey(el){
 if(!el)return "";
 if(el.dataset?.detailKey)return el.dataset.detailKey;
 const summary=el.querySelector(":scope > summary");
 return `${el.className||"details"}::${summary?.textContent?.trim()||""}`;
}
function captureOpenDetails(){
 document.querySelectorAll("details[open]").forEach(el=>{const key=detailStateKey(el);if(key)openDetailState.add(key);});
}
function restoreOpenDetails(){
 const scopedChoice=new Map();
 document.querySelectorAll("details[data-accordion-scope]").forEach(el=>{
   const key=detailStateKey(el),scope=el.dataset.accordionScope;
   if(key&&scope&&openDetailState.has(key))scopedChoice.set(scope,key);
 });
 document.querySelectorAll("details").forEach(el=>{
   const key=detailStateKey(el);if(!key)return;
   const scope=el.dataset.accordionScope;
   el.open=scope ? scopedChoice.get(scope)===key : openDetailState.has(key);
 });
}
document.addEventListener("toggle",e=>{const el=e.target;if(!(el instanceof HTMLDetailsElement))return;const key=detailStateKey(el);if(!key)return;if(el.open){openDetailState.add(key);const scope=el.dataset.accordionScope;if(scope){document.querySelectorAll(`details[data-accordion-scope="${scope}"]`).forEach(other=>{if(other!==el&&other.open){other.open=false;const otherKey=detailStateKey(other);if(otherKey)openDetailState.delete(otherKey);}});}}else openDetailState.delete(key);},true);
function renderAll(){
 captureOpenDetails();
 safeRender("dashboard",renderDashboard);
 safeRender("calendar",renderCalendar);
 safeRender("roomLocks",renderRoomLocks);
 safeRender("orders",renderOrders);
 safeRender("checkin",renderCheckin);
 safeRender("payments",renderPayments);
 safeRender("services",renderServices);
 safeRender("tasks",renderTasks);
 safeRender("guests",renderGuests);
 safeRender("templates",renderTemplates);
 safeRender("notifications",renderNotifications);
 safeRender("audit",renderAudit);
 safeRender("reports",renderReports);
 safeRender("settings",renderSettings);
 safeRender("notificationSettings",()=>{[["settingLargeRefundThreshold","notificationLargeRefundThreshold"],["settingHousekeepingOverdueMinutes","notificationHousekeepingOverdueMinutes"],["settingBreakfastReminderMinutes","notificationBreakfastReminderMinutes"],["settingTaxiReminderMinutes","notificationTaxiReminderMinutes"],["settingNotificationRetentionDays","notificationRetentionDays"],["settingNotificationAutoClearDays","notificationAutoClearDays"]].forEach(([id,k])=>{if($("#"+id))$("#"+id).value=settings[k];});});
 restoreOpenDetails();
 restoreCustomExpandedState();
}


function restoreCustomExpandedState(){
 openOrderRowState.forEach(id=>{const row=document.getElementById(`order-action-${id}`),summary=document.querySelector(`.order-summary-row[data-order-id="${CSS.escape(id)}"]`);if(row&&summary){row.classList.remove("hidden");summary.classList.add("is-expanded");const b=summary.querySelector(".order-row-toggle");if(b){b.textContent="收合";b.setAttribute("aria-expanded","true");}}});
 openPaymentDetailState.forEach(id=>{const box=document.getElementById(`payment-detail-${id}`);if(box){box.classList.remove("hidden");const b=box.closest("td")?.querySelector("button[onclick*=togglePaymentDetail]");if(b){b.textContent="收合明細";b.setAttribute("aria-expanded","true");}}});
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
 const pendingServices=activeOrders().flatMap(o=>(o.services||[]).filter(s=>s.status!=="已完成"&&s.status!=="已取消").map(s=>({order:o,service:s}))).sort((a,b)=>(a.service.date||"9999-12-31").localeCompare(b.service.date||"9999-12-31")||(a.service.time||"").localeCompare(b.service.time||""));
 const breakfastTomorrow=pendingServices.filter(x=>x.service.type==="早餐代訂"&&x.service.date===addDays(todayISO,1));
 const lineQueue=[...inList.map(o=>({id:o.id,title:`入住提醒｜${o.name}`,detail:`今日 ${settings.checkinTime} 後入住`})),...activeOrders().filter(o=>o.checkin===addDays(todayISO,1)).map(o=>({id:o.id,title:`入住前通知｜${o.name}`,detail:`明日入住・${o.count} 人`})),...breakfastTomorrow.map(({order:o,service:s})=>({id:o.id,title:`早餐確認｜${o.name}`,detail:`明日 ${s.time||"待確認"}・${s.details?.qty||1} 份／${s.details?.days||1} 天`}))].slice(0,8);
 $("#lineQueueCount").textContent=`${lineQueue.length} 則`;
 $("#lineQueue").innerHTML=lineQueue.map(x=>`<div class="list-item"><div><strong>${esc(x.title)}</strong><small>${esc(x.detail)}</small></div><button class="line-action official-line-button" title="聯絡眉原六官方 LINE" onclick="window.copyLineMessage('${x.id}')">${uiIcon("message")}官方 LINE</button></div>`).join("")||'<div class="empty">今日沒有待發 LINE。</div>';
 loadPuliWeather();
 $("#shortcutGrid").innerHTML=shortcuts.map(s=>`<a class="shortcut-card" href="${esc(s.url)}" target="_blank" rel="noopener"><span class="icon">${esc(s.icon)}</span><span>${esc(s.name)}</span></a>`).join("");
 const upcoming=activeOrders().filter(o=>o.checkin>=todayISO).sort((a,b)=>a.checkin.localeCompare(b.checkin)).slice(0,6);
 $("#upcomingList").innerHTML=upcoming.map(o=>`<div class="list-item"><div><strong>${esc(o.name)}｜${fmtDate(o.checkin)}</strong><small>${esc(o.package)}・${o.count} 人</small></div><span class="badge ${statusClass(o.status)==="paid"?"green":"gold"}">${esc(o.status)}</span></div>`).join("")||'<div class="empty">目前沒有近期入住。</div>';
 const todos=pendingServices.slice(0,12).map(({order:o,service:s})=>{const d=s.details||{};const detail=s.type==="早餐代訂"?`${d.qty||1} 份／${d.days||1} 天`:s.type==="接送／叫車"?`${d.guests||1} 人・${d.vehicleType||"車型未定"}`:d.quantity?`${d.quantity}${d.unit||"項"}`:"待安排";const overdue=Boolean(s.date&&s.date<todayISO);return {orderId:o.id,text:`${o.name}｜${s.type}・${s.date||"日期未定"}${s.time?` ${s.time}`:""}・${detail}`,overdue};});
 $("#serviceTodoList").innerHTML=todos.map(t=>`<div class="list-item"><strong>${esc(t.text)}</strong><span class="dashboard-list-actions"><span class="badge ${t.overdue?"red":"gold"}">${t.overdue?"已逾期":"待處理"}</span><button onclick="window.openServicesForOrder('${t.orderId}')">處理</button></span></div>`).join("")||'<div class="empty">目前沒有服務待辦。</div>';
 const todayAudit=auditLogs.filter(x=>String(x.time).slice(0,10)===todayISO),finance=todayAudit.filter(x=>x.module==="帳務"),hk=todayAudit.filter(x=>x.module==="房務");
 if($("#dashboardAuditSummary"))$("#dashboardAuditSummary").innerHTML=`<span>今日操作 <strong>${todayAudit.length}</strong></span><span>帳務異動 <strong>${finance.length}</strong></span><span>房務異動 <strong>${hk.length}</strong></span>`;
 if($("#dashboardRecentAudit"))$("#dashboardRecentAudit").innerHTML=auditLogs.slice(-6).reverse().map(a=>auditRecordHtml(a,true)).join("")||'<div class="empty">尚無操作紀錄。</div>';
 renderNotificationDashboard();
}
function getAlerts(){
 const a=[];
 const end=new Date(settings.insuranceEnd); const diff=Math.ceil((end-new Date())/DAY);
 if(diff<0)a.push({title:"保險已到期",detail:`到期時間：${settings.insuranceEnd.replace("T"," ")}`,level:"red",label:"已逾期"});
 else if(diff<=7)a.push({title:"保險即將到期",detail:`剩餘 ${diff} 天`,level:"red",label:"7 天內"});
 else if(diff<=30)a.push({title:"保險到期提醒",detail:`剩餘 ${diff} 天`,level:"gold",label:"30 天內"});
 else if(diff<=90)a.push({title:"保險到期提醒",detail:`剩餘 ${diff} 天`,level:"gold",label:"90 天內"});
 activeOrders().filter(o=>o.checkin>=todayISO&&paymentSummary(o).remaining>0).sort((a,b)=>a.checkin.localeCompare(b.checkin)).slice(0,8).forEach(o=>{const p=paymentSummary(o);a.push({title:`${o.name} 尚有待收款`,detail:`入住 ${o.checkin}・未收 ${money(p.remaining)}`,level:o.checkin<=addDays(todayISO,1)?"red":"gold",label:o.checkin<=addDays(todayISO,1)?"急迫":"待收款"});});
 return a;
}

function orderActionButtons(o){
 const terminal=["已取消","No Show"].includes(lifecycleStatus(o));
 return `<button class="order-action-primary" onclick="window.editOrder('${o.id}')">${uiIcon("edit")}編輯</button>${!terminal?`<button class="order-action-primary" onclick="window.openCalendarAdjust('${o.id}')">${uiIcon("calendar")}調整日期／房間</button>`:""}${(LIFECYCLE_NEXT[lifecycleStatus(o)]||[]).length?`<button class="workflow-action order-action-secondary" onclick="window.advanceLifecycle('${o.id}')">${uiIcon("arrow-right")}變更狀態</button>`:""}${WORKFLOW_NEXT[o.workflowStatus]?`<button class="workflow-action order-action-primary" onclick="window.advanceOrderWorkflow('${o.id}')">${uiIcon("arrow-right")}${esc(WORKFLOW_NEXT[o.workflowStatus])}</button>`:""}<button class="order-action-primary" onclick="window.openPaymentForOrder('${o.id}')">${uiIcon("wallet")}收款</button><button class="official-line-button order-action-secondary" onclick="window.copyLineMessage('${o.id}')">${uiIcon("message")}官方 LINE</button><button class="order-action-secondary" onclick="window.openOrderTimeline('${o.id}')">${uiIcon("file-text")}時間軸</button><button class="order-action-danger" onclick="window.deleteOrder('${o.id}')">${uiIcon("trash")}刪除</button>`;
}
function renderOrderMobileCards(list){
 const box=$("#orderMobileList");if(!box)return;
 const query=String($("#orderSearch")?.value||"").trim();
 box.innerHTML=list.map(o=>{const p=paymentSummary(o);return `<details class="management-mobile-card order-mobile-card" data-detail-key="order-${esc(o.id)}" data-accordion-scope="orders-mobile"${query&&list.length===1?" open":""}><summary class="management-mobile-summary"><span class="management-mobile-identity"><strong>${esc(o.name)}</strong><span>${esc(o.id)}・${esc(o.phone)}</span></span><span class="management-mobile-summary-meta"><span class="badge ${lifecycleClass(lifecycleStatus(o))}">${esc(lifecycleStatus(o))}</span><span class="management-expand-label">展開</span></span></summary><div class="management-mobile-body"><dl><div><dt>住宿日期</dt><dd>${o.checkin}～${o.checkout}</dd></div><div><dt>方案</dt><dd>${esc(o.package)}</dd></div><div class="wide"><dt>房間</dt><dd>${orderRooms(o).map(roomName).map(esc).join("、")}</dd></div><div><dt>最新應收</dt><dd>${money(p.adjustedTotal)}</dd></div><div><dt>剩餘應收</dt><dd>${money(p.remaining)}</dd></div><div class="wide"><dt>服務</dt><dd>${serviceTags(o).map(esc).join("、")||"—"}</dd></div></dl><div class="mobile-card-actions">${orderActionButtons(o)}</div></div></details>`}).join("")||'<div class="empty">沒有符合條件的訂單。</div>';
 applyStaticIcons(box);
}
function renderOrders(){
 const q=$("#orderSearch")?.value.trim().toLowerCase()||"", st=$("#statusFilter")?.value||"";
 const list=orders.filter(o=>(!st||lifecycleStatus(o)===st)&&(!q||[o.id,o.name,o.phone,o.package,o.checkin,o.checkout,...orderRooms(o).map(roomName)].join(" ").toLowerCase().includes(q))).sort((a,b)=>b.checkin.localeCompare(a.checkin));
 const orderCount=$("#orderResultCount");if(orderCount)orderCount.textContent=`顯示 ${list.length}／${orders.length} 筆`;
 renderOrderMobileCards(list);
 $("#orderTableBody").innerHTML=list.map(o=>{const expanded=openOrderRowState.has(o.id)||(q&&list.length===1);return `<tr class="order-summary-row${expanded?" is-expanded":""}" data-order-id="${esc(o.id)}">
 <td><strong>${esc(o.id)}</strong>${o.isBackfill?`<span class="badge backfill" title="補登原因：${esc(o.backfillReason)}">補登</span>`:""}<span class="guest-detail">${esc(o.source)}</span>${o.isBackfill?`<span class="guest-detail backfill-meta">原因：${esc(o.backfillReason)}${o.backfillOperator?`・人員：${esc(o.backfillOperator)}`:""}${o.backfillTime?`・時間：${esc(new Date(o.backfillTime).toLocaleString("zh-TW",{hour12:false}))}`:""}</span>`:""}</td>
 <td><strong>${esc(o.name)}</strong><span class="guest-detail">${esc(o.phone)}</span></td>
 <td>${o.checkin}<br>至 ${o.checkout}</td>
 <td>${esc(o.package)}<span class="guest-detail">${orderRooms(o).map(roomName).map(esc).join("、")}</span></td>
 <td><div class="service-tags">${serviceTags(o).map(x=>`<span>${esc(x)}</span>`).join("")||"-"}</div></td>
 <td class="money-cell"><strong>${money(o.total)}</strong><span class="guest-detail">已收 ${money(o.paid)}・未收 ${money(Math.max(0,o.total-o.paid))}</span><div class="money-progress"><i style="width:${Math.min(100,o.total?o.paid/o.total*100:0)}%"></i></div></td>
 <td><span class="badge ${lifecycleClass(lifecycleStatus(o))}" title="${esc(lifecycleHistoryText(o))}">${esc(lifecycleStatus(o))}</span><span class="workflow-badge">${esc(o.workflowStatus)}</span>${(o.lifecycleHistory||[]).length?`<span class="guest-detail">歷程 ${(o.lifecycleHistory||[]).length} 筆</span>`:""}<button type="button" class="order-row-toggle" aria-expanded="${expanded?"true":"false"}" onclick="window.toggleOrderRow('${o.id}')">${expanded?"收合":"展開"}</button></td>
 </tr><tr id="order-action-${o.id}" class="order-action-row${expanded?"":" hidden"}"><td colspan="7"><div class="order-action-row-inner"><span class="order-action-label">操作</span><div class="table-actions order-table-actions">${orderActionButtons(o)}</div></div></td></tr>`}).join("")||'<tr><td colspan="7">沒有符合條件的訂單。</td></tr>';
 $("#paymentOrder").innerHTML=orders.filter(o=>!["已取消","No Show"].includes(lifecycleStatus(o))).map(o=>{const p=paymentSummary(o);return `<option value="${o.id}">${o.id}｜${esc(o.name)}｜剩餘 ${money(p.remaining)}</option>`}).join("");
 updatePaymentDialogSummary();
}
window.toggleOrderRow=id=>{const row=document.getElementById(`order-action-${id}`);const summary=document.querySelector(`.order-summary-row[data-order-id="${CSS.escape(id)}"]`);if(!row||!summary)return;const opening=row.classList.contains("hidden");row.classList.toggle("hidden",!opening);summary.classList.toggle("is-expanded",opening);if(opening)openOrderRowState.add(id);else openOrderRowState.delete(id);const button=summary.querySelector(".order-row-toggle");if(button){button.textContent=opening?"收合":"展開";button.setAttribute("aria-expanded",opening?"true":"false");}};
function openOrder(o=null,presetDate="",presetType="normal"){
 $("#orderForm").reset(); $("#orderId").value=o?.id||""; $("#orderDialogTitle").textContent=o?"編輯訂單":"新增訂單";
 $("#guestName").value=o?.name||""; $("#guestPhone").value=o?.phone||"";
 $("#orderType").value=o?.orderType||(presetType==="backfill"?"backfill":"normal"); $("#backfillReason").value=o?.backfillReason||""; $("#backfillTime").value=o?.backfillTime?new Date(o.backfillTime).toLocaleString("zh-TW",{hour12:false}):"儲存時自動記錄"; $("#backfillOperator").value=o?.backfillOperator||""; toggleBackfillFields();
 const initialCheckin=o?.checkin||presetDate||todayISO; $("#checkinDate").value=initialCheckin; $("#checkoutDate").value=o?.checkout||addDays(initialCheckin,1);
 $("#checkoutDate").dataset.autoCheckout=o?"0":"1"; clearOrderFieldErrors();
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
 $("#breakfastDate").value=o?.breakfast?.date||""; $("#breakfastShop").value=o?.breakfast?.shop||""; $("#breakfastQty").value=o?.breakfast?.qty||0; $("#breakfastDays").value=o?.breakfast?.days||0; $("#breakfastFee").value=formatMoneyInput(o?.breakfast?.fee||0); $("#breakfastDelivery").value=o?.breakfast?.delivery||""; $("#breakfastDone").checked=!!o?.breakfast?.done;
 $("#taxiDate").value=o?.taxi?.date||""; $("#taxiTime").value=o?.taxi?.time||""; $("#taxiPickup").value=o?.taxi?.pickup||""; $("#taxiDestination").value=o?.taxi?.destination||""; $("#taxiGuests").value=o?.taxi?.guests||0; const taxiType=o?.taxi?.type||"";const taxiOptions=[...$("#taxiType").options].map(x=>x.value);$("#taxiType").value=taxiOptions.includes(taxiType)?taxiType:(taxiType?"其他":"");$("#taxiTypeOther").value=taxiOptions.includes(taxiType)?"":taxiType;$("#taxiTypeOtherField").classList.toggle("hidden",$("#taxiType").value!=="其他"); $("#taxiFare").value=formatMoneyInput(o?.taxi?.fare||0); $("#taxiDone").checked=!!o?.taxi?.done;
 $("#earlyCheckin").value=o?.earlyCheckin||""; $("#lateCheckout").value=o?.lateCheckout||""; $("#luggageStorage").checked=!!o?.luggageStorage;
 $$('input[name="roomChoice"]').forEach(x=>x.checked=(o?.rooms||[]).includes(x.value));
 handlePackageChange(); $("#conflictWarning").classList.add("hidden"); syncLegacyServiceDates();$("#orderDialog").showModal();
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

function clearOrderFieldErrors(){
 $$("#orderForm .field-error").forEach(el=>el.classList.remove("field-error"));
}
function focusOrderField(target,message){
 const el=typeof target==="string"?$(target):target;
 if(!el){toast(message);return false;}
 clearOrderFieldErrors();
 const visual=el.closest("label,fieldset")||el;
 visual.classList.add("field-error");
 $("#conflictWarning").textContent=message;
 $("#conflictWarning").classList.remove("hidden");
 requestAnimationFrame(()=>{
   visual.scrollIntoView({behavior:"smooth",block:"center"});
   setTimeout(()=>{if(typeof el.focus==="function"&&!el.disabled)el.focus({preventScroll:true});},260);
 });
 toast(message);
 return false;
}
function setupOrderDateAutomation(){
 const checkin=$("#checkinDate"),checkout=$("#checkoutDate");
 if(!checkin||!checkout||checkin.dataset.smartDateReady==="1")return;
 checkin.dataset.smartDateReady="1";
 checkin.addEventListener("change",()=>{
   if(!checkin.value)return;
   if(checkout.dataset.autoCheckout==="1"||!checkout.value||checkout.value<=checkin.value){
     checkout.value=addDays(checkin.value,1);
     checkout.dataset.autoCheckout="1";
   }
 });
 checkout.addEventListener("change",()=>{
   if(checkout.value&&checkin.value)checkout.dataset.autoCheckout=checkout.value===addDays(checkin.value,1)?"1":"0";
 });
}
setupOrderDateAutomation();

function setupEnterpriseNumberInput(selector,{fallback=0,min=0}={}){
 const el=$(selector);if(!el||el.dataset.enterpriseNumberReady==="1")return;el.dataset.enterpriseNumberReady="1";
 el.addEventListener("focus",()=>{el.select();});
 el.addEventListener("click",()=>{if(document.activeElement===el)el.select();});
 el.addEventListener("wheel",e=>{if(document.activeElement===el)e.preventDefault();},{passive:false});
 el.addEventListener("blur",()=>{let value=Number(el.value);if(!Number.isFinite(value)||value<min)value=fallback;el.value=String(value);});
}
["#breakfastQty","#breakfastDays","#taxiGuests"].forEach(sel=>setupEnterpriseNumberInput(sel,{fallback:sel==="#breakfastQty"?0:sel==="#breakfastDays"?0:0,min:0}));
setupEnterpriseNumberInput("#guestCount",{fallback:1,min:1});
["#breakfastFee","#taxiFare"].forEach(sel=>{
 const el=$(sel);if(!el)return;
 el.addEventListener("focus",e=>{e.target.value=moneyNumber(e.target.value)?String(moneyNumber(e.target.value)):"";e.target.select();});
 el.addEventListener("input",e=>{e.target.value=String(e.target.value||"").replace(/[^0-9]/g,"").replace(/^0+(?=\d)/,"");});
 el.addEventListener("blur",e=>{e.target.value=formatMoneyInput(e.target.value);});
 el.addEventListener("wheel",e=>{if(document.activeElement===el)e.preventDefault();},{passive:false});
});

function syncLegacyServiceDates(){
 const checkin=$("#checkinDate")?.value;
 if(checkin&&(!$("#breakfastDate").value||$("#breakfastDate").dataset.autoDate==="1")){$("#breakfastDate").value=addDays(checkin,1);$("#breakfastDate").dataset.autoDate="1";}
 // 接送／叫車採 Lazy Create：未由使用者輸入叫車內容時，不自動帶入退房日或建立服務。
}
$("#checkinDate")?.addEventListener("change",syncLegacyServiceDates);
$("#breakfastDate")?.addEventListener("change",e=>e.target.dataset.autoDate="0");$("#taxiDate")?.addEventListener("change",e=>e.target.dataset.autoDate="0");
$("#taxiType")?.addEventListener("change",e=>$("#taxiTypeOtherField")?.classList.toggle("hidden",e.target.value!=="其他"));


function readOrderForm(){
 const rooms=$$('input[name="roomChoice"]:checked').map(x=>x.value);
 const o={id:$("#orderId").value||("MY6-"+Date.now().toString().slice(-8)),name:$("#guestName").value.trim(),phone:$("#guestPhone").value.trim(),
 checkin:$("#checkinDate").value,checkout:$("#checkoutDate").value,package:$("#packageType").value,rooms,count:+$("#guestCount").value,source:$("#orderSource").value,status:$("#orderStatus").value,
 workflowStatus:$("#workflowStatus").value,lifecycleStatus:$("#lifecycleStatus")?.value||"詢問中",lifecycleOperator:$("#lifecycleOperator")?.value.trim()||"系統",lifecycleHistory:orders.find(o=>o.id===$("#orderId").value)?.lifecycleHistory||[],orderType:$("#orderType").value,isBackfill:$("#orderType").value==="backfill",backfillReason:$("#backfillReason").value.trim(),backfillTime:orders.find(o=>o.id===$("#orderId").value)?.backfillTime||"",backfillOperator:$("#backfillOperator").value.trim(),
 total:moneyNumber($("#orderTotal").value),paid:moneyNumber($("#orderPaid").value),note:$("#orderNote").value.trim(),
 breakfast:{date:$("#breakfastDate").value,shop:$("#breakfastShop").value.trim(),qty:+$("#breakfastQty").value,days:+$("#breakfastDays").value,fee:moneyNumber($("#breakfastFee").value),delivery:$("#breakfastDelivery").value,done:$("#breakfastDone").checked},
 taxi:{date:$("#taxiDate").value,time:$("#taxiTime").value,pickup:$("#taxiPickup").value.trim(),destination:$("#taxiDestination").value.trim(),guests:+$("#taxiGuests").value,type:($("#taxiType").value==="其他"?$("#taxiTypeOther").value.trim():$("#taxiType").value.trim()),fare:moneyNumber($("#taxiFare").value),done:$("#taxiDone").checked},
 earlyCheckin:$("#earlyCheckin").value,lateCheckout:$("#lateCheckout").value,luggageStorage:$("#luggageStorage").checked,services:orders.find(o=>o.id===$("#orderId").value)?.services||[],checklist:orders.find(o=>o.id===$("#orderId").value)?.checklist||{}};
 const hasTaxiIntent=Boolean(o.taxi.time||o.taxi.pickup||o.taxi.destination||o.taxi.guests>0||o.taxi.type||o.taxi.fare>0||o.taxi.done);
 if(!hasTaxiIntent)o.taxi={date:"",time:"",pickup:"",destination:"",guests:0,type:"",fare:0,done:false};
 syncServicesFromLegacyFields(o);
 return o;
}
$("#orderForm").addEventListener("invalid",e=>{
 e.preventDefault();
 const labels={guestName:"請填寫旅客姓名",guestPhone:"請填寫聯絡電話",checkinDate:"請選擇入住日期",checkoutDate:"請選擇退房日期"};
 focusOrderField(e.target,labels[e.target.id]||"請完成此必填欄位");
},{capture:true});
$("#orderForm").addEventListener("input",e=>{const visual=e.target.closest("label,fieldset");if(visual)visual.classList.remove("field-error");});
$("#orderForm").addEventListener("submit",e=>{
 e.preventDefault(); clearOrderFieldErrors(); const o=readOrderForm();
 if(!o.name)return focusOrderField("#guestName","請填寫旅客姓名");
 if(!o.phone)return focusOrderField("#guestPhone","請填寫聯絡電話");
 if(!o.checkin)return focusOrderField("#checkinDate","請選擇入住日期");
 if(!o.checkout)return focusOrderField("#checkoutDate","請選擇退房日期");
 if(!o.rooms.length)return focusOrderField("#roomCheckboxes","請至少選擇一個住宿單位");
 if(!Number.isFinite(o.count)||o.count<1)return focusOrderField("#guestCount","入住人數至少為 1 人");
 if(o.breakfast.qty>0 && o.breakfast.days<1)return focusOrderField("#breakfastDays","有預訂早餐時，送餐天數至少為 1 天");
 if(o.checkout<=o.checkin)return focusOrderField("#checkoutDate","退房日期必須晚於入住日期");
 const ruleError=validateBookingRules(o,o.id); if(ruleError){focusOrderField("#checkinDate",ruleError);return;}
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
 if(to==="已完成"){
   const pending=(o.services||[]).filter(s=>s.status!=="已完成"&&s.status!=="已取消");
   if(pending.length){if(!confirm(`尚有 ${pending.length} 項住宿服務未完成：
${pending.map(s=>`・${s.type}`).join("\n")}

仍要強制完成訂單嗎？`)){window.openServicesForOrder(o.id);return;}}
 }
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
 const q=String($("#checkinSearch")?.value||"").trim().toLocaleLowerCase("zh-TW");
 const all=activeOrders().filter(o=>o.checkout>=todayISO).sort((a,b)=>a.checkin.localeCompare(b.checkin));
 const list=q?all.filter(o=>[o.id,o.name,o.phone,o.package,o.checkin,o.checkout,...orderRooms(o).map(roomName)].join(" ").toLocaleLowerCase("zh-TW").includes(q)):all;
 const count=$("#checkinResultCount");if(count)count.textContent=`顯示 ${list.length}／${all.length} 筆`;
 const items=["身分確認","訂金","尾款","入住須知","LINE","導航","WiFi","完成入住"];
 $("#checkinList").innerHTML=list.map(o=>`<details class="management-mobile-card checkin-card" data-detail-key="checkin-${esc(o.id)}" data-accordion-scope="checkin-mobile"${q&&list.length===1?" open":""}><summary class="management-mobile-summary"><span class="management-mobile-identity"><strong>${esc(o.name)}</strong><span>${esc(o.id)}・${esc(o.phone)}</span></span><span class="management-mobile-summary-meta"><span>${esc(o.checkin)} 入住</span><span class="management-expand-label">展開</span></span></summary><div class="management-mobile-body"><p class="section-note">${esc(o.package)}｜${o.count} 人｜${orderRooms(o).map(roomName).map(esc).join("、")}</p><div class="checklist">${items.map(x=>{const autoDeposit=x==="訂金"&&hasCompletedDeposit(o);const checked=autoDeposit||o.checklist?.[x];return `<label class="check-item${autoDeposit?" auto-checked":""}"${autoDeposit?' title="已依訂單訂金收款狀態自動完成"':''}><input type="checkbox" ${checked?"checked":""} ${autoDeposit?"disabled aria-label='訂金已自動核對'":""} onchange="window.toggleCheck('${o.id}','${x}',this.checked)"> ${x}${autoDeposit?'<small class="check-auto-label">自動</small>':''}</label>`}).join("")}</div><div class="mobile-card-actions checkin-card-actions"><button class="official-line-button" title="聯絡眉原六官方 LINE" onclick="window.copyLineMessage('${o.id}')">${uiIcon("message")}官方 LINE</button><button onclick="window.openServicesForOrder('${o.id}')">${uiIcon("clipboard")}住宿服務</button><button onclick="window.editOrder('${o.id}')">${uiIcon("edit")}編輯訂單</button></div></div></details>`).join("")||'<div class="empty">目前沒有符合條件的待入住訂單。</div>';
 applyStaticIcons($("#checkinList"));
}

window.toggleCheck=(id,key,val)=>{
 const o=orders.find(x=>x.id===id);if(!o)return;o.checklist=o.checklist||{};o.checklist[key]=val;
 if(key==="完成入住"&&val)o.status="已入住";
 persist();
 // 僅更新資料，不重繪整張卡片，避免勾選後自動收合。
 safeRender("dashboard",renderDashboard);safeRender("orders",renderOrders);safeRender("reports",renderReports);
};
window.openServicesForOrder=id=>{navigate("services");const search=$("#serviceSearch");if(search){search.value=id;renderServices();}setTimeout(()=>$("#serviceManagementList")?.scrollIntoView({behavior:"smooth",block:"start"}),0);};


function ensureUnifiedOrderServices(order){
 order.services=Array.isArray(order.services)?order.services:[];
 const ensure=(type,present,data={})=>{const existing=order.services.find(s=>s.type===type&&s.status!=="已取消");if(present&&!existing)order.services.push(normalizeService({id:uid("S"),type,status:"待安排",paymentStatus:"免費",fee:0,date:data.date||order.checkin,time:data.time||"",details:data.details||{},note:data.note||"",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}));};
 ensure("寄放行李",!!order.luggageStorage,{date:order.checkin});
 ensure("提前入住",!!order.earlyCheckin,{date:order.checkin,time:order.earlyCheckin});
 ensure("延後退房",!!order.lateCheckout,{date:order.checkout,time:order.lateCheckout});
}
function migrateUnifiedOrderServices(){
 orders.forEach(order=>{
   order.services=Array.isArray(order.services)?order.services.map(normalizeService):[];
   // 修復 Hotfix 1：舊版不支援「寄放行李」型別時，會被誤轉為「特殊需求」，且每次渲染再新增一筆。
   if(order.luggageStorage&&!order.services.some(s=>s.type==="寄放行李"&&s.status!=="已取消")){
     const candidates=order.services.filter(s=>s.type==="特殊需求"&&s.status==="待安排"&&Number(s.fee||0)===0&&s.paymentStatus==="免費"&&(s.date||"")===order.checkin&&!s.time&&!s.note&&(!s.details||Object.keys(s.details).length===0||((Number(s.details.quantity||1)===1)&&!s.details.unit)));
     if(candidates.length){
       const keep=candidates[0];keep.type="寄放行李";keep.details={};keep.updatedAt=new Date().toISOString();
       const removeIds=new Set(candidates.slice(1).map(s=>s.id));
       order.services=order.services.filter(s=>!removeIds.has(s.id));
     }
   }
   // 同一訂單完全相同的服務只保留一筆，避免歷史錯誤資料繼續堆疊。
   const seen=new Set();
   order.services=order.services.filter(s=>{
     const key=[s.type,s.status,s.paymentStatus,Number(s.fee||0),s.date||"",s.time||"",s.note||"",JSON.stringify(s.details||{})].join("|");
     if(seen.has(key))return false;seen.add(key);return true;
   });
   ensureUnifiedOrderServices(order);
 });
}
function allServiceRows(){return orders.flatMap(order=>(order.services||[]).map(service=>({order,service})));}
function servicePaymentClass(s){return ({"已收款":"green","免費":"gray","部分收款":"gold","未收款":"red"}[s]||"gray");}
function renderServices(){
 migrateUnifiedOrderServices();
 const box=$("#serviceManagementList");if(!box)return;
 const q=String($("#serviceSearch")?.value||"").trim().toLocaleLowerCase("zh-TW"),status=$("#serviceStatusFilter")?.value||"",payment=$("#servicePaymentFilter")?.value||"";
 let rows=allServiceRows().filter(({order,service})=>(!status||service.status===status)&&(!payment||service.paymentStatus===payment)&&(!q||[order.id,order.name,order.phone,service.type,service.note].join(" ").toLocaleLowerCase("zh-TW").includes(q)));
 rows.sort((a,b)=>String(a.service.date||a.order.checkin).localeCompare(String(b.service.date||b.order.checkin)));
 $("#serviceResultCount").textContent=`${rows.length} 筆`;
 box.innerHTML=rows.map(({order,service})=>{const d=service.details||{};const structured=service.type==="早餐代訂"?`${d.shop||"早餐"}・${d.qty||1}份／${d.days||1}天`:service.type==="接送／叫車"?`${d.pickup||"上車地點未定"}${d.destination?` → ${d.destination}`:""}・${d.guests||1}人${d.vehicleType?`・${d.vehicleType}`:""}`:["加床","寵物住宿","特殊需求"].includes(service.type)?`${d.quantity||1}${d.unit||"項"}`:"";return `<details class="service-management-card compact-service-card" data-detail-key="service-${esc(service.id)}" data-accordion-scope="services"><summary class="service-card-main"><div class="service-card-copy"><button class="service-order-link" onclick="window.editOrder('${order.id}')">${esc(order.id)}</button><strong>${esc(service.type)}｜${esc(order.name)}</strong><span>${esc(service.date||"日期未定")}${service.time?` ${esc(service.time)}`:""}${structured?`・${esc(structured)}`:""}${service.note?`・${esc(service.note)}`:""}</span></div><div class="service-card-badges"><span class="badge ${service.status==="已完成"?"green":"gold"}">${esc(service.status)}</span><span class="badge ${servicePaymentClass(service.paymentStatus)}">${esc(service.paymentStatus)}</span></div></summary><div class="service-card-footer"><strong>${service.paymentStatus==="免費"?"免費":money(service.fee)}</strong><div class="table-actions"><button onclick="window.editService('${order.id}','${service.id}')">編輯</button><button class="danger" onclick="window.deleteService('${order.id}','${service.id}')">刪除</button></div></div></details>`}).join("")||'<div class="empty">沒有符合條件的住宿服務。</div>';
}
function selectedServiceOrder(){return orders.find(o=>o.id===$("#serviceOrderId")?.value);}
function serviceDefaultDate(order,type,direction="checkout"){
 if(!order)return "";
 if(type==="早餐代訂")return addDays(order.checkin,1);
 if(type==="接送／叫車")return direction==="checkin"?order.checkin:direction==="checkout"?order.checkout:"";
 if(type==="提前入住")return order.checkin;
 if(type==="延後退房")return order.checkout;
 return order.checkin;
}
function updateServiceSpecificFields({preserveDate=false}={}){
 const type=$("#serviceType")?.value||"早餐代訂";
 ["#serviceBreakfastFields","#serviceTaxiFields","#serviceQuantityFields"].forEach(s=>$(s)?.classList.add("hidden"));
 if(type==="早餐代訂")$("#serviceBreakfastFields")?.classList.remove("hidden");
 if(type==="接送／叫車")$("#serviceTaxiFields")?.classList.remove("hidden");
 if(["加床","寵物住宿","特殊需求"].includes(type))$("#serviceQuantityFields")?.classList.remove("hidden");
 if(!preserveDate){const order=selectedServiceOrder(),direction=$("#serviceTaxiDirection")?.value||"checkout";$("#serviceDate").value=serviceDefaultDate(order,type,direction);}
}
function setServiceTaxiType(value=""){
 const select=$("#serviceTaxiType"),values=[...select.options].map(o=>o.value);select.value=values.includes(value)?value:(value?"其他":"");$("#serviceTaxiTypeOther").value=values.includes(value)?"":value;$("#serviceTaxiTypeOtherField").classList.toggle("hidden",select.value!=="其他");
}
function openServiceDialog(orderId="",service=null){
 const select=$("#serviceOrderId");select.innerHTML=orders.map(o=>`<option value="${o.id}">${o.id}｜${esc(o.name)}｜${o.checkin}</option>`).join("");
 $("#serviceDialogTitle").textContent=service?"編輯住宿服務":"新增住宿服務";$("#serviceId").value=service?.id||"";select.value=orderId||orders[0]?.id||"";select.disabled=!!service;
 $("#serviceType").value=service?.type||"早餐代訂";$("#serviceStatus").value=service?.status||"待安排";$("#serviceFee").value=formatMoneyInput(service?.fee||0);$("#servicePaymentStatus").value=service?.paymentStatus||"未收款";
 const d=service?.details||{};$("#serviceTaxiDirection").value=d.direction||"checkout";$("#serviceDate").value=service?.date||serviceDefaultDate(selectedServiceOrder(),$("#serviceType").value,$("#serviceTaxiDirection").value);$("#serviceTime").value=service?.time||($("#serviceType").value==="早餐代訂"?"08:00":"");$("#serviceNote").value=service?.note||"";
 $("#serviceBreakfastShop").value=d.shop||"";$("#serviceBreakfastQty").value=d.qty||1;$("#serviceBreakfastDays").value=d.days||1;$("#serviceTaxiGuests").value=d.guests||1;$("#serviceTaxiPickup").value=d.pickup||"";$("#serviceTaxiDestination").value=d.destination||"";setServiceTaxiType(d.vehicleType||"");$("#serviceQuantity").value=d.quantity||1;$("#serviceUnit").value=d.unit||"";
 updateServiceSpecificFields({preserveDate:true});$("#serviceDialog").showModal();
 ["#serviceBreakfastQty","#serviceBreakfastDays","#serviceTaxiGuests","#serviceQuantity"].forEach(sel=>setupEnterpriseNumberInput(sel,{fallback:1,min:1}));
}
window.editService=(orderId,serviceId)=>{const order=orders.find(o=>o.id===orderId),service=order?.services?.find(s=>s.id===serviceId);if(service)openServiceDialog(orderId,service);};
window.deleteService=(orderId,serviceId)=>{if(!confirm("確定刪除此住宿服務？"))return;const order=orders.find(o=>o.id===orderId);if(!order)return;order.services=(order.services||[]).filter(s=>s.id!==serviceId);syncLegacyFieldsFromServices(order);persist();renderAll();toast("住宿服務已刪除");};
$("#addServiceBtn")?.addEventListener("click",()=>openServiceDialog());
["serviceSearch","serviceStatusFilter","servicePaymentFilter"].forEach(id=>$("#"+id)?.addEventListener(id==="serviceSearch"?"input":"change",renderServices));
$("#serviceFee")?.addEventListener("focus",e=>{e.target.value=moneyNumber(e.target.value)?String(moneyNumber(e.target.value)):"";e.target.select();});
$("#serviceFee")?.addEventListener("input",e=>{e.target.value=String(e.target.value||"").replace(/[^0-9]/g,"").replace(/^0+(?=\d)/,"");});
$("#serviceFee")?.addEventListener("blur",e=>{e.target.value=formatMoneyInput(e.target.value);});
$("#serviceType")?.addEventListener("change",()=>updateServiceSpecificFields());
$("#serviceOrderId")?.addEventListener("change",()=>updateServiceSpecificFields());
$("#serviceTaxiDirection")?.addEventListener("change",()=>updateServiceSpecificFields());
$("#serviceTaxiType")?.addEventListener("change",e=>$("#serviceTaxiTypeOtherField")?.classList.toggle("hidden",e.target.value!=="其他"));

function syncLegacyFieldsFromServices(order){
 const breakfast=(order.services||[]).find(s=>s.type==="早餐代訂"&&s.status!=="已取消");
 order.breakfast=breakfast?{date:breakfast.date||"",shop:breakfast.details?.shop||"",qty:Number(breakfast.details?.qty||0),days:Number(breakfast.details?.days||0),fee:Math.max(0,Number(breakfast.fee||0)||0),delivery:breakfast.time||"",done:breakfast.status==="已完成"}:{date:"",shop:"",qty:0,days:0,fee:0,delivery:"",done:false};
 const taxi=(order.services||[]).find(s=>s.type==="接送／叫車"&&s.status!=="已取消");
 order.taxi=taxi?{date:taxi.date||"",time:taxi.time||"",pickup:taxi.details?.pickup||"",destination:taxi.details?.destination||"",guests:Number(taxi.details?.guests||0),type:taxi.details?.vehicleType||"",fare:Number(taxi.fee||0),done:taxi.status==="已完成"}:{date:"",time:"",pickup:"",destination:"",guests:0,type:"",fare:0,done:false};
 const early=(order.services||[]).find(s=>s.type==="提前入住"&&s.status!=="已取消");order.earlyCheckin=early?.time||"";
 const late=(order.services||[]).find(s=>s.type==="延後退房"&&s.status!=="已取消");order.lateCheckout=late?.time||"";
}
function syncServicesFromLegacyFields(order){
 order.services=Array.isArray(order.services)?order.services:[];
 const upsert=(type,data,enabled)=>{
   const matches=order.services.map((service,index)=>({service,index})).filter(x=>x.service.type===type&&x.service.status!=="已取消");
   const primary=matches.find(x=>!String(x.service.id||"").startsWith("legacy-"))||matches[0];
   if(!enabled){
     // 只移除由舊欄位自動產生的服務，避免刪除使用者在服務管理中建立的紀錄。
     order.services=order.services.filter(service=>!(service.type===type&&String(service.id||"").startsWith("legacy-")));
     return;
   }
   const incoming=normalizeService(data);
   if(primary){
     const current=primary.service;
     if(incoming.fee>0&&["部分收款","已收款"].includes(current.paymentStatus))incoming.paymentStatus=current.paymentStatus;
     order.services[primary.index]=normalizeService({...current,...incoming,id:current.id,createdAt:current.createdAt||incoming.createdAt,updatedAt:new Date().toISOString()});
     // 同一訂單同一核心服務只保留主要紀錄，防止 Dashboard 與待辦重複。
     const keepId=order.services[primary.index].id;
     order.services=order.services.filter(service=>service.type!==type||service.id===keepId||service.status==="已取消");
   }else order.services.push(incoming);
 };
 upsert("早餐代訂",{id:"legacy-breakfast",type:"早餐代訂",status:order.breakfast?.done?"已完成":"待安排",fee:Number(order.breakfast?.fee||0),paymentStatus:Number(order.breakfast?.fee||0)>0?"未收款":"免費",date:order.breakfast?.date,time:order.breakfast?.delivery,note:"",details:{shop:order.breakfast?.shop||"",qty:Number(order.breakfast?.qty||1),days:Number(order.breakfast?.days||1)}},Number(order.breakfast?.qty)>0);
 const hasTaxiIntent=Boolean(order.taxi?.date&&(order.taxi?.time||order.taxi?.pickup||order.taxi?.destination||Number(order.taxi?.guests)>0||order.taxi?.type||Number(order.taxi?.fare)>0||order.taxi?.done));
 upsert("接送／叫車",{id:"legacy-taxi",type:"接送／叫車",status:order.taxi?.done?"已完成":"待安排",fee:Number(order.taxi?.fare||0),paymentStatus:Number(order.taxi?.fare||0)>0?"未收款":"免費",date:order.taxi?.date,time:order.taxi?.time,note:"",details:{direction:order.taxi?.date===order.checkin?"checkin":order.taxi?.date===order.checkout?"checkout":"custom",vehicleType:order.taxi?.type||"",guests:Number(order.taxi?.guests||1),pickup:order.taxi?.pickup||"",destination:order.taxi?.destination||""}},hasTaxiIntent);
}

$("#serviceForm")?.addEventListener("submit",e=>{
 e.preventDefault();const order=selectedServiceOrder();if(!order)return toast("請選擇訂單");const id=$("#serviceId").value||uid("S"),existing=(order.services||[]).find(s=>s.id===id),type=$("#serviceType").value;
 const details={};
 if(type==="早餐代訂")Object.assign(details,{shop:$("#serviceBreakfastShop").value.trim(),qty:+$("#serviceBreakfastQty").value||1,days:+$("#serviceBreakfastDays").value||1});
 if(type==="接送／叫車")Object.assign(details,{direction:$("#serviceTaxiDirection").value,vehicleType:$("#serviceTaxiType").value==="其他"?$("#serviceTaxiTypeOther").value.trim():$("#serviceTaxiType").value,guests:+$("#serviceTaxiGuests").value||1,pickup:$("#serviceTaxiPickup").value.trim(),destination:$("#serviceTaxiDestination").value.trim()});
 if(["加床","寵物住宿","特殊需求"].includes(type))Object.assign(details,{quantity:+$("#serviceQuantity").value||1,unit:$("#serviceUnit").value.trim()});
 const service=normalizeService({id,type,status:$("#serviceStatus").value,fee:moneyNumber($("#serviceFee").value),paymentStatus:$("#servicePaymentStatus").value,date:$("#serviceDate").value,time:$("#serviceTime").value,note:$("#serviceNote").value.trim(),details,createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()});
 order.services=order.services||[];const i=order.services.findIndex(s=>s.id===id);if(i>=0)order.services[i]=service;else order.services.push(service);syncLegacyFieldsFromServices(order);persist();$("#serviceDialog").close();renderAll();toast("住宿服務已儲存");
});

function paymentStatus(summary,total){
 if(summary.over>0)return '<span class="badge red">異常帳款</span>';
 if(summary.net===0)return '<span class="badge gray">未收款</span>';
 if(summary.net>=Number(total||0))return '<span class="badge green">已結清</span>';
 return `<span class="badge gold">部分收款</span>`;
}
function paymentDetailRows(order){
 const summary=paymentSummary(order);
 const opening=summary.opening>0?`<tr><td>—</td><td>訂單預收訂金</td><td>訂單建立時帶入</td><td>${money(summary.opening)}</td><td><span class="badge green">已納入</span></td></tr>`:"";
 const serviceRows=(Array.isArray(order.services)?order.services:[]).filter(service=>service&&service.status!=="已取消"&&Number(service.fee||0)>0).map(service=>`<tr><td>${esc(service.date||"—")}</td><td>住宿服務</td><td>${esc(service.type)}${service.note?`｜${esc(service.note)}`:""}</td><td class="amount-charge">${money(service.fee)}</td><td><span class="badge ${servicePaymentClass(service.paymentStatus)}">${esc(service.paymentStatus)}</span></td></tr>`).join("");
 const records=summary.records.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).map(p=>{
   const detail=p.type==="加收費用" ? `${esc(p.method)}｜${esc(p.category||"其他")}｜${esc(p.description||"未填說明")}` : (p.type==="退款" ? `${esc(p.method)}｜${esc(p.refundReason||"未填原因")}｜${esc(p.description||"未填說明")}` : `${esc(p.method)}${p.description?`｜${esc(p.description)}`:""}`);
   return `<tr><td>${esc(p.date)}</td><td>${esc(p.type)}</td><td>${detail}</td><td class="${p.amount<0?'amount-negative':(p.type==='加收費用'?'amount-charge':'')}">${p.amount<0?'-':''}${money(Math.abs(p.amount))}</td><td>${p.verified?'<span class="badge green">已核帳</span>':'<span class="badge gold">待核帳</span>'}</td></tr>`;
 }).join("");
 return opening+serviceRows+records||'<tr><td colspan="5">尚無收付款紀錄。</td></tr>';
}
function paymentRecordCards(order){
 const summary=paymentSummary(order);const items=[];if(summary.opening>0)items.push(`<div class="payment-record-card"><span>訂單預收訂金</span><strong>${money(summary.opening)}</strong><small>訂單建立時帶入・已納入</small></div>`);
 (Array.isArray(order.services)?order.services:[]).filter(service=>service&&service.status!=="已取消"&&Number(service.fee||0)>0).forEach(service=>items.push(`<div class="payment-record-card"><span>${esc(service.date||"—")}・住宿服務</span><strong>${money(service.fee)}</strong><small>${esc(service.type)}・${esc(service.paymentStatus)}</small></div>`));
 summary.records.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).forEach(p=>{const info=p.type==="加收費用"?`${esc(p.method)}｜${esc(p.category||"其他")}｜${esc(p.description||"")}`:(p.type==="退款"?`${esc(p.method)}｜${esc(p.refundReason||"未填原因")}｜${esc(p.description||"")}`:`${esc(p.method)}${p.description?`｜${esc(p.description)}`:""}`);items.push(`<div class="payment-record-card"><span>${esc(p.date)}・${esc(p.type)}</span><strong class="${p.amount<0?'amount-negative':''}">${p.amount<0?'-':''}${money(Math.abs(p.amount))}</strong><small>${info}・${p.verified?"已核帳":"待核帳"}</small></div>`)});return items.join("")||'<div class="empty">尚無收付款紀錄。</div>';
}
function renderPaymentMobileCards(list){
 const box=$("#paymentMobileList");if(!box)return;
 const query=String($("#paymentSearch")?.value||"").trim();
 box.innerHTML=list.map(o=>{const p=paymentSummary(o);return `<details class="management-mobile-card payment-mobile-card" data-detail-key="payment-${esc(o.id)}" data-accordion-scope="payments-mobile"${query&&list.length===1?" open":""}><summary class="management-mobile-summary"><span class="management-mobile-identity"><strong>${esc(o.name)}</strong><span>${esc(o.id)}・${esc(o.phone)}</span></span><span class="management-mobile-summary-meta"><span>${paymentStatus(p,p.adjustedTotal)}</span><span class="management-expand-label">展開</span></span></summary><div class="management-mobile-body"><div class="payment-mobile-summary"><div><span>原始訂單</span><strong>${money(o.total)}</strong></div><div><span>加收費用</span><strong>+${money(p.additionalCharges)}</strong></div><div><span>最新應收</span><strong>${money(p.adjustedTotal)}</strong></div><div><span>已收淨額</span><strong>${money(p.net)}</strong></div><div><span>已退款</span><strong>${money(p.refunds)}</strong></div><div><span>剩餘應收</span><strong>${money(p.remaining)}</strong></div></div><details class="payment-record-details" data-detail-key="payment-record-${esc(o.id)}"><summary>查看帳務明細</summary><div class="payment-record-list">${paymentRecordCards(o)}</div></details><div class="mobile-card-actions"><button class="primary" onclick="window.openPaymentForOrder('${o.id}')">${uiIcon("wallet")}登記收款／退款</button></div></div></details>`}).join("")||'<div class="empty">沒有符合條件的收款資料。</div>';
 applyStaticIcons(box);
}

window.openPaymentForOrder=id=>{navigate("payments");$("#paymentForm").reset();$("#paymentDate").value=todayISO;renderOrders();$("#paymentOrder").value=id;updatePaymentDialogSummary();$("#paymentDialog").showModal();};
function renderPayments(){
 const q=String($("#paymentSearch")?.value||"").trim().toLocaleLowerCase("zh-TW");
 const sorted=orders.slice().sort((a,b)=>b.checkin.localeCompare(a.checkin));
 const list=q?sorted.filter(o=>{const p=paymentSummary(o);return [o.id,o.name,o.phone,o.checkin,o.checkout,paymentStatus(p,p.adjustedTotal).replace(/<[^>]+>/g,""),...orderRooms(o).map(roomName)].join(" ").toLocaleLowerCase("zh-TW").includes(q)}):sorted;
 const count=$("#paymentResultCount");if(count)count.textContent=`顯示 ${list.length}／${orders.length} 筆`;
 renderPaymentMobileCards(list);
 const rows=list.map(o=>{
   const p=paymentSummary(o);
   return `<tr class="payment-order-row"><td>${esc(o.id)}</td><td>${esc(o.name)}</td><td>${money(o.total)}</td><td>${money(p.additionalCharges)}</td><td>${money(p.adjustedTotal)}</td><td>${money(p.deposit)}</td><td>${money(p.net)}</td><td>${money(p.refunds)}</td><td>${money(p.remaining)}</td><td>${paymentStatus(p,p.adjustedTotal)}</td></tr><tr class="payment-action-row"><td colspan="10"><div class="payment-action-row-inner"><span class="payment-action-label">操作</span><div class="table-actions payment-table-actions"><button type="button" class="compact-button" data-icon="file-text" aria-expanded="false" onclick="window.togglePaymentDetail('${o.id}',this)">查看明細</button><button type="button" class="compact-button" data-icon="wallet" onclick="window.openPaymentForOrder('${o.id}')">登記收款／退款</button></div></div><div id="payment-detail-${o.id}" class="payment-detail-wrap hidden"><div class="payment-summary-inline"><span>原始訂單<strong>${money(o.total)}</strong></span><span>加收費用<strong>+${money(p.additionalCharges)}</strong></span><span>最新應收<strong>${money(p.adjustedTotal)}</strong></span><span>預收訂金<strong>${money(p.deposit)}</strong></span><span>已收淨額<strong>${money(p.net)}</strong></span><span>已退款<strong>${money(p.refunds)}</strong></span><span>剩餘應收<strong>${money(p.remaining)}</strong></span></div><div class="table-wrap"><table class="payment-detail-table"><thead><tr><th>日期</th><th>類型</th><th>方式／說明</th><th>金額</th><th>核帳</th></tr></thead><tbody>${paymentDetailRows(o)}</tbody></table></div></div></td></tr>`;
 });
 $("#paymentTableBody").innerHTML=rows||'<tr><td colspan="10">尚無訂單。</td></tr>';
 applyStaticIcons($("#payments"));
}

window.togglePaymentDetail=(id,button)=>{const box=document.getElementById(`payment-detail-${id}`);if(!box)return;const opening=box.classList.contains("hidden");box.classList.toggle("hidden",!opening);if(opening)openPaymentDetailState.add(id);else openPaymentDetailState.delete(id);if(button){button.textContent=opening?"收合明細":"查看明細";button.setAttribute("aria-expanded",opening?"true":"false");applyStaticIcons(button.parentElement);}};
function updatePaymentTypeFields(){
 const type=$("#paymentType").value;
 const isCharge=type==="加收費用";
 const isRefund=type==="退款";
 $("#additionalChargeFields")?.classList.toggle("hidden",!isCharge);
 $("#refundFields")?.classList.toggle("hidden",!isRefund);
 $("#receiptNoteFields")?.classList.toggle("hidden",isCharge||isRefund);
 $("#paymentCategory").required=isCharge;
 $("#paymentDescription").required=isCharge;
 $("#refundReason").required=isRefund;
 $("#refundDescription").required=isRefund;
 $("#paymentMethod").disabled=false;
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
 const refundReason=$("#refundReason").value.trim();
 const description=type==="加收費用"?$("#paymentDescription").value.trim():(type==="退款"?$("#refundDescription").value.trim():$("#paymentNote").value.trim());
 if(!order)return toast("找不到指定訂單");
 if(raw<=0)return toast(type==="加收費用"?"加收金額必須大於 0":"收款金額必須大於 0");
 const summary=paymentSummary(order);
 if(type==="加收費用"){
   if(!category)return toast("請選擇加收費用分類");
   if(description.length<2)return toast("請填寫至少 2 個字的加收費用說明");
 }else if(type==="退款"){
   if(!refundReason)return toast("請選擇退款原因");
   if(description.length<2)return toast("請填寫至少 2 個字的退款說明");
 }else if(raw>summary.remaining){
   return toast(`本次收款超過剩餘應收，最多可收 ${money(summary.remaining)}`);
 }
 if(type==="退款" && raw>summary.net)return toast(`退款超過目前已收淨額，最多可退 ${money(summary.net)}`);
 const duplicate=payments.some(p=>p.orderId===id&&p.date===date&&p.type===type&&Math.abs(p.amount)===raw&&p.method===method&&(type==="加收費用" ? p.category===category&&p.description===description : (type==="退款" ? p.refundReason===refundReason&&p.description===description : p.description===description)));
 if(duplicate)return toast(type==="加收費用"?"偵測到相同加收費用，已阻止重複建立":"偵測到相同收付款紀錄，已阻止重複入帳");
 const amount=type==="退款"?-raw:raw;
 payments.push(normalizePayment({id:uid("P"),date,orderId:id,type,method,amount,category,refundReason,description,verified:$("#paymentVerified").value==="true",createdAt:new Date().toISOString(),operator:"管理員"}));
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
 if(roomTasks.some(t=>t.status==="待檢查"))return "待檢查";
 if(roomTasks.some(t=>["清掃中","已暫停"].includes(t.status)))return "清掃中";
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
function nextArrivalForRoom(room,date){
 return activeOrders().filter(o=>orderRooms(o).includes(room)&&o.checkin>=date&&lifecycleStatus(o)!=="已退房").sort((a,b)=>a.checkin.localeCompare(b.checkin))[0]||null;
}
function housekeepingUrgency(t){
 const next=nextArrivalForRoom(t.room,t.date); if(!next)return {label:t.priority||"一般",cls:t.priority==="高"?"red":"gray",next:"無近期入住"};
 const same=next.checkin<=todayISO; return {label:same?"急件":(t.priority||"一般"),cls:same?"red":"gold",next:`下次入住：${next.checkin} ${settings.checkinTime||"15:00"}・${next.name}`};
}
function renderTasks(){
 const linked=linkedHousekeepingTasks();
 const statuses=roomMaster.map(r=>({room:r,status:roomOperationalStatus(r.id)}));
 const count=status=>statuses.filter(x=>x.status===status).length;
 $("#hkOccupied").textContent=count("入住中"); $("#hkPending").textContent=count("待清掃"); $("#hkCleaning").textContent=count("清掃中");
 if($("#hkInspect"))$("#hkInspect").textContent=count("待檢查"); $("#hkReady").textContent=count("可入住");
 $("#roomStatusGrid").innerHTML=statuses.map(x=>`<article class="room-status-card status-${x.status}"><strong>${esc(x.room.name)}</strong><span>${x.status}</span></article>`).join("");
 const renderActiveCard=t=>{
   const o=orders.find(x=>x.id===t.orderId),checkoutTime=t.scheduledCheckout||o?.lateCheckout||settings.checkoutTime||"11:00",u=housekeepingUrgency(t);
   let action="";
   if(t.status==="待清掃")action=`<button class="primary" onclick="window.advanceTask('${t.id}')">${uiIcon("play")}開始清掃</button>`;
   if(t.status==="清掃中")action=`<button onclick="window.pauseTask('${t.id}')">暫停</button><button class="primary" onclick="window.advanceTask('${t.id}')">${uiIcon("check")}送交檢查</button>`;
   if(t.status==="已暫停")action=`<button class="primary" onclick="window.advanceTask('${t.id}')">${uiIcon("play")}繼續清掃</button>`;
   if(t.status==="待檢查")action=`<button class="primary" onclick="window.advanceTask('${t.id}')">${uiIcon("check")}主管確認</button>`;
   return `<article class="task-card housekeeping-record compact-housekeeping-card"><div class="task-card-head"><div><strong>${esc(roomName(t.room))}</strong><span class="task-order-id">${esc(t.orderId)}・${esc(t.guest||o?.name||"未命名旅客")}</span></div><span class="badge ${t.status==="待清掃"?"gold":"gray"}">${esc(t.status)}</span></div><div class="housekeeping-meta compact"><span>退房 ${esc(t.date)} ${esc(checkoutTime)}</span><span>${esc(t.assignee||"尚未指派")}</span><span>${esc(u.next)}</span></div><div class="housekeeping-inline-footer"><span class="badge ${u.cls}">${esc(u.label)}</span><div class="task-actions">${action}<button onclick="window.editTask('${t.id}')">${uiIcon("edit")}編輯</button></div></div></article>`;
 };
 const activeGroups=[["待清掃",["待清掃"]],["進行中",["清掃中","已暫停"]],["待檢查",["待檢查"]]];
 const activeHtml=activeGroups.map(([g,sts])=>`<div class="task-column"><h4>${g}<span>${linked.filter(t=>sts.includes(t.status)).length}</span></h4>${linked.filter(t=>sts.includes(t.status)).sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(renderActiveCard).join("")||"<small>目前沒有房務工作</small>"}</div>`).join("");
 const completed=linked.filter(t=>t.status==="已完成").sort((a,b)=>String(b.completedAt||"").localeCompare(String(a.completedAt||"")));
 const completedHtml=`<section class="housekeeping-completed"><div class="housekeeping-completed-head"><h4>已完成 <span>${completed.length}</span></h4><small>以緊湊清單顯示，避免卡片向下過長</small></div><div class="housekeeping-completed-list">${completed.map(t=>{const o=orders.find(x=>x.id===t.orderId);return `<article><strong>${esc(roomName(t.room))}</strong><span>${esc(t.guest||o?.name||"未命名旅客")}</span><span>${esc(t.date)}</span><span>${esc(t.assignee||"尚未指派")}</span><span>${formatRecordTime(t.completedAt)}</span><button onclick="window.editTask('${t.id}')">${uiIcon("edit")}編輯</button></article>`;}).join("")||'<div class="empty">尚無已完成房務紀錄。</div>'}</div></section>`;
 $("#taskBoard").innerHTML=`<div class="housekeeping-active-board">${activeHtml}</div>${completedHtml}`;
}
window.pauseTask=id=>{const t=tasks.find(x=>x.id===id);if(!t||t.status!=="清掃中")return;t.status="已暫停";t.pausedAt=new Date().toISOString();persist();renderAll();toast("房務工作已暫停");};
window.advanceTask=id=>{
 const t=tasks.find(x=>x.id===id); if(!t||!t.orderId)return; const linkedOrder=orders.find(o=>o.id===t.orderId);
 if(["待清掃","已暫停"].includes(t.status)){t.status="清掃中";if(linkedOrder)linkedOrder.workflowStatus="清掃中";if(!t.startedAt)t.startedAt=new Date().toISOString();persist();renderAll();toast(t.pausedAt?"已繼續清掃":"已開始清掃");return;}
 if(t.status==="清掃中"){t.status="待檢查";if(linkedOrder)linkedOrder.workflowStatus="待檢查";t.inspectedAt=new Date().toISOString();persist();renderAll();toast("已送交主管檢查");return;}
 if(t.status==="待檢查"){if(!confirm(`確認 ${roomName(t.room)} 已通過檢查並可入住？`))return;t.status="已完成";if(linkedOrder)linkedOrder.workflowStatus="可入住";t.completedAt=new Date().toISOString();persist();renderAll();toast("房務完成，房間已恢復可入住");}
};
window.editTask=id=>{const t=tasks.find(x=>x.id===id);if(!t||!t.orderId)return;const o=orders.find(x=>x.id===t.orderId);$("#taskForm").dataset.editId=id;$("#taskDate").value=t.date;$("#taskRoomLabel").value=roomName(t.room);$("#taskGuest").value=t.guest||o?.name||"";$("#taskCheckout").value=t.scheduledCheckout||o?.lateCheckout||settings.checkoutTime||"11:00";$("#taskStatus").value=t.status;$("#taskAssignee").value=t.assignee||"";if($("#taskPriority"))$("#taskPriority").value=t.priority||"一般";$("#taskStarted").value=formatRecordTime(t.startedAt);$("#taskCompleted").value=formatRecordTime(t.completedAt);$("#taskNote").value=t.note||"";$("#taskDialog").showModal();};
$("#taskForm").addEventListener("submit",e=>{e.preventDefault();const t=tasks.find(x=>x.id===e.currentTarget.dataset.editId);if(!t||!t.orderId)return;const previous=t.status;t.status=$("#taskStatus").value;t.assignee=$("#taskAssignee").value.trim();t.priority=$("#taskPriority")?$("#taskPriority").value:"一般";t.note=$("#taskNote").value.trim();if(t.status==="清掃中"&&!t.startedAt)t.startedAt=new Date().toISOString();if(t.status==="待檢查"&&!t.inspectedAt)t.inspectedAt=new Date().toISOString();if(t.status==="已完成"&&!t.completedAt)t.completedAt=new Date().toISOString();if(t.status==="待清掃"){t.startedAt="";t.pausedAt="";t.inspectedAt="";t.completedAt="";}if(previous==="已完成"&&t.status!=="已完成")t.completedAt="";delete e.currentTarget.dataset.editId;persist();$("#taskDialog").close();renderAll();toast("房務紀錄已更新");});

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
 if(mobile)mobile.innerHTML=guests.map((g,index)=>`<details class="guest-mobile-card" data-detail-key="guest-${esc(g.phone)}" data-accordion-scope="guests-mobile"${query&&guests.length===1?" open":""}><summary class="guest-mobile-summary"><span class="guest-mobile-identity"><strong>${esc(g.name)}</strong><span>${esc(g.phone)}</span></span><span class="guest-mobile-summary-meta"><span>${esc(g.last||"尚無日期")}</span><span class="guest-expand-label" aria-hidden="true">展開</span></span></summary><div class="guest-mobile-body"><dl><div><dt>LINE</dt><dd>${esc(g.line||"-")}</dd></div><div><dt>E-mail</dt><dd>${esc(g.email||"-")}</dd></div><div><dt>入住次數</dt><dd>${g.count}</dd></div><div><dt>累計消費</dt><dd>${money(g.total)}</dd></div><div><dt>最近入住</dt><dd>${esc(g.last||"-")}</dd></div><div><dt>車牌</dt><dd>${esc(g.plate||"-")}</dd></div><div><dt>寵物資料</dt><dd>${esc(g.pet||"-")}</dd></div><div class="wide"><dt>備註</dt><dd>${esc(g.note||"-")}</dd></div></dl><button class="guest-edit-btn guest-mobile-edit" onclick="window.editGuest('${esc(g.phone)}')">${uiIcon("edit")}編輯旅客</button></div></details>`).join("")||`<div class="empty">${query?"找不到符合條件的旅客資料。":"尚無旅客資料。"}</div>`;
}
window.editGuest=phone=>{const g=buildGuestMap()[phone];$("#guestOriginalPhone").value=phone;$("#profileName").value=g.name||"";$("#profilePhone").value=g.phone||"";$("#profileLine").value=g.line||"";$("#profileEmail").value=g.email||"";$("#profilePlate").value=g.plate||"";$("#profilePet").value=g.pet||"";$("#profileNote").value=g.note||"";$("#guestDialog").showModal();};
$("#guestForm").addEventListener("submit",e=>{e.preventDefault();const old=$("#guestOriginalPhone").value,phone=$("#profilePhone").value.trim(),p={name:$("#profileName").value.trim(),phone,line:$("#profileLine").value.trim(),email:$("#profileEmail").value.trim(),plate:$("#profilePlate").value.trim(),pet:$("#profilePet").value.trim(),note:$("#profileNote").value.trim()};orders.forEach(o=>{if(o.phone===old){o.phone=phone;o.name=p.name;}});delete guestProfiles[old];guestProfiles[phone]=p;persist();$("#guestDialog").close();renderAll();toast("旅客資料已更新");});

function templatePreviewOrder(){
 const id=$("#templateOrderSelect")?.value;
 return orders.find(o=>o.id===id)||activeOrders().sort((a,b)=>a.checkin.localeCompare(b.checkin))[0]||orders[0]||null;
}
function templateVariablesFor(order){
 const o=order||{};
 const rooms=orderRooms(o).map(roomName).join("、");
 return {
   "旅客姓名":o.name,"聯絡電話":o.phone,"訂單編號":o.id,"住宿單位":rooms,"入住日期":o.checkin,"退房日期":o.checkout,"備註":o.note,
   "早餐日期":o.breakfast?.date,"早餐店":o.breakfast?.shop,"早餐份數":o.breakfast?.qty?`${o.breakfast.qty} 份`:"","送餐天數":o.breakfast?.days,"送餐金額":o.breakfast?.fee?money(o.breakfast.fee):"NT$0","送達時間":o.breakfast?.delivery,
   "叫車日期":o.taxi?.date,"叫車時間":o.taxi?.time,"上車地點":o.taxi?.pickup,"目的地":o.taxi?.destination,"乘車人數":o.taxi?.guests?`${o.taxi.guests} 人`:"","人數":o.taxi?.guests?`${o.taxi.guests} 人`:"","車型":o.taxi?.type,"預估車資":o.taxi?.fare?money(o.taxi.fare):"","車資":o.taxi?.fare?money(o.taxi.fare):""
 };
}
function applyTemplateVariables(content,order=templatePreviewOrder()){
 const vars=templateVariablesFor(order);
 return String(content||"").replace(/\{\{([^{}]+)\}\}/g,(full,key)=>{
   const value=vars[String(key).trim()];
   return value===undefined||value===null||String(value).trim()===""?TEMPLATE_MISSING_VALUE:String(value);
 });
}
function preferredTemplateVariableGroup(){
 const name=String(selectedTemplate||"");
 if(name.includes("早餐"))return "早餐通知";
 if(name.includes("叫車"))return "叫車通知";
 return "旅客與訂單";
}
function insertTemplateVariable(btn){
 const input=$("#templateContent"),token=`{{${btn.dataset.variable}}}`;
 if(!input)return;
 const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;
 input.setRangeText(token,start,end,"end");
 input.focus();renderTemplatePreview();
 btn.classList.remove("inserted");void btn.offsetWidth;btn.classList.add("inserted");
 window.setTimeout(()=>btn.classList.remove("inserted"),650);
}
function renderTemplateVariablePanel(){
 const panel=$("#templateVariablePanel");if(!panel)return;
 const search=$("#templateVariableSearch");
 const query=String(search?.value||"").trim().toLocaleLowerCase("zh-TW");
 const preferred=preferredTemplateVariableGroup();
 const common=TEMPLATE_COMMON_VARIABLES[preferred]||TEMPLATE_COMMON_VARIABLES["旅客與訂單"];
 const matches=name=>!query||String(name).toLocaleLowerCase("zh-TW").includes(query);
 const commonMatches=common.filter(matches);
 const commonHtml=commonMatches.length?`<details class="template-variable-group template-common-variables" data-detail-key="template-vars-common" data-accordion-scope="template-variables"${query?' open':''}><summary>常用變數<span>${commonMatches.length} 個</span></summary><div class="template-variable-buttons">${commonMatches.map(name=>`<button type="button" class="template-variable-btn template-variable-common" data-variable="${esc(name)}">{{${esc(name)}}}</button>`).join("")}</div></details>`:"";
 const groups=Object.entries(TEMPLATE_VARIABLE_GROUPS).map(([group,names])=>{const filtered=names.filter(matches);if(!filtered.length)return "";return `<details class="template-variable-group" data-detail-key="template-vars-${esc(group)}" data-accordion-scope="template-variables"${query?' open':''}><summary>${esc(group)}<span>${filtered.length} 個變數</span></summary><div class="template-variable-buttons">${filtered.map(name=>`<button type="button" class="template-variable-btn" data-variable="${esc(name)}">{{${esc(name)}}}</button>`).join("")}</div></details>`;}).join("");
 panel.innerHTML=(commonHtml+groups)||'<div class="template-variable-empty">找不到符合條件的變數。</div>';
 $$(".template-variable-btn",panel).forEach(btn=>btn.onclick=()=>insertTemplateVariable(btn));
 if(search&&!search.dataset.bound){search.dataset.bound="1";search.addEventListener("input",renderTemplateVariablePanel);}
}
function renderTemplateOrderOptions(){
 const select=$("#templateOrderSelect");if(!select)return;const current=select.value;
 const list=[...orders].sort((a,b)=>String(b.checkin).localeCompare(String(a.checkin)));
 select.innerHTML=list.map(o=>`<option value="${esc(o.id)}">${esc(o.id)}｜${esc(o.name)}｜${esc(o.checkin)}</option>`).join("")||'<option value="">尚無訂單資料</option>';
 if(list.some(o=>o.id===current))select.value=current;
}
function renderTemplatePreview(){
 const preview=$("#templatePreview");if(!preview)return;
 preview.textContent=applyTemplateVariables($("#templateContent")?.value||"");
}
function selectTemplate(name){
 if(!templates[name])return;
 selectedTemplate=name;
 $("#templateTitle").textContent=name;
 $("#templateContent").value=templates[name];
 $$(".template-item").forEach(el=>el.classList.toggle("active",el.dataset.template===name));
 renderTemplateVariablePanel();
 renderTemplatePreview();
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
 renderTemplateOrderOptions();
 renderTemplateVariablePanel();
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


function notificationKey(parts){return parts.map(x=>String(x??"").trim()).join("|");}
function notificationStatus(key){return notificationState[key]?.status||"unread";}
function notificationTimeValue(date,time="00:00"){const d=new Date(`${date||todayISO}T${time||"00:00"}:00`);return Number.isFinite(d.getTime())?d.getTime():Date.now();}
function localISODate(value){const d=value instanceof Date?value:new Date(value);if(!Number.isFinite(d.getTime()))return "";const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return `${y}-${m}-${day}`;}
function buildNotifications(){
 const list=[],now=Date.now(),todayEnd=notificationTimeValue(todayISO,"23:59");
 const retentionCutoff=now-Number(settings.notificationRetentionDays||60)*DAY;
 const push=n=>{const key=n.key;if(!key)return;const state=notificationState[key]||{},status=state.status||"unread",closedAt=new Date(state.completedAt||state.ignoredAt||0).getTime();if(["completed","ignored"].includes(status)&&Number.isFinite(closedAt)&&closedAt>0&&closedAt<retentionCutoff)return;list.push({...n,status,readAt:state.readAt||"",completedAt:state.completedAt||"",ignoredAt:state.ignoredAt||"",createdAt:n.createdAt||new Date().toISOString()});};
 activeOrders().forEach(o=>{
  const life=lifecycleStatus(o),p=paymentSummary(o);
  if(o.checkin===todayISO&&!['已入住','已退房'].includes(life))push({key:notificationKey(['order-checkin',o.id,o.checkin]),type:'訂單',priority:'high',title:'今日入住待處理',detail:`${o.name}・${orderRooms(o).map(roomName).join('、')}`,orderId:o.id,room:orderRooms(o)[0]||'',targetPage:'checkin',eventAt:notificationTimeValue(o.checkin,settings.checkinTime)});
  if(o.checkout===todayISO&&life==='已入住')push({key:notificationKey(['order-checkout',o.id,o.checkout]),type:'訂單',priority:'high',title:'今日退房待處理',detail:`${o.name}・退房 ${settings.checkoutTime}`,orderId:o.id,room:orderRooms(o)[0]||'',targetPage:'checkin',eventAt:notificationTimeValue(o.checkout,settings.checkoutTime)});
  if(p.remaining>0&&o.checkin>=todayISO){const urgent=o.checkin<=addDays(todayISO,1);push({key:notificationKey(['payment-due',o.id,p.remaining]),type:'帳務',priority:urgent?'critical':'high',title:'訂單尚有待收款',detail:`${o.name}・未收 ${money(p.remaining)}・入住 ${o.checkin}`,orderId:o.id,targetPage:'payments',eventAt:notificationTimeValue(o.checkin,settings.checkinTime)});}
  (o.services||[]).filter(s=>s.status!=='已完成').forEach(s=>{if(!s.date)return;let mins=s.type==='早餐代訂'?Number(settings.notificationBreakfastReminderMinutes||30):s.type==='接送／叫車'?Number(settings.notificationTaxiReminderMinutes||60):0;let at=notificationTimeValue(s.date,s.time||'09:00')-mins*60000;if(at<=todayEnd&&notificationTimeValue(s.date,s.time||'09:00')>=notificationTimeValue(addDays(todayISO,-1),'00:00'))push({key:notificationKey(['service',o.id,s.id,s.date,s.time]),type:'住宿服務',priority:s.date<todayISO?'critical':s.date===todayISO?'high':'normal',title:`${s.type}待處理`,detail:`${o.name}・${s.date}${s.time?' '+s.time:''}`,orderId:o.id,targetPage:'services',eventAt:at});});
 });
 tasks.filter(t=>t.status!=='已完成').forEach(t=>{const start=notificationTimeValue(t.date,t.scheduledCheckout||settings.checkoutTime);const overdue=now>start+Number(settings.notificationHousekeepingOverdueMinutes||120)*60000;push({key:notificationKey(['housekeeping',t.id,t.status]),type:'房務',priority:overdue?'critical':t.date===todayISO?'high':'normal',title:overdue?'房務工作已逾時':`${t.status}房務工作`,detail:`${roomName(t.room)}・${t.guest||''}${t.assignee?'・'+t.assignee:''}`,orderId:t.orderId||'',room:t.room||'',targetPage:'housekeeping',eventAt:start});});
 payments.filter(p=>p.type==='退款'&&Math.abs(Number(p.amount)||0)>=Number(settings.notificationLargeRefundThreshold||10000)).forEach(p=>push({key:notificationKey(['large-refund',p.id,p.amount]),type:'帳務',priority:'critical',title:'大額退款提醒',detail:`${p.orderId}・${money(Math.abs(Number(p.amount)||0))}・${p.refundReason||'未填原因'}`,orderId:p.orderId,targetPage:'payments',eventAt:notificationTimeValue(p.date,'12:00')}));
 const cutoff=Date.now()-Number(settings.notificationAutoClearDays||90)*DAY;Object.keys(notificationState).forEach(k=>{const s=notificationState[k];if(['completed','ignored'].includes(s.status)&&new Date(s.completedAt||s.ignoredAt||0).getTime()<cutoff)delete notificationState[k];});
 return list.sort((a,b)=>(({critical:0,high:1,normal:2,low:3}[a.priority])-({critical:0,high:1,normal:2,low:3}[b.priority]))||(a.eventAt-b.eventAt));
}
function notificationLabel(status){return ({unread:'未讀',read:'已讀',completed:'已完成',ignored:'已忽略'}[status]||status);}
function notificationCardHtml(n,compact=false){const when=new Date(n.eventAt).toLocaleString('zh-TW',{hour12:false});if(compact)return `<article class="notification-card compact priority-${n.priority} status-${n.status}"><div class="notification-card-head"><div><span class="badge ${n.priority==='critical'?'red':n.priority==='high'?'gold':n.priority==='normal'?'green':'gray'}">${esc(n.priority.toUpperCase())}</span><span class="badge gray">${esc(n.type)}</span></div><time>${esc(when)}</time></div><h4>${esc(n.title)}</h4><p>${esc(n.detail)}</p></article>`;return `<details class="notification-card priority-${n.priority} status-${n.status}" data-detail-key="notification-${esc(n.key)}" data-accordion-scope="notifications"><summary><div class="notification-card-head"><div><span class="badge ${n.priority==='critical'?'red':n.priority==='high'?'gold':n.priority==='normal'?'green':'gray'}">${esc(n.priority.toUpperCase())}</span><span class="badge gray">${esc(n.type)}</span></div><time>${esc(when)}</time></div><h4>${esc(n.title)}</h4><div class="notification-meta"><span>${esc(notificationLabel(n.status))}</span>${n.orderId?`<span>${esc(n.orderId)}</span>`:''}<span class="management-expand-label">展開</span></div></summary><div class="notification-card-body"><p>${esc(n.detail)}</p><div class="notification-actions"><button onclick="window.openNotificationTarget('${esc(n.key)}')">前往處理</button>${n.status==='unread'?`<button onclick="window.setNotificationStatus('${esc(n.key)}','read')">標示已讀</button>`:`<button onclick="window.setNotificationStatus('${esc(n.key)}','unread')">返回未讀</button>`}<button onclick="window.setNotificationStatus('${esc(n.key)}','completed')">完成</button><button onclick="window.setNotificationStatus('${esc(n.key)}','ignored')">忽略</button></div></div></details>`;}
function renderNotifications(){notifications=buildNotifications();const q=String($('#notificationSearch')?.value||'').trim().toLowerCase(),st=$('#notificationStatusFilter')?.value||'',type=$('#notificationTypeFilter')?.value||'',pri=$('#notificationPriorityFilter')?.value||'';const filtered=notifications.filter(n=>(!st||n.status===st)&&(!type||n.type===type)&&(!pri||n.priority===pri)&&(!q||[n.title,n.detail,n.orderId,n.room,n.type].join(' ').toLowerCase().includes(q)));const unread=notifications.filter(n=>n.status==='unread');if($('#notificationUnreadCount'))$('#notificationUnreadCount').textContent=unread.length;if($('#notificationCriticalCount'))$('#notificationCriticalCount').textContent=notifications.filter(n=>n.priority==='critical'&&n.status==='unread').length;if($('#notificationTodayCount'))$('#notificationTodayCount').textContent=notifications.filter(n=>localISODate(n.eventAt)===todayISO).length;if($('#notificationTotalCount'))$('#notificationTotalCount').textContent=notifications.length;if($('#notificationResultCount'))$('#notificationResultCount').textContent=`顯示 ${filtered.length}／${notifications.length} 則`;if($('#notificationList'))$('#notificationList').innerHTML=filtered.map(n=>notificationCardHtml(n)).join('')||'<div class="empty">沒有符合條件的通知。</div>';const badge=$('#navNotificationBadge');if(badge){badge.textContent=unread.length;badge.classList.toggle('hidden',!unread.length);}renderNotificationDashboard();}
function renderNotificationDashboard(){notifications=buildNotifications();const active=notifications.filter(n=>!['completed','ignored'].includes(n.status));const groups=[['critical','緊急'],['high','重要'],['normal','一般'],['unread','未讀']];if($('#dashboardNotificationSummary'))$('#dashboardNotificationSummary').innerHTML=groups.map(([k,label])=>`<button data-notification-filter="${k}"><span>${label}</span><strong>${k==='unread'?active.filter(n=>n.status==='unread').length:active.filter(n=>n.priority===k).length}</strong></button>`).join('');if($('#dashboardRecentNotifications'))$('#dashboardRecentNotifications').innerHTML=active.slice(0,5).map(n=>notificationCardHtml(n,true)).join('')||'<div class="empty">目前沒有待處理通知。</div>';$$('[data-notification-filter]').forEach(b=>b.onclick=()=>{navigate('notifications');const v=b.dataset.notificationFilter;if(v==='unread')$('#notificationStatusFilter').value='unread';else $('#notificationPriorityFilter').value=v;renderNotifications();});}
window.setNotificationStatus=(key,status)=>{const now=new Date().toISOString();notificationState[key]={...(notificationState[key]||{}),status,[status==='read'?'readAt':status==='completed'?'completedAt':status==='ignored'?'ignoredAt':'updatedAt']:now};auditLogs.push({id:uid('A'),time:now,operator:'系統／目前使用者',module:'通知',action:`通知${notificationLabel(status)}`,targetId:key,orderId:notifications.find(n=>n.key===key)?.orderId||'',room:notifications.find(n=>n.key===key)?.room||'',guest:'',summary:`通知狀態變更為${notificationLabel(status)}`,before:null,after:{status}});persist();renderAll();};
window.openNotificationTarget=key=>{const n=notifications.find(x=>x.key===key);if(!n)return;window.setNotificationStatus(key,'read');navigate(n.targetPage||'notifications');if(n.targetPage==='payments'&&n.orderId){const q=$('#paymentSearch');if(q)q.value=n.orderId;renderPayments();}if(n.targetPage==='services'&&n.orderId){const q=$('#serviceSearch');if(q)q.value=n.orderId;renderServices();}};
function saveNotificationSettings(){settings.notificationLargeRefundThreshold=Math.max(0,Number($('#settingLargeRefundThreshold').value)||0);settings.notificationHousekeepingOverdueMinutes=Math.max(0,Number($('#settingHousekeepingOverdueMinutes').value)||0);settings.notificationBreakfastReminderMinutes=Math.max(0,Number($('#settingBreakfastReminderMinutes').value)||0);settings.notificationTaxiReminderMinutes=Math.max(0,Number($('#settingTaxiReminderMinutes').value)||0);settings.notificationRetentionDays=Math.max(1,Number($('#settingNotificationRetentionDays').value)||60);settings.notificationAutoClearDays=Math.max(1,Number($('#settingNotificationAutoClearDays').value)||90);persist();renderAll();toast('通知設定已儲存');}

function auditTechnicalDetails(a){
 const fields=auditChangedFields(a.before,a.after);
 if(a.action==="建立")return `建立資料：${JSON.stringify(a.after||{},null,2)}`;
 if(a.action==="刪除")return `刪除資料：${JSON.stringify(a.before||{},null,2)}`;
 return fields.length?fields.map(k=>`${k}: ${JSON.stringify(a.before?.[k])} → ${JSON.stringify(a.after?.[k])}`).join("\n"):String(a.summary||"內容已更新");
}
function auditReadableSummary(a){
 const generated=auditSummary(a.action,a.before,a.after,a.module);
 return (!a.summary||a.summary==="新增資料"||a.summary==="刪除資料"||/^[a-zA-Z][\w]*：/.test(a.summary))?generated:a.summary;
}
function auditRecordHtml(a,compact=false){
 const when=new Date(a.time).toLocaleString("zh-TW",{hour12:false});
 const target=[a.orderId,a.room?roomName(a.room):"",a.guest].filter(Boolean).join("・")||a.targetId||"系統";
 const technical=auditTechnicalDetails(a);
 return `<article class="audit-record${compact?" compact":""}"><span class="badge ${a.module==="帳務"?"gold":a.module==="房務"?"green":"gray"}">${esc(a.module)}</span><strong>${esc(a.action)}｜${esc(target)}</strong><span class="audit-summary">${esc(auditReadableSummary(a))}</span><small>${esc(a.operator||"系統")}</small><time>${esc(when)}</time>${compact?"":`<details class="audit-technical"><summary>查看技術明細</summary><pre>${esc(technical)}</pre></details>`}</article>`;
}
function auditGroupKey(a){return a.orderId?`order:${a.orderId}`:`other:${a.module}:${a.targetId||a.id}`;}
function auditGroupTitle(group){
 const first=group.records[0],orderId=first.orderId||"非訂單紀錄";
 const order=orders.find(o=>String(o.id)===String(first.orderId));
 const guest=order?.name||first.guest||"";
 return `${orderId}${guest?`｜${guest}`:""}`;
}
function auditGroupHtml(group,open=false){
 const latest=group.records[0],when=new Date(latest.time).toLocaleString("zh-TW",{hour12:false});
 return `<details class="audit-group" ${open?"open":""}><summary><span class="audit-group-chevron">›</span><strong>${esc(auditGroupTitle(group))}</strong><span class="audit-group-count">共 ${group.records.length} 筆異動</span><time>${esc(when)}</time></summary><div class="audit-group-records">${group.records.map(a=>auditRecordHtml(a)).join("")}</div></details>`;
}
let auditVisibleLimit=20;
function setAuditQuickFilter(mode){const module=$("#auditModuleFilter"),from=$("#auditDateFrom"),to=$("#auditDateTo");if(module)module.value=mode==="finance"?"帳務":mode==="housekeeping"?"房務":"";if(from)from.value=mode==="all"?"":todayISO;if(to)to.value=mode==="all"?"":todayISO;auditVisibleLimit=20;renderAudit();}
function renderAudit(){
 const list=[...auditLogs].reverse(),q=String($("#auditSearch")?.value||"").trim().toLowerCase(),module=$("#auditModuleFilter")?.value||"",from=$("#auditDateFrom")?.value||"",to=$("#auditDateTo")?.value||"";
 const filtered=list.filter(a=>(!module||a.module===module)&&(!from||String(a.time).slice(0,10)>=from)&&(!to||String(a.time).slice(0,10)<=to)&&(!q||[a.module,a.action,a.targetId,a.orderId,a.room,a.guest,a.operator,a.summary,auditReadableSummary(a)].join(" ").toLowerCase().includes(q)));
 const groupMap=new Map();filtered.forEach(a=>{const key=auditGroupKey(a);if(!groupMap.has(key))groupMap.set(key,{key,records:[]});groupMap.get(key).records.push(a);});
 const groups=[...groupMap.values()].sort((a,b)=>String(b.records[0]?.time||"").localeCompare(String(a.records[0]?.time||"")));
 const shown=groups.slice(0,auditVisibleLimit),today=auditLogs.filter(x=>String(x.time).slice(0,10)===todayISO);
 if($("#auditTodayCount"))$("#auditTodayCount").textContent=today.length;if($("#auditFinanceCount"))$("#auditFinanceCount").textContent=today.filter(x=>x.module==="帳務").length;if($("#auditHousekeepingCount"))$("#auditHousekeepingCount").textContent=today.filter(x=>x.module==="房務").length;if($("#auditTotalCount"))$("#auditTotalCount").textContent=auditLogs.length;
 if($("#auditResultCount"))$("#auditResultCount").textContent=`已載入 ${shown.length}／共 ${groups.length} 個群組（${filtered.length} 筆）`;
 const autoOpen=groups.length===1||Boolean(q);
 if($("#auditList"))$("#auditList").innerHTML=(shown.map(g=>auditGroupHtml(g,autoOpen)).join("")||'<div class="empty">沒有符合條件的稽核紀錄。</div>')+(shown.length<groups.length?`<button id="loadMoreAudit" class="load-more-audit">載入更多（尚有 ${groups.length-shown.length} 個群組）</button>`:"");
 $("#loadMoreAudit")?.addEventListener("click",()=>{auditVisibleLimit+=20;renderAudit();});
}
window.openOrderTimeline=id=>{navigate("audit");const q=$("#auditSearch");if(q)q.value=id;renderAudit();toast(`已顯示 ${id} 的完整時間軸`);};
function exportAuditLog(){const data={version:"Enterprise V1.2 Build 2A RC6 — Release Guard Hotfix 4",schema:STORAGE_SCHEMA_VERSION,exportedAt:new Date().toISOString(),auditLogs};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`Meiyuan6_Audit_Log_${todayISO}.json`;a.click();URL.revokeObjectURL(a.href);}

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
 const data={version:"Enterprise V1.2 Build 2A RC6 — Release Guard Hotfix 4",schema:STORAGE_SCHEMA_VERSION,exportedAt:new Date().toISOString(),orders,payments,tasks,roomLocks,guestProfiles,settings,shortcuts,templates,auditLogs,notificationState};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`Meiyuan6_PMS_Backup_${todayISO}.json`;a.click();URL.revokeObjectURL(a.href);
}
const BACKUP_REQUIRED_FIELDS=["schema","orders","payments","tasks","roomLocks","guestProfiles","settings","shortcuts","templates","auditLogs","notificationState"];
const STORAGE_KEYS=["my6_schema_version","my6_orders","my6_payments","my6_tasks","my6_guest_profiles","my6_settings","my6_templates","my6_shortcuts","my6_room_locks","my6_audit_logs","my6_notification_state"];
function isPlainObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
function isStrictISODate(value){const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value||""));if(!match)return false;const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);if(year<1||month<1||month>12||day<1)return false;const leap=year%4===0&&(year%100!==0||year%400===0);const days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];return day<=days[month-1];}
function assertUniqueIds(list,label){
 const seen=new Set();
 list.forEach((item,index)=>{const id=String(item?.id||"").trim();if(!id)throw new Error(`${label}第 ${index+1} 筆缺少 id`);if(seen.has(id))throw new Error(`${label}存在重複 id：${id}`);seen.add(id);});
}
function validateBackupData(data){
 if(!isPlainObject(data))throw new Error("備份根節點必須是物件");
 const missing=BACKUP_REQUIRED_FIELDS.filter(key=>!Object.prototype.hasOwnProperty.call(data,key));
 if(missing.length)throw new Error(`備份缺少必要欄位：${missing.join("、")}`);
 if(Number(data.schema)!==STORAGE_SCHEMA_VERSION)throw new Error(`Schema 不相容：需要 v${STORAGE_SCHEMA_VERSION}，檔案為 v${data.schema??"未知"}`);
 for(const key of ["orders","payments","tasks","roomLocks","shortcuts","auditLogs"]){if(!Array.isArray(data[key]))throw new Error(`${key} 必須是陣列`);}
 for(const key of ["guestProfiles","settings","templates","notificationState"]){if(!isPlainObject(data[key]))throw new Error(`${key} 必須是物件`);}
 if(!Object.keys(data.templates).length||Object.values(data.templates).some(value=>typeof value!=="string"))throw new Error("templates 必須包含至少一個文字模板");
 assertUniqueIds(data.orders,"訂單");assertUniqueIds(data.payments,"收付款");assertUniqueIds(data.tasks,"房務任務");assertUniqueIds(data.roomLocks,"房間鎖定");
 const orderIds=new Set(data.orders.map(item=>String(item.id)));
 data.payments.forEach((item,index)=>{const orderId=String(item?.orderId||"").trim();if(!orderIds.has(orderId))throw new Error(`收付款第 ${index+1} 筆指向不存在的訂單：${orderId||"空白"}`);});
 data.tasks.forEach((item,index)=>{const orderId=String(item?.orderId||"").trim();if(!orderIds.has(orderId))throw new Error(`房務任務第 ${index+1} 筆指向不存在的訂單：${orderId||"空白"}`);});
 data.orders.forEach((item,index)=>{if(Array.isArray(item?.services)){assertUniqueIds(item.services,`訂單 ${item.id} 的服務`);}});
 const roomIds=new Set(roomMaster.map(room=>room.id));
 data.roomLocks.forEach((item,index)=>{
  const room=String(item?.room||item?.roomId||"");
  if(!roomIds.has(room))throw new Error(`房間鎖定第 ${index+1} 筆包含未知房號：${room||"空白"}`);
  if(!LOCK_TYPES[item?.type])throw new Error(`房間鎖定第 ${index+1} 筆類型無效`);
  if(!isStrictISODate(item?.start)||!isStrictISODate(item?.end))throw new Error(`房間鎖定第 ${index+1} 筆日期格式無效`);
  if(String(item.start)>String(item.end))throw new Error(`房間鎖定第 ${index+1} 筆結束日期早於開始日期`);
 });
 return true;
}
function captureRuntimeState(){return {orders:structuredClone(orders),payments:structuredClone(payments),tasks:structuredClone(tasks),roomLocks:structuredClone(roomLocks),guestProfiles:structuredClone(guestProfiles),settings:structuredClone(settings),shortcuts:structuredClone(shortcuts),templates:structuredClone(templates),auditLogs:structuredClone(auditLogs),notificationState:structuredClone(notificationState),selectedTemplate,auditRecordingReady};}
function restoreRuntimeState(state){orders=state.orders;payments=state.payments;tasks=state.tasks;roomLocks=state.roomLocks;guestProfiles=state.guestProfiles;settings=state.settings;shortcuts=state.shortcuts;templates=state.templates;auditLogs=state.auditLogs;notificationState=state.notificationState;selectedTemplate=state.selectedTemplate;auditRecordingReady=state.auditRecordingReady;}
function captureStorageState(){return Object.fromEntries(STORAGE_KEYS.map(key=>[key,localStorage.getItem(key)]));}
function restoreStorageState(state){Object.entries(state).forEach(([key,value])=>value===null?localStorage.removeItem(key):localStorage.setItem(key,value));}
function createPreImportBackup(){
 const snapshot={version:"Enterprise V1.2 Build 2A RC6 — Data Integrity Hotfix 2",schema:STORAGE_SCHEMA_VERSION,createdAt:new Date().toISOString(),orders,payments,tasks,roomLocks,guestProfiles,settings,shortcuts,templates,auditLogs,notificationState};
 const key=`my6_pre_import_backup_${Date.now()}`;
 localStorage.setItem(key,JSON.stringify(snapshot));
 localStorage.setItem("my6_pre_import_backup_latest",key);
 return key;
}
async function importBackup(file){
 let runtimeBefore=null,storageBefore=null,preImportKey="";
 try{
  const data=JSON.parse(await file.text());
  validateBackupData(data);
  const staged={
   orders:data.orders.map(normalizeOrder),payments:data.payments.map(normalizePayment),tasks:data.tasks.map(normalizeTask),
   roomLocks:data.roomLocks.map(normalizeRoomLock),guestProfiles:structuredClone(data.guestProfiles),settings:{...defaultSettings,...data.settings},
   shortcuts:structuredClone(data.shortcuts),templates:structuredClone(data.templates),auditLogs:structuredClone(data.auditLogs),notificationState:structuredClone(data.notificationState)
  };
  const stagedOrderIds=new Set(staged.orders.map(item=>item.id));
  if(staged.payments.some(item=>!stagedOrderIds.has(item.orderId))||staged.tasks.some(item=>!stagedOrderIds.has(item.orderId)))throw new Error("正規化後跨模組訂單關聯失效");
  runtimeBefore=captureRuntimeState();storageBefore=captureStorageState();preImportKey=createPreImportBackup();
  orders=staged.orders;payments=staged.payments;tasks=staged.tasks;roomLocks=staged.roomLocks;guestProfiles=staged.guestProfiles;settings=staged.settings;shortcuts=staged.shortcuts;templates=staged.templates;auditLogs=staged.auditLogs;notificationState=staged.notificationState;selectedTemplate=Object.keys(templates)[0]||"";
  auditRecordingReady=false;persist();auditRecordingReady=true;
  appendAuditRecord("系統設定","建立","backup-import",null,{operator:"系統／目前使用者",note:`匯入 Schema v${STORAGE_SCHEMA_VERSION} 備份；匯入前快照 ${preImportKey}`});
  localStorage.setItem("my6_audit_logs",JSON.stringify(auditLogs));
  renderAll();toast("備份已安全匯入");
 }catch(error){
  console.error("Backup import failed",error);
  if(runtimeBefore)restoreRuntimeState(runtimeBefore);
  if(storageBefore){try{restoreStorageState(storageBefore);}catch(rollbackError){console.error("Backup rollback failed",rollbackError);}}
  auditRecordingReady=true;
  toast(`備份匯入失敗：${error?.message||"格式錯誤"}`);
 }finally{
  const input=$("#importData");if(input)input.value="";
 }
}


// RC6 Release Guard Hotfix 2 — Enterprise Runtime Integrity Engine
const RELEASE_GUARD_VERSION="RC6 Release Guard Hotfix 2";
const RELEASE_GUARD_SNAPSHOT_PREFIX="my6_release_guard_snapshot_";
let releaseGuardLastResult=null;
function releaseGuardIssue(severity,code,message,detail=""){
 return {severity,code,message,detail:String(detail||"")};
}
function releaseGuardValidDate(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||"")))return false;
 const [y,m,d]=String(value).split("-").map(Number),dt=new Date(Date.UTC(y,m-1,d));
 return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d;
}
function releaseGuardDuplicateIds(list,label,issues){
 const seen=new Set();
 (Array.isArray(list)?list:[]).forEach((item,index)=>{
  const id=String(item?.id||"").trim();
  if(!id)issues.push(releaseGuardIssue("P1",`${label.toUpperCase()}_ID_MISSING`,`${label}缺少 ID`,`index=${index}`));
  else if(seen.has(id))issues.push(releaseGuardIssue("P1",`${label.toUpperCase()}_ID_DUPLICATE`,`${label} ID 重複`,id));
  else seen.add(id);
 });
}
function releaseGuardStorageScan(issues){
 const expected={my6_orders:"array",my6_payments:"array",my6_tasks:"array",my6_room_locks:"array",my6_guest_profiles:"object",my6_settings:"object",my6_templates:"object",my6_shortcuts:"array",my6_audit_logs:"array",my6_notification_state:"object"};
 Object.entries(expected).forEach(([key,type])=>{
  const raw=localStorage.getItem(key);if(raw===null)return;
  try{const value=JSON.parse(raw);const valid=type==="array"?Array.isArray(value):(value&&typeof value==="object"&&!Array.isArray(value));if(!valid)issues.push(releaseGuardIssue("P0","STORAGE_TYPE_INVALID",`${key} 資料型別錯誤`,type));}
  catch(error){issues.push(releaseGuardIssue("P0","STORAGE_JSON_CORRUPT",`${key} JSON 已損壞`,error.message));}
 });
 const schemaRaw=localStorage.getItem("my6_schema_version");
 if(Number(schemaRaw)!==STORAGE_SCHEMA_VERSION)issues.push(releaseGuardIssue("P0","SCHEMA_MISMATCH",`Storage Schema 必須為 v${STORAGE_SCHEMA_VERSION}`,`目前=${schemaRaw??"未設定"}`));
}
function releaseGuardCrossValidate(issues){
 const orderIds=new Set(orders.map(o=>String(o.id)));
 releaseGuardDuplicateIds(orders,"order",issues);releaseGuardDuplicateIds(payments,"payment",issues);releaseGuardDuplicateIds(tasks,"task",issues);releaseGuardDuplicateIds(roomLocks,"roomLock",issues);releaseGuardDuplicateIds(auditLogs,"audit",issues);
 orders.forEach(o=>{
  if(!releaseGuardValidDate(o.checkin)||!releaseGuardValidDate(o.checkout)||o.checkout<=o.checkin)issues.push(releaseGuardIssue("P1","ORDER_DATE_INVALID",`訂單 ${o.id} 入退房日期錯誤`,`${o.checkin} → ${o.checkout}`));
  if(!Array.isArray(o.rooms)||!o.rooms.length)issues.push(releaseGuardIssue("P1","ORDER_ROOM_EMPTY",`訂單 ${o.id} 未指定房間`));
  if(!Number.isFinite(Number(o.total))||Number(o.total)<0||!Number.isFinite(Number(o.paid))||Number(o.paid)<0)issues.push(releaseGuardIssue("P1","ORDER_AMOUNT_INVALID",`訂單 ${o.id} 金額不合法`));
  if(Number(o.paid)>Number(o.total)&&Number(o.total)>0)issues.push(releaseGuardIssue("P2","ORDER_OVERPAID",`訂單 ${o.id} 已收金額高於訂單金額`,`${o.paid}/${o.total}`));
  (Array.isArray(o.services)?o.services:[]).forEach((v,i)=>{if(!Number.isFinite(Number(v.fee))||Number(v.fee)<0)issues.push(releaseGuardIssue("P1","SERVICE_FEE_INVALID",`訂單 ${o.id} 服務費用不合法`,`service=${v.id||i}`));if(v.date&&!releaseGuardValidDate(v.date))issues.push(releaseGuardIssue("P2","SERVICE_DATE_INVALID",`訂單 ${o.id} 服務日期錯誤`,v.date));});
 });
 payments.forEach(p=>{if(!orderIds.has(String(p.orderId||"")))issues.push(releaseGuardIssue("P1","PAYMENT_ORPHAN",`收付款 ${p.id} 找不到關聯訂單`,p.orderId));if(!Number.isFinite(Number(p.amount))||Number(p.amount)<0)issues.push(releaseGuardIssue("P1","PAYMENT_AMOUNT_INVALID",`收付款 ${p.id} 金額不合法`,p.amount));if(p.date&&!releaseGuardValidDate(p.date))issues.push(releaseGuardIssue("P2","PAYMENT_DATE_INVALID",`收付款 ${p.id} 日期錯誤`,p.date));});
 tasks.forEach(t=>{if(t.orderId&&!orderIds.has(String(t.orderId)))issues.push(releaseGuardIssue("P1","TASK_ORPHAN",`房務任務 ${t.id} 找不到關聯訂單`,t.orderId));if(t.date&&!releaseGuardValidDate(t.date))issues.push(releaseGuardIssue("P2","TASK_DATE_INVALID",`房務任務 ${t.id} 日期錯誤`,t.date));});
 roomLocks.forEach(l=>{if(!releaseGuardValidDate(l.start)||!releaseGuardValidDate(l.end)||l.end<l.start)issues.push(releaseGuardIssue("P1","ROOM_LOCK_DATE_INVALID",`房間鎖定 ${l.id} 日期錯誤`,`${l.start} → ${l.end}`));if(!roomMaster.some(r=>r.id===l.room))issues.push(releaseGuardIssue("P1","ROOM_LOCK_ROOM_INVALID",`房間鎖定 ${l.id} 房號不存在`,l.room));});
}
function createReleaseGuardSnapshot(reason="manual"){
 const key=RELEASE_GUARD_SNAPSHOT_PREFIX+Date.now();
 const snapshot={version:RELEASE_GUARD_VERSION,schema:STORAGE_SCHEMA_VERSION,reason,createdAt:new Date().toISOString(),orders,payments,tasks,roomLocks,guestProfiles,settings,shortcuts,templates,auditLogs,notificationState};
 localStorage.setItem(key,JSON.stringify(snapshot));localStorage.setItem("my6_release_guard_snapshot_latest",key);return key;
}
function runReleaseGuard(options={}){
 const issues=[];let snapshotKey="";
 try{releaseGuardStorageScan(issues);releaseGuardCrossValidate(issues);}catch(error){issues.push(releaseGuardIssue("P0","ENGINE_EXCEPTION","健康檢查引擎執行失敗",error.message));}
 const counts={P0:issues.filter(x=>x.severity==="P0").length,P1:issues.filter(x=>x.severity==="P1").length,P2:issues.filter(x=>x.severity==="P2").length};
 const blocker=counts.P0>0||counts.P1>0,status=counts.P0?"FAIL":counts.P1?"BLOCKED":counts.P2?"WARNING":"PASS";
 if(blocker&&options.snapshot!==false){try{snapshotKey=createReleaseGuardSnapshot("automatic-blocker");}catch(error){issues.push(releaseGuardIssue("P0","SNAPSHOT_FAILED","Recovery Snapshot 建立失敗",error.message));counts.P0++;}}
 const score=Math.max(0,100-counts.P0*40-counts.P1*20-counts.P2*5);
 releaseGuardLastResult={engine:RELEASE_GUARD_VERSION,checkedAt:new Date().toISOString(),schema:STORAGE_SCHEMA_VERSION,status,score,releaseReady:!blocker,blocker,counts,issues,snapshotKey};
 window.RELEASE_GUARD_STATUS=releaseGuardLastResult;renderReleaseGuard(releaseGuardLastResult);
 console.info("[Enterprise Release Guard]",releaseGuardLastResult);
 return releaseGuardLastResult;
}
function renderReleaseGuard(result=releaseGuardLastResult){
 const root=$("#releaseGuardPanel");if(!root||!result)return;
 const badgeClass=result.status==="PASS"?"green":result.status==="WARNING"?"gold":"danger";
 root.innerHTML=`<div class="health-summary"><div><span class="badge ${badgeClass}">${esc(result.status)}</span><strong>健康分數 ${result.score}/100</strong><small>${esc(new Date(result.checkedAt).toLocaleString("zh-TW"))}</small></div><div class="health-counts"><span>P0：${result.counts.P0}</span><span>P1：${result.counts.P1}</span><span>P2：${result.counts.P2}</span></div></div><div class="health-grid"><div><small>Storage Schema</small><strong>v${result.schema}</strong></div><div><small>Release Ready</small><strong>${result.releaseReady?"PASS":"BLOCKED"}</strong></div><div><small>Recovery Snapshot</small><strong>${result.snapshotKey?"已建立":"無需建立"}</strong></div></div><div class="health-issues">${result.issues.length?result.issues.map(x=>`<article><span class="badge ${x.severity==="P2"?"gold":"danger"}">${x.severity}</span><div><strong>${esc(x.message)}</strong><small>${esc(x.code)}${x.detail?`｜${esc(x.detail)}`:""}</small></div></article>`).join(""):'<div class="empty">未發現 Runtime Integrity 問題。</div>'}</div>`;
}
function releaseGuardPreflight(action="write"){
 const result=runReleaseGuard({snapshot:true});
 if(result.blocker){toast(`Release Guard 已阻擋 ${action}：P0 ${result.counts.P0}／P1 ${result.counts.P1}`);return false;}return true;
}
window.ReleaseGuard={run:runReleaseGuard,health:runReleaseGuard,preflight:releaseGuardPreflight,createSnapshot:createReleaseGuardSnapshot,getLastResult:()=>releaseGuardLastResult};

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
 $("#checkinSearch")?.addEventListener("input",renderCheckin);$("#clearCheckinSearch")?.addEventListener("click",()=>{const x=$("#checkinSearch");if(x){x.value="";x.focus();}renderCheckin();});
 $("#paymentSearch")?.addEventListener("input",renderPayments);$("#clearPaymentSearch")?.addEventListener("click",()=>{const x=$("#paymentSearch");if(x){x.value="";x.focus();}renderPayments();});
 $("#guestSearch")?.addEventListener("input",renderGuests);
 $("#clearGuestSearch")?.addEventListener("click",()=>{const input=$("#guestSearch");if(input){input.value="";input.focus();}renderGuests();});
 $("#addPaymentBtn").onclick=()=>{$("#paymentForm").reset();$("#paymentDate").value=todayISO;renderOrders();updatePaymentDialogSummary();$("#paymentDialog").showModal();};
 $$("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).close());
 $("#prevMonth").onclick=()=>{calDate.setMonth(calDate.getMonth()-1);renderCalendar();};$("#nextMonth").onclick=()=>{calDate.setMonth(calDate.getMonth()+1);renderCalendar();};$("#calendarToday").onclick=()=>{calDate=new Date();renderCalendar();};
 $("#addTemplateBtn").onclick=addTemplate;
 $("#saveTemplateBtn").onclick=saveCurrentTemplate;
 $("#deleteTemplateBtn").onclick=deleteCurrentTemplate;
 $("#templateContent")?.addEventListener("input",renderTemplatePreview);
 $("#templateOrderSelect")?.addEventListener("change",renderTemplatePreview);
 const setTemplateTab=name=>{ $$("[data-template-tab]").forEach(btn=>{const active=btn.dataset.templateTab===name;btn.classList.toggle("active",active);btn.setAttribute("aria-selected",String(active));}); $$("[data-template-pane]").forEach(pane=>pane.classList.toggle("mobile-active",pane.dataset.templatePane===name)); };
 $$("[data-template-tab]").forEach(btn=>btn.onclick=()=>setTemplateTab(btn.dataset.templateTab));
 $$("[data-template-action]").forEach(btn=>btn.onclick=()=>{const action=btn.dataset.templateAction;if(action==="save")saveCurrentTemplate();if(action==="copy")$("#copyTemplateBtn").click();if(action==="delete")deleteCurrentTemplate();});
 setTemplateTab("editor");
 $("#copyTemplateBtn").onclick=async()=>{const text=applyTemplateVariables($("#templateContent").value);try{await navigator.clipboard.writeText(text);toast("已複製套用後文字");}catch{prompt("請複製",text);}};
 $("#copyWifiBtn").onclick=async()=>{const t="眉原六民宿 Wi-Fi\nSSID：deco_be25_Guest\n密碼：liou6868";try{await navigator.clipboard.writeText(t);toast("Wi-Fi 資料已複製");}catch{prompt("請複製",t);}};
 ["auditSearch","auditDateFrom","auditDateTo"].forEach(id=>$("#"+id)?.addEventListener("input",()=>{auditVisibleLimit=20;renderAudit();}));$("#auditModuleFilter")?.addEventListener("change",()=>{auditVisibleLimit=20;renderAudit();});$("#clearAuditFilter")?.addEventListener("click",()=>{["auditSearch","auditDateFrom","auditDateTo"].forEach(id=>{const x=$("#"+id);if(x)x.value="";});if($("#auditModuleFilter"))$("#auditModuleFilter").value="";renderAudit();});$("#exportAuditBtn")?.addEventListener("click",exportAuditLog);
 $("#openSettingsBtn").onclick=()=>navigate("settings");
 $$(".settings-tabs button").forEach(b=>b.onclick=()=>{$$(".settings-tabs button").forEach(x=>x.classList.toggle("active",x===b));$$(".settings-pane").forEach(p=>p.classList.toggle("active",p.dataset.pane===b.dataset.settingsTab));});
 $("#saveSettings").onclick=saveSettingsFields;$("#resetSettings").onclick=()=>{settings={...defaultSettings};persist();renderAll();toast("已恢復預設設定");};$("#saveRegistration").onclick=saveRegistration;
 $("#addShortcut").onclick=()=>{shortcuts.push({icon:"🔗",name:"新快捷",url:"https://"});renderSettings();};$("#saveShortcuts").onclick=collectShortcuts;
 $("#openOfficialLine").onclick=openOfficialLine;
 $("#exportData").onclick=exportBackup;$("#importData").onchange=e=>e.target.files[0]&&importBackup(e.target.files[0]);
 $("#runReleaseGuard")?.addEventListener("click",()=>{const r=runReleaseGuard({snapshot:true});appendAuditRecord("系統設定","檢查","release-guard",null,{operator:"系統／目前使用者",note:`${r.status}；P0 ${r.counts.P0}／P1 ${r.counts.P1}／P2 ${r.counts.P2}`});persist();toast(r.releaseReady?"系統健康檢查通過":"發現 Release Blocker，已建立 Recovery Snapshot");});
 $("#createHealthSnapshot")?.addEventListener("click",()=>{const key=createReleaseGuardSnapshot("manual");toast(`Recovery Snapshot 已建立：${key}`);runReleaseGuard({snapshot:false});});

 ["notificationSearch"].forEach(id=>$("#"+id)?.addEventListener("input",renderNotifications));["notificationStatusFilter","notificationTypeFilter","notificationPriorityFilter"].forEach(id=>$("#"+id)?.addEventListener("change",renderNotifications));
 $("#clearNotificationFilter")?.addEventListener("click",()=>{["notificationSearch"].forEach(id=>$("#"+id).value="");["notificationStatusFilter","notificationTypeFilter","notificationPriorityFilter"].forEach(id=>$("#"+id).value="");renderNotifications();});
 $("#refreshNotifications")?.addEventListener("click",()=>{renderNotifications();toast("通知已重新整理");});
 $("#markAllNotificationsRead")?.addEventListener("click",()=>{buildNotifications().filter(n=>n.status==="unread").forEach(n=>notificationState[n.key]={...(notificationState[n.key]||{}),status:"read",readAt:new Date().toISOString()});persist();renderAll();toast("全部通知已標示已讀");});
 $("#saveNotificationSettings")?.addEventListener("click",saveNotificationSettings);
 $("#resetNotificationSettings")?.addEventListener("click",()=>{["notificationLargeRefundThreshold","notificationHousekeepingOverdueMinutes","notificationBreakfastReminderMinutes","notificationTaxiReminderMinutes","notificationRetentionDays","notificationAutoClearDays"].forEach(k=>settings[k]=defaultSettings[k]);persist();renderAll();toast("通知設定已恢復預設");});

 $("#resetDemoData").onclick=()=>{if(confirm("確定重設全部資料？")){orders=structuredClone(seedOrders).map(normalizeOrder);payments=[];tasks=structuredClone(seedTasks).map(normalizeTask);guestProfiles={};settings={...defaultSettings};shortcuts=structuredClone(defaultShortcuts);templates={...defaultTemplates};roomLocks=[];auditLogs=[];notificationState={};selectedTemplate=Object.keys(templates)[0];auditRecordingReady=false;persist();auditRecordingReady=true;renderAll();toast("已重設為示範資料");}};
 renderAll();
 setTimeout(()=>runReleaseGuard({snapshot:true}),150);
}
document.addEventListener("DOMContentLoaded",init);
})();

