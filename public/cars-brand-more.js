(()=>{
'use strict';
if(!/^\/cars\/?$/.test(location.pathname))return;
const rail=document.getElementById('brandRail');
if(!rail)return;
let expanded=false,applying=false;
const lang=()=>window.ZebazLang?.get?.()||localStorage.getItem('zebaz_lang')||document.documentElement.lang||'ku';
const tr=(ku,ar,en)=>lang()==='ar'?ar:lang()==='en'?en:ku;
function cols(){const w=innerWidth;return w<=430?3:w<=840?4:w<=1180?6:8}
function visibleLogoCount(){return Math.max(2,cols()-1)}
function ensureButton(){
  let b=rail.querySelector('.c-brand-more');
  if(!b){
    b=document.createElement('button');
    b.type='button';
    b.className='c-brand-more';
    b.addEventListener('click',()=>{expanded=!expanded;apply()});
    rail.appendChild(b);
  }
  const remaining=Math.max(0,rail.querySelectorAll('.c-brand-v4').length-visibleLogoCount());
  b.innerHTML=expanded
    ?`<span class="z-more-icon">−</span><strong>${tr('کەمتر','أقل','Show less')}</strong><small>${tr('یەک ڕیز','صف واحد','One row')}</small>`
    :`<span class="z-more-icon">＋</span><strong>${tr('زیاتر ببینە','عرض المزيد','For more')}</strong><small>+${remaining}</small>`;
  return b;
}
function apply(){
  if(applying)return;applying=true;
  requestAnimationFrame(()=>{
    const cards=[...rail.querySelectorAll('.c-brand-v4')];
    if(!cards.length){applying=false;return}
    const c=cols();rail.style.setProperty('--z-brand-cols',String(c));
    const q=(document.getElementById('brandSearchV4')?.value||'').trim();
    rail.classList.toggle('z-searching',!!q);
    const limit=visibleLogoCount();
    cards.forEach((card,i)=>card.classList.toggle('z-brand-collapsed',!expanded&&!q&&i>=limit));
    const b=ensureButton();
    b.hidden=!!q||cards.length<=limit;
    rail.classList.toggle('is-expanded',expanded||!!q);
    applying=false;
  });
}
const mo=new MutationObserver(()=>{if(!applying)setTimeout(apply,0)});
mo.observe(rail,{childList:true});
document.getElementById('brandSearchV4')?.addEventListener('input',apply);
window.addEventListener('resize',()=>{clearTimeout(apply._t);apply._t=setTimeout(apply,120)});
window.addEventListener('zebaz:lang',apply);
[0,250,700,1500,3500,7000].forEach(ms=>setTimeout(apply,ms));
})();
