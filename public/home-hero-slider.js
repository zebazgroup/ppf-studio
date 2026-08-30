(()=>{
  if(location.pathname!=='/' && location.pathname!=='/home') return;
  const hero=document.querySelector('.hv-hero');
  if(!hero || hero.dataset.zSlider==='1') return;
  hero.dataset.zSlider='1';
  const IMAGES=['/hero/hero-gwagon.webp','/hero/hero-range.webp','/hero/hero-lambo.webp','/hero/hero-raptor.webp','/hero/hero-landcruiser.webp'];
  const labels={
    ku:{eyebrow:'AI GALLERY',title:'وێنەی سینەمایی ZEBAZ',sub:'کۆمەڵە وێنەی ئۆتۆمبێلی دروستکراو بە AI بۆ پێشاندانی ستایلی پرێمیۆمی ZEBAZ.',view:'بینینی هەموو'},
    ar:{eyebrow:'AI GALLERY',title:'صور ZEBAZ السينمائية',sub:'مجموعة صور سيارات مولدة بالذكاء الاصطناعي بهوية ZEBAZ الفاخرة.',view:'عرض الكل'},
    en:{eyebrow:'AI GALLERY',title:'ZEBAZ CINEMATIC AUTOMOTIVE',sub:'A curated set of AI-generated automotive visuals built around the premium ZEBAZ identity.',view:'VIEW ALL'}
  };
  const getLang=()=>window.ZebazLang?.get?.()||document.documentElement.lang||'ku';
  const style=document.createElement('style');style.id='zebaz-home-cinematic-v1';style.textContent=`
  .home-v2 .top{background:#020202f8!important;border-bottom:1px solid #202020!important}
  .hv-hero{min-height:620px!important;background:#020202!important;isolation:isolate}
  .hv-hero:before{display:none!important}.hv-hero:after{z-index:1!important;background:linear-gradient(180deg,transparent 70%,#020202 100%)!important}
  .z-hero-slider{position:absolute;inset:0;z-index:0;background:#020202;overflow:hidden}
  .z-hero-slide{position:absolute;inset:-1px;background-position:center;background-size:cover;background-repeat:no-repeat;opacity:0;transform:scale(1.035);transition:opacity .9s ease,transform 5.8s ease;will-change:opacity,transform}
  .z-hero-slide.active{opacity:1;transform:scale(1)}
  .z-hero-slider:after{content:'';position:absolute;inset:0;z-index:3;background:linear-gradient(90deg,#020202 0%,#020202f5 27%,#020202c8 39%,#02020255 58%,#02020215 78%),linear-gradient(180deg,#00000025 0%,transparent 60%,#020202 100%);pointer-events:none}
  [dir=rtl] .z-hero-slider:after{background:linear-gradient(270deg,#020202 0%,#020202f5 27%,#020202c8 39%,#02020255 58%,#02020215 78%),linear-gradient(180deg,#00000025 0%,transparent 60%,#020202 100%)}
  .hv-hero-inner{min-height:620px!important;z-index:4!important;grid-template-columns:.9fr 1.1fr!important}
  .hv-copy{max-width:590px!important;padding:70px 0!important;text-shadow:0 4px 30px #000}
  .hv-kicker{color:#d6a240!important;font-size:10px!important;letter-spacing:3.1px!important;font-weight:800!important}
  .hv-copy h1{font-size:clamp(52px,5vw,82px)!important;font-weight:800!important;line-height:.94!important;letter-spacing:-2.5px!important;margin-bottom:24px!important}
  .hv-copy h1 span{color:transparent!important;-webkit-text-stroke:1.4px #d49b34;text-stroke:1.4px #d49b34;text-shadow:none!important}
  .hv-copy p{color:#d2d2d2!important;max-width:540px!important;font-size:14px!important}
  .hv-btn{border-radius:7px!important;padding:13px 20px!important;background:#050505a8!important;backdrop-filter:blur(10px)}
  .hv-btn.gold{border-color:#a97624!important;color:#e6b34e!important}
  .z-hero-controls{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);z-index:7;display:flex;align-items:center;gap:9px;direction:ltr}
  .z-hero-dot{width:22px;height:3px;border:0;border-radius:999px;background:#ffffffd9;padding:0;cursor:pointer;opacity:.7;transition:.25s}.z-hero-dot.active{width:30px;background:#d59b35;opacity:1}
  .z-hero-arrow{position:absolute;top:50%;z-index:7;width:44px;height:58px;margin-top:-29px;border:0;background:#00000020;color:#fff;font-size:31px;display:grid;place-items:center;cursor:pointer;opacity:.75;transition:.2s}.z-hero-arrow:hover{background:#0008;opacity:1}.z-hero-prev{left:12px}.z-hero-next{right:12px}
  .z-ai-gallery{background:linear-gradient(180deg,#050505,#020202);border-bottom:1px solid #202020;padding:42px 0 50px;color:#fff}.z-ai-gallery-in{width:min(1480px,93%);margin:auto}
  .z-ai-gallery-head{display:flex;align-items:flex-end;justify-content:space-between;gap:25px;margin-bottom:20px}.z-ai-gallery-kicker{color:#d49b34;font-size:10px;font-weight:800;letter-spacing:2.3px;margin-bottom:8px}.z-ai-gallery h2{margin:0;font-size:27px;line-height:1.1;letter-spacing:-.4px}.z-ai-gallery p{margin:8px 0 0;color:#9d9d9d;font-size:12px;line-height:1.65;max-width:560px}
  .z-ai-gallery-view{border:1px solid #8f6424;color:#e0aa45;background:#070707;border-radius:7px;padding:12px 18px;font-size:10px;font-weight:800;white-space:nowrap;cursor:pointer}
  .z-ai-gallery-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.z-ai-card{position:relative;min-height:250px;border:1px solid #282828;border-radius:9px;overflow:hidden;background:#111 center/cover no-repeat;box-shadow:0 12px 40px #0006;transition:.28s}.z-ai-card:hover{transform:translateY(-4px);border-color:#7c5b24}.z-ai-card:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,#000a 100%)}.z-ai-chip{position:absolute;z-index:2;top:10px;left:10px;background:#050505dc;border:1px solid #454545;border-radius:5px;color:#fff;font-size:9px;font-weight:800;padding:5px 7px}.z-ai-index{position:absolute;z-index:2;right:10px;bottom:9px;color:#e2ad4b;font-size:9px;letter-spacing:1px;font-weight:800}
  @media(max-width:1000px){.z-ai-gallery-grid{grid-template-columns:repeat(3,1fr)}.z-ai-card:nth-child(n+4){display:none}}
  @media(max-width:760px){.hv-hero{min-height:610px!important}.hv-hero-inner{min-height:610px!important;display:block!important;width:90%!important}.z-hero-slider:after,[dir=rtl] .z-hero-slider:after{background:linear-gradient(180deg,#0202023d 0%,#02020275 30%,#020202e9 66%,#020202 100%)!important}.z-hero-slide{background-position:66% center}.hv-copy{padding:285px 0 48px!important;max-width:none!important}.hv-copy h1{font-size:43px!important}.hv-copy p{font-size:12px!important;line-height:1.65!important}.z-hero-arrow{display:none}.z-hero-controls{bottom:13px}.z-ai-gallery{padding:31px 0 38px}.z-ai-gallery-head{align-items:flex-start}.z-ai-gallery-view{display:none}.z-ai-gallery h2{font-size:21px}.z-ai-gallery-grid{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:9px;padding-bottom:6px;scrollbar-width:none}.z-ai-gallery-grid::-webkit-scrollbar{display:none}.z-ai-card,.z-ai-card:nth-child(n+4){display:block;min-width:72vw;min-height:235px;scroll-snap-align:start}}
  `;document.head.appendChild(style);
  const slider=document.createElement('div');slider.className='z-hero-slider';
  IMAGES.forEach((src,i)=>{const d=document.createElement('div');d.className='z-hero-slide'+(i===0?' active':'');d.style.backgroundImage=`url("${src}")`;slider.appendChild(d)});
  hero.prepend(slider);
  const prev=document.createElement('button');prev.className='z-hero-arrow z-hero-prev';prev.type='button';prev.setAttribute('aria-label','Previous image');prev.innerHTML='‹';hero.appendChild(prev);
  const next=document.createElement('button');next.className='z-hero-arrow z-hero-next';next.type='button';next.setAttribute('aria-label','Next image');next.innerHTML='›';hero.appendChild(next);
  const controls=document.createElement('div');controls.className='z-hero-controls';controls.innerHTML=IMAGES.map((_,i)=>`<button class="z-hero-dot${i===0?' active':''}" type="button" aria-label="Slide ${i+1}"></button>`).join('');hero.appendChild(controls);
  let index=0,timer=null;const slides=[...slider.children],dots=[...controls.children];
  function show(n){index=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle('active',i===index));dots.forEach((d,i)=>d.classList.toggle('active',i===index))}
  function auto(){clearInterval(timer);timer=setInterval(()=>show(index+1),3700)}
  prev.onclick=()=>{show(index-1);auto()};next.onclick=()=>{show(index+1);auto()};dots.forEach((d,i)=>d.onclick=()=>{show(i);auto()});auto();
  const gallery=document.createElement('section');gallery.className='z-ai-gallery';
  function paintGallery(){const c=labels[getLang()]||labels.ku;gallery.innerHTML=`<div class="z-ai-gallery-in"><div class="z-ai-gallery-head"><div><div class="z-ai-gallery-kicker">${c.eyebrow}</div><h2>${c.title}</h2><p>${c.sub}</p></div><button class="z-ai-gallery-view" type="button">${c.view} →</button></div><div class="z-ai-gallery-grid">${IMAGES.map((src,i)=>`<div class="z-ai-card" style="background-image:url(&quot;${src}&quot;)"><span class="z-ai-chip">AI</span><span class="z-ai-index">0${i+1}</span></div>`).join('')}</div></div>`;gallery.querySelector('.z-ai-gallery-view')?.addEventListener('click',()=>gallery.scrollIntoView({behavior:'smooth'}))}
  paintGallery();hero.after(gallery);window.addEventListener('zebaz:lang',paintGallery);
})();