(()=>{
'use strict';
if(!/^\/cars\/?$/.test(location.pathname))return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const THEME_KEY='zebaz_cars_theme_v4';
const mm=matchMedia('(prefers-color-scheme: dark)');
let brandRendering=false,currentDetailId='',qualityTimer=0;
const lang=()=>window.ZebazLang?.get?.()||localStorage.getItem('zebaz_lang')||document.documentElement.lang||'ku';
const tr=(ku,ar,en)=>lang()==='ar'?ar:lang()==='en'?en:ku;
const esc=v=>{const d=document.createElement('div');d.textContent=v==null?'':String(v);return d.innerHTML};
const app=()=>window.ZebazCarsApp||null;
const brandSlug=value=>String(value||'').toLowerCase().normalize('NFKD').replace(/[&+]/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'brand';

function resolvedTheme(mode){return mode==='auto'?(mm.matches?'dark':'light'):mode}
function applyTheme(mode=localStorage.getItem(THEME_KEY)||'auto'){
  if(!['auto','light','dark'].includes(mode))mode='auto';
  localStorage.setItem(THEME_KEY,mode);
  const actual=resolvedTheme(mode);
  document.documentElement.dataset.carsTheme=actual;
  document.documentElement.dataset.carsThemeMode=mode;
  const meta=$('meta[name="theme-color"]');if(meta)meta.content=actual==='dark'?'#0b0d10':'#ffffff';
  const sel=$('#carsThemeSelect');if(sel)sel.value=mode;
}
function themeLabels(){return [{v:'auto',t:tr('خۆکار','تلقائي','Auto')},{v:'light',t:tr('ڕووناک','فاتح','Light')},{v:'dark',t:tr('تاریک','داكن','Dark')}]}
function installThemeControl(){
  const actions=$('.c-actions');if(!actions||$('#carsThemeSelect'))return;
  const wrap=document.createElement('label');wrap.className='c-theme-wrap';wrap.title=tr('ڕووکار','المظهر','Appearance');
  wrap.innerHTML=`<span class="c-theme-icon">◐</span><select class="c-theme-select" id="carsThemeSelect" aria-label="Theme"></select>`;
  actions.insertBefore(wrap,$('#topSell')||actions.firstChild);
  const sel=$('#carsThemeSelect');
  const fill=()=>{const keep=localStorage.getItem(THEME_KEY)||'auto';sel.innerHTML=themeLabels().map(x=>`<option value="${x.v}">${x.t}</option>`).join('');sel.value=keep};
  fill();sel.addEventListener('change',()=>applyTheme(sel.value));window.addEventListener('zebaz:lang',fill);
}
mm.addEventListener?.('change',()=>{if((localStorage.getItem(THEME_KEY)||'auto')==='auto')applyTheme('auto')});

function makes(){return $$('#zcMake option').map(o=>o.value).filter(Boolean)}
function ensureBrandTools(){
  const rail=$('#brandRail');if(!rail||$('.c-brand-tools'))return;
  const tools=document.createElement('div');tools.className='c-brand-tools';tools.innerHTML=`<input class="c-brand-search" id="brandSearchV4" type="search" autocomplete="off" placeholder="${tr('گەڕان لە مارکەکان...','ابحث عن ماركة...','Search brands...')}"><span class="c-brand-count" id="brandCountV4"></span>`;
  rail.before(tools);$('#brandSearchV4')?.addEventListener('input',renderBrandsV4);
}
function renderBrandsV4(){
  const rail=$('#brandRail'),select=$('#zcMake');if(!rail||!select||brandRendering)return;
  const all=makes();if(!all.length)return;
  brandRendering=true;ensureBrandTools();
  const q=($('#brandSearchV4')?.value||'').trim().toLowerCase(),active=select.value;
  const list=all.filter(name=>!q||name.toLowerCase().includes(q));
  rail.innerHTML=list.map(name=>`<button type="button" class="c-brand c-brand-v3 c-brand-v4${active===name?' active':''}" data-brand="${esc(name)}" aria-label="${esc(name)}"><span class="c-brand-logo-shell"><img class="c-brand-logo" src="/brands/${brandSlug(name)}.png" alt="${esc(name)}" loading="lazy" decoding="async"><span class="c-brand-fallback">${esc(name)}</span></span><small>${esc(name)}</small></button>`).join('');
  const count=$('#brandCountV4');if(count)count.textContent=`${list.length}/${all.length}`;
  $$('.c-brand-v4',rail).forEach(btn=>btn.addEventListener('click',()=>{
    const same=select.value===btn.dataset.brand;select.value=same?'':btn.dataset.brand;select.dispatchEvent(new Event('change',{bubbles:true}));
    $$('.c-brand-v4',rail).forEach(x=>x.classList.toggle('active',!same&&x===btn));
    $('#listings')?.scrollIntoView({behavior:'smooth',block:'start'});
  }));
  $$('.c-brand-logo',rail).forEach(img=>img.addEventListener('error',()=>{img.style.display='none'}, {once:true}));
  brandRendering=false;
}
function watchBrands(){
  const rail=$('#brandRail');if(!rail)return;
  new MutationObserver(()=>{if(brandRendering)return;if(!rail.querySelector('.c-brand-v4'))setTimeout(renderBrandsV4,0)}).observe(rail,{childList:true});
  [0,250,900,1800,3600,7300].forEach(ms=>setTimeout(renderBrandsV4,ms));
  $('#zcMake')?.addEventListener('change',()=>$$('.c-brand-v4',rail).forEach(b=>b.classList.toggle('active',b.dataset.brand===$('#zcMake').value)));
}

function installStudioIntro(){
  const upload=$('.c-upload');if(!upload||$('.v4-studio-card'))return;
  const card=document.createElement('div');card.className='v4-studio-card';card.innerHTML=`<div class="v4-ai-badge">AI</div><div><strong>ZEBAZ AI Studio + 360</strong><small>${tr('تا 12 وێنە دابنێ. AI کوالێتی دەپشکنێت، دەتوانێت تەنها ژینگە/باکگراوند بکاتە ستودیۆ و ئۆتۆمبێلە ڕاستەقینەکە بپارێزێت. بۆ 360 لانیکەم 8 زاویەی ڕاستەقینە پێویستە.','ارفع حتى 12 صورة. يفحص AI الجودة ويمكنه تحويل الخلفية فقط إلى استوديو مع الحفاظ على السيارة الحقيقية. عرض 360 يحتاج 8 زوايا حقيقية على الأقل.','Upload up to 12 photos. AI checks quality and can turn only the environment into a studio while preserving the real car. 360 needs at least 8 real angles.')}</small></div><span class="v4-ready" id="v4ReadyState">0/8 • 360</span>`;
  upload.before(card);const quality=document.createElement('div');quality.className='v4-quality';quality.id='v4QualityPanel';upload.after(quality);
  const strong=upload.querySelector('strong');if(strong){strong.setAttribute('data-ku','وێنەکانی ئۆتۆمبێل — تا 12');strong.setAttribute('data-ar','صور السيارة — حتى 12');strong.setAttribute('data-en','Car photos — up to 12');window.ZebazLang?.apply?.(strong)}
}
function imageFromData(url){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url})}
async function inspectImage(url){
  try{
    const img=await imageFromData(url),w=img.naturalWidth,h=img.naturalHeight,c=document.createElement('canvas');c.width=96;c.height=96;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,96,96);const d=x.getImageData(0,0,96,96).data;let lum=0,edge=0,count=0;const gray=new Float32Array(96*96);for(let i=0,p=0;i<d.length;i+=4,p++){const g=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];gray[p]=g;lum+=g}lum/=gray.length;for(let y=1;y<95;y++)for(let xx=1;xx<95;xx++){const p=y*96+xx;edge+=Math.abs(gray[p]-gray[p-1])+Math.abs(gray[p]-gray[p-96]);count++}edge/=Math.max(1,count);const resolution=Math.min(w,h)>=720,brightness=lum>28&&lum<232,sharp=edge>10;return{w,h,lum,edge,good:resolution&&brightness&&sharp,resolution,brightness,sharp};
  }catch{return{w:0,h:0,good:false,resolution:false,brightness:false,sharp:false}}
}
async function refreshQuality(){
  const a=app(),panel=$('#v4QualityPanel');if(!a||!panel)return;const photos=a.state?.photos||[];const ready=$('#v4ReadyState');if(ready)ready.textContent=`${Math.min(photos.length,8)}/8 • 360`;
  if(!photos.length){panel.innerHTML='';return}
  panel.innerHTML=`<div class="v4-quality-row"><span>${tr('پشکنینی کوالێتی...','فحص الجودة...','Checking photo quality...')}</span><b>AI CHECK</b></div>`;
  const results=await Promise.all(photos.map(inspectImage));
  const good=results.filter(x=>x.good).length;
  panel.innerHTML=results.map((r,i)=>`<div class="v4-quality-row ${r.good?'good':'warn'}"><span>#${i+1} • ${r.w||'?'}×${r.h||'?'}</span><b>${r.good?tr('باشە','جيدة','GOOD'):(!r.resolution?tr('قەبارە کەمە','دقة منخفضة','LOW RES'):!r.sharp?tr('کەمێک ماتە','ضبابية','SOFT'):tr('ڕووناکی','إضاءة','LIGHT'))}</b></div>`).join('')+`<div class="v4-quality-row ${good>=8?'good':'warn'}"><span>${tr('وێنەی گونجاو بۆ 360','صور صالحة لـ 360','Usable 360 frames')}</span><b>${good}/8+</b></div>`;
}
function scheduleQuality(){clearTimeout(qualityTimer);qualityTimer=setTimeout(refreshQuality,350)}

function ensureStudioModal(){
  if($('#v4StudioModal'))return;
  const m=document.createElement('div');m.id='v4StudioModal';m.className='v4-studio-modal';m.innerHTML=`<div class="v4-studio-panel"><div class="v4-compare-head"><div><strong>ZEBAZ AI Studio</strong><div style="font-size:10px;color:var(--v4-muted);margin-top:3px">${tr('بەراوردی وێنەی ڕاستەقینە و ستودیۆ','مقارنة الصورة الأصلية والاستوديو','Original vs studio result')}</div></div><button class="c-close" type="button" data-v4-close>×</button></div><div class="v4-studio-grid"><div class="v4-studio-image"><b>${tr('ڕاستەقینە','الأصلية','ORIGINAL')}</b><img id="v4StudioOriginal" alt="original"></div><div class="v4-studio-image"><b>AI STUDIO</b><img id="v4StudioResult" alt="studio"></div></div><div class="v4-studio-actions"><button class="c-btn" type="button" data-v4-close>${tr('ڕاستەقینەکە بهێڵە','احتفظ بالأصلية','Keep original')}</button><button class="c-btn primary" id="v4UseStudio" type="button">${tr('وێنەی ستودیۆ بەکاربهێنە','استخدم صورة الاستوديو','Use studio version')}</button></div></div>`;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-v4-close]'))m.classList.remove('open')});
}
async function runStudio(index,button){
  const a=app(),photo=a?.state?.photos?.[index];if(!a||!photo)return;button.classList.add('loading');button.textContent=tr('AI کاردەکات...','AI يعمل...','AI working...');
  try{
    const r=await fetch('/api/cars/ai-studio',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:photo})});const j=await r.json();if(!r.ok||!j.ok||!j.image)throw new Error(j.error||'AI Studio unavailable');
    ensureStudioModal();$('#v4StudioOriginal').src=photo;$('#v4StudioResult').src=j.image;$('#v4StudioModal').classList.add('open');
    const use=$('#v4UseStudio');use.onclick=()=>{if(a.state.photos[index]!==undefined){a.state.photos[index]=j.image;a.renderPhotos?.();scheduleQuality()}$('#v4StudioModal').classList.remove('open')};
  }catch(err){const s=$('#sellStatus');if(s)s.textContent=String(err.message||tr('AI Studio ئێستا بەردەست نییە. وێنەی ئاسایی هەر کاردەکات.','AI Studio غير متاح الآن. الصور العادية ما زالت تعمل.','AI Studio is unavailable right now. Normal photos still work.'))}
  finally{button.classList.remove('loading');button.textContent='✦ AI Studio'}
}
function decoratePhotoGrid(){
  const grid=$('#photoGrid'),a=app();if(!grid||!a)return;$$('.c-thumb',grid).forEach((thumb,i)=>{if(thumb.querySelector('.v4-thumb-action'))return;const b=document.createElement('button');b.type='button';b.className='v4-thumb-action';b.textContent='✦ AI Studio';b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();runStudio(i,b)});thumb.appendChild(b)});scheduleQuality();
}
function watchPhotos(){const grid=$('#photoGrid');if(!grid)return;new MutationObserver(decoratePhotoGrid).observe(grid,{childList:true,subtree:true});decoratePhotoGrid()}

function ensureCompareModal(){
  if($('#v4CompareModal'))return;
  const m=document.createElement('div');m.id='v4CompareModal';m.className='v4-compare-modal';m.innerHTML=`<div class="v4-compare-panel"><div class="v4-compare-head"><div><div class="c-eyebrow">ZEBAZ AI COMPARE</div><h2>${tr('بەراوردی زیرەکی دوو ئۆتۆمبێل','مقارنة ذكية بين سيارتين','Smart two-car comparison')}</h2></div><button class="c-close" type="button" data-v4-compare-close>×</button></div><div class="v4-compare-cars" id="v4CompareCars"></div><div class="v4-ai-result" id="v4CompareResult"></div></div>`;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-v4-compare-close]'))m.classList.remove('open')});
}
function carSummary(x){return `${x.make||''} ${x.model||''}${x.year?' • '+x.year:''}${x.price?' • '+x.price:''}${x.mileage?' • '+x.mileage:''}${x.city?' • '+x.city:''}`}
async function compareV4(){
  const a=app();if(!a)return;const ids=[...(a.state?.compare||[])],cars=ids.map(id=>a.state.cars.find(x=>String(x.id)===String(id))).filter(Boolean);if(cars.length!==2){const t=$('#cToast');if(t){t.textContent=tr('دوو ئۆتۆمبێل هەڵبژێرە','اختر سيارتين','Select exactly two cars');t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}return}
  ensureCompareModal();$('#v4CompareCars').innerHTML=cars.map((x,i)=>`<div class="v4-compare-car"><strong>${i+1}. ${esc((x.make||'')+' '+(x.model||''))}</strong><span>${esc(carSummary(x))}${x.description?'<br>'+esc(x.description):''}</span></div>`).join('');const out=$('#v4CompareResult');out.classList.add('loading');out.textContent=tr('ZEBAZ AI بە داتای ڕاستەقینەی ئەم دوو ئاگهییە بەراورد دەکات...','ZEBAZ AI يقارن بيانات الإعلانين الفعلية...','ZEBAZ AI is comparing the actual listing data...');$('#v4CompareModal').classList.add('open');
  const language=lang()==='ku'?'Kurdish Sorani':lang()==='ar'?'Arabic':'English';
  const data=cars.map(x=>({make:x.make||null,model:x.model||null,year:x.year||null,price:x.price||null,mileage:x.mileage||null,city:x.city||null,color:x.color||null,description:x.description||null,sellerType:'private listing'}));
  const prompt=`You are ZEBAZ AI Car Compare. Compare exactly these TWO marketplace listings for a buyer in Kurdistan/Iraq. Write in ${language}. Use the listing data below as facts. Never invent missing engine, horsepower, trim, battery, options, accident history or reliability facts. If a specification is not provided and you are not certain, explicitly label it unknown / needs verification. You may give clearly labeled general model-level guidance only when appropriate.\n\nLISTINGS:\n${JSON.stringify(data,null,2)}\n\nReturn a professional decision report with these headings: 1) Quick verdict, 2) Performance & strength (known facts only), 3) Specifications/features, 4) Running cost & efficiency, 5) Reliability/practicality, 6) Resale/value, 7) Suitability for Kurdistan/Iraq, 8) Price/value-for-money, 9) Pros & cons for each car, 10) Final winner and why. Mention which missing facts the buyer should verify before purchase.`;
  try{const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:prompt,history:[]})});const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'AI compare failed');out.textContent=j.reply||j.response||j.answer||tr('وەڵام نەگەڕایەوە.','لم تصل إجابة.','No response returned.')}catch(e){out.textContent=tr('بەراوردی AI ئێستا سەرکەوتوو نەبوو. دووبارە هەوڵ بدە.','تعذرت مقارنة AI الآن. حاول مرة أخرى.','AI comparison failed right now. Please retry.')}finally{out.classList.remove('loading')}
}
function interceptCompare(){document.addEventListener('click',e=>{const b=e.target.closest?.('#compareTool');if(!b)return;e.preventDefault();e.stopImmediatePropagation();compareV4()},true)}

function addGalleryLightbox(img){img.style.cursor='zoom-in';img.addEventListener('click',()=>{ensureStudioModal();$('#v4StudioOriginal').src=img.src;$('#v4StudioResult').src=img.src;$('#v4StudioModal').classList.add('open');const use=$('#v4UseStudio');if(use)use.style.display='none';const close=()=>{if(use)use.style.display='';$('#v4StudioModal').removeEventListener('transitionend',close)};$('#v4StudioModal').addEventListener('transitionend',close)},{once:false})}
function installSpin(body,car){
  if(body.querySelector('.v4-spin-wrap'))return;const urls=(car.imageUrls||[]).filter(Boolean).slice(0,12),gallery=body.querySelector('.c-gallery');
  if(urls.length<8){const note=document.createElement('div');note.className='v4-gallery-note';note.textContent=tr(`ئەم ئاگهییە ${urls.length} وێنەی هەیە. بۆ 360ی ڕاستەقینە لانیکەم 8 زاویە پێویستە؛ لێرە گەلەری و زووم بەردەستە.`,`هذا الإعلان يحتوي ${urls.length} صور. عرض 360 حقيقي يحتاج 8 زوايا على الأقل؛ المعرض والتكبير متاحان.`,`This listing has ${urls.length} photos. A truthful 360 view needs at least 8 real angles; gallery and zoom remain available.`);gallery?.before(note);$$('.c-gallery img',body).forEach(addGalleryLightbox);return}
  const wrap=document.createElement('div');wrap.className='v4-spin-wrap';wrap.innerHTML=`<div class="v4-spin-head"><div><strong>ZEBAZ 360 • ${tr('زاویە ڕاستەقینەکان','زوايا حقيقية','REAL UPLOADED ANGLES')}</strong><small>${tr('بکێشە بۆ سوڕاندن • زووم و fullscreen','اسحب للدوران • تكبير وملء الشاشة','Drag to rotate • zoom • fullscreen')}</small></div><small>${urls.length} frames</small></div><div class="v4-spin" id="v4Spin"><img src="${esc(urls[0])}" alt="360 car view"></div><div class="v4-spin-controls"><button type="button" data-spin-prev>‹</button><button type="button" data-spin-zoomout>−</button><button type="button" data-spin-reset>100%</button><button type="button" data-spin-zoomin>＋</button><button type="button" data-spin-next>›</button><button type="button" data-spin-full>⛶</button></div>`;gallery?.before(wrap);
  const spin=$('#v4Spin',wrap),img=$('img',spin);let index=0,scale=1,startX=0,dragging=false,lastStep=0;const show=i=>{index=(i+urls.length)%urls.length;img.src=urls[index];img.style.transform=`scale(${scale})`;const r=$('[data-spin-reset]',wrap);if(r)r.textContent=Math.round(scale*100)+'%'};urls.slice(1).forEach(u=>{const im=new Image();im.src=u});
  spin.addEventListener('pointerdown',e=>{dragging=true;startX=e.clientX;lastStep=0;spin.setPointerCapture?.(e.pointerId)});spin.addEventListener('pointermove',e=>{if(!dragging)return;const step=Math.trunc((e.clientX-startX)/22);if(step!==lastStep){show(index-(step-lastStep));lastStep=step}});const end=()=>{dragging=false};spin.addEventListener('pointerup',end);spin.addEventListener('pointercancel',end);
  $('[data-spin-prev]',wrap).onclick=()=>show(index-1);$('[data-spin-next]',wrap).onclick=()=>show(index+1);$('[data-spin-zoomin]',wrap).onclick=()=>{scale=Math.min(2.8,scale+.2);show(index)};$('[data-spin-zoomout]',wrap).onclick=()=>{scale=Math.max(1,scale-.2);show(index)};$('[data-spin-reset]',wrap).onclick=()=>{scale=1;show(index)};$('[data-spin-full]',wrap).onclick=()=>spin.requestFullscreen?.();
  if(gallery)gallery.style.display='none';
}
function enhanceDetail(){const a=app(),body=$('#detailBody');if(!a||!body||!currentDetailId)return;const car=a.state?.cars?.find(x=>String(x.id)===String(currentDetailId));if(car)installSpin(body,car)}
function watchDetail(){document.addEventListener('click',e=>{const card=e.target.closest?.('.c-card');if(card&&!e.target.closest('button'))currentDetailId=card.dataset.id||''},true);const body=$('#detailBody');if(body)new MutationObserver(()=>setTimeout(enhanceDetail,0)).observe(body,{childList:true,subtree:false})}

function polishCopy(){const trust=$$('.c-v3-trust-item small').find(x=>(x.getAttribute('data-en')||'').includes('Up to 5'));if(trust){trust.setAttribute('data-ku','تا 12 وێنە، AI Studio و 360ی زاویە ڕاستەقینە.');trust.setAttribute('data-ar','حتى 12 صورة، AI Studio وعرض 360 من زوايا حقيقية.');trust.setAttribute('data-en','Up to 12 photos, AI Studio and real-angle 360.');window.ZebazLang?.apply?.(trust)}}
function waitForApp(){let tries=0;const timer=setInterval(()=>{tries++;if(app()){clearInterval(timer);installStudioIntro();watchPhotos();decoratePhotoGrid();scheduleQuality();}else if(tries>40)clearInterval(timer)},150)}
function init(){applyTheme();installThemeControl();ensureBrandTools();watchBrands();interceptCompare();watchDetail();polishCopy();waitForApp();window.addEventListener('zebaz:lang',()=>{installThemeControl();const input=$('#brandSearchV4');if(input)input.placeholder=tr('گەڕان لە مارکەکان...','ابحث عن ماركة...','Search brands...');renderBrandsV4();polishCopy();installStudioIntro()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.ZebazCarsV4={applyTheme,renderBrands:renderBrandsV4,refreshQuality};
})();
