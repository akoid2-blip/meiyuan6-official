(() => {
  "use strict";
  const $=s=>document.querySelector(s);
  const trigger=$("#cloudStatusTrigger"), panel=$("#cloudStatusPopover"), backdrop=$("#cloudStatusBackdrop"), closeBtn=$("#cloudStatusClose");
  if(!trigger||!panel)return;
  let last={};
  const fmt=value=>{if(!value)return "尚未同步";try{return new Date(value).toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})}catch{return String(value)}};
  function statusInfo(){
    const cloud=window.Meiyuan6CloudStatus?.getStatus?.()||{};
    const rt=window.Meiyuan6Realtime?.getStatus?.()||{};
    const order=window.Meiyuan6OrderCloud?.getStatus?.()||{};
    const hk=window.Meiyuan6HousekeepingCloud?.getStatus?.()||{};
    const online=navigator.onLine;
    const syncing=[cloud.sync,rt.status,order.status,hk.status].some(x=>["syncing","connecting","writing","booting"].includes(x));
    const error=!online||[cloud.sync,rt.status,order.status,hk.status].some(x=>["error","fallback","offline"].includes(x));
    const label=!online?"離線":error?"同步異常":syncing?"同步中":"已同步";
    const tone=!online||error?"error":syncing?"syncing":"ready";
    const lastSync=rt.lastSyncAt||cloud.lastSyncAt||order.lastWriteAt||hk.lastWriteAt||"";
    return {cloud,rt,order,hk,online,syncing,error,label,tone,lastSync};
  }
  const row=(name,detail,tone="ready")=>`<div class="cloud-status-row" data-tone="${tone}"><span class="cloud-row-dot" aria-hidden="true"></span><span><strong>${name}</strong><small>${detail}</small></span></div>`;
  function render(){
    const x=statusInfo();last=x;trigger.dataset.tone=x.tone;$("#cloudStatusTriggerLabel").textContent=x.label;$("#cloudStatusLastSync").textContent=`最後同步：${fmt(x.lastSync)}`;
    const ready=v=>["ready","healthy","connected","cloud-data-ready"].includes(v);
    $("#cloudStatusRows").innerHTML=[
      row("Cloud Data",x.cloud.cloudReady?"資料已就緒":"等待資料層",x.cloud.cloudReady?"ready":"muted"),
      row("Order Cloud",["writing","syncing"].includes(x.order.status)?"同步中":ready(x.order.status)?"已就緒":x.order.status||"等待中",["writing","syncing"].includes(x.order.status)?"syncing":ready(x.order.status)?"ready":"muted"),
      row("Housekeeping Cloud",["writing","syncing"].includes(x.hk.status)?"同步中":ready(x.hk.status)?"已就緒":x.hk.status||"等待中",["writing","syncing"].includes(x.hk.status)?"syncing":ready(x.hk.status)?"ready":"muted"),
      row("Realtime",x.rt.connected?"已連線":x.rt.status||"等待連線",x.rt.connected?"ready":x.rt.status==="error"?"error":"muted"),
      row("Offline Mode",x.online?"離線快取已就緒":"目前離線",x.online?"ready":"error")
    ].join("");
  }
  function open(){render();panel.hidden=false;backdrop.hidden=false;trigger.setAttribute("aria-expanded","true");document.documentElement.classList.add("cloud-status-open");}
  function close(){panel.hidden=true;backdrop.hidden=true;trigger.setAttribute("aria-expanded","false");document.documentElement.classList.remove("cloud-status-open");}
  trigger.addEventListener("click",()=>panel.hidden?open():close());closeBtn?.addEventListener("click",close);backdrop?.addEventListener("click",close);
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
  ["meiyuan6:cloud-status","meiyuan6:sync-status","meiyuan6:order-cloud-state","meiyuan6:housekeeping-cloud-state","meiyuan6:auth-ready"].forEach(name=>document.addEventListener(name,render));
  window.addEventListener("online",render);window.addEventListener("offline",render);
  $("#cloudStatusLog")?.addEventListener("click",()=>alert([`雲端狀態：${last.label}`,`最後同步：${fmt(last.lastSync)}`,last.rt?.error?`錯誤：${last.rt.error}`:""].filter(Boolean).join("\n")));
  document.addEventListener("DOMContentLoaded",()=>{render();setTimeout(render,900)});
})();
