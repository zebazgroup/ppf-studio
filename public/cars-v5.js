(()=>{
'use strict';
if(!/^\/cars\/?$/.test(location.pathname))return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=()=>window.ZebazCarsApp||null;
const lang=()=>window.ZebazLang?.get?.()||localStorage.getItem('zebaz_lang')||document.documentElement.lang||'ku';
const tr=(ku,ar,en)=>lang()==='ar'?ar:lang()==='en'?en:ku;
const esc=v=>{const d=document.createElement('div');d.textContent=v==null?'':String(v);return d.innerHTML};
const answerOf=j=>j?.answer||j?.reply||j?.response||'';

function toast(text){const t=$('#cToast');if(!t)return;t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1900)}
function carLabel(x){return `${x?.make||''} ${x?.model||''}${x?.year?' '+x.year:''}`.trim()}
function carMeta(x){if(!x)return'';return [x.year,x.price,x.mileage,x.city,x.color].filter(Boolean).join(' • ')}

/* Force every generated brand mark to the new real-logo build and remove all text fallbacks. */
function installLogoGuard(){
  const rail=$('#brandRail');if(!rail)return;
  const fix=()=>{
    $$('.c-brand-v4',rail).forEach(card=>{
      card.querySelector('.c-brand-fallback')?.remove();
      const img=card.querySelector('.c-brand-logo');if(!img)return;
      const clean=img.getAttribute('src')?.split('?')[0]||'';
      if(clean&&img.getAttribute('src')!==clean+'?v=8')img.src=clean+'?v=8';
    });
  };
  new MutationObserver(fix).observe(rail,{childList:true,subtree:true});
  [0,250,900,1800,3600,7200].forEach(ms=>setTimeout(fix,ms));
}

function ensureResultModal(){
  if($('#v5ResultModal'))return;
  const m=document.createElement('div');m.id='v5ResultModal';m.className='v5-result-modal';
  m.innerHTML=`<div class="v5-result-panel"><div class="v5-result-head"><div><div class="c-eyebrow">ZEBAZ AI COMPARE</div><strong data-ku="ڕاپۆرتی بەراوردی زیرەک" data-ar="تقرير المقارنة الذكية" data-en="AI comparison report"></strong></div><button class="c-close" type="button" data-v5-close>×</button></div><div class="v5-result-cars" id="v5ResultCars"></div><div class="v5-result-answer" id="v5ResultAnswer"></div></div>`;
  document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-v5-close]'))m.classList.remove('open')});
  window.ZebazLang?.apply?.(m);
}

function listingByText(text){
  const a=app(),q=String(text||'').trim().toLowerCase();if(!a||!q)return null;
  const cars=a.state?.cars||[];
  return cars.find(x=>carLabel(x).toLowerCase()===q)||cars.find(x=>q.includes(String(x.make||'').toLowerCase())&&q.includes(String(x.model||'').toLowerCase()))||null;
}
function refreshCompareSuggestions(){
  const list=$('#v5CarsList'),a=app();if(!list||!a)return;
  const seen=new Set();list.innerHTML=(a.state?.cars||[]).map(x=>carLabel(x)).filter(v=>v&&!seen.has(v)&&seen.add(v)).map(v=>`<option value="${esc(v)}"></option>`).join('');
}
function prefillSelected(){
  const a=app();if(!a)return;const ids=[...(a.state?.compare||[])];
  const cars=ids.map(id=>(a.state?.cars||[]).find(x=>String(x.id)===String(id))).filter(Boolean).slice(0,2);
  if(cars[0]){$('#v5CompareA').value=carLabel(cars[0]);$('#v5PriceA').value=cars[0].price||''}
  if(cars[1]){$('#v5CompareB').value=carLabel(cars[1]);$('#v5PriceB').value=cars[1].price||''}
}

async function runCompareLab(){
  const aText=$('#v5CompareA')?.value.trim(),bText=$('#v5CompareB')?.value.trim();
  if(!aText||!bText)return toast(tr('هەردوو ئۆتۆمبێلەکە بنووسە','اكتب السيارتين','Enter both cars'));
  if(aText.toLowerCase()===bText.toLowerCase())return toast(tr('دوو ئۆتۆمبێلی جیاواز هەڵبژێرە','اختر سيارتين مختلفتين','Choose two different cars'));
  const button=$('#v5CompareGo');button?.classList.add('loading');if(button)button.textContent=tr('AI بەراورد دەکات...','AI يقارن...','AI is comparing...');
  const carA=listingByText(aText),carB=listingByText(bText),priceA=$('#v5PriceA')?.value.trim(),priceB=$('#v5PriceB')?.value.trim();
  ensureResultModal();
  const cards=[{name:aText,listing:carA,price:priceA},{name:bText,listing:carB,price:priceB}];
  $('#v5ResultCars').innerHTML=cards.map((x,i)=>`<div class="v5-result-car"><b>${i===0?'A':'B'} • ${esc(x.name)}</b><span>${esc(x.listing?carMeta(x.listing):(x.price?tr('نرخ: ','السعر: ','Price: ')+x.price:tr('زانیاریی بازاڕ لەلایەن AI پشکنین دەکرێت','سيتم التحقق من بيانات السوق بالذكاء الاصطناعي','AI will verify available market/spec data')))}</span></div>`).join('');
  const out=$('#v5ResultAnswer');out.classList.add('loading');out.textContent=tr('ZEBAZ AI مواسەفات، هێز، نرخ و بەهای بەرامبەر پارە پشکنین دەکات...','ZEBAZ AI يفحص المواصفات والقوة والسعر والقيمة...','ZEBAZ AI is checking specs, strength, price and value...');$('#v5ResultModal').classList.add('open');
  const language=lang()==='ar'?'Arabic':lang()==='en'?'English':'Kurdish Sorani';
  const payload={
    carA:{name:aText,askingPrice:priceA||carA?.price||null,year:carA?.year||null,mileage:carA?.mileage||null,city:carA?.city||null,color:carA?.color||null,description:carA?.description||null},
    carB:{name:bText,askingPrice:priceB||carB?.price||null,year:carB?.year||null,mileage:carB?.mileage||null,city:carB?.city||null,color:carB?.color||null,description:carB?.description||null}
  };
  const prompt=`You are ZEBAZ AI Compare, an expert automotive decision system. Compare CAR A and CAR B below for a buyer in Kurdistan/Iraq. Answer in ${language}. Use web search when useful for current/official specifications and market context. Never invent a trim, engine, horsepower, torque, battery, options, accident history, condition or price. If exact year/trim is unclear, say what needs verification and compare only facts you can support.\n\nUSER/ZEBAZ DATA:\n${JSON.stringify(payload,null,2)}\n\nMake the answer premium, decisive and easy to scan. Cover exactly: Quick verdict; Power & performance (horsepower/torque/acceleration only when verified); Drivetrain & capability; Key specifications & features; Fuel/energy efficiency; Reliability & ownership practicality; Off-road/towing where relevant; Resale in Iraq/Kurdistan; Price and value-for-money using the supplied asking prices when present; Pros of A; Pros of B; What must be checked before purchase; Final winner. At the end give three separate winners: STRONGER, MORE EQUIPPED/SPECS, BEST VALUE. If one cannot be determined, write NEEDS VERIFICATION instead of guessing.`;
  try{
    const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:prompt,history:[],language:lang()})});const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'AI compare failed');
    out.textContent=answerOf(j)||tr('وەڵام نەگەڕایەوە.','لم تصل إجابة.','No answer returned.');
  }catch(e){out.textContent=tr('بەراوردی AI ئێستا سەرکەوتوو نەبوو. دووبارە هەوڵ بدە.','تعذرت مقارنة AI الآن. حاول مرة أخرى.','AI comparison failed right now. Please retry.')}finally{out.classList.remove('loading');button?.classList.remove('loading');if(button)button.textContent=tr('✦ بەراورد بە ZEBAZ AI','✦ قارن بواسطة ZEBAZ AI','✦ Compare with ZEBAZ AI')}
}

function installCompareLab(){
  const tools=$('.c-tools');if(!tools||$('#v5CompareLab'))return;
  const lab=document.createElement('div');lab.id='v5CompareLab';lab.className='v5-compare-lab';lab.innerHTML=`
    <div class="v5-compare-head"><div class="v5-compare-title"><div class="v5-ai-orb">AI</div><div><strong data-ku="ZEBAZ AI Compare Lab" data-ar="مختبر مقارنة ZEBAZ AI" data-en="ZEBAZ AI Compare Lab"></strong><small data-ku="دوو ئۆتۆمبێل بەراورد بکە؛ AI هێز، مواسەفات، نرخ، بەهای بەرامبەر پارە و بڕیاری کۆتایی دەدات." data-ar="قارن سيارتين؛ يحلل AI القوة والمواصفات والسعر والقيمة ويعطي قراراً نهائياً." data-en="Compare two cars; AI analyzes strength, specs, price, value and gives a final verdict."></small></div></div><span class="v5-compare-badge">POWER • SPECS • VALUE</span></div>
    <datalist id="v5CarsList"></datalist>
    <div class="v5-compare-grid"><label class="v5-car-field"><span><b>CAR A</b><i data-ku="یەکەم ئۆتۆمبێل" data-ar="السيارة الأولى" data-en="First car"></i></span><input id="v5CompareA" list="v5CarsList" data-ku-placeholder="نمونە: Ford Raptor R 2025" data-ar-placeholder="مثال: Ford Raptor R 2025" data-en-placeholder="Example: Ford Raptor R 2025"><div class="v5-price-row"><input id="v5PriceA" inputmode="decimal" data-ku-placeholder="نرخ (ئارەزوومەندانە)" data-ar-placeholder="السعر (اختياري)" data-en-placeholder="Price (optional)"><input id="v5NoteA" data-ku-placeholder="Trim / تێبینی" data-ar-placeholder="الفئة / ملاحظة" data-en-placeholder="Trim / note"></div></label><div class="v5-vs">VS</div><label class="v5-car-field"><span><b>CAR B</b><i data-ku="دووەم ئۆتۆمبێل" data-ar="السيارة الثانية" data-en="Second car"></i></span><input id="v5CompareB" list="v5CarsList" data-ku-placeholder="نمونە: BYD Leopard 5 2025" data-ar-placeholder="مثال: BYD Leopard 5 2025" data-en-placeholder="Example: BYD Leopard 5 2025"><div class="v5-price-row"><input id="v5PriceB" inputmode="decimal" data-ku-placeholder="نرخ (ئارەزوومەندانە)" data-ar-placeholder="السعر (اختياري)" data-en-placeholder="Price (optional)"><input id="v5NoteB" data-ku-placeholder="Trim / تێبینی" data-ar-placeholder="الفئة / ملاحظة" data-en-placeholder="Trim / note"></div></label></div>
    <div class="v5-compare-actions"><span class="v5-compare-note" data-ku="دەتوانیت ئۆتۆمبێلی ناو بازاڕەکە هەڵبژێریت یان ناوی هەر دوو ئۆتۆمبێلێکی جیهان بنووسیت." data-ar="يمكنك اختيار سيارات من السوق أو كتابة اسم أي سيارتين." data-en="Choose marketplace listings or type any two cars in the world."></span><button class="c-btn v5-compare-go" id="v5CompareGo" type="button" data-ku="✦ بەراورد بە ZEBAZ AI" data-ar="✦ قارن بواسطة ZEBAZ AI" data-en="✦ Compare with ZEBAZ AI"></button></div>`;
  tools.before(lab);window.ZebazLang?.apply?.(lab);refreshCompareSuggestions();$('#v5CompareGo').addEventListener('click',runCompareLab);
  const old=$('#compareTool');if(old){old.id='compareToolV5';old.addEventListener('click',e=>{e.preventDefault();prefillSelected();refreshCompareSuggestions();lab.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>$('#v5CompareA')?.focus(),450)})}
}

async function generateAd(){
  const b=$('#v5AdGenerate'),desc=$('#description');if(!b||!desc)return;
  const info={make:$('#make')?.value||'',model:$('#model')?.value||'',year:$('#year')?.value||'',price:$('#price')?.value||'',mileage:$('#mileage')?.value||'',city:$('#city')?.value||'',color:$('#color')?.value||'',vin:$('#vin')?.value||'',highlights:$('#v5AdHighlights')?.value||''};
  if(!info.make||!info.model)return toast(tr('سەرەتا مارکە و مۆدێل هەڵبژێرە','اختر الماركة والموديل أولاً','Choose make and model first'));
  b.classList.add('loading');b.textContent=tr('AI دەنووسێت...','AI يكتب...','AI writing...');
  const language=lang()==='ar'?'Arabic':lang()==='en'?'English':'Kurdish Sorani';
  const prompt=`Write a premium, trustworthy car-sale advertisement in ${language} for ZEBAZ Cars using ONLY the facts below. Do not invent trim, options, condition, ownership history, accident history, engine specs or warranty. If a field is blank, omit it. Keep it polished and easy to read, around 70-120 words, with a strong opening and a concise final call to contact the seller. Return only the advertisement text, no headings about your process.\n${JSON.stringify(info,null,2)}`;
  try{const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:prompt,history:[],language:lang()})});const j=await r.json();if(!r.ok||!j.ok)throw new Error();const text=answerOf(j);if(!text)throw new Error();desc.value=text;desc.dispatchEvent(new Event('input',{bubbles:true}));toast(tr('دەقی ئاگهی بە AI ئامادە کرا ✅','تم تجهيز نص الإعلان بالذكاء الاصطناعي ✅','AI ad copy is ready ✅'))}catch{toast(tr('AI ئێستا نەتوانی دەق دروست بکات','تعذر على AI كتابة الإعلان الآن','AI could not write the ad right now'))}finally{b.classList.remove('loading');b.textContent=tr('✦ AI ئاگهی بنووسێت','✦ اكتب الإعلان بالـ AI','✦ Write ad with AI')}
}
function installAdWriter(){
  const desc=$('#description'),field=desc?.closest('.c-field');if(!field||$('#v5AdWriter'))return;
  const box=document.createElement('div');box.id='v5AdWriter';box.className='v5-ad-writer';box.innerHTML=`<div class="v5-ad-head"><strong data-ku="ZEBAZ AI Ad Writer" data-ar="كاتب إعلانات ZEBAZ AI" data-en="ZEBAZ AI Ad Writer"></strong><span>SMART LISTING</span></div><div class="v5-ad-row"><input id="v5AdHighlights" data-ku-placeholder="خاڵە تایبەتەکان: full option، یەک دەست، نوێکراوە... تەنها ئەوەی ڕاستە بنووسە" data-ar-placeholder="نقاط مميزة: فل أوبشن، مالك واحد... اكتب الحقائق فقط" data-en-placeholder="Highlights: options, ownership, upgrades... facts only"><button class="c-btn v5-ad-generate" id="v5AdGenerate" type="button" data-ku="✦ AI ئاگهی بنووسێت" data-ar="✦ اكتب الإعلان بالـ AI" data-en="✦ Write ad with AI"></button></div><small class="v5-ad-note" data-ku="AI زانیارییەکانی فۆرمەکە بەکاردێنێت و هیچ مواسەفاتێک لەخۆوە زیاد ناکات." data-ar="يستخدم AI بيانات النموذج فقط ولا يخترع مواصفات." data-en="AI uses the form data and does not invent vehicle facts."></small>`;
  field.before(box);window.ZebazLang?.apply?.(box);$('#v5AdGenerate').addEventListener('click',generateAd);
}

function init(){installLogoGuard();installCompareLab();installAdWriter();ensureResultModal();let n=0;const timer=setInterval(()=>{n++;refreshCompareSuggestions();installCompareLab();installAdWriter();if(n>30)clearInterval(timer)},500);window.addEventListener('zebaz:lang',()=>window.ZebazLang?.apply?.(document))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
