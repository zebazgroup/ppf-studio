(()=>{
  const KEY='zebaz_lang';
  const THEME_KEY='zebaz_theme';
  const valid=['ku','ar','en'];
  const validThemes=['system','dark','light'];
  let content=[];
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

  function get(){
    const x=localStorage.getItem(KEY);
    return valid.includes(x)?x:'ku';
  }

  function getTheme(){
    const x=localStorage.getItem(THEME_KEY);
    return validThemes.includes(x)?x:'system';
  }

  function resolvedTheme(mode=getTheme()){
    if(mode==='system') return window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
    return mode;
  }

  function applyTheme(mode=getTheme(),save=false){
    if(!validThemes.includes(mode)) mode='system';
    if(save) localStorage.setItem(THEME_KEY,mode);
    const resolved=resolvedTheme(mode);
    document.documentElement.dataset.theme=resolved;
    document.documentElement.dataset.themeMode=mode;
    document.documentElement.style.colorScheme=resolved;
    document.querySelectorAll('[data-theme-mode]').forEach(b=>b.classList.toggle('active',b.dataset.themeMode===mode));
    window.dispatchEvent(new CustomEvent('zebaz:theme',{detail:{mode,resolved}}));
    return resolved;
  }

  const mq=window.matchMedia('(prefers-color-scheme: light)');
  const onSystemThemeChange=()=>{if(getTheme()==='system')applyTheme('system',false)};
  if(mq.addEventListener) mq.addEventListener('change',onSystemThemeChange); else if(mq.addListener) mq.addListener(onSystemThemeChange);
  applyTheme(getTheme(),false);

  function applyContent(lang){
    const nodes=[...document.querySelectorAll('[data-content-slot]')];
    for(const item of content){
      for(const el of nodes.filter(n=>n.dataset.contentSlot===item.slot)){
        el.style.display=item.visible===false?'none':'';
        if(item.visible===false)continue;
        if(el.hasAttribute('data-content-image')&&item.imageUrl){
          el.style.backgroundImage=`linear-gradient(180deg,#0002,#0009),url('${item.imageUrl}')`;
          el.classList.add('has-image');
        }
        const suffix=cap(lang),title=item['title'+suffix],caption=item['caption'+suffix];
        const field=el.dataset.contentField;
        if(field){
          const v=item[field+suffix];
          if(v)el.textContent=v;
        }else{
          if(title){const t=el.querySelector('[data-content-title],h1,h2,h3');if(t)t.textContent=title}
          if(caption){const p=el.querySelector('[data-content-caption],p');if(p)p.textContent=caption}
        }
        if(item.link&&el.tagName==='A')el.href=item.link;
      }
    }
  }

  function apply(lang,save=true){
    if(!valid.includes(lang))lang='ku';
    if(save)localStorage.setItem(KEY,lang);
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==='en'?'ltr':'rtl';
    document.querySelectorAll('[data-ku]').forEach(el=>{const v=el.dataset[lang];if(v!==undefined)el.textContent=v});
    document.querySelectorAll('[data-ku-html]').forEach(el=>{const v=el.dataset[lang+'Html'];if(v!==undefined)el.innerHTML=v});
    document.querySelectorAll('[data-ku-placeholder]').forEach(el=>{const v=el.dataset[lang+'Placeholder'];if(v!==undefined)el.placeholder=v});
    const body=document.body,title=body.dataset['title'+cap(lang)];
    if(title)document.title=title;
    document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
    const gate=document.querySelector('[data-lang-gate]');
    if(gate)gate.style.display='none';
    applyContent(lang);
    window.dispatchEvent(new CustomEvent('zebaz:lang',{detail:{lang}}));
    return lang;
  }

  function set(lang){return apply(lang,true)}
  function open(){const g=document.querySelector('[data-lang-gate]');if(g)g.style.display='flex'}

  async function loadContent(){
    try{
      const r=await fetch('/api/content',{cache:'no-store'});
      if(r.ok){const j=await r.json();content=j.items||[];applyContent(get())}
    }catch{}
  }

  function addGlobalMenu(){
    if(document.querySelector('.z-global-menu'))return;
    const st=document.createElement('style');
    st.textContent=`
      .z-global-menu{position:fixed;top:14px;inset-inline-end:14px;z-index:250}
      .z-menu-btn{width:46px;height:46px;border-radius:14px;border:1px solid #4b4128;background:#090909e8;backdrop-filter:blur(18px);display:grid;place-content:center;gap:5px;cursor:pointer;box-shadow:0 12px 35px #0008}
      .z-menu-btn span{width:19px;height:1.5px;background:#d7b66d;display:block}
      .z-menu-backdrop{position:fixed;inset:0;background:#000b;opacity:0;pointer-events:none;transition:.25s}
      .z-menu-drawer{position:fixed;top:0;bottom:0;inset-inline-end:0;width:min(380px,88vw);background:linear-gradient(180deg,#090909,#050505);border-inline-start:1px solid #2d2a22;transform:translateX(110%);transition:.28s cubic-bezier(.2,.8,.2,1);padding:24px;box-shadow:-25px 0 80px #000;overflow:auto}
      [dir=rtl] .z-menu-drawer{transform:translateX(-110%);box-shadow:25px 0 80px #000}
      .z-global-menu.open .z-menu-backdrop{opacity:1;pointer-events:auto}
      .z-global-menu.open .z-menu-drawer{transform:translateX(0)}
      .z-menu-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:20px;border-bottom:1px solid #222}
      .z-menu-head img{width:180px;max-height:52px;object-fit:contain}
      .z-menu-close{width:40px;height:40px;border-radius:50%;border:1px solid #333;background:#111;color:#fff;font-size:26px;cursor:pointer}
      .z-menu-links{display:grid;gap:7px;margin-top:18px}
      .z-menu-links a{display:flex;align-items:center;justify-content:space-between;text-decoration:none;color:#d5d5d5;border:1px solid transparent;border-radius:14px;padding:14px 15px;font-size:14px}
      .z-menu-links a:after{content:'›';color:#8a7440;font-size:20px}
      [dir=rtl] .z-menu-links a:after{content:'‹'}
      .z-menu-links a:hover,.z-menu-links a.current{background:#111;border-color:#3d3522;color:#e2c77d}
      .z-menu-langs{display:flex;gap:7px;border-top:1px solid #222;margin-top:18px;padding-top:18px}
      .z-menu-langs button{flex:1;border:1px solid #333;background:#0d0d0d;color:#ddd;border-radius:12px;padding:11px;cursor:pointer}
      .z-menu-langs button.active{border-color:#8d7742;color:#d7b66d;background:#17130b}
      .z-theme-wrap{border-top:1px solid #222;margin-top:16px;padding-top:16px}
      .z-theme-label{display:block;color:#858585;font-size:11px;margin-bottom:9px}
      .z-theme-modes{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
      .z-theme-modes button{border:1px solid #333;background:#0d0d0d;color:#cfcfcf;border-radius:12px;padding:10px 7px;cursor:pointer;font-size:12px;transition:.2s}
      .z-theme-modes button:hover,.z-theme-modes button.active{border-color:#8d7742;color:#d7b66d;background:#17130b}
      .z-theme-icon{display:block;font-size:16px;margin-bottom:4px}
      .z-back-home{position:fixed;bottom:18px;inset-inline-start:18px;z-index:120;text-decoration:none;color:#e9d397;background:#090909e8;border:1px solid #564a2c;border-radius:999px;padding:11px 15px;font-size:12px;backdrop-filter:blur(16px);box-shadow:0 12px 35px #0008}
      .z-menu-open{overflow:hidden}
      .top{background:#030303f3!important;border-bottom-color:#252117!important}
      .hero{box-shadow:inset 0 -100px 120px #0005}
      .card{box-shadow:0 18px 45px #0004}
      .card:hover{box-shadow:0 22px 55px #0008,0 0 0 1px #d7b66d16}

      html[data-theme="light"] body,html[data-theme="light"] body.home-v2{background:#f5f2eb!important;color:#161616!important}
      html[data-theme="light"] body:before{background:radial-gradient(circle at 80% 8%,#b8964817,transparent 24%),radial-gradient(circle at 10% 48%,#00000008,transparent 18%)}
      html[data-theme="light"] .top,html[data-theme="light"] .home-v2 .top{background:#faf8f2ee!important;border-bottom-color:#d8d2c6!important}
      html[data-theme="light"] .nav a,html[data-theme="light"] .langpick button,html[data-theme="light"] .langbtn{color:#242424!important;background:#fffdf8!important;border-color:#d8d1c4!important}
      html[data-theme="light"] .home-v2 .navlinks>a{color:#2f2f2f!important;background:transparent!important}
      html[data-theme="light"] .home-v2 .langpick button{background:#fffdf8!important;border-color:#d8d1c4!important;color:#2c2c2c!important}
      html[data-theme="light"] .home-v2 .book-top{background:#fff9ea!important;color:#7d611f!important;border-color:#b89549!important}
      html[data-theme="light"] .hero{background:radial-gradient(circle at 82% 14%,#efe4c8 0,#f7f2e8 26%,#f8f6f0 60%,#f4f1e9 100%)!important;border-bottom-color:#d8d2c6!important;box-shadow:inset 0 -100px 120px #d8ccb522!important}
      html[data-theme="light"] .hero:before{background-image:linear-gradient(#00000008 1px,transparent 1px),linear-gradient(90deg,#00000008 1px,transparent 1px)!important}
      html[data-theme="light"] .hero.has-image:before{background:linear-gradient(90deg,#f7f4eceb 0,#f7f4ecc9 48%,#f7f4ec55),linear-gradient(#ffffff22,#f5f2e8a8)!important}
      html[data-theme="light"] .muted,html[data-theme="light"] .lead,html[data-theme="light"] .hero p,html[data-theme="light"] .card p,html[data-theme="light"] .panel p,html[data-theme="light"] .note{color:#66625b!important}
      html[data-theme="light"] .section.alt,html[data-theme="light"] .hv-owner{background:#eeeae1!important;border-color:#d8d2c6!important}
      html[data-theme="light"] .card,html[data-theme="light"] .panel,html[data-theme="light"] .metric,html[data-theme="light"] .form-card,html[data-theme="light"] .ai-shell{background:#fffdf8!important;border-color:#d8d1c4!important;color:#171717!important;box-shadow:0 18px 45px #5d4b2414}
      html[data-theme="light"] .field input,html[data-theme="light"] .field select,html[data-theme="light"] .field textarea,html[data-theme="light"] .composer input{background:#fff!important;border-color:#d5cec0!important;color:#161616!important}
      html[data-theme="light"] .field label{color:#333!important}
      html[data-theme="light"] .messages{background:linear-gradient(#f5f2eb,#fffdf8)!important}
      html[data-theme="light"] .bot{background:#f0ece3!important;border-color:#d8d1c4!important;color:#222!important}
      html[data-theme="light"] .chat-head,html[data-theme="light"] .composer{border-color:#d8d1c4!important}
      html[data-theme="light"] .footer,html[data-theme="light"] .home-v2 .footer{background:#f5f2eb!important;border-color:#d8d2c6!important;color:#706b61!important}
      html[data-theme="light"] .phones a{background:#fffdf8!important;color:#242424!important;border-color:#d8d1c4!important}
      html[data-theme="light"] .lang-gate{background:radial-gradient(circle at 50% 0,#e7d7ad,#f5f1e7 43%,#ece8df)!important}
      html[data-theme="light"] .gate-box{background:#fffdf8ee!important;border-color:#d2cabd!important;box-shadow:0 30px 100px #5949191c}
      html[data-theme="light"] .gate-langs button{background:#fff!important;color:#222!important;border-color:#d5cec0!important}

      html[data-theme="light"] .hv-hero{background:radial-gradient(circle at 70% 20%,#ead9ad 0,transparent 25%),radial-gradient(circle at 20% 80%,#ece7dc 0,transparent 35%),#f7f4ed!important;border-bottom-color:#d8d2c6!important}
      html[data-theme="light"] .hv-hero:before{background:linear-gradient(90deg,#00000008 1px,transparent 1px),linear-gradient(#00000008 1px,transparent 1px)!important}
      html[data-theme="light"] .hv-copy p,html[data-theme="light"] .hv-head p,html[data-theme="light"] .hv-card p,html[data-theme="light"] .hv-owner-copy p,html[data-theme="light"] .hv-location p,html[data-theme="light"] .hv-contact-box p{color:#66625b!important}
      html[data-theme="light"] .hv-strip{background:#eeeae1!important;border-bottom-color:#d8d2c6!important}
      html[data-theme="light"] .hv-stat{border-color:#d8d2c6!important}
      html[data-theme="light"] .hv-stat span{color:#69645b!important}
      html[data-theme="light"] .hv-card{background:linear-gradient(145deg,#fffdf8,#f0ece3)!important;border-color:#d8d1c4!important;color:#161616!important;box-shadow:0 18px 45px #5d4b2414}
      html[data-theme="light"] .hv-card.ai,html[data-theme="light"] .hv-card.game,html[data-theme="light"] .hv-card.oil,html[data-theme="light"] .hv-card.media{background:linear-gradient(145deg,#fffdf8,#eee8dc)!important}
      html[data-theme="light"] .hv-card .ico{background:#f7f1e4!important;border-color:#c6a75f!important;color:#8d6d27!important}
      html[data-theme="light"] .hv-owner-copy,html[data-theme="light"] .hv-owner-visual,html[data-theme="light"] .hv-location{background:#fffdf8!important;border-color:#d8d1c4!important;color:#161616!important}
      html[data-theme="light"] .hv-owner-visual{background:radial-gradient(circle at 55% 38%,#eadbb7,#f4f0e7 58%)!important}
      html[data-theme="light"] .hv-owner-visual:before{color:#00000008!important}
      html[data-theme="light"] .hv-metric{background:#f7f3ea!important;border-color:#d8d1c4!important}
      html[data-theme="light"] .hv-metric span{color:#6d675e!important}
      html[data-theme="light"] .hv-contact-box{background:linear-gradient(130deg,#fffdf8,#eee9df)!important;border-color:#d8d1c4!important}
      html[data-theme="light"] .hv-phones a{background:#fff!important;color:#232323!important;border-color:#d8d1c4!important}

      html[data-theme="light"] .z-menu-btn{background:#fffdf8ee;border-color:#b99a55;box-shadow:0 12px 35px #5e4b1d20}
      html[data-theme="light"] .z-menu-drawer{background:linear-gradient(180deg,#fffdf8,#f2eee5);border-color:#d5cec0;box-shadow:-25px 0 80px #6d582b26}
      html[data-theme="light"][dir=rtl] .z-menu-drawer{box-shadow:25px 0 80px #6d582b26}
      html[data-theme="light"] .z-menu-head{border-color:#ddd6c9}
      html[data-theme="light"] .z-menu-close{background:#fff;color:#222;border-color:#d5cec0}
      html[data-theme="light"] .z-menu-links a{color:#292929}
      html[data-theme="light"] .z-menu-links a:hover,html[data-theme="light"] .z-menu-links a.current{background:#f0eadf;border-color:#c7ad73;color:#7d611f}
      html[data-theme="light"] .z-menu-langs,html[data-theme="light"] .z-theme-wrap{border-color:#ddd6c9}
      html[data-theme="light"] .z-menu-langs button,html[data-theme="light"] .z-theme-modes button{background:#fff;color:#2c2c2c;border-color:#d5cec0}
      html[data-theme="light"] .z-menu-langs button.active,html[data-theme="light"] .z-theme-modes button.active{background:#f2e6c8;color:#785b1d;border-color:#b89549}
      html[data-theme="light"] .z-theme-label{color:#746e64}
      html[data-theme="light"] .z-back-home{background:#fffdf8ee;color:#7d611f;border-color:#b89549;box-shadow:0 12px 35px #5e4b1d20}

      @media(max-width:680px){
        .z-global-menu{top:10px;inset-inline-end:10px}
        .z-menu-btn{width:42px;height:42px;border-radius:12px}
        .z-back-home{bottom:12px;inset-inline-start:12px;padding:9px 12px;font-size:11px}
        .z-menu-drawer{padding:18px}
        .z-menu-head img{width:155px}
      }
    `;
    document.head.appendChild(st);

    const path=location.pathname.replace(/\/+$/,'')||'/';
    const shell=document.createElement('div');
    shell.className='z-global-menu';
    shell.innerHTML=`
      <button class="z-menu-btn" aria-label="Menu"><span></span><span></span><span></span></button>
      <div class="z-menu-backdrop"></div>
      <aside class="z-menu-drawer">
        <div class="z-menu-head"><a href="/"><img src="/zebaz-logo.svg" alt="ZEBAZ"></a><button class="z-menu-close">×</button></div>
        <nav class="z-menu-links">
          <a href="/" data-ku="سەرەکی" data-ar="الرئيسية" data-en="Home"></a>
          <a href="/ppf" data-ku="PPF و حجز" data-ar="PPF والحجز" data-en="PPF & Booking"></a>
          <a href="/studio" data-ku="ستودیۆ" data-ar="الاستوديو" data-en="Studio"></a>
          <a href="/fb-oil" data-ku="FB Oil" data-ar="FB Oil" data-en="FB Oil"></a>
          <a href="/carwash" data-ku="شۆردنگەی ئۆتۆمبێل" data-ar="غسيل السيارات" data-en="Car Wash"></a>
          <a href="/game-center" data-ku="ناوەندی یاری" data-ar="مركز الألعاب" data-en="Game Center"></a>
          <a href="/media" data-ku="میدیا و ڕیڤیو" data-ar="الإعلام والمراجعات" data-en="Media & Reviews"></a>
          <a href="/ai" data-ku="زیرەکی ئۆتۆمبێل" data-ar="ذكاء السيارات" data-en="ZEBAZ AI"></a>
          <a href="/#contact" data-ku="پەیوەندی" data-ar="تواصل معنا" data-en="Contact"></a>
          <a href="/admin" data-ku="بەڕێوەبەر" data-ar="الإدارة" data-en="Admin"></a>
        </nav>
        <div class="z-menu-langs"><button data-lang="ku">کوردی</button><button data-lang="ar">ع</button><button data-lang="en">EN</button></div>
        <div class="z-theme-wrap">
          <span class="z-theme-label" data-ku="ڕووکار" data-ar="المظهر" data-en="Appearance"></span>
          <div class="z-theme-modes">
            <button data-theme-mode="system"><span class="z-theme-icon">◐</span><span data-ku="سیستەم" data-ar="النظام" data-en="System"></span></button>
            <button data-theme-mode="dark"><span class="z-theme-icon">●</span><span data-ku="تاریک" data-ar="داكن" data-en="Dark"></span></button>
            <button data-theme-mode="light"><span class="z-theme-icon">☀</span><span data-ku="ڕووناک" data-ar="فاتح" data-en="Light"></span></button>
          </div>
        </div>
      </aside>`;
    document.body.appendChild(shell);

    const btn=shell.querySelector('.z-menu-btn'),back=shell.querySelector('.z-menu-backdrop'),close=shell.querySelector('.z-menu-close');
    const toggle=on=>{shell.classList.toggle('open',on);document.body.classList.toggle('z-menu-open',on)};
    btn.onclick=()=>toggle(!shell.classList.contains('open'));
    back.onclick=()=>toggle(false);
    close.onclick=()=>toggle(false);

    shell.querySelectorAll('.z-menu-links a').forEach(a=>{
      const ap=new URL(a.href,location.origin).pathname.replace(/\/+$/,'')||'/';
      if(ap===path)a.classList.add('current');
      a.addEventListener('click',()=>toggle(false));
    });

    shell.querySelectorAll('[data-theme-mode]').forEach(b=>b.addEventListener('click',()=>applyTheme(b.dataset.themeMode,true)));
    applyTheme(getTheme(),false);

    if(path!=='/'&&!document.querySelector('.z-back-home')){
      const a=document.createElement('a');
      a.href='/';
      a.className='z-back-home';
      a.setAttribute('data-ku','← گەڕانەوە بۆ سەرەکی');
      a.setAttribute('data-ar','← العودة للرئيسية');
      a.setAttribute('data-en','← Back to Home');
      document.body.appendChild(a);
    }
  }

  window.ZebazLang={get,set,open,apply};
  window.ZebazTheme={get:getTheme,set:mode=>applyTheme(mode,true),apply:applyTheme};

  document.addEventListener('DOMContentLoaded',()=>{
    addGlobalMenu();
    const saved=localStorage.getItem(KEY);
    apply(saved||'ku',false);
    applyTheme(getTheme(),false);
    const gate=document.querySelector('[data-lang-gate]');
    if(gate&&!saved)gate.style.display='flex';
    document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>set(b.dataset.lang)));
    document.querySelectorAll('[data-open-language]').forEach(b=>b.addEventListener('click',open));
    loadContent();
  });
})();