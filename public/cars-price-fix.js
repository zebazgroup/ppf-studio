(()=>{
  if(!/^\/cars\/?$/.test(location.pathname))return;
  const style=document.createElement('style');
  style.id='zc-price-visibility-fix';
  style.textContent=`
    .zc-premium .zc-price,
    .zc-max-featured-price{
      direction:ltr!important;
      unicode-bidi:plaintext!important;
      white-space:nowrap!important;
      overflow:visible!important;
      text-overflow:clip!important;
      max-width:100%!important;
      box-sizing:border-box!important;
      font-variant-numeric:tabular-nums!important;
    }
    @media(max-width:760px){
      .zc-premium .zc-body{overflow:visible!important}
      .zc-premium .zc-price{
        width:100%!important;
        align-self:stretch!important;
        text-align:end!important;
        line-height:1.08!important;
        letter-spacing:-.35px!important;
        padding-inline:0!important;
      }
      .zc-max-featured-copy{grid-template-columns:minmax(0,1fr) auto!important}
      .zc-max-featured-price{font-size:clamp(13px,4vw,17px)!important;padding:8px 9px!important}
    }
  `;
  document.head.appendChild(style);

  function fit(el,min=12,max=18){
    if(!el)return;
    el.style.fontSize=max+'px';
    let size=max;
    const room=Math.max(0,el.clientWidth||el.parentElement?.clientWidth||0);
    if(!room)return;
    while(size>min && el.scrollWidth>room){size-=.5;el.style.fontSize=size+'px'}
  }
  function fitAll(){
    document.querySelectorAll('.zc-price').forEach(x=>fit(x,12,18));
    document.querySelectorAll('.zc-max-featured-price').forEach(x=>fit(x,12,17));
  }
  const boot=()=>{fitAll();
    const grid=document.getElementById('carsGrid');
    if(grid)new MutationObserver(()=>requestAnimationFrame(fitAll)).observe(grid,{childList:true,subtree:true,characterData:true});
    window.addEventListener('resize',()=>requestAnimationFrame(fitAll));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
