(()=>{
  if(/^\/admin(?:\/|$)/.test(location.pathname)||/^\/cars\/?$/.test(location.pathname))return;
  const boot=()=>{
    document.body.classList.add('z-site-v2');
    if(!document.getElementById('z-site-v2-style')){
      const s=document.createElement('style');s.id='z-site-v2-style';s.textContent=`
        body.z-site-v2{text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;overflow-x:hidden}
        body.z-site-v2 a,body.z-site-v2 button{transition:transform .16s ease,border-color .16s ease,background .16s ease,color .16s ease,box-shadow .16s ease}
        body.z-site-v2 button:active,body.z-site-v2 .cta:active,body.z-site-v2 .hv-btn:active{transform:scale(.985)}
        body.z-site-v2 input,body.z-site-v2 select,body.z-site-v2 textarea{outline:none;transition:border-color .16s ease,box-shadow .16s ease,background .16s ease}
        body.z-site-v2 input:focus,body.z-site-v2 select:focus,body.z-site-v2 textarea:focus{border-color:var(--z-accent,#d7b66d)!important;box-shadow:0 0 0 3px var(--z-accent-faint,#d7b66d12)!important}
        body.z-site-v2 img{content-visibility:auto}
        body.z-site-v2 .card,body.z-site-v2 .hv-card,body.z-site-v2 .panel,body.z-site-v2 .service-card{contain:layout paint style}
        .z-net-toast{position:fixed;z-index:99999;left:50%;bottom:18px;transform:translate(-50%,20px);opacity:0;pointer-events:none;background:#111;color:#fff;border:1px solid #333;border-radius:12px;padding:9px 13px;font:700 11px/1.3 -apple-system,BlinkMacSystemFont,"SF Pro Text",Arial,Tahoma,sans-serif;box-shadow:0 12px 35px #0007;transition:.2s}.z-net-toast.show{opacity:1;transform:translate(-50%,0)}
        .z-page-progress{position:fixed;z-index:99998;top:0;left:0;height:2px;width:0;background:var(--z-accent,#d7b66d);box-shadow:0 0 10px var(--z-accent,#d7b66d);transition:width .2s,opacity .3s}.z-page-progress.go{width:72%}.z-page-progress.done{width:100%;opacity:0}
        @media(max-width:760px){body.z-site-v2{scroll-padding-bottom:90px}.z-net-toast{bottom:calc(84px + env(safe-area-inset-bottom))}}
      `;document.head.appendChild(s)
    }
    document.querySelectorAll('img:not([loading])').forEach((img,i)=>{if(i>1&&!img.closest('.hv-hero,.hero,[data-content-slot="home_hero"]'))img.loading='lazy';img.decoding='async'});
    document.querySelectorAll('button,a,input,select,textarea').forEach(el=>{if(!el.hasAttribute('aria-label')&&!el.textContent?.trim()&&el.getAttribute('placeholder'))el.setAttribute('aria-label',el.getAttribute('placeholder'))});
    const toast=document.createElement('div');toast.className='z-net-toast';document.body.appendChild(toast);const show=msg=>{toast.textContent=msg;toast.classList.add('show');clearTimeout(show.t);show.t=setTimeout(()=>toast.classList.remove('show'),2400)};
    addEventListener('offline',()=>show(document.documentElement.lang==='ar'?'أنت غير متصل بالإنترنت':document.documentElement.lang==='en'?'You are offline':'ئینتەرنێت پچڕاوە'));
    addEventListener('online',()=>show(document.documentElement.lang==='ar'?'عاد الاتصال بالإنترنت':document.documentElement.lang==='en'?'Back online':'ئینتەرنێت گەڕایەوە'));
    const p=document.createElement('div');p.className='z-page-progress';document.body.appendChild(p);document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||a.target==='_blank'||a.origin!==location.origin||a.pathname===location.pathname)return;p.classList.add('go')});addEventListener('pageshow',()=>{p.classList.remove('go');p.classList.add('done');setTimeout(()=>p.classList.remove('done'),350)});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();