import { readFile, writeFile } from 'fs/promises';

const file='public/admin.html';
let html=await readFile(file,'utf8');
if(html.includes('zebaz-ai-admin-v2')){
  console.log('AI admin patch already present');
  process.exit(0);
}

const css=`<style id="zebaz-ai-admin-v2">
.ai-tab-badge{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;margin-inline-start:6px;border-radius:999px;background:#55d994;color:#06130c;font-size:10px;font-weight:1000}.ai-admin-head{display:flex;justify-content:space-between;gap:14px;align-items:center;flex-wrap:wrap}.ai-admin-live{display:inline-flex;align-items:center;gap:7px;color:#7ee2a8;font-size:12px}.ai-admin-live:before{content:'';width:8px;height:8px;border-radius:50%;background:#55d994;box-shadow:0 0 0 5px #55d99418}.ai-source{color:#55d994;border-color:#285d42;background:#55d99410}.ai-division{display:inline-flex;padding:5px 9px;border-radius:999px;border:1px solid #343434;background:#111;color:#ddd;font-size:11px}.ai-pending{display:inline-flex;padding:5px 9px;border-radius:999px;border:1px solid #6a5421;background:#d7b66d12;color:#e7ca88;font-size:11px}.ai-refresh-note{font-size:11px;color:#777;margin-top:8px}@media(max-width:700px){#aiView .card{padding:14px}#aiView .toolbar{width:100%}#aiView .toolbar input{width:100%;min-width:0}}
</style>`;

const script=`<script id="zebaz-ai-admin-script-v2">
(()=>{
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=v=>{const d=document.createElement('div');d.textContent=v==null?'':String(v);return d.innerHTML};
  let aiItems=[];
  function isAi(b){return String(b?.serviceCode||'').startsWith('ai_')||String(b?.service||'').startsWith('AI •')}
  function divisionLabel(b){const t=String(b?.requestType||'general');return({ppf:'PPF / Care',studio:'Studio / Media',carwash:'Car Wash',fb_oil:'FB Oil',game_center:'Game Center',general:'General'})[t]||t}
  function cleanService(b){const s=String(b?.service||'');const p=s.split('•').map(x=>x.trim());return p.length>=3?p.slice(2).join(' • '):s}
  function render(){
    const body=q('#aiRows');if(!body)return;
    const search=(q('#aiSearch')?.value||'').trim().toLowerCase();
    const list=aiItems.filter(b=>!search||[b.name,b.phone,b.car,b.year,b.service,b.serviceCode,b.notes,b.language,b.requestType,b.date].some(v=>String(v||'').toLowerCase().includes(search)));
    body.innerHTML=list.map(b=>'<tr><td>'+esc(b.date||new Date(b.receivedAt).toLocaleString())+'</td><td><b>'+esc(b.name)+'</b></td><td>'+esc(b.phone)+'</td><td><span class="ai-division">'+esc(divisionLabel(b))+'</span></td><td>'+esc(b.car||'—')+'</td><td>'+esc(b.year||'—')+'</td><td><span class="badge ai-source">AI • '+esc(cleanService(b))+'</span></td><td>'+esc(b.notes||'—')+'</td><td>'+esc(b.language||'—')+'</td><td><span class="ai-pending">چاوەڕێی پشتڕاستکردنەوە</span></td></tr>').join('')||'<tr><td colspan="10" class="empty">هیچ داواکارییەکی AI نییە.</td></tr>';
    const badge=q('#aiTabCount');if(badge)badge.textContent=String(aiItems.length);
    const count=q('#aiRequestCount');if(count)count.textContent=String(aiItems.length);
  }
  async function loadAI(){
    try{
      const r=await fetch('/admin/api/bookings',{cache:'no-store'});
      if(!r.ok)return;
      const j=await r.json();
      aiItems=(j.bookings||[]).filter(isAi);
      render();
      const stamp=q('#aiLastRefresh');if(stamp)stamp.textContent=new Date().toLocaleTimeString();
    }catch{}
  }
  function activate(viewId,button){
    qa('.tab').forEach(x=>x.classList.remove('active'));qa('.view').forEach(x=>x.classList.remove('active'));
    button?.classList.add('active');q('#'+viewId)?.classList.add('active');
  }
  function install(){
    const tabs=q('.tabs');if(!tabs||q('#aiAdminTab'))return;
    const btn=document.createElement('button');btn.id='aiAdminTab';btn.className='tab';btn.innerHTML='داواکارییەکانی AI <span id="aiTabCount" class="ai-tab-badge">0</span>';
    const contentBtn=q('[data-view="contentView"]',tabs);tabs.insertBefore(btn,contentBtn||null);
    const sec=document.createElement('section');sec.id='aiView';sec.className='view';sec.innerHTML='<div class="card"><div class="ai-admin-head"><div><h2>AI → Admin Requests</h2><div class="ai-admin-live">ڕاستەوخۆ لە ZEBAZ AI بۆ ئەدمین</div></div><div class="toolbar"><input id="aiSearch" placeholder="گەڕان بە ناو، مۆبایل، خزمەتگوزاری، ئۆتۆمبێل یان بەش..."><button id="aiRefreshBtn" class="secondary">نوێکردنەوە</button></div></div><div class="stats" style="margin-top:14px"><div class="stat-card"><div class="muted">هەموو داواکارییەکانی AI</div><div id="aiRequestCount" class="stat">0</div></div><div class="stat-card"><div class="muted">دۆخ</div><div class="stat" style="font-size:18px;color:#e7ca88">PENDING</div></div></div><div class="table"><table><thead><tr><th>کات</th><th>ناو</th><th>مۆبایل</th><th>بەش</th><th>ئۆتۆمبێل</th><th>ساڵ</th><th>خزمەتگوزاری</th><th>شوێن / تێبینی</th><th>زمان</th><th>دۆخ</th></tr></thead><tbody id="aiRows"><tr><td colspan="10" class="empty">Loading...</td></tr></tbody></table></div><div class="ai-refresh-note">نوێترین نوێکردنەوە: <span id="aiLastRefresh">—</span></div></div>';
    const content=q('#contentView');content?.parentNode?.insertBefore(sec,content);
    btn.addEventListener('click',()=>{activate('aiView',btn);loadAI()});
    q('#aiRefreshBtn')?.addEventListener('click',loadAI);q('#aiSearch')?.addEventListener('input',render);
    loadAI();setInterval(()=>{const d=q('#dashboard');if(d&&d.style.display!=='none')loadAI()},20000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
</script>`;

html=html.replace('</head>',css+'</head>').replace('</body>',script+'</body>');
await writeFile(file,html);
console.log('AI admin all-service view patch applied');
