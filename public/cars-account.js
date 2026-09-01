(()=>{
'use strict';
const $=s=>document.querySelector(s);
const state={user:null,ready:false,mode:'login',pendingSell:false};
const lang=()=>window.ZebazLang?.get?.()||document.documentElement.lang||'ku';
const tr=(ku,ar,en)=>lang()==='ar'?ar:lang()==='en'?en:ku;
function setStatus(message='',error=false){const el=$('#accountStatus');if(!el)return;el.textContent=message;el.style.color=error?'#e12b38':'var(--c-muted)'}
function setOpen(open){const el=$('#accountModal');if(el)el.classList.toggle('open',open)}
function render(){
  const guest=$('#accountGuest'),member=$('#accountMember'),nameField=$('#accountNameField');
  if(guest)guest.hidden=!!state.user;if(member)member.hidden=!state.user;
  if(nameField)nameField.hidden=state.mode!=='register';
  document.querySelectorAll('.c-account-tab').forEach(b=>b.classList.toggle('active',b.dataset.accountMode===state.mode));
  const submit=$('#accountSubmit');if(submit)submit.textContent=state.mode==='register'?tr('دروستکردنی هەژمار','إنشاء حساب','Create account'):tr('چوونەژوورەوە','تسجيل الدخول','Sign in');
  const title=$('#accountTitle');if(title)title.textContent=state.user?tr('هەژمارەکەت','حسابك','Your account'):state.mode==='register'?tr('هەژمار دروست بکە','إنشاء حساب','Create account'):tr('چوونەژوورەوە','تسجيل الدخول','Sign in');
  const label=$('#accountButton .c-account-label');if(label)label.textContent=state.user?state.user.name:tr('هەژمار','الحساب','Account');
  if(state.user){const n=$('#accountMemberName'),p=$('#accountMemberPhone');if(n)n.textContent=state.user.name;if(p)p.textContent=state.user.phone;const name=$('#sellerName'),phone=$('#sellerPhone');if(name&&!name.value)name.value=state.user.name;if(phone&&!phone.value)phone.value=state.user.phone}
}
async function api(path,options={}){const r=await fetch(path,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}}),j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error||'Request failed');e.status=r.status;throw e}return j}
async function refresh(){
  try{const j=await api('/api/account/me');state.user=j.user||null}catch{state.user=null}finally{state.ready=true;render()}
  if(state.user&&state.pendingSell){state.pendingSell=false;setOpen(false);window.ZebazCarsApp?.modal?.('#sellModal',true)}
  return state.user;
}
function open(mode=state.user?'member':'login',pendingSell=false){state.mode=mode==='register'?'register':'login';state.pendingSell=!!pendingSell;setStatus(pendingSell?tr('بۆ بڵاوکردنەوەی ئۆتۆمبێل، سەرەتا بچۆ ژوورەوە یان هەژمار دروست بکە.','لنشر سيارة، سجّل الدخول أو أنشئ حساباً أولاً.','Sign in or create an account before posting a car.'):'');render();setOpen(true)}
function requireAccount(){if(state.user)return true;open('login',true);if(!state.ready)refresh();return false}
async function submit(e){
  e.preventDefault();const button=$('#accountSubmit');if(button)button.disabled=true;setStatus(tr('تکایە چاوەڕێ بکە…','يرجى الانتظار…','Please wait…'));
  try{
    const body={phone:$('#accountPhone')?.value.trim()||'',password:$('#accountPassword')?.value||''};if(state.mode==='register')body.name=$('#accountName')?.value.trim()||'';
    const j=await api('/api/account/'+(state.mode==='register'?'register':'login'),{method:'POST',body:JSON.stringify(body)});state.user=j.user;state.ready=true;render();setStatus('');
    const shouldSell=state.pendingSell;state.pendingSell=false;setOpen(false);if(shouldSell)setTimeout(()=>window.ZebazCarsApp?.modal?.('#sellModal',true),80)
  }catch(err){const message=err.status===409?tr('ئەم ژمارەیە پێشتر هەژماری هەیە.','هذا الرقم لديه حساب بالفعل.','This phone already has an account.'):err.status===401?tr('ژمارە یان وشەی نهێنی هەڵەیە.','رقم الهاتف أو كلمة المرور غير صحيحة.','Incorrect phone or password.'):err.status===429?tr('هەوڵی زۆر دراوە؛ کەمێک چاوەڕێ بکە.','محاولات كثيرة؛ انتظر قليلاً.','Too many attempts; try again later.'):tr('تکایە زانیارییەکان بە دروستی پڕ بکەرەوە.','أكمل المعلومات بشكل صحيح.','Please complete the information correctly.');setStatus(message,true)
  }finally{if(button)button.disabled=false}
}
async function logout(){try{await api('/api/account/logout',{method:'POST',body:'{}'})}catch{}state.user=null;state.ready=true;state.pendingSell=false;render();setOpen(false)}
function boot(){
  $('#accountButton')?.addEventListener('click',()=>open(state.user?'member':'login',false));
  document.querySelectorAll('.c-account-tab').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.accountMode;setStatus('');render()}));
  $('#accountForm')?.addEventListener('submit',submit);$('#accountLogout')?.addEventListener('click',logout);
  window.addEventListener('zebaz:lang',render);refresh();
}
window.ZebazAccount={require:requireAccount,open,refresh,getUser:()=>state.user};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
