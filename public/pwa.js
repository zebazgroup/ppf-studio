(()=>{
  const addMeta=(name,content,attr='name')=>{let m=document.head.querySelector(`meta[${attr}="${name}"]`);if(!m){m=document.createElement('meta');m.setAttribute(attr,name);document.head.appendChild(m)}m.content=content};
  if(!document.head.querySelector('link[rel="manifest"]')){const l=document.createElement('link');l.rel='manifest';l.href='/manifest.webmanifest';document.head.appendChild(l)}
  if(!document.head.querySelector('link[rel="apple-touch-icon"]')){const l=document.createElement('link');l.rel='apple-touch-icon';l.href='/zebaz-logo.svg';document.head.appendChild(l)}
  addMeta('mobile-web-app-capable','yes');
  addMeta('apple-mobile-web-app-capable','yes');
  addMeta('apple-mobile-web-app-status-bar-style','black-translucent');
  addMeta('apple-mobile-web-app-title','ZEBAZ');
  addMeta('theme-color','#050505');
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{}));

  let installPrompt=null;
  const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;document.documentElement.classList.add('z-can-install')});
  window.addEventListener('appinstalled',()=>{installPrompt=null;document.documentElement.classList.add('z-installed')});

  const copy=lang=>lang==='ar'?{home:'الرئيسية',book:'حجز',studio:'ستوديو',ai:'AI',menu:'القائمة',install:'تثبيت التطبيق',installTitle:'ZEBAZ كتطبيق',ios:'على iPhone: اضغط مشاركة ثم Add to Home Screen.',android:'اضغط تثبيت لفتح ZEBAZ كتطبيق مستقل.',close:'إغلاق'}:lang==='en'?{home:'Home',book:'Book',studio:'Studio',ai:'AI',menu:'Menu',install:'Install App',installTitle:'ZEBAZ App',ios:'On iPhone: tap Share, then Add to Home Screen.',android:'Install ZEBAZ to open it like a standalone app.',close:'Close'}:{home:'سەرەکی',book:'حجز',studio:'ستودیۆ',ai:'AI',menu:'مێنیو',install:'دامەزراندنی ئەپ',installTitle:'ZEBAZ وەک ئەپ',ios:'لە iPhone: Share بکە، پاشان Add to Home Screen هەڵبژێرە.',android:'ZEBAZ دابمەزرێنە تا وەک ئەپێکی سەربەخۆ بیکەیتەوە.',close:'داخستن'};
  const lang=()=>window.ZebazLang?.get?.()||localStorage.getItem('zebaz_lang')||'ku';

  function injectStyles(){if(document.getElementById('z-pwa-style'))return;const s=document.createElement('style');s.id='z-pwa-style';s.textContent=`
    .z-mobile-app-nav{display:none}.z-install-entry{margin-top:10px;width:100%;border:1px solid var(--z-accent-deep,#8d6d27);background:var(--z-accent-faint,#d7b66d12);color:var(--z-accent,#d7b66d);border-radius:14px;padding:12px 14px;font:inherit;font-size:13px;font-weight:800;cursor:pointer}.z-install-entry[hidden]{display:none!important}.z-install-sheet{position:fixed;inset:0;z-index:9999;display:grid;place-items:end center;background:#000b;backdrop-filter:blur(10px);padding:14px}.z-install-card{width:min(520px,100%);border:1px solid var(--z-line,#2b2b2b);border-radius:24px;background:var(--z-surface,#0d0d0d);color:var(--z-text,#f5f5f5);padding:20px;box-shadow:0 28px 90px #000c}.z-install-card img{width:150px;max-height:45px;object-fit:contain;display:block;margin:0 auto 14px}.z-install-card h3{margin:0 0 8px;text-align:center}.z-install-card p{color:var(--z-muted,#aaa);line-height:1.8;text-align:center}.z-install-card button{width:100%;margin-top:10px;border:0;border-radius:13px;padding:12px;background:var(--z-accent,#d7b66d);color:#090909;font-weight:900;cursor:pointer}
    @media(max-width:760px){body{padding-bottom:calc(144px + env(safe-area-inset-bottom))!important}.z-mobile-app-nav{position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:238;height:58px;display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:5px;border:1px solid var(--z-line,#2b2b2b);border-radius:18px;background:#090909ee;box-shadow:0 18px 55px #000c;backdrop-filter:blur(22px)}html[data-theme="light"] .z-mobile-app-nav{background:#fffdf8ee;box-shadow:0 18px 55px #5e4b1d2b}.z-mobile-app-nav a,.z-mobile-app-nav button{min-width:0;border:0;background:transparent;color:var(--z-muted,#999);text-decoration:none;border-radius:13px;display:grid;place-items:center;align-content:center;gap:2px;font:inherit;font-size:9px;font-weight:800;padding:3px;cursor:pointer}.z-mobile-app-nav .ico{font-size:17px;line-height:1;color:var(--z-accent,#d7b66d)}.z-mobile-app-nav a.active{background:var(--z-accent-faint,#d7b66d12);color:var(--z-accent,#d7b66d)}.z-ai-dock{bottom:calc(76px + env(safe-area-inset-bottom))!important}.z-back-home{bottom:calc(136px + env(safe-area-inset-bottom))!important}.z-global-menu{z-index:270}.z-appearance-dock{z-index:265}}
    @media(display-mode:standalone){.z-install-entry{display:none!important}body{overscroll-behavior-y:none;-webkit-tap-highlight-color:transparent}}
  `;document.head.appendChild(s)}

  function showInstall(){
    if(isStandalone())return;
    if(installPrompt){installPrompt.prompt();installPrompt.userChoice.finally(()=>{installPrompt=null});return}
    const c=copy(lang());const wrap=document.createElement('div');wrap.className='z-install-sheet';wrap.innerHTML=`<div class="z-install-card"><img src="/zebaz-logo.svg" alt="ZEBAZ"><h3>${c.installTitle}</h3><p>${isIOS?c.ios:c.android}</p><button type="button">${c.close}</button></div>`;document.body.appendChild(wrap);wrap.addEventListener('click',e=>{if(e.target===wrap||e.target.tagName==='BUTTON')wrap.remove()})
  }

  function installMenuEntry(){const drawer=document.querySelector('.z-menu-drawer');if(!drawer||drawer.querySelector('.z-install-entry'))return;const b=document.createElement('button');b.className='z-install-entry';b.type='button';b.textContent=copy(lang()).install;b.hidden=isStandalone();b.addEventListener('click',showInstall);drawer.appendChild(b);window.addEventListener('zebaz:lang',()=>b.textContent=copy(lang()).install)}

  function installMobileNav(){if(document.querySelector('.z-mobile-app-nav'))return;const c=copy(lang()),path=location.pathname.replace(/\/+$/,'')||'/';const nav=document.createElement('nav');nav.className='z-mobile-app-nav';nav.setAttribute('aria-label','ZEBAZ mobile navigation');nav.innerHTML=`<a href="/" data-key="home"><span class="ico">⌂</span><span class="lbl">${c.home}</span></a><a href="/ppf" data-key="book"><span class="ico">◇</span><span class="lbl">${c.book}</span></a><a href="/studio" data-key="studio"><span class="ico">◉</span><span class="lbl">${c.studio}</span></a><a href="/ai" data-key="ai"><span class="ico">◎</span><span class="lbl">${c.ai}</span></a><button type="button" data-key="menu"><span class="ico">☰</span><span class="lbl">${c.menu}</span></button>`;document.body.appendChild(nav);const current=path==='/'?'home':path.startsWith('/ppf')?'book':path.startsWith('/studio')?'studio':path.startsWith('/ai')?'ai':'';if(current)nav.querySelector(`[data-key="${current}"]`)?.classList.add('active');nav.querySelector('[data-key="menu"]')?.addEventListener('click',()=>document.querySelector('.z-menu-btn')?.click());window.addEventListener('zebaz:lang',()=>{const x=copy(lang());for(const k of ['home','book','studio','ai','menu']){const el=nav.querySelector(`[data-key="${k}"] .lbl`);if(el)el.textContent=x[k]}})}

  function syncTheme(){const m=document.head.querySelector('meta[name="theme-color"]');if(m)m.content=document.documentElement.dataset.theme==='light'?'#f5f2eb':'#050505'}
  function boot(){injectStyles();installMenuEntry();installMobileNav();syncTheme();window.addEventListener('zebaz:theme',syncTheme)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
