import { readFile, writeFile } from 'fs/promises';
const file='public/cars.html';
let src=await readFile(file,'utf8');
if(src.includes('ZEBAZ_CARS_INLINE_BOOT_V1')){console.log('ZEBAZ Cars inline bootstrap already present');process.exit(0)}
const anchor='<script src="/site.js"></script>';
if(!src.includes(anchor))throw new Error('site.js anchor not found in cars.html');
const boot=String.raw`<script id="zc-inline-boot">(()=>{/* ZEBAZ_CARS_INLINE_BOOT_V1 */
const g=document.getElementById('carsGrid');if(!g)return;
const esc=v=>{const d=document.createElement('div');d.textContent=v==null?'':String(v);return d.innerHTML};
const money=v=>{const s=String(v||'').trim();return s?(s.startsWith('$')?s:'$'+s):'—'};
const lang=()=>document.documentElement.lang||'ku';
const tr=(ku,ar,en)=>lang()==='ar'?ar:lang()==='en'?en:ku;
let done=false;
function render(cars){if(done||!Array.isArray(cars))return;done=true;window.__ZEBAZ_INLINE_CARS=cars;const list=cars.slice(0,24);g.innerHTML=list.length?list.map((x,i)=>'<article class="zc-card" data-id="'+esc(x.id)+'"><div class="zc-photo" style="background-image:url(\''+esc(x.coverUrl||'')+'\')"><span class="zc-ai">AI PHOTO</span><span class="zc-price">'+esc(money(x.price))+'</span></div><div class="zc-body"><h3>'+esc((x.make||'')+' '+(x.model||''))+'</h3><div class="zc-meta"><span>'+esc(x.year||'—')+'</span><span>'+esc(x.mileage||'—')+'</span><span>'+esc(x.city||'—')+'</span></div></div></article>').join(''):'<div class="zc-empty">'+tr('هیچ ئۆتۆمبێلێک نییە.','لا توجد سيارات حالياً.','No cars available.')+'</div>';window.dispatchEvent(new CustomEvent('zebaz:inline-cars',{detail:{cars}}))}
async function get(url,ms){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{cache:'no-store',signal:c.signal});if(!r.ok)throw 0;const j=await r.json();if(j?.ok&&Array.isArray(j.cars))return j.cars;throw 0}finally{clearTimeout(t)}}
(async()=>{try{render(await get('/api/cars-fast?boot='+Date.now(),4500))}catch{try{render(await get('/api/cars?boot='+Date.now(),6500))}catch{if(!done)g.innerHTML='<div class="zc-empty"><b>'+tr('بارکردنی ئۆتۆمبێلەکان سەرکەوتوو نەبوو','تعذر تحميل السيارات','Could not load cars')+'</b><br><button class="zc-btn" onclick="location.reload()" style="margin-top:12px">'+tr('دووبارە هەوڵ بدە','إعادة المحاولة','Retry')+'</button></div>'}}})();
})();</script>`;
src=src.replace(anchor,boot+'\n'+anchor);
await writeFile(file,src);
console.log('ZEBAZ Cars inline bootstrap patch applied');
