(() => {
  "use strict";
  const C=window.MEIYUAN6_CLOUD_CONFIG||{};
  const TABLES=["orders","order_rooms","payments","services","housekeeping_tasks","room_locks","guest_profiles","templates","checkin_checklists","shortcuts","property_settings","audit_logs"];
  const state={status:"disabled",connected:false,lastEventAt:null,lastSyncAt:null,pending:0,error:"",channel:null,client:null,pushTimer:null,pullTimer:null,applyingRemote:false,pushing:false,ignoreRemoteUntil:0,lastPullFingerprint:"",seen:new Map()};
  const emit=(name,detail={})=>document.dispatchEvent(new CustomEvent(name,{detail}));
  function setStatus(status,error=""){state.status=status;state.error=error;state.connected=status==="connected";renderBadge();emit("meiyuan6:sync-status",snapshot());}
  function snapshot(){return {status:state.status,connected:state.connected,lastEventAt:state.lastEventAt,lastSyncAt:state.lastSyncAt,pending:state.pending,error:state.error};}
  function renderBadge(){let el=document.getElementById("cloudSyncStatus");if(!el){el=document.createElement("div");el.id="cloudSyncStatus";el.className="cloud-sync-status";document.body.appendChild(el)}const labels={disabled:"Realtime 未啟用","waiting-auth":"等待雲端登入",connecting:"Realtime 連線中",connected:"雲端已同步",syncing:"同步中",offline:"離線",error:"Realtime 錯誤"};el.textContent=labels[state.status]||state.status;el.dataset.status=state.status;el.title=state.error||`最後同步：${state.lastSyncAt||"尚未同步"}`;}
  const enabled=()=>Boolean(C.enabled&&C.mode==="cloud"&&C.realtimeEnabled&&C.supabaseUrl&&C.supabasePublishableKey&&window.Meiyuan6Supabase?.configured());
  function client(){if(!state.client)state.client=window.Meiyuan6Supabase?.getClient();if(!state.client)throw new Error("Supabase Client 尚未設定");return state.client;}
  function dedupe(payload){const row=payload.new||payload.old||{};const key=[payload.table,payload.eventType,row.id||row.property_id||"",row.updated_at||payload.commit_timestamp||""].join("|");const now=Date.now();for(const [k,t] of state.seen)if(now-t>30000)state.seen.delete(k);if(state.seen.has(key))return true;state.seen.set(key,now);return false;}
  async function fetchAll(){const c=client(), out={};for(const t of TABLES){const {data,error}=await c.from(t).select("*").eq("property_id",C.propertyId);if(error)throw new Error(`${t}: ${error.message}`);out[t]=data||[]}return out;}
  function toLocal(d){const byOrder={};(d.order_rooms||[]).forEach(x=>(byOrder[x.order_id]??=[]).push(x.room_id));const sv={};(d.services||[]).forEach(x=>(sv[x.order_id]??=[]).push({...x.details,id:x.id,type:x.service_type,date:x.service_date,time:x.service_time,status:x.status,fee:Number(x.fee||0),paymentStatus:x.payment_status,note:x.note,revision:Number(x.revision||1),createdAt:x.created_at,updatedAt:x.updated_at}));
    const orders=(d.orders||[]).map(o=>({id:o.id,name:o.guest_name,phone:o.phone,checkin:o.checkin_date,checkout:o.checkout_date,guests:o.guest_count,packageType:o.package_type,orderType:o.order_type,lifecycleStatus:o.status,total:Number(o.total_amount||0),openingPaid:Number(o.opening_paid||0),paid:Number(o.opening_paid||0),source:o.source,note:o.note,backfillReason:o.backfill_reason,revision:o.revision,createdAt:o.created_at,updatedAt:o.updated_at,rooms:byOrder[o.id]||[],room:(byOrder[o.id]||[])[0]||"",services:sv[o.id]||[]}));
    const payments=(d.payments||[]).map(p=>({id:p.id,orderId:p.order_id,type:p.transaction_type,amount:Number(p.amount||0),method:p.payment_method,date:p.transaction_date,description:p.description,refundReason:p.refund_reason,verified:p.verified,verifiedAt:p.verified_at,revision:p.revision,createdAt:p.created_at,updatedAt:p.updated_at}));
    const tasks=(d.housekeeping_tasks||[]).map(t=>({id:t.id,orderId:t.order_id,room:t.room_id,date:t.task_date,title:t.title,status:t.status,priority:t.priority,assignee:t.assignee,inspector:t.inspector,scheduledCheckout:t.scheduled_checkout,startedAt:t.started_at,pausedAt:t.paused_at,inspectedAt:t.inspected_at,completedAt:t.completed_at,note:t.note,revision:t.revision}));
    const roomLocks=(d.room_locks||[]).map(x=>({id:x.id,room:x.room_id,start:x.start_date,end:x.end_date,type:x.lock_type,reason:x.reason,revision:x.revision}));
    const guestProfiles=Object.fromEntries((d.guest_profiles||[]).map(g=>[g.phone||g.id,{name:g.name,phone:g.phone,email:g.email,note:g.note,lastOrderAt:g.last_order_at}]));
    const templates=Object.fromEntries((d.templates||[]).map(t=>[t.title,String(t.content||"")]));
    const checklists=Object.fromEntries((d.checkin_checklists||[]).map(row=>[row.order_id,{checklist:row.checklist||{},revision:Number(row.revision||1),updatedAt:row.updated_at}]));
    orders.forEach(order=>{const saved=checklists[order.id];if(saved){order.checklist={...(order.checklist||{}),...saved.checklist};order.checklistRevision=saved.revision;}});
    const shortcuts=(d.shortcuts||[]).sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0)).map(row=>({id:row.id,icon:row.icon,name:row.name,url:row.url,sortOrder:Number(row.sort_order||0),revision:Number(row.revision||1),updatedAt:row.updated_at}));
    const settings=(d.property_settings||[])[0]?.settings||{};
    const auditLogs=(d.audit_logs||[]).map(a=>({id:a.id,operator:a.operator_name,module:a.module,action:a.action,targetId:a.target_id,orderId:a.order_id,guestName:a.guest_name,roomName:a.room_name,summary:a.summary,before:a.before_data,after:a.after_data,deviceId:a.device_id,revision:a.revision,createdAt:a.created_at}));
    return {orders,payments,tasks,roomLocks,guestProfiles,templates,checklists,shortcuts,settings,auditLogs};}
  function preservePendingServices(local){
    let pending=[];try{pending=JSON.parse(localStorage.getItem("my6_pending_service_writes")||"[]")}catch{}
    if(!Array.isArray(pending)||!pending.length)return local;
    const orders=new Map((local.orders||[]).map(order=>[String(order.id),order])),remaining=[];
    pending.filter(item=>Date.now()-new Date(item.savedAt||0).getTime()<86400000).forEach(item=>{
      const order=orders.get(String(item.orderId)),saved=item.service;if(!saved?.id)return;
      if(!order){remaining.push(item);return;}
      order.services=Array.isArray(order.services)?order.services:[];
      const index=order.services.findIndex(service=>String(service.id)===String(saved.id)),cloud=index>=0?order.services[index]:null;
      const confirmed=cloud&&Number(cloud.revision||1)>=Number(saved.revision||1)&&JSON.stringify({...cloud,createdAt:"",updatedAt:""})===JSON.stringify({...saved,createdAt:"",updatedAt:""});
      if(confirmed)return;
      if(index>=0)order.services[index]=saved;else order.services.push(saved);
      remaining.push(item);
    });
    localStorage.setItem("my6_pending_service_writes",JSON.stringify(remaining));
    return local;
  }
  function preservePendingSettings(local){
    let pending=null;try{pending=JSON.parse(localStorage.getItem("my6_pending_settings_write")||"null")}catch{}
    if(!pending?.settings||Date.now()-new Date(pending.savedAt||0).getTime()>=86400000){localStorage.removeItem("my6_pending_settings_write");return local;}
    if(JSON.stringify(local.settings||{})===JSON.stringify(pending.settings)){localStorage.removeItem("my6_pending_settings_write");return local;}
    local.settings=pending.settings;return local;
  }
  function preservePendingTemplates(local){
    let pending={};try{pending=JSON.parse(localStorage.getItem("my6_pending_template_writes")||"{}")}catch{}
    let pendingDeletes={};try{pendingDeletes=JSON.parse(localStorage.getItem("my6_pending_template_deletes")||"{}")}catch{}
    const now=Date.now(),remaining={};local.templates=local.templates||{};
    Object.entries(pending||{}).forEach(([title,item])=>{
      if(now-new Date(item.savedAt||0).getTime()>=86400000)return;
      if(String(local.templates[title]??"")===String(item.content??""))return;
      local.templates[title]=String(item.content??"");remaining[title]=item;
    });
    const remainingDeletes={};
    Object.entries(pendingDeletes||{}).forEach(([title,item])=>{
      if(now-new Date(item.savedAt||0).getTime()>=86400000)return;
      if(!Object.prototype.hasOwnProperty.call(local.templates,title))return;
      delete local.templates[title];remainingDeletes[title]=item;
    });
    localStorage.setItem("my6_pending_template_writes",JSON.stringify(remaining));
    localStorage.setItem("my6_pending_template_deletes",JSON.stringify(remainingDeletes));return local;
  }
  function preservePendingChecklists(local){
    let pending={};try{pending=JSON.parse(localStorage.getItem("my6_pending_checklist_writes")||"{}")}catch{}
    const now=Date.now(),remaining={};local.checklists=local.checklists||{};
    Object.entries(pending||{}).forEach(([orderId,item])=>{
      if(now-new Date(item.savedAt||0).getTime()>=86400000)return;
      const cloud=local.checklists[orderId];
      if(cloud&&Number(cloud.revision||0)>Number(item.expectedRevision||0)&&JSON.stringify(cloud.checklist||{})===JSON.stringify(item.checklist||{}))return;
      local.checklists[orderId]={checklist:item.checklist||{},revision:Number(item.expectedRevision||0),updatedAt:item.savedAt};
      const order=(local.orders||[]).find(row=>String(row.id)===String(orderId));
      if(order)order.checklist={...(order.checklist||{}),...(item.checklist||{})};
      remaining[orderId]=item;
    });
    localStorage.setItem("my6_pending_checklist_writes",JSON.stringify(remaining));return local;
  }
  function preservePendingShortcuts(local){
    let pending=null;try{pending=JSON.parse(localStorage.getItem("my6_pending_shortcuts_write")||"null")}catch{}
    if(!pending?.shortcuts&&!(local.shortcuts||[]).length){
      let existing=[];try{existing=JSON.parse(localStorage.getItem("my6_shortcuts")||"[]")}catch{}
      if(Array.isArray(existing)&&existing.length){pending={shortcuts:existing,savedAt:new Date().toISOString()};localStorage.setItem("my6_pending_shortcuts_write",JSON.stringify(pending));}
    }
    if(!pending?.shortcuts||Date.now()-new Date(pending.savedAt||0).getTime()>=86400000){localStorage.removeItem("my6_pending_shortcuts_write");return local;}
    const normalize=list=>JSON.stringify((list||[]).map(({id,icon,name,url})=>({id,icon,name,url})));
    if(normalize(local.shortcuts)===normalize(pending.shortcuts)){localStorage.removeItem("my6_pending_shortcuts_write");return local;}
    local.shortcuts=pending.shortcuts;return local;
  }
  async function pull(){if(!enabled()||state.applyingRemote||state.pushing)return;state.applyingRemote=true;try{const local=preservePendingShortcuts(preservePendingChecklists(preservePendingTemplates(preservePendingSettings(preservePendingServices(toLocal(await fetchAll()))))));const fingerprint=JSON.stringify(local);if(fingerprint===state.lastPullFingerprint){state.lastSyncAt=state.lastSyncAt||new Date().toISOString();setStatus("connected");return {skipped:true};}setStatus("syncing");state.lastPullFingerprint=fingerprint;const keys={orders:"my6_orders",payments:"my6_payments",tasks:"my6_tasks",roomLocks:"my6_room_locks",guestProfiles:"my6_guest_profiles",templates:"my6_templates",checklists:"my6_checkin_checklists",shortcuts:"my6_shortcuts",settings:"my6_settings",auditLogs:"my6_audit_logs"};Object.entries(keys).forEach(([n,k])=>localStorage.setItem(k,JSON.stringify(local[n])));state.lastSyncAt=new Date().toISOString();setStatus("connected");emit("meiyuan6:cloud-data-applied",{at:state.lastSyncAt,source:"realtime"})}catch(e){setStatus(navigator.onLine?"error":"offline",e.message)}finally{state.applyingRemote=false}}
  function schedulePull(){if(Date.now()<state.ignoreRemoteUntil||state.pushing||state.applyingRemote)return;clearTimeout(state.pullTimer);state.pending=1;state.pullTimer=setTimeout(()=>{state.pending=0;pull()},Math.max(1800,Number(C.realtimeDebounceMs||800)));}
  const BUSINESS_FIELDS={
    orders:["guest_name","phone","checkin_date","checkout_date","guest_count","package_type","order_type","status","total_amount","opening_paid","source","note","backfill_reason"],
    payments:["order_id","transaction_type","amount","payment_method","transaction_date","description","refund_reason","verified","verified_at"],
    services:["order_id","service_type","service_date","service_time","status","fee","payment_status","note","details"],
    housekeeping_tasks:["order_id","room_id","task_date","title","status","priority","assignee","inspector","scheduled_checkout","started_at","paused_at","inspected_at","completed_at","note"],
    room_locks:["room_id","start_date","end_date","lock_type","reason"]
  };
  const comparable=value=>{
    if(value===undefined||value===null)return "";
    if(typeof value==="number")return Number(value);
    if(typeof value==="boolean")return value;
    if(typeof value==="object")return JSON.stringify(value,Object.keys(value).sort());
    return String(value);
  };
  function sameBusinessRow(table,local,remote){
    return (BUSINESS_FIELDS[table]||[]).every(field=>comparable(local?.[field])===comparable(remote?.[field]));
  }
  async function remoteRevisions(c,table,rows){
    const ids=rows.map(x=>x.id).filter(Boolean);if(!ids.length)return new Map();
    const {data,error}=await c.from(table).select("*").in("id",ids);
    if(error)throw new Error(`${table}: ${error.message}`);return new Map((data||[]).map(x=>[x.id,x]));
  }
  async function guardConflicts(c,data){
    if(C.conflictGuardEnabled===false)return data;
    const guarded={...data};
    for(const table of ["orders","payments","services","housekeeping_tasks","room_locks"]){
      const rows=data[table]||[];if(!rows.length)continue;const remote=await remoteRevisions(c,table,rows);
      const safeRows=[];
      for(const row of rows){
        const rr=remote.get(row.id);if(!rr){safeRows.push(row);continue;}
        const localRevision=Number(row.revision||1),remoteRevision=Number(rr.revision||1);
        if(remoteRevision>localRevision){
          // A stale revision with identical business fields is an unchanged snapshot, not a conflict.
          // Skip that row so another dataset (for example a new payment) can still be committed.
          if(sameBusinessRow(table,row,rr))continue;
          const detail={table,id:row.id,localRevision,remoteRevision,remoteUpdatedAt:rr.updated_at,message:"雲端資料版本較新，已阻止舊資料覆蓋。"};
          window.Meiyuan6OfflineGuard?.addConflict(detail);throw Object.assign(new Error(`${table}/${row.id} 發生版本衝突`),{code:"REVISION_CONFLICT",detail});
        }
        safeRows.push(row);
      }
      guarded[table]=safeRows;
    }
    return guarded;
  }
  async function transmit(item){
    const c=client(),snapshot=item?.payload||window.Meiyuan6Migration.transform(),data=await guardConflicts(c,snapshot);
    // Payments are committed immediately after their parent orders. Auxiliary relations must not block money writes.
    const order=["orders","payments","order_rooms","services","housekeeping_tasks","room_locks","guest_profiles","property_settings","audit_logs"];
    const conflictTarget={order_rooms:"order_id,room_id",property_settings:"property_id"};
    for(const t of order){
      const rows=data[t]||[];if(!rows.length)continue;
      const opts=conflictTarget[t]?{onConflict:conflictTarget[t]}:undefined;
      const {error}=await c.from(t).upsert(rows,opts);
      if(error)throw Object.assign(new Error(`${t}: ${error.message}`),{code:"TABLE_WRITE_FAILED",table:t});
    }
    if(item?.idempotencyKey){const {error}=await c.from("sync_operations").upsert({property_id:C.propertyId,idempotency_key:item.idempotencyKey,device_id:localStorage.getItem("my6_device_id")||"",payload_hash:item.hash||"",status:"completed",completed_at:new Date().toISOString()},{onConflict:"property_id,idempotency_key"});if(error&&!/does not exist/i.test(error.message))throw error}
  }
  async function flushQueue(){if(!enabled()||!navigator.onLine||!window.Meiyuan6OfflineGuard)return;let item;while((item=window.Meiyuan6OfflineGuard.next())){window.Meiyuan6OfflineGuard.mark(item.id,"sending");try{await transmit(item);window.Meiyuan6OfflineGuard.remove(item.id)}catch(e){window.Meiyuan6OfflineGuard.mark(item.id,"failed",e.message);e.queueItemId=item.id;throw e}}}
  async function push(){
    if(!enabled()||state.applyingRemote||state.pushing||!window.Meiyuan6Migration)return;
    let refreshAfterPush=false,recoveredConflict=null;
    state.pushing=true;state.ignoreRemoteUntil=Date.now()+5000;setStatus("syncing");
    try{
      const data=window.Meiyuan6Migration.transform();let item=null;
      if(window.Meiyuan6OfflineGuard)item=await window.Meiyuan6OfflineGuard.enqueue(data,navigator.onLine?"debounced-change":"offline-change");
      if(!navigator.onLine){setStatus("offline","資料已加入待同步佇列");return}
      if(item){await flushQueue()}else await transmit(null);
      state.lastSyncAt=new Date().toISOString();refreshAfterPush=true;
    }catch(e){
      if(e.code==="REVISION_CONFLICT"&&navigator.onLine){
        // A stale full snapshot must not retry forever. Keep the audit record, discard only that stale queue item,
        // refresh the latest cloud revision, and return Realtime to a healthy state without interrupting the page.
        if(e.queueItemId)window.Meiyuan6OfflineGuard?.remove(e.queueItemId);
        recoveredConflict=e.detail||null;refreshAfterPush=true;
      }else setStatus(navigator.onLine?"error":"offline",e.message);
    }finally{
      state.pushing=false;state.ignoreRemoteUntil=Math.max(state.ignoreRemoteUntil,Date.now()+2500);
    }
    if(refreshAfterPush){
      let result=await pull();
      if(recoveredConflict){
        let conflict=recoveredConflict,recovered=false;
        for(let attempt=0;attempt<5&&!recovered;attempt+=1){
          window.Meiyuan6OfflineGuard?.resolveEntityConflicts?.(conflict.table,conflict.id,"cloud-refresh");
          // A newer queue item may contain the payment that triggered this push. Continue after every stale
          // item is removed; refresh between attempts so each queued snapshot is checked against current data.
          try{
            await flushQueue();
            result=await pull();
            recovered=true;
          }catch(retryError){
            if(retryError.code==="REVISION_CONFLICT"&&retryError.queueItemId){
              window.Meiyuan6OfflineGuard?.remove(retryError.queueItemId);
              conflict=retryError.detail||conflict;
              result=await pull();
              continue;
            }
            setStatus(navigator.onLine?"error":"offline",retryError.message);
            return;
          }
        }
        if(!recovered){setStatus("error","同步佇列含有多筆舊版本資料，請重新同步");return;}
      }
      if(result!==undefined||!state.error)setStatus("connected");
    }
  }
  function schedulePush(){if(!enabled()||state.applyingRemote)return;clearTimeout(state.pushTimer);state.pending++;state.pushTimer=setTimeout(()=>{state.pending=0;push()},Number(C.realtimeDebounceMs||800));}
  async function start(){renderBadge();if(!enabled()){setStatus("disabled");return snapshot()}if(state.channel&&state.connected)return snapshot();setStatus("connecting");const c=client();const {data}=await c.auth.getSession();if(!data.session){setStatus("waiting-auth","尚未登入 Cloud Auth");return snapshot()}if(state.channel){try{await c.removeChannel(state.channel)}catch{}state.channel=null;}let ch=c.channel(`meiyuan6-${C.propertyId}`);for(const table of TABLES)ch=ch.on("postgres_changes",{event:"*",schema:"public",table,filter:`property_id=eq.${C.propertyId}`},payload=>{if(dedupe(payload)||Date.now()<state.ignoreRemoteUntil||state.pushing)return;state.lastEventAt=new Date().toISOString();emit("meiyuan6:cloud-change",{table,eventType:payload.eventType});schedulePull()});state.channel=ch.subscribe(status=>{if(status==="SUBSCRIBED")setStatus("connected");else if(["CHANNEL_ERROR","TIMED_OUT","CLOSED"].includes(status))setStatus(navigator.onLine?"error":"offline",status)});return snapshot()}
  async function stop(){if(state.channel&&state.client)await state.client.removeChannel(state.channel);state.channel=null;setStatus("disabled")}
  window.addEventListener("online",()=>{if(enabled()){setStatus("connecting");start()}});window.addEventListener("offline",()=>setStatus("offline","網路已中斷"));
  document.addEventListener("meiyuan6:auth-ready",e=>{if(e.detail?.authenticated===true)start();else if(e.detail?.authenticated===false)setStatus("waiting-auth")});
  window.Meiyuan6Realtime=Object.freeze({start,stop,pull,push,schedulePush,status:snapshot,getStatus:snapshot});document.addEventListener("DOMContentLoaded",start);
})();
