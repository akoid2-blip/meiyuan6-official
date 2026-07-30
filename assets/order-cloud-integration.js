(() => {
 "use strict";
 function render(state={}){
  let el=document.getElementById("orderCloudStatus");
  if(!el){el=document.createElement("button");el.id="orderCloudStatus";el.type="button";el.className="cloud-data-layer-status order-cloud-status";el.style.bottom="54px";el.onclick=()=>alert(["Order Cloud Integration",`狀態：${state.status||"unknown"}`,`資料來源：${state.source||"local"}`,`待同步：${state.pending?"是":"否"}`,state.lastError?`錯誤：${state.lastError}`:""].filter(Boolean).join("\n"));document.body.appendChild(el);}
  const labels={booting:"Order Cloud 啟動中",ready:"Order Cloud Ready",writing:"Order Cloud 同步中",fallback:"Order Local Fallback","local-only":"Order Local Mode","local-pending-migration":"Order 待雲端遷移"};
  el.textContent=labels[state.status]||"Order Cloud";el.dataset.status=state.status||"unknown";
 }
 document.addEventListener("meiyuan6:order-cloud-state",e=>render(e.detail));
 document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>render(window.Meiyuan6OrderCloud?.state),100));
})();
