(()=>{
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{}));
  const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const isCars=()=>/^\/cars\/?$/.test(location.pathname);
  if(isStandalone()&&!isCars()){
    location.replace('/cars/');
    return;
  }
  if(!isCars())return;

  let installPrompt=null;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;document.documentElement.classList.add('zc-can-install')});
  window.addEventListener('appinstalled',()=>{installPrompt=null;document.documentElement.classList.add('zc-installed')});

  const lang=()=>window.ZebazLang?.get?.()||localStorage.getItem('zebaz_lang')||'ku';
  const copy=()=>{
    const l=lang();
    if(l==='ar')return{cars:'السيارات',newCars:'جديدة',used:'مستعملة',brands:'الماركات',search:'بحث',sell:'بيع',top:'أعلى',install:'تثبيت التطبيق',installTitle:'ZEBAZ Motors',ios:'على iPhone: اضغط مشاركة ثم Add to Home Screen.',android:'ثبّت ZEBAZ Motors لفتحه كتطبيق مستقل.',close:'إغلاق'};
    if(l==='en')return{cars:'Cars',newCars:'New',used:'Used',brands:'Brands',search:'Search',sell:'Sell',top:'Top',install:'Install App',installTitle:'ZEBAZ Motors',ios:'On iPhone: tap Share, then Add to Home Screen.',android:'Install ZEBAZ Motors to open it as a standalone app.',close:'Close'};
    return{cars:'ئۆتۆمبێل',newCars:'نوێ',used:'بەکارهاتوو',brands:'مارکەکان',search:'گەڕان',sell:'فرۆشتن',top:'سەرەوە',install:'دامەزراندنی ئەپ',installTitle:'ZEBAZ Motors',ios:'لە iPhone: Share بکە، پاشان Add to Home Screen هەڵبژێرە.',android:'ZEBAZ Motors دابمەزرێنە تا وەک ئەپێکی سەربەخۆ بیکەیتەوە.',close:'داخستن'};
  };

  function style(){
    if(document.getElementById('zc-cars-app-style'))return;
    const s=document.createElement('style');s.id='zc-cars-app-style';s.textContent=`
      .zc-cars-app-nav{display:none}.zc-install-cars{height:42px;padding:0 13px;border:1px solid #d9b362;border-radius:10px;background:#fffaf0;color:#9a6713;font:inherit;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap}.zc-app-mode .zc-premium-nav{position:sticky;top:0}.zc-app-mode .zc-premium-links a[href="/"],.zc-app-mode .zc-premium-links a[href="/ppf"],.zc-app-mode .zc-premium-links a[href="/ai"]{display:none!important}.zc-app-mode .zc-premium-logo{cursor:default}.zc-app-mode{overscroll-behavior-y:none;-webkit-tap-highlight-color:transparent}.zc-app-mode .z-mobile-app-nav{display:none!important}
      .zc-install-sheet{position:fixed;inset:0;z-index:10050;background:#111b;backdrop-filter:blur(10px);display:grid;place-items:end center;padding:14px}.zc-install-card{width:min(480px,100%);background:#fff;color:#222;border:1px solid #e8e1d6;border-radius:24px;padding:22px;box-shadow:0 30px 90px #0007;text-align:center}.zc-install-card img{width:170px;max-height:48px;object-fit:contain;margin:0 auto 12px}.zc-install-card h3{margin:0 0 8px}.zc-install-card p{margin:0;color:#716b62;line-height:1.8}.zc-install-card button{width:100%;margin-top:14px;border:0;border-radius:12px;padding:12px;background:linear-gradient(180deg,#d8a744,#c58a1f);color:#fff;font-weight:900}
      @media(max-width:760px){body.zc-premium{padding-bottom:calc(86px + env(safe-area-inset-bottom))!important}.zc-cars-app-nav{position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:9990;height:64px;display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:5px;border:1px solid #e6e0d6;border-radius:18px;background:#fffffff2;box-shadow:0 16px 45px #32220d26;backdrop-filter:blur(20px)}.zc-cars-app-nav button{min-width:0;border:0;background:transparent;color:#777168;border-radius:12px;display:grid;place-items:center;align-content:center;gap:3px;font:inherit;font-size:9px;font-weight:900;padding:3px;cursor:pointer}.zc-cars-app-nav .ico{font-size:18px;line-height:1;color:#bd801b}.zc-cars-app-nav button.primary{background:#fff5df;color:#9b6817}.zc-cars-app-nav button.primary .ico{font-size:20px}.zc-premium-nav .zc-install-cars{display:none}.zc-premium .z-mobile-app-nav{display:none!important}}
      @media(display-mode:standalone){.zc-install-cars{display:none!important}.zc-app-mode .zc-premium-nav{padding-top:env(safe-area-inset-top)}}
    `;document.head.appendChild(s);
  }

  function updateMeta(){
    document.title='ZEBAZ Motors';
    let a=document.head.querySelector('meta[name="apple-mobile-web-app-title"]');if(!a){a=document.createElement('meta');a.name='apple-mobile-web-app-title';document.head.appendChild(a)}a.content='ZEBAZ Motors';
    let t=document.head.querySelector('meta[name="theme-color"]');if(t)t.content='#ffffff';
  }

  function showInstall(){
    if(isStandalone())return;
    if(installPrompt){installPrompt.prompt();installPrompt.userChoice.finally(()=>{installPrompt=null});return}
    const c=copy(),ios=/iphone|ipad|ipod/i.test(navigator.userAgent);const w=document.createElement('div');w.className='zc-install-sheet';w.innerHTML=`<div class="zc-install-card"><img src="/zebaz-logo.svg" alt="ZEBAZ"><h3>${c.installTitle}</h3><p>${ios?c.ios:c.android}</p><button>${c.close}</button></div>`;document.body.appendChild(w);w.addEventListener('click',e=>{if(e.target===w||e.target.tagName==='BUTTON')w.remove()});
  }

  function adaptDesktopNav(){
    const nav=document.querySelector('.zc-premium-nav');if(!nav)return;
    const logo=nav.querySelector('a:has(.zc-premium-logo)');if(logo){logo.href='/cars/';}
    if(isStandalone()){
      const links=nav.querySelector('.zc-premium-links');if(links){const c=copy();links.innerHTML=`<a class="active" href="/cars/">${c.cars}</a><a href="#new">${c.newCars}</a><a href="#cars">${c.used}</a><a href="#brands">${c.brands}</a>`;}
    }else if(!nav.querySelector('.zc-install-cars')){
      const c=copy(),actions=nav.querySelector('.zc-nav-actions');if(actions){const b=document.createElement('button');b.className='zc-install-cars';b.type='button';b.textContent=c.install;b.onclick=showInstall;actions.insertBefore(b,actions.firstChild)}
    }
  }

  function installBottomNav(){
    document.querySelector('.z-mobile-app-nav')?.remove();
    if(document.querySelector('.zc-cars-app-nav'))return;
    const c=copy(),n=document.createElement('nav');n.className='zc-cars-app-nav';n.setAttribute('aria-label','ZEBAZ Motors app navigation');n.innerHTML=`<button data-a="cars"><span class="ico">⌂</span><span>${c.cars}</span></button><button data-a="brands"><span class="ico">◉</span><span>${c.brands}</span></button><button data-a="search"><span class="ico">⌕</span><span>${c.search}</span></button><button class="primary" data-a="sell"><span class="ico">＋</span><span>${c.sell}</span></button><button data-a="top"><span class="ico">↑</span><span>${c.top}</span></button>`;document.body.appendChild(n);
    n.querySelector('[data-a="cars"]').onclick=()=>document.getElementById('cars')?.scrollIntoView({behavior:'smooth',block:'start'});
    n.querySelector('[data-a="brands"]').onclick=()=>document.querySelector('.zc-brand-section')?.scrollIntoView({behavior:'smooth',block:'start'});
    n.querySelector('[data-a="search"]').onclick=()=>{document.querySelector('.zc-premium-search')?.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>document.getElementById('zcMake')?.focus(),350)};
    n.querySelector('[data-a="sell"]').onclick=()=>document.getElementById('openSell')?.click();
    n.querySelector('[data-a="top"]').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
  }

  function boot(){
    style();updateMeta();if(isStandalone())document.body.classList.add('zc-app-mode');
    requestAnimationFrame(()=>{adaptDesktopNav();installBottomNav();if(new URLSearchParams(location.search).get('sell')==='1')setTimeout(()=>document.getElementById('openSell')?.click(),250)});
    window.addEventListener('zebaz:lang',()=>{document.querySelector('.zc-cars-app-nav')?.remove();adaptDesktopNav();installBottomNav()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
