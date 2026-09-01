(()=>{
  'use strict';
  if(!/^\/cars\/?$/.test(location.pathname))return;

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const BRAND_DATA=[
    ['Toyota','toyota.com','TY'],['Mercedes-Benz','mercedes-benz.com','MB'],['BMW','bmw.com','BMW'],['Lexus','lexus.com','LX'],['Land Rover','landrover.com','LR'],
    ['Porsche','porsche.com','PR'],['Audi','audi.com','AU'],['Ford','ford.com','FD'],['Nissan','nissan-global.com','NS'],['Kia','kia.com','KIA'],
    ['Hyundai','hyundai.com','HY'],['BYD','byd.com','BYD'],['GMC','gmc.com','GMC'],['Chevrolet','chevrolet.com','CH'],['Jeep','jeep.com','JP'],
    ['Cadillac','cadillac.com','CD'],['Volkswagen','volkswagen.com','VW'],['Honda','honda.com','HN'],['Haval','haval-global.com','HV'],['Rolls-Royce','rolls-roycemotorcars.com','RR'],
    ['Tesla','tesla.com','TS'],['Dodge','dodge.com','DG'],['RAM','ramtrucks.com','RAM'],['Mazda','mazda.com','MZ'],['Mitsubishi','mitsubishi-motors.com','MI']
  ];
  const lang=()=>window.ZebazLang?.get?.()||localStorage.getItem('zebaz_lang')||document.documentElement.lang||'ku';
  const tr=(ku,ar,en)=>lang()==='ar'?ar:lang()==='en'?en:ku;
  const favicon=domain=>`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  const altIcon=domain=>`https://icons.duckduckgo.com/ip3/${domain}.ico`;
  let brandRendering=false;

  function installBrandRail(){
    const rail=$('#brandRail');
    if(!rail||brandRendering)return;
    brandRendering=true;
    const select=$('#zcMake');
    const active=select?.value||'';
    rail.innerHTML=BRAND_DATA.map(([name,domain,abbr])=>`<button type="button" class="c-brand c-brand-v3${active===name?' active':''}" data-brand="${name}" aria-label="${name}"><span class="c-brand-logo-shell"><img class="c-brand-logo" src="${favicon(domain)}" data-domain="${domain}" alt="${name}" loading="lazy" decoding="async"><span class="c-brand-fallback">${abbr}</span></span><small>${name}</small></button>`).join('');
    $$('.c-brand-logo',rail).forEach(img=>{
      const shell=img.closest('.c-brand-logo-shell');
      img.addEventListener('load',()=>shell?.classList.add('has-logo'),{once:true});
      img.addEventListener('error',()=>{
        if(img.dataset.altTried!=='1'){
          img.dataset.altTried='1';
          img.src=altIcon(img.dataset.domain||'');
        }else{
          img.remove();
          shell?.classList.remove('has-logo');
        }
      });
      if(img.complete&&img.naturalWidth>0)shell?.classList.add('has-logo');
    });
    $$('.c-brand-v3',rail).forEach(btn=>btn.addEventListener('click',()=>{
      const make=$('#zcMake');
      if(!make)return;
      const same=make.value===btn.dataset.brand;
      make.value=same?'':btn.dataset.brand;
      make.dispatchEvent(new Event('change',{bubbles:true}));
      $$('.c-brand-v3',rail).forEach(x=>x.classList.toggle('active',!same&&x===btn));
      $('#listings')?.scrollIntoView({behavior:'smooth',block:'start'});
    }));
    rail.dataset.v3Brands='1';
    brandRendering=false;
  }

  function watchBrandRail(){
    const rail=$('#brandRail');
    if(!rail)return;
    const observer=new MutationObserver(()=>{
      if(brandRendering)return;
      const first=rail.firstElementChild;
      if(!first||!first.classList.contains('c-brand-v3'))setTimeout(installBrandRail,0);
    });
    observer.observe(rail,{childList:true});
    [0,500,1400,3200,7000].forEach(ms=>setTimeout(installBrandRail,ms));
  }

  function addHeaderBadge(){
    const logo=$('.c-logo');
    const link=logo?.closest('a');
    if(!link||$('.c-logo-sub'))return;
    const badge=document.createElement('span');
    badge.className='c-logo-sub';
    badge.textContent='MOTORS MARKETPLACE';
    link.after(badge);
  }

  function addTrustStrip(){
    const hero=$('.c-hero .c-wrap');
    if(!hero||$('.c-v3-trust'))return;
    const strip=document.createElement('div');
    strip.className='c-v3-trust';
    strip.innerHTML=`
      <div class="c-v3-trust-item"><span class="c-v3-trust-icon">⌕</span><div><strong data-ku="گەڕانی خێرا و زیرەک" data-ar="بحث سريع وذكي" data-en="Fast smart search"></strong><small data-ku="بە مارکە، مۆدێل، ساڵ، شار و نرخ." data-ar="حسب الماركة والموديل والسنة والمدينة والسعر." data-en="Filter by make, model, year, city and price."></small></div></div>
      <div class="c-v3-trust-item"><span class="c-v3-trust-icon">✦</span><div><strong>ZEBAZ AI</strong><small data-ku="یارمەتی بۆ هەڵبژاردن، بەراورد و نرخ." data-ar="مساعدة في الاختيار والمقارنة والسعر." data-en="Help with choosing, comparison and value."></small></div></div>
      <div class="c-v3-trust-item"><span class="c-v3-trust-icon">＋</span><div><strong data-ku="فرۆشتنی ئۆتۆمبێل" data-ar="بيع سيارتك" data-en="Sell your car"></strong><small data-ku="تا 5 وێنە و ناردن بۆ پشکنین." data-ar="حتى 5 صور وإرسال للمراجعة." data-en="Up to 5 photos and review submission."></small></div></div>`;
    hero.appendChild(strip);
    window.ZebazLang?.apply?.(document);
  }

  function polishCards(){
    $$('.c-card').forEach(card=>{
      if(card.dataset.v3==='1')return;
      card.dataset.v3='1';
      const img=card.querySelector('.c-photo img');
      if(img){img.decoding='async';if(!img.getAttribute('loading'))img.loading='lazy'}
      const price=card.querySelector('.c-price');
      if(price)price.setAttribute('aria-label',tr('نرخی ئۆتۆمبێل','سعر السيارة','Car price'));
    });
  }

  function watchCards(){
    const grid=$('#carsGrid');
    if(!grid)return;
    const obs=new MutationObserver(()=>polishCards());
    obs.observe(grid,{childList:true,subtree:true});
    polishCards();
  }

  function syncBrandActive(){
    const make=$('#zcMake');
    const rail=$('#brandRail');
    if(!make||!rail)return;
    make.addEventListener('change',()=>$$('.c-brand-v3',rail).forEach(b=>b.classList.toggle('active',b.dataset.brand===make.value)));
  }

  function addMobileTopTitle(){
    const top=$('.c-top-in');
    if(!top||$('.c-mobile-title'))return;
    const el=document.createElement('div');
    el.className='c-mobile-title';
    el.innerHTML='<strong>ZEBAZ Motors</strong><small>Marketplace</small>';
    const style=document.createElement('style');
    style.textContent='.c-mobile-title{display:none}@media(max-width:840px){.c-mobile-title{display:flex;flex-direction:column;line-height:1.05;margin-inline-end:auto}.c-mobile-title strong{font-size:12px;font-weight:950}.c-mobile-title small{font-size:8px;color:#8a8d93;margin-top:3px;letter-spacing:.4px}}';
    document.head.appendChild(style);
    $('.c-logo')?.closest('a')?.after(el);
  }

  function init(){
    addHeaderBadge();
    addMobileTopTitle();
    addTrustStrip();
    installBrandRail();
    watchBrandRail();
    syncBrandActive();
    watchCards();
    window.addEventListener('zebaz:lang',()=>{addTrustStrip();window.ZebazLang?.apply?.(document)});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
