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

const templates = {
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
送達時間：{{送達時間}}
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
 {id:"MY6-260801",name:"陳小姐",phone:"0912-345-678",checkin:addDays(todayISO,1),checkout:addDays(todayISO,3),package:"小包棟（8～15人）",rooms:["R1","R2","R4"],count:10,source:"官方 LINE",status:"已付訂金",total:28000,paid:10000,note:"預計 16:00 抵達",breakfast:{date:addDays(todayISO,2),shop:"在地早餐店",qty:10,delivery:"08:00",done:false},taxi:{date:"",time:"",pickup:"",destination:"",guests:0,type:"",fare:0,done:false},earlyCheckin:"",lateCheckout:"",luggageStorage:true,checklist:{}},
 {id:"MY6-260802",name:"林先生",phone:"0988-123-456",checkin:addDays(todayISO,4),checkout:addDays(todayISO,5),package:"一般訂房",rooms:["R3","R6"],count:7,source:"電話",status:"已確認",total:12000,paid:0,note:"有長輩同行",breakfast:{date:"",shop:"",qty:0,delivery:"",done:false},taxi:{date:addDays(todayISO,5),time:"11:30",pickup:"眉原六民宿",destination:"埔里轉運站",guests:4,type:"一般計程車",fare:400,done:false},earlyCheckin:"",lateCheckout:"12:00",luggageStorage:false,checklist:{}}
];
const seedTasks=[
 {id:"T1",date:todayISO,room:"R4",title:"退房清潔",status:"尚未安排"},
 {id:"T2",date:todayISO,room:"R5",title:"備品補充",status:"清潔中"}
];

const STORAGE_SCHEMA_VERSION = 2;

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
   total, paid:Math.min(paid,total || paid),
   note:String(raw?.note || raw?.notes || ""),
   breakfast:{
     date:validISO(raw?.breakfast?.date || raw?.breakfastDate, ""),
     shop:String(raw?.breakfast?.shop || raw?.breakfastShop || ""),
     qty:Math.max(0,Number(raw?.breakfast?.qty ?? raw?.breakfastQty ?? 0)||0),
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
 return {
   id:String(raw?.id || `T-M${index}`),
   date:validISO(raw?.date,todayISO),
   room:normalizeRoomIds(raw?.room || raw?.roomId || raw?.unitId)[0] || roomMaster[index%roomMaster.length].id,
   title:String(raw?.title || raw?.task || "退房清潔"),
   status:String(raw?.status || "尚未安排")
 };
}

const storedOrders = safeJSON("my6_orders", null);
let orders=(Array.isArray(storedOrders) && storedOrders.length ? storedOrders : seedOrders).map(normalizeOrder);
let payments=Array.isArray(safeJSON("my6_payments",[])) ? safeJSON("my6_payments",[]) : [];
let tasks=(Array.isArray(safeJSON("my6_tasks",null)) ? safeJSON("my6_tasks",null) : seedTasks).map(normalizeTask);
let guestProfiles=safeJSON("my6_guest_profiles",{});
let settings={...defaultSettings,...safeJSON("my6_settings",{})};
let shortcuts=Array.isArray(safeJSON("my6_shortcuts",null)) ? safeJSON("my6_shortcuts",null) : defaultShortcuts;
let calDate=new Date();

try{
 const oldVersion=Number(localStorage.getItem("my6_schema_version")||0);
 if(oldVersion<STORAGE_SCHEMA_VERSION){
   localStorage.setItem("my6_legacy_backup_"+Date.now(), JSON.stringify({
     orders:storedOrders,
     payments:safeJSON("my6_payments",[]),
     tasks:safeJSON("my6_tasks",[]),
     guestProfiles:safeJSON("my6_guest_profiles",{}),
     settings:safeJSON("my6_settings",{}),
     shortcuts:safeJSON("my6_shortcuts",[])
   }));
   localStorage.setItem("my6_schema_version",String(STORAGE_SCHEMA_VERSION));
 }
}catch(error){ console.warn("Schema backup failed",error); }

function persist(){
 orders=orders.map(normalizeOrder);
 tasks=tasks.map(normalizeTask);
 localStorage.setItem("my6_schema_version",String(STORAGE_SCHEMA_VERSION));
 localStorage.setItem("my6_orders",JSON.stringify(orders));
 localStorage.setItem("my6_payments",JSON.stringify(payments));
 localStorage.setItem("my6_tasks",JSON.stringify(tasks));
 localStorage.setItem("my6_guest_profiles",JSON.stringify(guestProfiles));
 localStorage.setItem("my6_settings",JSON.stringify(settings));
 localStorage.setItem("my6_shortcuts",JSON.stringify(shortcuts));
}
function toast(msg){
 const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.classList.remove("show"),2200);
}
function statusClass(s){ return s==="暫時保留"?"hold":(["已付訂金","已付全額"].includes(s)?"paid":"confirmed"); }
function activeOrders(){ return orders.filter(o=>o && o.status!=="已取消"); }
function orderRooms(o){ return normalizeRoomIds(o?.rooms); }
function hasConflict(candidate,ignoreId=""){
 const candidateRooms=orderRooms(candidate);
 return activeOrders().some(o=>o.id!==ignoreId && candidate.checkin<o.checkout && candidate.checkout>o.checkin && candidateRooms.some(r=>orderRooms(o).includes(r)));
}
function serviceTags(o){
 const a=[]; if(o.breakfast?.qty) a.push(`早餐 ${o.breakfast.qty}份${o.breakfast.done?"✓":""}`);
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
     $("#calendarGrid").innerHTML=`<div class="calendar-error"><strong>房況日曆載入失敗</strong><p>${esc(error.message)}</p><button onclick="location.reload()">重新載入</button></div>`;
   }
 }
}
function renderAll(){
 safeRender("dashboard",renderDashboard);
 safeRender("calendar",renderCalendar);
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
 const due=inList.reduce((s,o)=>s+Math.max(0,o.total-o.paid),0);
 const paidToday=payments.filter(p=>p.date===todayISO).reduce((s,p)=>s+p.amount,0);
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
 const lineQueue=[...inList.map(o=>({id:o.id,title:`入住提醒｜${o.name}`,detail:`今日 ${settings.checkinTime} 後入住`})),...activeOrders().filter(o=>o.checkin===addDays(todayISO,1)).map(o=>({id:o.id,title:`入住前通知｜${o.name}`,detail:`明日入住・${o.count} 人`})),...activeOrders().filter(o=>o.breakfast?.date===addDays(todayISO,1)&&o.breakfast?.qty&&!o.breakfast.done).map(o=>({id:o.id,title:`早餐確認｜${o.name}`,detail:`明日 ${o.breakfast.delivery||"待確認"}・${o.breakfast.qty} 份`}))].slice(0,8);
 $("#lineQueueCount").textContent=`${lineQueue.length} 則`;
 $("#lineQueue").innerHTML=lineQueue.map(x=>`<div class="list-item"><div><strong>${esc(x.title)}</strong><small>${esc(x.detail)}</small></div><button class="line-action official-line-button" title="聯絡眉原六官方 LINE" onclick="window.copyLineMessage('${x.id}')">🟢 官方 LINE</button></div>`).join("")||'<div class="empty">今日沒有待發 LINE。</div>';
 loadPuliWeather();
 $("#shortcutGrid").innerHTML=shortcuts.map(s=>`<a class="shortcut-card" href="${esc(s.url)}" target="_blank" rel="noopener"><span class="icon">${esc(s.icon)}</span><span>${esc(s.name)}</span></a>`).join("");
 const upcoming=activeOrders().filter(o=>o.checkin>=todayISO).sort((a,b)=>a.checkin.localeCompare(b.checkin)).slice(0,6);
 $("#upcomingList").innerHTML=upcoming.map(o=>`<div class="list-item"><div><strong>${esc(o.name)}｜${fmtDate(o.checkin)}</strong><small>${esc(o.package)}・${o.count} 人</small></div><span class="badge ${statusClass(o.status)==="paid"?"green":"gold"}">${esc(o.status)}</span></div>`).join("")||'<div class="empty">目前沒有近期入住。</div>';
 const todos=activeOrders().flatMap(o=>{
   const a=[]; if(o.breakfast?.qty&&!o.breakfast.done)a.push(`${o.name}｜早餐 ${o.breakfast.qty} 份`);
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

function renderOrders(){
 const q=$("#orderSearch")?.value.trim().toLowerCase()||"", st=$("#statusFilter")?.value||"";
 const list=orders.filter(o=>(!st||o.status===st)&&(!q||[o.id,o.name,o.phone].join(" ").toLowerCase().includes(q))).sort((a,b)=>b.checkin.localeCompare(a.checkin));
 $("#orderTableBody").innerHTML=list.map(o=>`<tr>
 <td><strong>${esc(o.id)}</strong><span class="guest-detail">${esc(o.source)}</span></td>
 <td><strong>${esc(o.name)}</strong><span class="guest-detail">${esc(o.phone)}</span></td>
 <td>${o.checkin}<br>至 ${o.checkout}</td>
 <td>${esc(o.package)}<span class="guest-detail">${orderRooms(o).map(roomName).map(esc).join("、")}</span></td>
 <td><div class="service-tags">${serviceTags(o).map(x=>`<span>${esc(x)}</span>`).join("")||"-"}</div></td>
 <td class="money-cell"><strong>${money(o.total)}</strong><span class="guest-detail">已收 ${money(o.paid)}・未收 ${money(Math.max(0,o.total-o.paid))}</span><div class="money-progress"><i style="width:${Math.min(100,o.total?o.paid/o.total*100:0)}%"></i></div></td>
 <td><span class="badge ${statusClass(o.status)==="paid"?"green":statusClass(o.status)==="hold"?"gold":"gray"}">${esc(o.status)}</span></td>
 <td><div class="table-actions"><button onclick="window.editOrder('${o.id}')">編輯</button><button class="official-line-button" title="聯絡眉原六官方 LINE" onclick="window.copyLineMessage('${o.id}')">🟢 官方 LINE</button><button onclick="window.deleteOrder('${o.id}')">刪除</button></div></td>
 </tr>`).join("")||'<tr><td colspan="8">沒有符合條件的訂單。</td></tr>';
 $("#paymentOrder").innerHTML=activeOrders().map(o=>`<option value="${o.id}">${o.id}｜${esc(o.name)}｜未收 ${money(o.total-o.paid)}</option>`).join("");
}
function openOrder(o=null){
 $("#orderForm").reset(); $("#orderId").value=o?.id||""; $("#orderDialogTitle").textContent=o?"編輯訂單":"新增訂單";
 $("#guestName").value=o?.name||""; $("#guestPhone").value=o?.phone||""; $("#checkinDate").value=o?.checkin||todayISO; $("#checkoutDate").value=o?.checkout||addDays(todayISO,1);
 $("#packageType").value=o?.package||"一般訂房"; $("#guestCount").value=o?.count||2; $("#guestCount").dataset.clearOnFocus="1"; $("#orderSource").value=o?.source||"官方 LINE"; $("#orderStatus").value=o?.status||"詢問中";
 $("#orderTotal").value=formatMoneyInput(o?.total||0); $("#orderPaid").value=formatMoneyInput(o?.paid||0); $("#orderNote").value=o?.note||"";
 $("#breakfastDate").value=o?.breakfast?.date||""; $("#breakfastShop").value=o?.breakfast?.shop||""; $("#breakfastQty").value=o?.breakfast?.qty||0; $("#breakfastDelivery").value=o?.breakfast?.delivery||""; $("#breakfastDone").checked=!!o?.breakfast?.done;
 $("#taxiDate").value=o?.taxi?.date||""; $("#taxiTime").value=o?.taxi?.time||""; $("#taxiPickup").value=o?.taxi?.pickup||""; $("#taxiDestination").value=o?.taxi?.destination||""; $("#taxiGuests").value=o?.taxi?.guests||0; $("#taxiType").value=o?.taxi?.type||""; $("#taxiFare").value=formatMoneyInput(o?.taxi?.fare||0); $("#taxiDone").checked=!!o?.taxi?.done;
 $("#earlyCheckin").value=o?.earlyCheckin||""; $("#lateCheckout").value=o?.lateCheckout||""; $("#luggageStorage").checked=!!o?.luggageStorage;
 $$('input[name="roomChoice"]').forEach(x=>x.checked=(o?.rooms||[]).includes(x.value));
 handlePackageChange(); $("#conflictWarning").classList.add("hidden"); $("#orderDialog").showModal();
}
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
 total:moneyNumber($("#orderTotal").value),paid:moneyNumber($("#orderPaid").value),note:$("#orderNote").value.trim(),
 breakfast:{date:$("#breakfastDate").value,shop:$("#breakfastShop").value.trim(),qty:+$("#breakfastQty").value,delivery:$("#breakfastDelivery").value,done:$("#breakfastDone").checked},
 taxi:{date:$("#taxiDate").value,time:$("#taxiTime").value,pickup:$("#taxiPickup").value.trim(),destination:$("#taxiDestination").value.trim(),guests:+$("#taxiGuests").value,type:$("#taxiType").value.trim(),fare:moneyNumber($("#taxiFare").value),done:$("#taxiDone").checked},
 earlyCheckin:$("#earlyCheckin").value,lateCheckout:$("#lateCheckout").value,luggageStorage:$("#luggageStorage").checked,checklist:orders.find(o=>o.id===$("#orderId").value)?.checklist||{}};
}
$("#orderForm").addEventListener("submit",e=>{
 e.preventDefault(); const o=readOrderForm();
 if(!o.rooms.length)return toast("請至少選擇一個住宿單位");
 if(!Number.isFinite(o.count)||o.count<1)return toast("入住人數至少為 1 人");
 if(o.checkout<=o.checkin)return toast("退房日期必須晚於入住日期");
 if(hasConflict(o,o.id)){ $("#conflictWarning").textContent="房況衝突：所選日期已有相同住宿單位被占用。";$("#conflictWarning").classList.remove("hidden");return; }
 const i=orders.findIndex(x=>x.id===o.id); if(i>=0)orders[i]=o;else orders.push(o); persist();$("#orderDialog").close();renderAll();toast("訂單已儲存");
});
window.editOrder=id=>openOrder(orders.find(o=>o.id===id));
window.openOrderFromCalendar=id=>{
 const nav=$(`[data-page="orders"]`);
 if(nav) nav.click();
 const order=orders.find(o=>o.id===id);
 if(order) setTimeout(()=>openOrder(order),0);
};
window.deleteOrder=id=>{ if(confirm("確定刪除此訂單？")){orders=orders.filter(o=>o.id!==id);persist();renderAll();toast("訂單已刪除");}};
const LINE_MANAGER_LOGIN_URL="https://tw.linebiz.com/login/";
function openOfficialLine(){
 const customerLineUrl=(settings.lineUrl||"https://lin.ee/933tuhU").trim();
 if(!/^https?:\/\//i.test(customerLineUrl)){toast("LINE 網址設定不正確");return;}
 const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
 if(mobile){
   // Mobile: universal link lets the OS open LINE App when available.
   window.location.href=customerLineUrl;
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
     events+=`<div class="event ${statusClass(o.status)} event-${segment}" draggable="true" data-id="${o.id}" data-mode="move" data-lane="${lane}" role="button" tabindex="0" title="開啟訂單：${esc(o.name)}｜${esc(calendarOrderSummary(o))}">
       ${first?`<span class="resize-handle" draggable="true" data-id="${o.id}" data-mode="start" title="調整入住日期"></span>`:`<span class="event-spacer"></span>`}
       <span class="event-content"><span class="event-name">${esc(o.name)}</span><span class="event-room">${esc(calendarOrderSummary(o))}</span></span>
       ${last?`<span class="resize-handle" draggable="true" data-id="${o.id}" data-mode="end" title="調整退房日期"></span>`:`<span class="event-spacer"></span>`}
     </div>`;
   }
   html+=`<div class="calendar-cell ${muted?"muted":""}" data-date="${iso}"><div class="day-num">${d.getDate()}</div>${events}</div>`;
 }
 $("#calendarGrid").innerHTML=html;
 $$(".event,.resize-handle",$("#calendarGrid")).forEach(el=>el.addEventListener("dragstart",e=>{
   dragInfo={id:el.dataset.id,mode:el.dataset.mode||"move"}; e.dataTransfer.effectAllowed="move"; e.stopPropagation();
 }));
 $$(".event",$("#calendarGrid")).forEach(el=>{
   el.addEventListener("click",e=>{
     if(e.target.classList.contains("resize-handle")) return;
     window.openOrderFromCalendar(el.dataset.id);
   });
   el.addEventListener("keydown",e=>{
     if(e.key==="Enter"||e.key===" "){
       e.preventDefault();
       window.openOrderFromCalendar(el.dataset.id);
     }
   });
 });
 $$(".calendar-cell[data-date]",$("#calendarGrid")).forEach(cell=>{
   cell.addEventListener("dragover",e=>{e.preventDefault();cell.classList.add("drag-over")});
   cell.addEventListener("dragleave",()=>cell.classList.remove("drag-over"));
   cell.addEventListener("drop",e=>{e.preventDefault();cell.classList.remove("drag-over");applyCalendarDrop(cell.dataset.date);});
 });
}
function applyCalendarDrop(date){
 if(!dragInfo)return; const o=orders.find(x=>x.id===dragInfo.id); if(!o)return; const next={...o,rooms:[...o.rooms]};
 if(dragInfo.mode==="move"){const nights=daysBetween(o.checkin,o.checkout);next.checkin=date;next.checkout=addDays(date,nights);}
 if(dragInfo.mode==="start"){if(date>=o.checkout)return toast("入住日期必須早於退房日期");next.checkin=date;}
 if(dragInfo.mode==="end"){const checkout=addDays(date,1);if(checkout<=o.checkin)return toast("退房日期必須晚於入住日期");next.checkout=checkout;}
 if(hasConflict(next,o.id))return toast("拖曳失敗：房況衝突");
 Object.assign(o,next);persist();renderAll();toast("房況日期已更新");
}

function renderCheckin(){
 const list=activeOrders().filter(o=>o.checkout>=todayISO).sort((a,b)=>a.checkin.localeCompare(b.checkin));
 const items=["身分確認","訂金","尾款","入住須知","LINE","導航","WiFi","完成入住"];
 $("#checkinList").innerHTML=list.map(o=>`<article class="checkin-card"><div class="panel-head"><div><strong>${esc(o.name)}｜${o.checkin} 入住</strong><p class="section-note">${esc(o.package)}｜${o.count} 人｜${orderRooms(o).map(roomName).map(esc).join("、")}</p></div><button class="official-line-button" title="聯絡眉原六官方 LINE" onclick="window.copyLineMessage('${o.id}')">🟢 官方 LINE</button></div><div class="checklist">${items.map(x=>`<label class="check-item"><input type="checkbox" ${o.checklist?.[x]?"checked":""} onchange="window.toggleCheck('${o.id}','${x}',this.checked)"> ${x}</label>`).join("")}</div></article>`).join("")||'<div class="empty">目前沒有待入住訂單。</div>';
}
window.toggleCheck=(id,key,val)=>{const o=orders.find(x=>x.id===id);o.checklist=o.checklist||{};o.checklist[key]=val;if(key==="完成入住"&&val)o.status="已入住";persist();renderAll();};

function renderPayments(){
 $("#paymentTableBody").innerHTML=payments.slice().reverse().map(p=>{const o=orders.find(x=>x.id===p.orderId);return `<tr><td>${p.date}</td><td>${esc(p.orderId)}</td><td>${esc(o?.name||"-")}</td><td>${esc(p.type)}</td><td>${esc(p.method)}</td><td>${money(p.amount)}</td><td>${p.verified?'<span class="badge green">已核帳</span>':'<span class="badge gold">待核帳</span>'}</td></tr>`}).join("")||'<tr><td colspan="7">尚無收款紀錄。</td></tr>';
}
$("#paymentForm").addEventListener("submit",e=>{
 e.preventDefault();const id=$("#paymentOrder").value,raw=moneyNumber($("#paymentAmount").value),amount=$("#paymentType").value==="退款"?-raw:raw;
 payments.push({date:$("#paymentDate").value,orderId:id,type:$("#paymentType").value,method:$("#paymentMethod").value,amount,verified:$("#paymentVerified").value==="true"});
 const o=orders.find(x=>x.id===id);if(o)o.paid=Math.max(0,o.paid+amount);persist();$("#paymentDialog").close();renderAll();toast("收款已登記");
});

function renderTasks(){
 const groups=[["尚未安排",["尚未安排"]],["進行中",["已安排","清潔中","待複查"]],["已完成",["已完成"]]];
 $("#taskBoard").innerHTML=groups.map(([g,sts])=>`<div class="task-column"><h4>${g}</h4>${tasks.filter(t=>sts.includes(t.status)).map(t=>`<div class="task-card"><strong>${esc(roomName(t.room))}</strong><p>${esc(t.title)}</p><small>${t.date}｜${esc(t.status)}</small><br><button onclick="window.advanceTask('${t.id}')">更新狀態</button></div>`).join("")||"<small>目前沒有任務</small>"}</div>`).join("");
}
window.advanceTask=id=>{const t=tasks.find(x=>x.id===id),seq=["尚未安排","已安排","清潔中","待複查","已完成"];t.status=seq[Math.min(seq.indexOf(t.status)+1,seq.length-1)];persist();renderAll();};
$("#taskForm").addEventListener("submit",e=>{e.preventDefault();tasks.push({id:uid("T"),date:$("#taskDate").value,room:$("#taskRoom").value,title:$("#taskTitle").value,status:$("#taskStatus").value});persist();$("#taskDialog").close();renderAll();toast("房務任務已新增");});

function buildGuestMap(){
 const map={};activeOrders().forEach(o=>{if(!map[o.phone])map[o.phone]={name:o.name,phone:o.phone,count:0,total:0,last:"",note:""};const g=map[o.phone];g.count++;g.total+=o.total;g.last=g.last>o.checkin?g.last:o.checkin;if(o.note)g.note=o.note;});
 Object.keys(map).forEach(p=>Object.assign(map[p],guestProfiles[p]||{}));return map;
}
function renderGuests(){
 $("#guestTableBody").innerHTML=Object.values(buildGuestMap()).map(g=>`<tr><td><strong>${esc(g.name)}</strong>${g.line?`<span class="guest-detail">LINE：${esc(g.line)}</span>`:""}</td><td>${esc(g.phone)}${g.email?`<span class="guest-detail">${esc(g.email)}</span>`:""}</td><td>${g.count}</td><td>${money(g.total)}</td><td>${g.last}</td><td>${esc(g.note||"-")}${g.plate?`<span class="guest-detail">車牌：${esc(g.plate)}</span>`:""}</td><td><button onclick="window.editGuest('${esc(g.phone)}')">編輯</button></td></tr>`).join("")||'<tr><td colspan="7">尚無旅客資料。</td></tr>';
}
window.editGuest=phone=>{const g=buildGuestMap()[phone];$("#guestOriginalPhone").value=phone;$("#profileName").value=g.name||"";$("#profilePhone").value=g.phone||"";$("#profileLine").value=g.line||"";$("#profileEmail").value=g.email||"";$("#profilePlate").value=g.plate||"";$("#profilePet").value=g.pet||"";$("#profileNote").value=g.note||"";$("#guestDialog").showModal();};
$("#guestForm").addEventListener("submit",e=>{e.preventDefault();const old=$("#guestOriginalPhone").value,phone=$("#profilePhone").value.trim(),p={name:$("#profileName").value.trim(),phone,line:$("#profileLine").value.trim(),email:$("#profileEmail").value.trim(),plate:$("#profilePlate").value.trim(),pet:$("#profilePet").value.trim(),note:$("#profileNote").value.trim()};orders.forEach(o=>{if(o.phone===old){o.phone=phone;o.name=p.name;}});delete guestProfiles[old];guestProfiles[phone]=p;persist();$("#guestDialog").close();renderAll();toast("旅客資料已更新");});

function renderTemplates(){
 $("#templateList").innerHTML=Object.keys(templates).map((k,i)=>`<div class="template-item ${i===0?"active":""}" data-template="${esc(k)}">${esc(k)}</div>`).join("");
 if(!$("#templateContent").value){$("#templateTitle").textContent="入住須知";$("#templateContent").value=templates["入住須知"];}
 $$(".template-item").forEach(el=>el.onclick=()=>{$$(".template-item").forEach(x=>x.classList.remove("active"));el.classList.add("active");$("#templateTitle").textContent=el.dataset.template;$("#templateContent").value=templates[el.dataset.template];});
}
function renderReports(){
 const month=todayISO.slice(0,7),list=activeOrders().filter(o=>o.checkin.startsWith(month));$("#reportOrders").textContent=list.length;$("#reportNights").textContent=list.reduce((s,o)=>s+daysBetween(o.checkin,o.checkout),0);$("#reportAvg").textContent=money(list.length?list.reduce((s,o)=>s+o.total,0)/list.length:0);
 const counts={};activeOrders().forEach(o=>counts[o.phone]=(counts[o.phone]||0)+1);const vals=Object.values(counts);$("#reportRepeat").textContent=(vals.length?Math.round(vals.filter(v=>v>1).length/vals.length*100):0)+"%";
 const src={};activeOrders().forEach(o=>src[o.source]=(src[o.source]||0)+1);const max=Math.max(1,...Object.values(src));$("#sourceBars").innerHTML=Object.entries(src).map(([k,v])=>`<div class="bar-row"><span>${esc(k)}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><strong>${v}</strong></div>`).join("")||'<div class="empty">尚無資料。</div>';
}
function renderSettings(){
 const map={settingPropertyName:"propertyName",settingLineUrl:"lineUrl",settingFullCapacity:"fullCapacity",settingSmallCapacity:"smallCapacity",settingCheckinTime:"checkinTime",settingCheckoutTime:"checkoutTime",settingHourlyFee:"hourlyFee",settingPetFee:"petFee",registrationDate:"registrationDate",registrationDocNo:"registrationDocNo",registrationLicense:"registrationLicense",insuranceCompany:"insuranceCompany",insurancePolicy:"insurancePolicy",insuranceStart:"insuranceStart",insuranceEnd:"insuranceEnd"};
 Object.entries(map).forEach(([id,key])=>{const el=$("#"+id);if(el)el.value=settings[key]??"";});
 $("#shortcutEditor").innerHTML=shortcuts.map((s,i)=>`<div class="shortcut-edit-row" data-index="${i}"><label>圖示<input class="icon-input" value="${esc(s.icon)}"></label><label>名稱<input class="name-input" value="${esc(s.name)}"></label><label class="url">網址<input class="url-input" value="${esc(s.url)}"></label><button class="danger" type="button" onclick="window.removeShortcut(${i})">刪除</button></div>`).join("");
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
 const data={version:"Enterprise V1.1 Official Stable",exportedAt:new Date().toISOString(),orders,payments,tasks,guestProfiles,settings,shortcuts};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`Meiyuan6_PMS_Backup_${todayISO}.json`;a.click();URL.revokeObjectURL(a.href);
}
async function importBackup(file){
 try{const data=JSON.parse(await file.text());orders=data.orders||[];payments=data.payments||[];tasks=data.tasks||[];guestProfiles=data.guestProfiles||{};settings={...defaultSettings,...(data.settings||{})};shortcuts=data.shortcuts||defaultShortcuts;persist();renderAll();toast("備份已匯入");}catch{toast("備份檔格式錯誤");}
}

function init(){
 $("#todayText").textContent=new Date().toLocaleDateString("zh-TW",{year:"numeric",month:"long",day:"numeric",weekday:"long"});
 $("#roomCheckboxes").innerHTML=roomMaster.map(r=>`<label class="checkbox-item"><input type="checkbox" name="roomChoice" value="${r.id}"><span>${esc(r.name)}（${r.capacity} 人）</span></label>`).join("");
 $("#taskRoom").innerHTML=roomMaster.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join("");
 $("#paymentDate").value=todayISO;$("#taskDate").value=todayISO;
 $("#loginForm").onsubmit=e=>{e.preventDefault();if($("#loginUser").value==="admin"&&$("#loginPass").value==="123456"){$("#loginView").classList.add("hidden");$("#appView").classList.remove("hidden");renderAll();}else toast("帳號或密碼錯誤");};
 $("#logoutBtn").onclick=()=>location.reload();
 $$("#nav button").forEach(b=>b.onclick=()=>navigate(b.dataset.page));$$("[data-page-jump]").forEach(b=>b.onclick=()=>navigate(b.dataset.pageJump));
 $("#quickAddOrder").onclick=$("#addOrderBtn").onclick=()=>openOrder();$("#packageType").onchange=handlePackageChange;
 $("#orderSearch").oninput=renderOrders;$("#statusFilter").onchange=renderOrders;
 $("#addPaymentBtn").onclick=()=>{$("#paymentForm").reset();$("#paymentDate").value=todayISO;renderOrders();$("#paymentDialog").showModal();};
 $("#addTaskBtn").onclick=()=>{$("#taskForm").reset();$("#taskDate").value=todayISO;$("#taskDialog").showModal();};
 $$("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).close());
 $("#prevMonth").onclick=()=>{calDate.setMonth(calDate.getMonth()-1);renderCalendar();};$("#nextMonth").onclick=()=>{calDate.setMonth(calDate.getMonth()+1);renderCalendar();};$("#calendarToday").onclick=()=>{calDate=new Date();renderCalendar();};
 $("#copyTemplateBtn").onclick=async()=>{try{await navigator.clipboard.writeText($("#templateContent").value);toast("模板已複製");}catch{prompt("請複製",$("#templateContent").value);}};
 $("#copyWifiBtn").onclick=async()=>{const t="眉原六民宿 Wi-Fi\nSSID：deco_be25_Guest\n密碼：liou6868";try{await navigator.clipboard.writeText(t);toast("Wi-Fi 資料已複製");}catch{prompt("請複製",t);}};
 $("#openSettingsBtn").onclick=()=>navigate("settings");
 $$(".settings-tabs button").forEach(b=>b.onclick=()=>{$$(".settings-tabs button").forEach(x=>x.classList.toggle("active",x===b));$$(".settings-pane").forEach(p=>p.classList.toggle("active",p.dataset.pane===b.dataset.settingsTab));});
 $("#saveSettings").onclick=saveSettingsFields;$("#resetSettings").onclick=()=>{settings={...defaultSettings};persist();renderAll();toast("已恢復預設設定");};$("#saveRegistration").onclick=saveRegistration;
 $("#addShortcut").onclick=()=>{shortcuts.push({icon:"🔗",name:"新快捷",url:"https://"});renderSettings();};$("#saveShortcuts").onclick=collectShortcuts;
 $("#openOfficialLine").onclick=openOfficialLine;
 $("#exportData").onclick=exportBackup;$("#importData").onchange=e=>e.target.files[0]&&importBackup(e.target.files[0]);
 $("#resetDemoData").onclick=()=>{if(confirm("確定重設全部資料？")){orders=structuredClone(seedOrders);payments=[];tasks=structuredClone(seedTasks);guestProfiles={};settings={...defaultSettings};shortcuts=structuredClone(defaultShortcuts);persist();renderAll();toast("已重設為示範資料");}};
 renderAll();
}
document.addEventListener("DOMContentLoaded",init);
})();