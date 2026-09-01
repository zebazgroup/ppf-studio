(()=>{
'use strict';
const $=s=>document.querySelector(s);
const state={user:null,ready:false,mode:'login',pendingSell:false,otpStep:false,otpPhone:'',memberCodeSent:false,config:{otpRequired:false,smsConfigured:false}};
const lang=()=>window.ZebazLang?.get?.()||document.documentElement.lang||'ku';
const tr=(ku,ar,en)=>lang()==='ar'?ar:lang()==='en'?en:ku;
function setStatus(message='',error=false){const el=$('#accountStatus');if(!el)return;el.textContent=message;el.style.color=error?'#e12b38':'var(--c-muted)'}
function setMemberStatus(message='',error=false){const el=$('#accountMemberStatus');if(!el)return;el.textContent=message;el.style.color=error?'#e12b38':'var(--c-muted)'}
function setOpen(open){const el=$('#accountModal');if(el)el.classList.toggle('open',open)}
function toggleField(selector,show){const field=$(selector);if(!field)return;field.hidden=!show;field.querySelectorAll('input').forEach(input=>input.disabled=!show)}
function render(){
  const guest=$('#accountGuest'),member=$('#accountMember'),tabs=$('.c-account-tabs');
  if(guest)guest.hidden=!!state.user;if(member)member.hidden=!state.user;if(tabs)tabs.hidden=state.otpStep;
  toggleField('#accountNameField',!state.otpStep&&state.mode==='register');
  toggleField('#accountPhoneField',!state.otpStep);
  toggleField('#accountPasswordField',!state.otpStep);
  toggleField('#accountOtpField',state.otpStep);
  document.querySelectorAll('.c-account-tab').forEach(b=>b.classList.toggle('active',b.dataset.accountMode===state.mode));
  const submit=$('#accountSubmit');if(submit)submit.textContent=state.otpStep?tr('پشتڕاستکردنەوەی کۆد','تأكيد الرمز','Verify code'):state.mode==='register'?(state.config.otpRequired?tr('ناردنی کۆد','إرسال الرمز','Send code'):tr('دروستکردنی هەژمار','إنشاء حساب','Create account')):tr('چوونەژوورەوە','تسجيل الدخول','Sign in');
  const resend=$('#accountResend');if(resend){resend.hidden=!state.otpStep;resend.textContent=tr('کۆد دووبارە بنێرە','إعادة إرسال الرمز','Resend code')}
  const title=$('#accountTitle');if(title)title.textContent=state.user?tr('هەژمارەکەت','حسابك','Your account'):state.otpStep?tr('کۆدەکە بنووسە','أدخل رمز التحقق','Enter the code'):state.mode==='register'?tr('هەژمار دروست بکە','إنشاء حساب','Create account'):tr('چوونەژوورەوە','تسجيل الدخول','Sign in');
  const label=$('#accountButton .c-account-label');if(label)label.textContent=state.user?state.user.name:tr('هەژمار','الحساب','Account');
  if(state.user){
    const n=$('#accountMemberName'),p=$('#accountMemberPhone');if(n)n.textContent=state.user.name;if(p)p.textContent=state.user.phone;
    const needsVerify=state.config.otpRequired&&!state.user.phoneVerified,box=$('#accountMemberVerify');if(box)box.hidden=!needsVerify;
    const verifyTitle=$('#accountMemberVerifyTitle'),verifyText=$('#accountMemberVerifyText'),send=$('#accountSendVerify'),check=$('#accountCheckVerify'),wrap=$('#accountMemberCodeWrap');
    if(verifyTitle)verifyTitle.textContent=tr('ژمارەکەت پشتڕاست بکەرەوە','أكد رقم هاتفك','Verify your phone');
    if(verifyText)verifyText.textContent=tr('پێش بڵاوکردنەوەی ئۆتۆمبێل، کۆدی 6 ژمارەیی بە SMS بگرە.','قبل نشر سيارة، استلم رمزاً من 6 أرقام عبر SMS.','Get a 6-digit SMS code before posting a car.');
    if(send)send.textContent=state.memberCodeSent?tr('کۆد دووبارە بنێرە','إعادة إرسال الرمز','Resend code'):tr('کۆد بنێرە','إرسال الرمز','Send code');
    if(check)check.textContent=tr('پشتڕاستکردنەوە','تأكيد','Verify');if(wrap)wrap.hidden=!state.memberCodeSent;
    const name=$('#sellerName'),phone=$('#sellerPhone');if(name&&!name.value)name.value=state.user.name;if(phone&&!phone.value)phone.value=state.user.phone;
  }
}
async function api(path,options={}){const r=await fetch(path,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}}),j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error||'Request failed');e.status=r.status;e.code=j.code;throw e}return j}
function accountError(err){
  if(err.code==='SMS_NOT_CONFIGURED')return tr('خزمەتی SMS هێشتا چالاک نەکراوە.','خدمة الرسائل لم تُفعّل بعد.','SMS verification is not active yet.');
  if(err.code==='SMS_UNAVAILABLE')return tr('کۆدەکە نەنێردرا؛ دووبارە هەوڵ بدەرەوە.','لم يتم إرسال الرمز؛ حاول مرة أخرى.','The code was not sent; try again.');
  if(err.code==='INVALID_CODE'||err.status===401&&state.otpStep)return tr('کۆدەکە هەڵەیە.','رمز التحقق غير صحيح.','The verification code is incorrect.');
  if(err.code==='OTP_EXPIRED')return tr('کۆدەکە بەسەرچوو؛ کۆدێکی نوێ بگرە.','انتهت صلاحية الرمز؛ اطلب رمزاً جديداً.','The code expired; request a new one.');
  if(err.code==='OTP_COOLDOWN')return tr('پێش ناردنەوەی کۆدێکی تر 60 چرکە چاوەڕێ بکە.','انتظر 60 ثانية قبل طلب رمز آخر.','Wait 60 seconds before requesting another code.');
  if(err.code==='OTP_RATE_LIMIT'||err.status===429)return tr('هەوڵی زۆر دراوە؛ کەمێک چاوەڕێ بکە.','محاولات كثيرة؛ انتظر قليلاً.','Too many attempts; try again later.');
  if(err.status===409)return tr('ئەم ژمارەیە پێشتر هەژماری هەیە.','هذا الرقم لديه حساب بالفعل.','This phone already has an account.');
  if(err.code==='INVALID_PHONE')return tr('ژمارەی مۆبایلی عێراقی دروست بنووسە.','أدخل رقم هاتف عراقي صحيحاً.','Enter a valid Iraqi mobile number.');
  if(err.status===401)return tr('ژمارە یان وشەی نهێنی هەڵەیە.','رقم الهاتف أو كلمة المرور غير صحيحة.','Incorrect phone or password.');
  return tr('تکایە زانیارییەکان بە دروستی پڕ بکەرەوە.','أكمل المعلومات بشكل صحيح.','Please complete the information correctly.');
}
async function refresh(){
  try{const [config,me]=await Promise.all([api('/api/account/config').catch(()=>({otpRequired:false,smsConfigured:false})),api('/api/account/me')]);state.config={otpRequired:!!config.otpRequired,smsConfigured:!!config.smsConfigured};state.user=me.user||null}catch{state.user=null}finally{state.ready=true;render()}
  if(state.user&&(!state.config.otpRequired||state.user.phoneVerified)&&state.pendingSell){state.pendingSell=false;setOpen(false);window.ZebazCarsApp?.modal?.('#sellModal',true)}
  return state.user;
}
function resetOtp(){state.otpStep=false;state.otpPhone='';const otp=$('#accountOtp');if(otp)otp.value=''}
function open(mode=state.user?'member':'login',pendingSell=false){state.mode=mode==='register'?'register':'login';state.pendingSell=!!pendingSell;if(!state.user)resetOtp();const message=pendingSell?(state.user?tr('پێش بڵاوکردنەوە ژمارەکەت بە SMS پشتڕاست بکەرەوە.','أكد رقم هاتفك عبر SMS قبل النشر.','Verify your phone by SMS before posting.'):tr('بۆ بڵاوکردنەوەی ئۆتۆمبێل، سەرەتا بچۆ ژوورەوە یان هەژمار دروست بکە.','لنشر سيارة، سجّل الدخول أو أنشئ حساباً أولاً.','Sign in or create an account before posting a car.')):'';if(state.user)setMemberStatus(message);else setStatus(message);render();setOpen(true)}
function requireAccount(){if(state.user&&(!state.config.otpRequired||state.user.phoneVerified))return true;open(state.user?'member':'login',true);if(!state.ready)refresh();return false}
function registrationBody(){return {name:$('#accountName')?.value.trim()||'',phone:$('#accountPhone')?.value.trim()||'',password:$('#accountPassword')?.value||''}}
async function sendRegistrationCode(){const body=registrationBody(),j=await api('/api/account/register',{method:'POST',body:JSON.stringify(body)});if(j.codeSent){state.otpStep=true;state.otpPhone=body.phone;render();setStatus(tr('کۆدی 6 ژمارەیی نێردرا بۆ '+(j.phoneMasked||''),'تم إرسال رمز من 6 أرقام إلى '+(j.phoneMasked||''),'A 6-digit code was sent to '+(j.phoneMasked||'')));setTimeout(()=>$('#accountOtp')?.focus(),50);return null}return j.user||null}
async function submit(e){
  e.preventDefault();const button=$('#accountSubmit');if(button)button.disabled=true;setStatus(tr('تکایە چاوەڕێ بکە…','يرجى الانتظار…','Please wait…'));
  try{
    let user;if(state.otpStep){const j=await api('/api/account/verify',{method:'POST',body:JSON.stringify({phone:state.otpPhone,code:$('#accountOtp')?.value.trim()||''})});user=j.user}else if(state.mode==='register')user=await sendRegistrationCode();else{const j=await api('/api/account/login',{method:'POST',body:JSON.stringify({phone:$('#accountPhone')?.value.trim()||'',password:$('#accountPassword')?.value||''})});user=j.user}
    if(!user)return;state.user=user;state.ready=true;resetOtp();render();setStatus('');const shouldSell=state.pendingSell&&(!state.config.otpRequired||user.phoneVerified);state.pendingSell=false;setOpen(false);if(shouldSell)setTimeout(()=>window.ZebazCarsApp?.modal?.('#sellModal',true),80)
  }catch(err){setStatus(accountError(err),true)}finally{if(button)button.disabled=false}
}
async function resend(){const button=$('#accountResend');if(button)button.disabled=true;try{await sendRegistrationCode()}catch(err){setStatus(accountError(err),true)}finally{if(button)button.disabled=false}}
async function sendMemberCode(){const button=$('#accountSendVerify');if(button)button.disabled=true;setMemberStatus(tr('کۆدەکە دەنێردرێت…','جارٍ إرسال الرمز…','Sending code…'));try{const j=await api('/api/account/verification/send',{method:'POST',body:'{}'});state.memberCodeSent=true;render();setMemberStatus(tr('کۆدی 6 ژمارەیی نێردرا بۆ '+(j.phoneMasked||''),'تم إرسال رمز من 6 أرقام إلى '+(j.phoneMasked||''),'A 6-digit code was sent to '+(j.phoneMasked||'')));setTimeout(()=>$('#accountMemberOtp')?.focus(),50)}catch(err){setMemberStatus(accountError(err),true)}finally{if(button)button.disabled=false}}
async function verifyMemberCode(){const button=$('#accountCheckVerify');if(button)button.disabled=true;setMemberStatus(tr('کۆدەکە دەپشکنرێت…','جارٍ التحقق من الرمز…','Checking code…'));try{const j=await api('/api/account/verification/verify',{method:'POST',body:JSON.stringify({code:$('#accountMemberOtp')?.value.trim()||''})});state.user=j.user;state.memberCodeSent=false;render();setMemberStatus('');const shouldSell=state.pendingSell;state.pendingSell=false;setOpen(false);if(shouldSell)setTimeout(()=>window.ZebazCarsApp?.modal?.('#sellModal',true),80)}catch(err){setMemberStatus(accountError(err),true)}finally{if(button)button.disabled=false}}
async function logout(){try{await api('/api/account/logout',{method:'POST',body:'{}'})}catch{}state.user=null;state.ready=true;state.pendingSell=false;state.memberCodeSent=false;resetOtp();render();setOpen(false)}
function boot(){
  $('#accountButton')?.addEventListener('click',()=>open(state.user?'member':'login',false));
  document.querySelectorAll('.c-account-tab').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.accountMode;resetOtp();setStatus('');render()}));
  $('#accountForm')?.addEventListener('submit',submit);$('#accountResend')?.addEventListener('click',resend);$('#accountSendVerify')?.addEventListener('click',sendMemberCode);$('#accountCheckVerify')?.addEventListener('click',verifyMemberCode);$('#accountLogout')?.addEventListener('click',logout);
  window.addEventListener('zebaz:lang',render);refresh();
}
window.ZebazAccount={require:requireAccount,open,refresh,getUser:()=>state.user};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
