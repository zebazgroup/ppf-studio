(()=>{
  const LANG_KEY='zebaz_lang';
  const THEME_KEY='zebaz_theme';
  const COLOR_KEY='zebaz_color';
  const validLangs=['ku','ar','en'];
  const validThemes=['system','dark','light'];
  const validColors=['gold','blue','red','green','purple'];
  let content=[];
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

  function getLang(){const x=localStorage.getItem(LANG_KEY);return validLangs.includes(x)?x:'ku'}
  function getTheme(){const x=localStorage.getItem(THEME_KEY);return validThemes.includes(x)?x:'system'}
  function getColor(){const x=localStorage.getItem(COLOR_KEY);return validColors.includes(x)?x:'gold'}

  function resolvedTheme(mode=getTheme()){
    if(mode==='system')return window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
    return mode;
  }

  function applyTheme(mode=getTheme(),save=false){
    if(!validThemes.includes(mode))mode='system';
    if(save)localStorage.setItem(THEME_KEY,mode);
    const resolved=resolvedTheme(mode);
    document.documentElement.dataset.theme=resolved;
    document.documentElement.dataset.themeMode=mode;
    document.documentElement.style.colorScheme=resolved;
    document.querySelectorAll('[data-theme-mode]').forEach(b=>b.classList.toggle('active',b.dataset.themeMode===mode));
    window.dispatchEvent(new CustomEvent('zebaz:theme',{detail:{mode,resolved}}));
    return resolved;
  }

  function applyColor(color=getColor(),save=false){
    if(!validColors.includes(color))color='gold';
    if(save)localStorage.setItem(COLOR_KEY,color);
    document.documentElement.dataset.palette=color;
    document.querySelectorAll('[data-palette-choice]').forEach(b=>b.classList.toggle('active',b.dataset.paletteChoice===color));
    window.dispatchEvent(new CustomEvent('zebaz:color',{detail:{color}}));
    return color;
  }

  const mq=window.matchMedia('(prefers-color-scheme: light)');
  const systemChanged=()=>{if(getTheme()==='system')applyTheme('system',false)};
  if(mq.addEventListener)mq.addEventListener('change',systemChanged);else if(mq.addListener)mq.addListener(systemChanged);
  applyTheme(getTheme(),false);
  applyColor(getColor(),false);

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
        if(field){const v=item[field+suffix];if(v)el.textContent=v}
        else{
          if(title){const t=el.querySelector('[data-content-title],h1,h2,h3');if(t)t.textContent=title}
          if(caption){const p=el.querySelector('[data-content-caption],p');if(p)p.textContent=caption}
        }
        if(item.link&&el.tagName==='A')el.href=item.link;
      }
    }
  }

  function applyLang(lang,save=true){
    if(!validLangs.includes(lang))lang='ku';
    if(save)localStorage.setItem(LANG_KEY,lang);
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==='en'?'ltr':'rtl';
    document.querySelectorAll('[data-ku]').forEach(el=>{const v=el.dataset[lang];if(v!==undefined)el.textContent=v});
    document.querySelectorAll('[data-ku-html]').forEach(el=>{const v=el.dataset[lang+'Html'];if(v!==undefined)el.innerHTML=v});
    document.querySelectorAll('[data-ku-placeholder]').forEach(el=>{const v=el.dataset[lang+'Placeholder'];if(v!==undefined)el.placeholder=v});
    const body=document.body,title=body&&body.dataset['title'+cap(lang)];if(title)document.title=title;
    document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
    const gate=document.querySelector('[data-lang-gate]');if(gate)gate.style.display='none';
    applyContent(lang);
    window.dispatchEvent(new CustomEvent('zebaz:lang',{detail:{lang}}));
    return lang;
  }

  function openLanguage(){const g=document.querySelector('[data-lang-gate]');if(g)g.style.display='flex'}

  async function loadContent(){
    try{const r=await fetch('/api/content',{cache:'no-store'});if(r.ok){const j=await r.json();content=j.items||[];applyContent(getLang())}}catch{}
  }

  function injectThemeStyles(){
    if(document.getElementById('z-theme-styles'))return;
    const st=document.createElement('style');st.id='z-theme-styles';
    st.textContent=`
      html[data-palette="gold"]{--z-accent:#d7b66d;--z-accent-deep:#8d6d27;--z-accent-soft:#d7b66d24;--z-accent-faint:#d7b66d12}
      html[data-palette="blue"]{--z-accent:#62a8ff;--z-accent-deep:#246ab8;--z-accent-soft:#62a8ff24;--z-accent-faint:#62a8ff12}
      html[data-palette="red"]{--z-accent:#ff625f;--z-accent-deep:#b82f2c;--z-accent-soft:#ff625f24;--z-accent-faint:#ff625f12}
      html[data-palette="green"]{--z-accent:#55d994;--z-accent-deep:#23865a;--z-accent-soft:#55d99424;--z-accent-faint:#55d99412}
      html[data-palette="purple"]{--z-accent:#b984ff;--z-accent-deep:#7644b9;--z-accent-soft:#b984ff24;--z-accent-faint:#b984ff12}
      :root{--z-bg:#050505;--z-surface:#0d0d0d;--z-surface2:#111;--z-text:#f5f5f5;--z-muted:#9a9a9a;--z-line:#2b2b2b}
      html[data-theme="light"]{--z-bg:#f5f2eb;--z-surface:#fffdf8;--z-surface2:#f0ece3;--z-text:#171717;--z-muted:#66625b;--z-line:#d8d1c4}
      body,body.home-v2{background:var(--z-bg)!important;color:var(--z-text)!important;transition:background .25s,color .25s}
      body:before{background:radial-gradient(circle at 80% 8%,var(--z-accent-faint),transparent 24%),radial-gradient(circle at 10% 48%,#ffffff05,transparent 18%)!important}
      html[data-theme="light"] body:before{background:radial-gradient(circle at 80% 8%,var(--z-accent-soft),transparent 24%),radial-gradient(circle at 10% 48%,#00000007,transparent 18%)!important}
      .gold,.eyebrow,.division-name,.hv-kicker,.hv-card .more,.hv-owner-visual:after,.hv-metric strong,.hv-stat strong,.z-menu-links a:after,[class*="gold"]{color:var(--z-accent)!important}
      .cta.primary,.submit,.composer button,.hv-btn.gold,.user{background:var(--z-accent)!important;border-color:var(--z-accent)!important;color:#080808!important}
      .cta:hover,.card:hover,.langpick button:hover,.langpick button.active,.gate-langs button:hover{border-color:var(--z-accent-deep)!important}
      .top,.home-v2 .top{border-bottom-color:var(--z-line)!important}
      .z-global-menu{position:fixed;top:14px;inset-inline-end:14px;z-index:250}
      .z-menu-btn{width:46px;height:46px;border-radius:14px;border:1px solid var(--z-accent-deep);background:#090909e8;backdrop-filter:blur(18px);display:grid;place-content:center;gap:5px;cursor:pointer;box-shadow:0 12px 35px #0008}
      .z-menu-btn span{width:19px;height:1.5px;background:var(--z-accent);display:block}
      .z-menu-backdrop{position:fixed;inset:0;background:#000b;opacity:0;pointer-events:none;transition:.25s}
      .z-menu-drawer{position:fixed;top:0;bottom:0;inset-inline-end:0;width:min(390px,88vw);background:linear-gradient(180deg,#090909,#050505);border-inline-start:1px solid #2d2a22;transform:translateX(110%);transition:.28s cubic-bezier(.2,.8,.2,1);padding:24px;box-shadow:-25px 0 80px #000;overflow:auto}
      [dir=rtl] .z-menu-drawer{transform:translateX(-110%);box-shadow:25px 0 80px #000}
      .z-global-menu.open .z-menu-backdrop{opacity:1;pointer-events:auto}.z-global-menu.open .z-menu-drawer{transform:translateX(0)}
      .z-menu-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:20px;border-bottom:1px solid #222}.z-menu-head img{width:180px;max-height:52px;object-fit:contain}
      .z-menu-close{width:40px;height:40px;border-radius:50%;border:1px solid #333;background:#111;color:#fff;font-size:26px;cursor:pointer}
      .z-menu-links{display:grid;gap:7px;margin-top:18px}.z-menu-links a{display:flex;align-items:center;justify-content:space-between;text-decoration:none;color:#d5d5d5;border:1px solid transparent;border-radius:14px;padding:14px 15px;font-size:14px}.z-menu-links a:after{content:'›';font-size:20px}[dir=rtl] .z-menu-links a:after{content:'‹'}
      .z-menu-links a:hover,.z-menu-links a.current{background:#111;border-color:var(--z-accent-deep);color:var(--z-accent)}
      .z-menu-langs{display:flex;gap:7px;border-top:1px solid #222;margin-top:18px;padding-top:18px}.z-menu-langs button{flex:1;border:1px solid #333;background:#0d0d0d;color:#ddd;border-radius:12px;padding:11px;cursor:pointer}.z-menu-langs button.active{border-color:var(--z-accent-deep);color:var(--z-accent);background:var(--z-accent-faint)}
      .z-theme-wrap{border-top:1px solid #222;margin-top:16px;padding-top:16px}.z-theme-label{display:block;color:#858585;font-size:11px;margin-bottom:9px}.z-theme-modes{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.z-theme-modes button{border:1px solid #333;background:#0d0d0d;color:#cfcfcf;border-radius:12px;padding:10px 7px;cursor:pointer;font-size:12px}.z-theme-modes button:hover,.z-theme-modes button.active{border-color:var(--z-accent-deep);color:var(--z-accent);background:var(--z-accent-faint)}.z-theme-icon{display:block;font-size:16px;margin-bottom:4px}
      .z-back-home{position:fixed;bottom:18px;inset-inline-start:18px;z-index:120;text-decoration:none;color:var(--z-accent);background:#090909e8;border:1px solid var(--z-accent-deep);border-radius:999px;padding:11px 15px;font-size:12px;backdrop-filter:blur(16px);box-shadow:0 12px 35px #0008}.z-menu-open{overflow:hidden}

      .z-color-control{position:fixed;top:14px;inset-inline-start:14px;z-index:249}
      .z-color-btn{width:46px;height:46px;border-radius:14px;border:1px solid var(--z-accent-deep);background:var(--z-surface);color:var(--z-accent);font-size:21px;cursor:pointer;box-shadow:0 12px 35px #0007;backdrop-filter:blur(16px)}
      .z-color-panel{position:absolute;top:56px;inset-inline-start:0;width:205px;padding:12px;border:1px solid var(--z-line);border-radius:16px;background:color-mix(in srgb,var(--z-surface) 95%,transparent);box-shadow:0 18px 55px #0008;backdrop-filter:blur(18px);opacity:0;transform:translateY(-8px) scale(.97);pointer-events:none;transition:.2s}
      .z-color-control.open .z-color-panel{opacity:1;transform:none;pointer-events:auto}.z-color-title{font-size:11px;color:var(--z-muted);margin-bottom:10px;display:block}.z-color-swatches{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
      .z-swatch{width:30px;height:30px;border-radius:50%;border:2px solid transparent;cursor:pointer;box-shadow:0 0 0 1px var(--z-line);transition:.18s}.z-swatch:hover{transform:scale(1.08)}.z-swatch.active{border-color:var(--z-text);box-shadow:0 0 0 2px var(--z-accent)}
      .z-swatch[data-palette-choice="gold"]{background:#d7b66d}.z-swatch[data-palette-choice="blue"]{background:#62a8ff}.z-swatch[data-palette-choice="red"]{background:#ff625f}.z-swatch[data-palette-choice="green"]{background:#55d994}.z-swatch[data-palette-choice="purple"]{background:#b984ff}

      html[data-theme="light"] h1,html[data-theme="light"] h2,html[data-theme="light"] h3,html[data-theme="light"] h4,html[data-theme="light"] h5,html[data-theme="light"] h6,html[data-theme="light"] .title,html[data-theme="light"] .card h3,html[data-theme="light"] .panel h3,html[data-theme="light"] .hv-copy h1,html[data-theme="light"] .hv-head h2,html[data-theme="light"] .hv-card h3,html[data-theme="light"] .hv-owner-copy h2,html[data-theme="light"] .hv-location h3,html[data-theme="light"] .hv-contact-box h2{color:#171717!important}
      html[data-theme="light"] p,html[data-theme="light"] .lead,html[data-theme="light"] .muted,html[data-theme="light"] .card p,html[data-theme="light"] .panel p,html[data-theme="light"] .note,html[data-theme="light"] .hv-copy p,html[data-theme="light"] .hv-head p,html[data-theme="light"] .hv-card p,html[data-theme="light"] .hv-owner-copy p,html[data-theme="light"] .hv-location p,html[data-theme="light"] .hv-contact-box p,html[data-theme="light"] .hv-stat span,html[data-theme="light"] .hv-metric span{color:#66625b!important}
      html[data-theme="light"] .top,html[data-theme="light"] .home-v2 .top{background:#faf8f2ee!important;border-bottom-color:#d8d2c6!important}
      html[data-theme="light"] .nav a,html[data-theme="light"] .langpick button,html[data-theme="light"] .langbtn,html[data-theme="light"] .home-v2 .navlinks>a{color:#242424!important}
      html[data-theme="light"] .nav a,html[data-theme="light"] .langpick button,html[data-theme="light"] .langbtn{background:#fffdf8!important;border-color:#d8d1c4!important}
      html[data-theme="light"] .home-v2 .navlinks>a{background:transparent!important}
      html[data-theme="light"] .home-v2 .book-top{background:var(--z-accent-faint)!important;color:var(--z-accent-deep)!important;border-color:var(--z-accent-deep)!important}
      html[data-theme="light"] .hero{background:radial-gradient(circle at 82% 14%,var(--z-accent-soft) 0,#f7f2e8 28%,#f8f6f0 62%,#f4f1e9 100%)!important;border-bottom-color:#d8d2c6!important;box-shadow:none!important}
      html[data-theme="light"] .hero:before{background-image:linear-gradient(#00000008 1px,transparent 1px),linear-gradient(90deg,#00000008 1px,transparent 1px)!important}
      html[data-theme="light"] .hero.has-image:before{background:linear-gradient(90deg,#f7f4eceb 0,#f7f4ecc9 48%,#f7f4ec55),linear-gradient(#ffffff22,#f5f2e8a8)!important}
      html[data-theme="light"] .section.alt,html[data-theme="light"] .hv-owner{background:#eeeae1!important;border-color:#d8d2c6!important}
      html[data-theme="light"] .card,html[data-theme="light"] .panel,html[data-theme="light"] .metric,html[data-theme="light"] .form-card,html[data-theme="light"] .ai-shell,html[data-theme="light"] .hv-card,html[data-theme="light"] .hv-owner-copy,html[data-theme="light"] .hv-owner-visual,html[data-theme="light"] .hv-location,html[data-theme="light"] .hv-contact-box{background:#fffdf8!important;border-color:#d8d1c4!important;color:#171717!important;box-shadow:0 18px 45px #5d4b2414}
      html[data-theme="light"] .field input,html[data-theme="light"] .field select,html[data-theme="light"] .field textarea,html[data-theme="light"] .composer input{background:#fff!important;border-color:#d5cec0!important;color:#161616!important}
      html[data-theme="light"] input::placeholder,html[data-theme="light"] textarea::placeholder{color:#8a857c!important}html[data-theme="light"] .field label{color:#333!important}
      html[data-theme="light"] .messages{background:linear-gradient(#f5f2eb,#fffdf8)!important}.bot{border-color:var(--z-line)!important}html[data-theme="light"] .bot{background:#f0ece3!important;color:#222!important}.chat-head,.composer{border-color:var(--z-line)!important}
      html[data-theme="light"] .footer,html[data-theme="light"] .home-v2 .footer{background:#f5f2eb!important;border-color:#d8d2c6!important;color:#706b61!important}html[data-theme="light"] .phones a,html[data-theme="light"] .hv-phones a{background:#fffdf8!important;color:#242424!important;border-color:#d8d1c4!important}
      html[data-theme="light"] .lang-gate{background:radial-gradient(circle at 50% 0,var(--z-accent-soft),#f5f1e7 43%,#ece8df)!important}html[data-theme="light"] .gate-box{background:#fffdf8ee!important;border-color:#d2cabd!important;box-shadow:0 30px 100px #5949191c}html[data-theme="light"] .gate-langs button{background:#fff!important;color:#222!important;border-color:#d5cec0!important}
      html[data-theme="light"] .hv-hero{background:radial-gradient(circle at 70% 20%,var(--z-accent-soft) 0,transparent 27%),radial-gradient(circle at 20% 80%,#ece7dc 0,transparent 35%),#f7f4ed!important;border-bottom-color:#d8d2c6!important}html[data-theme="light"] .hv-hero:before{background:linear-gradient(90deg,#00000008 1px,transparent 1px),linear-gradient(#00000008 1px,transparent 1px)!important}html[data-theme="light"] .hv-strip{background:#eeeae1!important;border-bottom-color:#d8d2c6!important}html[data-theme="light"] .hv-stat{border-color:#d8d2c6!important}
      html[data-theme="light"] .hv-card.ai,html[data-theme="light"] .hv-card.game,html[data-theme="light"] .hv-card.oil,html[data-theme="light"] .hv-card.media{background:linear-gradient(145deg,#fffdf8,#eee8dc)!important}html[data-theme="light"] .hv-card .ico{background:var(--z-accent-faint)!important;border-color:var(--z-accent-deep)!important;color:var(--z-accent-deep)!important}html[data-theme="light"] .hv-owner-visual{background:radial-gradient(circle at 55% 38%,var(--z-accent-soft),#f4f0e7 58%)!important}html[data-theme="light"] .hv-owner-visual:before{color:#00000008!important}html[data-theme="light"] .hv-metric{background:#f7f3ea!important;border-color:#d8d1c4!important}
      html[data-theme="light"] .z-menu-btn{background:#fffdf8ee;box-shadow:0 12px 35px #5e4b1d20}html[data-theme="light"] .z-menu-drawer{background:linear-gradient(180deg,#fffdf8,#f2eee5);border-color:#d5cec0;box-shadow:-25px 0 80px #6d582b26}html[data-theme="light"][dir=rtl] .z-menu-drawer{box-shadow:25px 0 80px #6d582b26}html[data-theme="light"] .z-menu-head{border-color:#ddd6c9}html[data-theme="light"] .z-menu-close{background:#fff;color:#222;border-color:#d5cec0}html[data-theme="light"] .z-menu-links a{color:#292929}html[data-theme="light"] .z-menu-links a:hover,html[data-theme="light"] .z-menu-links a.current{background:var(--z-accent-faint);border-color:var(--z-accent-deep);color:var(--z-accent-deep)}html[data-theme="light"] .z-menu-langs,html[data-theme="light"] .z-theme-wrap{border-color:#ddd6c9}html[data-theme="light"] .z-menu-langs button,html[data-theme="light"] .z-theme-modes button{background:#fff;color:#2c2c2c;border-color:#d5cec0}html[data-theme="light"] .z-menu-langs button.active,html[data-theme="light"] .z-theme-modes button.active{background:var(--z-accent-faint);color:var(--z-accent-deep);border-color:var(--z-accent-deep)}html[data-theme="light"] .z-theme-label{color:#746e64}html[data-theme="light"] .z-back-home{background:#fffdf8ee;color:var(--z-accent-deep);border-color:var(--z-accent-deep);box-shadow:0 12px 35px #5e4b1d20}
      html[data-theme="light"] .z-color-btn{background:#fffdf8;color:var(--z-accent-deep);box-shadow:0 12px 35px #5e4b1d20}html[data-theme="light"] .z-color-panel{background:#fffdf8f5;box-shadow:0 18px 55px #5e4b1d26}
      @media(max-width:680px){.z-global-menu{top:10px;inset-inline-end:10px}.z-menu-btn{width:42px;height:42px;border-radius:12px}.z-color-control{top:10px;inset-inline-start:10px}.z-color-btn{width:42px;height:42px;border-radius:12px}.z-color-panel{top:50px;width:195px}.z-back-home{bottom:12px;inset-inline-start:12px;padding:9px 12px;font-size:11px}.z-menu-drawer{padding:18px}.z-menu-head img{width:155px}}
    `;
    document.head.appendChild(st);
  }

  function addColorControl(){
    if(document.querySelector('.z-color-control'))return;
    const c=document.createElement('div');c.className='z-color-control';
    c.innerHTML=`<button class="z-color-btn" aria-label="Website color">◉</button><div class="z-color-panel"><span class="z-color-title" data-ku="ڕەنگی وێبسایت" data-ar="لون الموقع" data-en="Website color"></span><div class="z-color-swatches"><button class="z-swatch" data-palette-choice="gold" aria-label="Gold"></button><button class="z-swatch" data-palette-choice="blue" aria-label="Blue"></button><button class="z-swatch" data-palette-choice="red" aria-label="Red"></button><button class="z-swatch" data-palette-choice="green" aria-label="Green"></button><button class="z-swatch" data-palette-choice="purple" aria-label="Purple"></button></div></div>`;
    document.body.appendChild(c);
    const btn=c.querySelector('.z-color-btn');btn.addEventListener('click',e=>{e.stopPropagation();c.classList.toggle('open')});
    c.querySelectorAll('[data-palette-choice]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();applyColor(b.dataset.paletteChoice,true);c.classList.remove('open')}));
    document.addEventListener('click',e=>{if(!c.contains(e.target))c.classList.remove('open')});
    applyColor(getColor(),false);
  }

  function addGlobalMenu(){
    if(document.querySelector('.z-global-menu'))return;
    const path=location.pathname.replace(/\/+$/,'')||'/';
    const shell=document.createElement('div');shell.className='z-global-menu';
    shell.innerHTML=`<button class="z-menu-btn" aria-label="Menu"><span></span><span></span><span></span></button><div class="z-menu-backdrop"></div><aside class="z-menu-drawer"><div class="z-menu-head"><a href="/"><img src="/zebaz-logo.svg" alt="ZEBAZ"></a><button class="z-menu-close">×</button></div><nav class="z-menu-links"><a href="/" data-ku="سەرەکی" data-ar="الرئيسية" data-en="Home"></a><a href="/ppf" data-ku="PPF و حجز" data-ar="PPF والحجز" data-en="PPF & Booking"></a><a href="/studio" data-ku="ستودیۆ" data-ar="الاستوديو" data-en="Studio"></a><a href="/fb-oil" data-ku="FB Oil" data-ar="FB Oil" data-en="FB Oil"></a><a href="/carwash" data-ku="شۆردنگەی ئۆتۆمبێل" data-ar="غسيل السيارات" data-en="Car Wash"></a><a href="/game-center" data-ku="ناوەندی یاری" data-ar="مركز الألعاب" data-en="Game Center"></a><a href="/media" data-ku="میدیا و ڕیڤیو" data-ar="الإعلام والمراجعات" data-en="Media & Reviews"></a><a href="/ai" data-ku="زیرەکی ئۆتۆمبێل" data-ar="ذكاء السيارات" data-en="ZEBAZ AI"></a><a href="/#contact" data-ku="پەیوەندی" data-ar="تواصل معنا" data-en="Contact"></a><a href="/admin" data-ku="بەڕێوەبەر" data-ar="الإدارة" data-en="Admin"></a></nav><div class="z-menu-langs"><button data-lang="ku">کوردی</button><button data-lang="ar">ع</button><button data-lang="en">EN</button></div><div class="z-theme-wrap"><span class="z-theme-label" data-ku="ڕووکار" data-ar="المظهر" data-en="Appearance"></span><div class="z-theme-modes"><button data-theme-mode="system"><span class="z-theme-icon">◐</span><span data-ku="سیستەم" data-ar="النظام" data-en="System"></span></button><button data-theme-mode="dark"><span class="z-theme-icon">●</span><span data-ku="تاریک" data-ar="داكن" data-en="Dark"></span></button><button data-theme-mode="light"><span class="z-theme-icon">☀</span><span data-ku="ڕووناک" data-ar="فاتح" data-en="Light"></span></button></div></div></aside>`;
    document.body.appendChild(shell);
    const btn=shell.querySelector('.z-menu-btn'),back=shell.querySelector('.z-menu-backdrop'),close=shell.querySelector('.z-menu-close');
    const toggle=on=>{shell.classList.toggle('open',on);document.body.classList.toggle('z-menu-open',on)};
    btn.onclick=()=>toggle(!shell.classList.contains('open'));back.onclick=()=>toggle(false);close.onclick=()=>toggle(false);
    shell.querySelectorAll('.z-menu-links a').forEach(a=>{const ap=new URL(a.href,location.origin).pathname.replace(/\/+$/,'')||'/';if(ap===path)a.classList.add('current');a.addEventListener('click',()=>toggle(false))});
    shell.querySelectorAll('[data-theme-mode]').forEach(b=>b.addEventListener('click',()=>applyTheme(b.dataset.themeMode,true)));
    applyTheme(getTheme(),false);
    if(path!=='/'&&!document.querySelector('.z-back-home')){const a=document.createElement('a');a.href='/';a.className='z-back-home';a.setAttribute('data-ku','← گەڕانەوە بۆ سەرەکی');a.setAttribute('data-ar','← العودة للرئيسية');a.setAttribute('data-en','← Back to Home');document.body.appendChild(a)}
  }

  window.ZebazLang={get:getLang,set:lang=>applyLang(lang,true),open:openLanguage,apply:applyLang};
  window.ZebazTheme={get:getTheme,set:mode=>applyTheme(mode,true),apply:applyTheme};
  window.ZebazColor={get:getColor,set:color=>applyColor(color,true),apply:applyColor};

  document.addEventListener('DOMContentLoaded',()=>{
    injectThemeStyles();
    addGlobalMenu();
    addColorControl();
    const saved=localStorage.getItem(LANG_KEY);applyLang(saved||'ku',false);applyTheme(getTheme(),false);applyColor(getColor(),false);
    const gate=document.querySelector('[data-lang-gate]');if(gate&&!saved)gate.style.display='flex';
    document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>applyLang(b.dataset.lang,true)));
    document.querySelectorAll('[data-open-language]').forEach(b=>b.addEventListener('click',openLanguage));
    loadContent();
  });
})();