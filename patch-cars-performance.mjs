import { readFile, writeFile } from 'fs/promises';

const file='public/cars.html';
let src=await readFile(file,'utf8');

if(!src.includes('ZEBAZ_CARS_PERF_V1')){
  src=src.replace(
    "(()=>{const $=id=>document.getElementById(id),lang=()=>window.ZebazLang?.get?.()||'ku',tr=(ku,ar,en)=>lang()==='ar'?ar:lang()==='en'?en:ku;let cars=[],photos=[];",
    "(()=>{/* ZEBAZ_CARS_PERF_V1 */const $=id=>document.getElementById(id),lang=()=>window.ZebazLang?.get?.()||'ku',tr=(ku,ar,en)=>lang()==='ar'?ar:lang()==='en'?en:ku;let cars=[],photos=[],visibleCount=18,renderToken=0,coverObserver=null,moreObserver=null;const PAGE_SIZE=18;"
  );

  const oldRender=`function render(){const q=$('search').value.trim().toLowerCase(),mk=$('makeFilter').value,yr=$('yearFilter').value,ct=$('cityFilter').value;const list=cars.filter(x=>(!q||[x.make,x.model,x.year,x.city,x.color].some(v=>String(v||'').toLowerCase().includes(q)))&&(!mk||x.make===mk)&&(!yr||String(x.year)===yr)&&(!ct||x.city===ct));$('carsGrid').innerHTML=list.map(x=>'<article class="zc-card" data-id="'+esc(x.id)+'"><div class="zc-photo" style="background-image:url(\\''+esc(x.coverUrl||'')+'\\')"><span class="zc-ai">AI PHOTO</span><span class="zc-price">'+esc(money(x.price))+'</span></div><div class="zc-body"><h3>'+esc(x.make+' '+x.model)+'</h3><div class="zc-meta"><span>'+esc(x.year)+'</span><span>'+esc(x.mileage||'—')+'</span><span>'+esc(x.city||'—')+'</span></div></div></article>').join('')||'<div class="zc-empty">'+tr('هیچ ئۆتۆمبێلێک نەدۆزرایەوە.','لم يتم العثور على سيارات.','No cars found.')+'</div>';document.querySelectorAll('.zc-card').forEach(c=>c.onclick=()=>show(c.dataset.id))}`;

  const newRender=`function initLazyCovers(){if(coverObserver)coverObserver.disconnect();const els=[...document.querySelectorAll('.zc-photo[data-cover]')];if(!els.length)return;if(!('IntersectionObserver'in window)){els.forEach(el=>{el.style.backgroundImage=\`url("\${el.dataset.cover}")\`;el.removeAttribute('data-cover')});return}coverObserver=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;const el=e.target,u=el.dataset.cover;if(u)el.style.backgroundImage=\`url("\${u}")\`;el.removeAttribute('data-cover');coverObserver.unobserve(el)}},{rootMargin:'500px 0px'});els.forEach(el=>coverObserver.observe(el))}
function observeMore(){if(moreObserver)moreObserver.disconnect();const s=$('zcMoreSentinel');if(!s||!('IntersectionObserver'in window))return;moreObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){moreObserver.disconnect();visibleCount+=PAGE_SIZE;render()}},{rootMargin:'350px 0px'});moreObserver.observe(s)}
function render(){const token=++renderToken,q=$('search').value.trim().toLowerCase(),mk=$('makeFilter').value,yr=$('yearFilter').value,ct=$('cityFilter').value;const filtered=cars.filter(x=>(!q||[x.make,x.model,x.year,x.city,x.color].some(v=>String(v||'').toLowerCase().includes(q)))&&(!mk||x.make===mk)&&(!yr||String(x.year)===yr)&&(!ct||x.city===ct));const list=filtered.slice(0,visibleCount);const cards=list.map((x,i)=>{const cover=esc(x.coverUrl||''),eager=i<3&&cover,lazy=!eager&&cover;return '<article class="zc-card" data-id="'+esc(x.id)+'"><div class="zc-photo"'+(eager?' style="background-image:url(\\''+cover+'\\')"':'')+(lazy?' data-cover="'+cover+'"':'')+'><span class="zc-ai">AI PHOTO</span><span class="zc-price">'+esc(money(x.price))+'</span></div><div class="zc-body"><h3>'+esc(x.make+' '+x.model)+'</h3><div class="zc-meta"><span>'+esc(x.year||'—')+'</span><span>'+esc(x.mileage||'—')+'</span><span>'+esc(x.city||'—')+'</span></div></div></article>'}).join('');const empty='<div class="zc-empty">'+tr('هیچ ئۆتۆمبێلێک نەدۆزرایەوە.','لم يتم العثور على سيارات.','No cars found.')+'</div>';const more=filtered.length>list.length?'<div id="zcMoreSentinel" style="grid-column:1/-1;text-align:center;padding:12px 0 22px"><button id="zcLoadMore" type="button" class="zc-btn" style="min-width:170px">'+tr('زیاتر پیشان بدە','عرض المزيد','Load more')+' • '+list.length+'/'+filtered.length+'</button></div>':'';$('carsGrid').innerHTML=(cards||empty)+more;if(token!==renderToken)return;document.querySelectorAll('.zc-card').forEach(c=>c.onclick=()=>show(c.dataset.id));initLazyCovers();const b=$('zcLoadMore');if(b)b.onclick=()=>{visibleCount+=PAGE_SIZE;render()};observeMore()}`;

  if(!src.includes(oldRender))throw new Error('Cars render anchor not found');
  src=src.replace(oldRender,newRender);

  src=src.replace(
    "['search','makeFilter','yearFilter','cityFilter'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',render));$('clearFilters').onclick=()=>{$('search').value='';$('makeFilter').value=$('yearFilter').value=$('cityFilter').value='';render()};",
    "['search','makeFilter','yearFilter','cityFilter'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',()=>{visibleCount=PAGE_SIZE;render()}));$('clearFilters').onclick=()=>{$('search').value='';$('makeFilter').value=$('yearFilter').value=$('cityFilter').value='';visibleCount=PAGE_SIZE;render()};"
  );
}

await writeFile(file,src);

// Browser HTTP cache is enough for car photos; keep them cached longer and avoid repeat DB/image transfers.
const server='server.js';
let srv=await readFile(server,'utf8');
srv=srv.replace("res.setHeader('Cache-Control','public,max-age=3600');res.send(rows[0].image)","res.setHeader('Cache-Control','public,max-age=604800,stale-while-revalidate=86400');res.send(rows[0].image)");
await writeFile(server,srv);

console.log('ZEBAZ Cars performance patch applied');
