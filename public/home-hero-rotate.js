(()=>{
  if(!['/','/home','/home/'].includes(location.pathname))return;
  const hero=document.querySelector('.hv-hero');
  if(!hero)return;
  const paths=['/hero-data/hero-1.txt','/hero-data/hero-2.txt','/hero-data/hero-3.txt','/hero-data/hero-4.txt','/hero-data/hero-5.txt'];
  const css=document.createElement('style');
  css.textContent=`
    .hv-hero.z-hero-rotate{position:relative;overflow:hidden;background:#020202!important;min-height:640px}
    .z-hero-bg{position:absolute;inset:0;z-index:0;background:center/cover no-repeat;opacity:0;transform:scale(1.035);transition:opacity .9s ease,transform 5.4s ease}
    .z-hero-bg:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#020202f7 0%,#020202df 28%,#02020288 52%,#02020220 76%),linear-gradient(0deg,#020202b5 0%,transparent 40%)}
    [dir=rtl] .z-hero-bg:after{background:linear-gradient(270deg,#020202f7 0%,#020202df 28%,#02020288 52%,#02020220 76%),linear-gradient(0deg,#020202b5 0%,transparent 40%)}
    .z-hero-bg.active{opacity:1;transform:scale(1);z-index:1}
    .hv-hero.z-hero-rotate .hv-hero-inner{position:relative;z-index:3;min-height:640px;display:flex;align-items:center}
    .hv-hero.z-hero-rotate .hv-stage{display:none!important}
    .z-hero-dots{position:absolute;z-index:5;left:50%;bottom:19px;transform:translateX(-50%);display:flex;gap:8px}
    .z-hero-dots button{border:0;width:24px;height:4px;padding:0;border-radius:99px;background:#ffffff70;cursor:pointer;transition:.2s}
    .z-hero-dots button.active{width:40px;background:var(--z-accent,#d7b66d)}
    @media(max-width:760px){.hv-hero.z-hero-rotate,.hv-hero.z-hero-rotate .hv-hero-inner{min-height:560px}.z-hero-bg{background-position:62% center}.z-hero-bg:after,[dir=rtl] .z-hero-bg:after{background:linear-gradient(0deg,#020202f5 0%,#020202c8 52%,#02020252 100%)}.z-hero-dots{bottom:12px}}
  `;
  document.head.appendChild(css);
  hero.classList.add('z-hero-rotate');
  const load=async()=>{
    const urls=[];
    for(const p of paths){try{const r=await fetch(p,{cache:'force-cache'});if(r.ok){const t=(await r.text()).trim();if(t.startsWith('data:image/'))urls.push(t)}}catch{}}
    if(!urls.length)return;
    const layers=urls.map((u,i)=>{const d=document.createElement('div');d.className='z-hero-bg'+(i===0?' active':'');d.style.backgroundImage=`url("${u}")`;hero.prepend(d);return d});
    const dots=document.createElement('div');dots.className='z-hero-dots';dots.innerHTML=urls.map((_,i)=>`<button type="button" aria-label="${i+1}" data-i="${i}" class="${i===0?'active':''}"></button>`).join('');hero.appendChild(dots);
    let index=0,timer;
    const show=i=>{index=(i+layers.length)%layers.length;layers.forEach((x,n)=>x.classList.toggle('active',n===index));dots.querySelectorAll('button').forEach((x,n)=>x.classList.toggle('active',n===index))};
    const start=()=>{clearInterval(timer);timer=setInterval(()=>show(index+1),4700)};
    dots.onclick=e=>{const b=e.target.closest('button[data-i]');if(!b)return;show(+b.dataset.i);start()};
    document.addEventListener('visibilitychange',()=>document.hidden?clearInterval(timer):start());
    start();
  };
  load();
})();
