(() => {
  "use strict";
  const C=window.MEIYUAN6_CLOUD_CONFIG||{};
  const QUEUE_KEY="my6_cloud_pending_queue_v1";
  const CONFLICT_KEY="my6_cloud_conflicts_v1";
  const DRAFT_KEY="my6_cloud_drafts_v1";
  const MAX=Math.max(10,Number(C.offlineQueueMaxItems||100));
  const emit=(name,detail={})=>document.dispatchEvent(new CustomEvent(name,{detail}));
  const parse=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||"")||fallback}catch{return fallback}};
  const save=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const uuid=()=>crypto.randomUUID?crypto.randomUUID():`idem-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const canonical=v=>JSON.stringify(v,Object.keys(v||{}).sort());
  async function digest(value){const bytes=new TextEncoder().encode(canonical(value));if(crypto.subtle){const h=await crypto.subtle.digest("SHA-256",bytes);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("")}let h=2166136261;for(const b of bytes)h=Math.imul(h^b,16777619);return `fnv-${(h>>>0).toString(16)}`}
  function queue(){return parse(QUEUE_KEY,[])}
  function conflicts(){return parse(CONFLICT_KEY,[])}
  async function enqueue(payload,reason="local-change"){
    if(C.offlineQueueEnabled===false)return null;
    const hash=await digest(payload);const q=queue();
    const duplicate=q.find(x=>x.hash===hash&&x.status!=="failed");if(duplicate)return duplicate;
    const item={id:uuid(),idempotencyKey:uuid(),hash,reason,status:"pending",attempts:0,createdAt:new Date().toISOString(),payload};
    q.push(item);while(q.length>MAX)q.shift();save(QUEUE_KEY,q);emit("meiyuan6:queue-change",status());return item;
  }
  function next(){return queue().find(x=>x.status==="pending"||x.status==="failed")||null}
  function mark(id,statusValue,error=""){const q=queue();const x=q.find(i=>i.id===id);if(x){x.status=statusValue;x.error=error;x.updatedAt=new Date().toISOString();if(statusValue==="sending")x.attempts=(x.attempts||0)+1;save(QUEUE_KEY,q);emit("meiyuan6:queue-change",status())}return x}
  function remove(id){save(QUEUE_KEY,queue().filter(x=>x.id!==id));emit("meiyuan6:queue-change",status())}
  function addConflict(detail){const list=conflicts();const item={id:uuid(),createdAt:new Date().toISOString(),resolved:false,...detail};list.unshift(item);save(CONFLICT_KEY,list.slice(0,200));emit("meiyuan6:conflict",item);return item}
  function resolveConflict(id){const list=conflicts();const item=list.find(x=>x.id===id);if(item){item.resolved=true;item.resolvedAt=new Date().toISOString();save(CONFLICT_KEY,list)}emit("meiyuan6:conflict-change",status())}
  function resolveEntityConflicts(table,id,resolution="cloud-refresh"){
    const list=conflicts();let changed=0;
    list.forEach(item=>{if(!item.resolved&&item.table===table&&String(item.id)===String(id)){item.resolved=true;item.resolution=resolution;item.resolvedAt=new Date().toISOString();changed+=1;}});
    if(changed)save(CONFLICT_KEY,list);
    emit("meiyuan6:conflict-change",status());
    return changed;
  }
  function saveDraft(scope,id,data){const d=parse(DRAFT_KEY,{});d[`${scope}:${id||"new"}`]={scope,id,data,updatedAt:new Date().toISOString()};save(DRAFT_KEY,d)}
  function loadDraft(scope,id){return parse(DRAFT_KEY,{})[`${scope}:${id||"new"}`]||null}
  function clearDraft(scope,id){const d=parse(DRAFT_KEY,{});delete d[`${scope}:${id||"new"}`];save(DRAFT_KEY,d)}
  function status(){const q=queue(),c=conflicts();return {pending:q.filter(x=>x.status!=="sent").length,failed:q.filter(x=>x.status==="failed").length,conflicts:c.filter(x=>!x.resolved).length,online:navigator.onLine}}
  function canCommit(risk="normal") {if(navigator.onLine)return {ok:true};if(C.highRiskOfflineGuard!==false&&["payment","refund","verify","delete","settings","booking"].includes(risk))return {ok:false,reason:"此操作需要連線以確認最新雲端資料。"};return {ok:true,queued:true}}
  window.Meiyuan6OfflineGuard=Object.freeze({enqueue,next,mark,remove,queue,status,addConflict,conflicts,resolveConflict,resolveEntityConflicts,saveDraft,loadDraft,clearDraft,canCommit,digest});
})();
