(() => {
  "use strict";
  const config = window.MEIYUAN6_CLOUD_CONFIG || {};
  const ROLE_LABELS = Object.freeze({owner:"Owner",manager:"Manager",frontdesk:"Frontdesk",housekeeping:"Housekeeping",viewer:"Viewer"});
  const PAGE_ACCESS = Object.freeze({
    owner:["dashboard","calendar","orders","checkin","payments","services","housekeeping","guests","templates","audit","notifications","reports","settings"],
    manager:["dashboard","calendar","orders","checkin","payments","services","housekeeping","guests","templates","audit","notifications","reports","settings"],
    frontdesk:["dashboard","calendar","orders","checkin","payments","services","housekeeping","guests","templates","notifications"],
    housekeeping:["dashboard","calendar","checkin","housekeeping","notifications"],
    viewer:["dashboard","calendar","orders","checkin","services","housekeeping","notifications","reports"]
  });
  const state={mode:"local",session:null,profile:null,client:null,ready:false};
  const $=s=>document.querySelector(s);
  const $$=s=>Array.from(document.querySelectorAll(s));
  function toast(message){ const el=$("#toast"); if(!el)return; el.textContent=message; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2600); }
  function configured(){return Boolean(config.enabled&&config.authEnabled&&config.supabaseUrl&&config.supabasePublishableKey&&window.Meiyuan6Supabase?.configured());}
  function setLoginMode(cloud){
    const title=$("#loginForm h1"),sub=$("#loginForm p"),user=$("#loginUser"),pass=$("#loginPass"),small=$("#loginForm small");
    if(!user||!pass)return;
    if(cloud){
      state.mode="cloud"; user.type="email"; user.value=""; user.placeholder="name@example.com"; user.closest("label").childNodes[0].textContent="電子郵件";
      pass.value=""; sub.textContent="Enterprise V1.3 · Phase 7 · Cloud RC1 Authentication";
      small.textContent="使用已核准的眉原六管理帳號登入";
      const btn=$("#loginForm button[type=submit]"); if(btn) btn.textContent="登入雲端系統";
      if(!$("#forgotPasswordBtn")){ const b=document.createElement("button"); b.type="button"; b.id="forgotPasswordBtn"; b.className="link-button full"; b.textContent="忘記密碼"; small.before(b); b.onclick=resetPassword; }
    } else {
      state.mode="local"; sub.textContent="Enterprise V1.3 · Phase 7 · Local Safe Mode";
    }
  }
  function initClient(){
    if(!configured())return null;
    state.client=window.Meiyuan6Supabase.getClient();
    return state.client;
  }
  async function loadProfile(user){
    const {data,error}=await state.client.from("user_profiles").select("id,property_id,display_name,role,is_active").eq("id",user.id).maybeSingle();
    if(error)throw error;
    if(!data||!data.is_active)throw new Error("帳號尚未啟用或已被停用");
    if(!ROLE_LABELS[data.role])throw new Error("帳號角色設定無效");
    state.profile=data; return data;
  }
  function applyRole(profile){
    const role=profile?.role||"viewer", allowed=new Set(PAGE_ACCESS[role]||PAGE_ACCESS.viewer);
    $$("#nav [data-page]").forEach(btn=>{btn.hidden=!allowed.has(btn.dataset.page);});
    const roleBadge=$("#authUserBadge"); if(roleBadge){roleBadge.textContent=`${profile.display_name||"使用者"} · ${ROLE_LABELS[role]}`;roleBadge.hidden=false;}
    const settings=$("#openSettingsBtn"); if(settings) settings.hidden=!allowed.has("settings");
    const addOrder=$("#quickAddOrder"); if(addOrder) addOrder.hidden=!(["owner","manager","frontdesk"].includes(role));
    const destructiveAllowed=["owner","manager"].includes(role);
    document.documentElement.dataset.authRole=role;
    document.documentElement.dataset.canDelete=String(destructiveAllowed);
    if(!allowed.has(document.querySelector(".page.active")?.id||"dashboard")) document.querySelector('#nav [data-page="dashboard"]')?.click();
  }
  function showApp(){ $("#loginView")?.classList.add("hidden"); $("#appView")?.classList.remove("hidden"); document.dispatchEvent(new CustomEvent("meiyuan6:auth-ready",{detail:{authenticated:true,role:state.profile?.role||null}})); if(typeof window.renderAll==="function")window.renderAll(); }
  function showLogin(message){ $("#appView")?.classList.add("hidden"); $("#loginView")?.classList.remove("hidden"); document.dispatchEvent(new CustomEvent("meiyuan6:auth-ready",{detail:{authenticated:false}})); if(message)toast(message); }
  async function signIn(email,password){
    const {data,error}=await state.client.auth.signInWithPassword({email,password}); if(error)throw error;
    await loadProfile(data.user); applyRole(state.profile); showApp();
  }
  async function signOut(){ if(state.client)await state.client.auth.signOut(); state.session=null;state.profile=null;location.reload(); }
  async function resetPassword(){
    const email=$("#loginUser")?.value.trim(); if(!email){toast("請先輸入電子郵件");return;}
    const {error}=await state.client.auth.resetPasswordForEmail(email,{redirectTo:config.passwordResetRedirect});
    toast(error?`無法寄送：${error.message}`:"密碼重設信已寄出");
  }
  async function restore(){
    const {data,error}=await state.client.auth.getSession(); if(error)throw error;
    state.session=data.session;
    if(!data.session){showLogin();return;}
    try{await loadProfile(data.session.user);applyRole(state.profile);showApp();}catch(err){await state.client.auth.signOut();showLogin(err.message);}
  }
  function bindCloudHandlers(){
    const form=$("#loginForm"); if(form) form.onsubmit=async e=>{e.preventDefault();const btn=form.querySelector('button[type="submit"]');btn.disabled=true;try{await signIn($("#loginUser").value.trim(),$("#loginPass").value);}catch(err){toast(err.message||"登入失敗");}finally{btn.disabled=false;}};
    const logout=$("#logoutBtn"); if(logout) logout.onclick=signOut;
    state.client.auth.onAuthStateChange(async(event,session)=>{state.session=session;if(event==="SIGNED_OUT")showLogin();});
  }
  async function init(){
    if(!configured()){setLoginMode(false);state.ready=true;window.Meiyuan6Auth=Object.freeze({state,ROLE_LABELS,PAGE_ACCESS});return;}
    setLoginMode(true);initClient();bindCloudHandlers();await restore();state.ready=true;
    window.Meiyuan6Auth=Object.freeze({state,ROLE_LABELS,PAGE_ACCESS,signOut,refreshProfile:async()=>applyRole(await loadProfile(state.session.user))});
    console.info("[Meiyuan6 Auth]",{mode:state.mode,role:state.profile?.role||null,ready:true});
  }
  window.addEventListener("DOMContentLoaded",()=>{init().catch(err=>{console.error("[Meiyuan6 Auth]",err);showLogin("雲端登入初始化失敗，請檢查設定");});},{once:true});
})();
