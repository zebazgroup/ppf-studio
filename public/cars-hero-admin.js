(()=>{
  if(!/^\/cars\/?$/.test(location.pathname))return;
  const SLOTS=['cars_slider_1','cars_slider_2','cars_slider_3','cars_slider_4','cars_slider_5'];
  const FALLBACK=['/hero/hero-gwagon.webp','/hero/hero-range.webp','/hero/hero-lambo.webp','/hero/hero-raptor.webp','/hero/hero-landcruiser.webp'];
  const card=document.querySelector('.c-hero-card');
  if(!card||card.dataset.carsSlider==='1')return;
  card.dataset.carsSlider='1';

  const style=document.createElement('style');
  style.id='zebaz-cars-admin-slider-v1';
  style.textContent=`
    .c-hero-card{position:relative!important;isolation:isolate!important;min-height:370px!important;padding:44px!important;background:#090909!important;border-color:#262626!important;color:#fff!important;box-shadow:0 20px 60px #00000024!important}
    .c-hero-card>div:not(.c-cars-slider):not(.c-cars-dots){position:relative;z-index:4}.c-hero-card>.c-hero-art{opacity:0;pointer-events:none}
    .c-hero-card .c-eyebrow{color:#e0aa45!important}.c-hero-card h1{color:#fff!important;text-shadow:0 5px 28px #000!important;max-width:660px}.c-hero-card p{color:#d1d1d1!important;text-shadow:0 3px 18px #000!important;max-width:620px}
    .c-hero-card .c-btn:not(.primary){background:#0a0a0abf!important;color:#fff!important;border-color:#ffffff55!important;backdrop-filter:blur(12px)}
    .c-cars-slider{position:absolute!important;inset:0!important;z-index:0!important;overflow:hidden!important;border-radius:23px!important;background:#080808!important}
    .c-cars-slide{position:absolute;inset:-1px;background-position:center;background-size:cover;background-repeat:no-repeat;opacity:0;transform:scale(1.035);transition:opacity .85s ease,transform 5.2s ease;will-change:opacity,transform}
    .c-cars-slide.active{opacity:1;transform:scale(1)}
    .c-cars-slider:after{content:'';position:absolute;inset:0;z-index:2;background:linear-gradient(90deg,#050505f8 0%,#050505e5 34%,#0505059e 54%,#0505052b 78%),linear-gradient(180deg,#00000028,transparent 55%,#050505a8);pointer-events:none}
    [dir=rtl] .c-cars-slider:after{background:linear-gradient(270deg,#050505f8 0%,#050505e5 34%,#0505059e 54%,#0505052b 78%),linear-gradient(180deg,#00000028,transparent 55%,#050505a8)}
    .c-cars-dots{position:absolute!important;z-index:6!important;left:50%;bottom:15px;transform:translateX(-50%);display:flex;gap:7px;direction:ltr}
    .c-cars-dot{width:18px;height:3px;padding:0;border:0;border-radius:999px;background:#ffffffb8;opacity:.7;cursor:pointer;transition:.2s}.c-cars-dot.active{width:28px;background:#ff3b30;opacity:1}
    @media(max-width:760px){.c-hero{padding:8px 0 18px!important}.c-hero-card{min-height:410px!important;border-radius:0!important;border-left:0!important;border-right:0!important;padding:235px 16px 42px!important;display:block!important}.c-cars-slider{border-radius:0!important}.c-cars-slider:after,[dir=rtl] .c-cars-slider:after{background:linear-gradient(180deg,#00000018 0%,#05050550 38%,#050505e8 66%,#050505 100%)!important}.c-cars-slide{background-position:65% center}.c-hero-card h1{font-size:34px!important}.c-hero-card p{font-size:12px!important;line-height:1.55!important}.c-cars-dots{bottom:12px}.c-hero-card>.c-hero-art{display:none!important}}
  `;
  document.head.appendChild(style);

  const slider=document.createElement('div');slider.className='c-cars-slider';
  const dots=document.createElement('div');dots.className='c-cars-dots';
  const slides=[];
  FALLBACK.forEach((src,i)=>{
    const s=document.createElement('div');s.className='c-cars-slide'+(i===0?' active':'');s.style.backgroundImage=`url("${src}")`;slider.appendChild(s);slides.push(s);
    const d=document.createElement('button');d.type='button';d.className='c-cars-dot'+(i===0?' active':'');d.setAttribute('aria-label','Cars hero '+(i+1));dots.appendChild(d);
  });
  card.prepend(slider);card.appendChild(dots);
  const dotEls=[...dots.children];let index=0,timer=null;
  function show(n){index=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle('active',i===index));dotEls.forEach((d,i)=>d.classList.toggle('active',i===index))}
  function auto(){clearInterval(timer);timer=setInterval(()=>show(index+1),4000)}
  dotEls.forEach((d,i)=>d.addEventListener('click',()=>{show(i);auto()}));auto();

  async function loadAdminImages(){
    try{
      const r=await fetch('/api/content',{cache:'no-store'});if(!r.ok)return;
      const j=await r.json(),items=Array.isArray(j.items)?j.items:[];
      SLOTS.forEach((slot,i)=>{const item=items.find(x=>x.slot===slot&&x.visible!==false&&x.imageUrl);if(item?.imageUrl)slides[i].style.backgroundImage=`url("${item.imageUrl}")`});
      document.documentElement.dataset.zCarsAdminHero='1';
    }catch{}
  }
  loadAdminImages();window.addEventListener('zebaz:content',loadAdminImages);
})();