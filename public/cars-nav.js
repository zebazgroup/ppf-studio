(()=>{
  const lang=()=>window.ZebazLang?.get?.()||localStorage.getItem('zebaz_lang')||'ku';
  const copy=l=>l==='ar'?{cars:'السيارات',sell:'بيع سيارة'}:l==='en'?{cars:'Cars',sell:'Sell Car'}:{cars:'ئۆتۆمبێلەکان',sell:'فرۆشتنی ئۆتۆمبێل'};
  function install(){
    const drawer=document.querySelector('.z-menu-links');
    if(drawer&&!drawer.querySelector('a[href="/cars"]')){
      const home=drawer.querySelector('a[href="/"]'),a=document.createElement('a');a.href='/cars';a.dataset.ku='ئۆتۆمبێلەکان';a.dataset.ar='السيارات';a.dataset.en='Cars';
      if(home?.nextSibling)drawer.insertBefore(a,home.nextSibling);else drawer.prepend(a);
      const sell=document.createElement('a');sell.href='/cars?sell=1';sell.dataset.ku='فرۆشتنی ئۆتۆمبێل';sell.dataset.ar='بيع سيارة';sell.dataset.en='Sell Car';drawer.insertBefore(sell,a.nextSibling);
    }
    const nav=document.querySelector('.z-mobile-app-nav');
    if(nav){
      const studio=nav.querySelector('[data-key="studio"]');
      if(studio){studio.href='/cars';studio.dataset.key='cars';studio.querySelector('.ico').textContent='◈';studio.querySelector('.lbl').textContent=copy(lang()).cars;if(location.pathname.startsWith('/cars'))studio.classList.add('active')}
      const book=nav.querySelector('[data-key="book"]');if(book&&location.search.includes('sell=1')&&location.pathname.startsWith('/cars')){book.href='/cars?sell=1';book.querySelector('.lbl').textContent=copy(lang()).sell}
      window.addEventListener('zebaz:lang',()=>{const c=copy(lang()),x=nav.querySelector('[data-key="cars"] .lbl');if(x)x.textContent=c.cars});
    }
    if(location.pathname.startsWith('/cars')&&new URLSearchParams(location.search).get('sell')==='1')setTimeout(()=>document.getElementById('openSell')?.click(),250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
