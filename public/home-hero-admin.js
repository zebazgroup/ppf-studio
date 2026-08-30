(()=>{
  if(location.pathname!=='/'&&location.pathname!=='/home')return;
  const SLOTS=['home_slider_1','home_slider_2','home_slider_3','home_slider_4','home_slider_5'];
  async function load(){
    try{
      const r=await fetch('/api/content',{cache:'no-store'});if(!r.ok)return;
      const j=await r.json(),items=Array.isArray(j.items)?j.items:[];
      const urls=SLOTS.map(s=>items.find(x=>x.slot===s&&x.visible!==false&&x.imageUrl)?.imageUrl||'');
      if(!urls.some(Boolean))return;
      const slides=[...document.querySelectorAll('.z-hero-slide')],cards=[...document.querySelectorAll('.z-ai-card')];
      urls.forEach((u,i)=>{if(!u)return;if(slides[i])slides[i].style.backgroundImage=`url("${u}")`;if(cards[i])cards[i].style.backgroundImage=`url("${u}")`});
      document.documentElement.dataset.zAdminHero='1';
    }catch{}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,120));else setTimeout(load,120);
  window.addEventListener('zebaz:content',load);
})();
