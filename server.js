import express from 'express';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';
import { fileURLToPath } from 'url';

const {Pool}=pg;
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const app=express();

app.get('/health',(req,res)=>res.status(200).send('ok'));
app.set('trust proxy',1);
app.use((req,res,next)=>{
  const proto=String(req.headers['x-forwarded-proto']||req.protocol||'').split(',')[0].trim().toLowerCase();
  if(proto&&proto!=='https')return res.redirect(301,`https://${req.get('host')}${req.originalUrl}`);
  res.setHeader('Strict-Transport-Security','max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy','upgrade-insecure-requests');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','SAMEORIGIN');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  next();
});
app.use(express.json({limit:'12mb'}));
app.use(express.static(path.join(__dirname,'public'),{index:false}));

const ADMIN_USER=process.env.ADMIN_USER||'admin';
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||crypto.randomBytes(12).toString('base64url');
const sessions=new Map();
const aiRate=new Map();
const CONTENT_SLOTS=new Set(['home_hero','home_owner','studio_main','fb_oil_main','fb_oil_1','fb_oil_2','fb_oil_3','carwash_main','game_center_main','media_main']);
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL?.includes('railway.internal')?false:{rejectUnauthorized:false}});

async function initDb(){
  await pool.query(`CREATE TABLE IF NOT EXISTS bookings(id UUID PRIMARY KEY,received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),booking_date TEXT,name TEXT NOT NULL,phone TEXT NOT NULL,car TEXT NOT NULL,year TEXT NOT NULL,vin TEXT NOT NULL,service TEXT NOT NULL,notes TEXT,language TEXT)`);
  await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS request_type TEXT DEFAULT 'ppf'`);
  await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_code TEXT`);
  await pool.query(`UPDATE bookings SET request_type='studio' WHERE COALESCE(request_type,'ppf')='ppf' AND (LOWER(service) LIKE '%review%' OR LOWER(service) LIKE '%advert%' OR service LIKE '%ڕیڤیو%' OR service LIKE '%ڕیکلام%' OR service LIKE '%مراجعة%' OR service LIKE '%إعلان%')`);
  await pool.query(`CREATE TABLE IF NOT EXISTS site_content(slot TEXT PRIMARY KEY,title_ku TEXT,title_ar TEXT,title_en TEXT,caption_ku TEXT,caption_ar TEXT,caption_en TEXT,link TEXT,visible BOOLEAN NOT NULL DEFAULT TRUE,image BYTEA,mime_type TEXT,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  console.log('ZEBAZ PostgreSQL database ready');
}
initDb().catch(e=>{console.error(e);process.exit(1)});

function cookie(req,n){const m=(req.headers.cookie||'').match(new RegExp('(?:^|; )'+n+'=([^;]*)'));return m?decodeURIComponent(m[1]):null;}
function auth(req,res,next){const t=cookie(req,'zebaz_admin');return t&&sessions.has(t)?next():res.status(401).json({ok:false,error:'Unauthorized'});}
function clean(v,max=4000){return String(v??'').trim().slice(0,max)}
function requestType(b){if(['ppf','studio'].includes(b?.requestType))return b.requestType;const c=clean(b?.serviceCode||b?.service).toLowerCase();return /(review|advert|ڕیڤیو|ڕیکلام|مراجعة|إعلان)/i.test(c)?'studio':'ppf'}

app.post('/admin/login',(req,res)=>{const {username,password}=req.body||{};if(username!==ADMIN_USER||password!==ADMIN_PASSWORD)return res.status(401).json({ok:false,error:'Wrong username or password'});const t=crypto.randomBytes(32).toString('hex');sessions.set(t,Date.now());res.setHeader('Set-Cookie',`zebaz_admin=${t}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`);res.json({ok:true})});
app.post('/admin/logout',auth,(req,res)=>{sessions.delete(cookie(req,'zebaz_admin'));res.setHeader('Set-Cookie','zebaz_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');res.json({ok:true})});
app.get('/admin/api/bookings',auth,async(req,res)=>{try{const {rows}=await pool.query(`SELECT id,received_at AS "receivedAt",booking_date AS date,name,phone,car,year,vin,service,service_code AS "serviceCode",COALESCE(request_type,'ppf') AS "requestType",notes,language FROM bookings ORDER BY received_at DESC`);res.json({ok:true,bookings:rows,databaseReady:true})}catch(e){console.error(e);res.status(500).json({ok:false,error:'Database error'})}});

app.get('/admin/api/content',auth,async(req,res)=>{try{const {rows}=await pool.query(`SELECT slot,title_ku AS "titleKu",title_ar AS "titleAr",title_en AS "titleEn",caption_ku AS "captionKu",caption_ar AS "captionAr",caption_en AS "captionEn",link,visible,(image IS NOT NULL) AS "hasImage",EXTRACT(EPOCH FROM updated_at)::bigint AS version FROM site_content ORDER BY slot`);res.json({ok:true,items:rows})}catch(e){console.error(e);res.status(500).json({ok:false,error:'Content database error'})}});
app.post('/admin/api/content',auth,async(req,res)=>{try{const b=req.body||{},slot=clean(b.slot,80);if(!CONTENT_SLOTS.has(slot))return res.status(400).json({ok:false,error:'Invalid content slot'});let image=null,mime=null,newImage=false;if(b.imageData){const m=String(b.imageData).match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);if(!m)return res.status(400).json({ok:false,error:'Invalid image'});image=Buffer.from(m[2],'base64');mime=m[1];newImage=true;if(image.length>6*1024*1024)return res.status(400).json({ok:false,error:'Image is too large'})}const vals=[slot,clean(b.titleKu,300),clean(b.titleAr,300),clean(b.titleEn,300),clean(b.captionKu),clean(b.captionAr),clean(b.captionEn),clean(b.link,500),b.visible!==false];if(newImage){await pool.query(`INSERT INTO site_content(slot,title_ku,title_ar,title_en,caption_ku,caption_ar,caption_en,link,visible,image,mime_type,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()) ON CONFLICT(slot) DO UPDATE SET title_ku=EXCLUDED.title_ku,title_ar=EXCLUDED.title_ar,title_en=EXCLUDED.title_en,caption_ku=EXCLUDED.caption_ku,caption_ar=EXCLUDED.caption_ar,caption_en=EXCLUDED.caption_en,link=EXCLUDED.link,visible=EXCLUDED.visible,image=EXCLUDED.image,mime_type=EXCLUDED.mime_type,updated_at=NOW()`,[...vals,image,mime])}else if(b.removeImage){await pool.query(`INSERT INTO site_content(slot,title_ku,title_ar,title_en,caption_ku,caption_ar,caption_en,link,visible,image,mime_type,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,NULL,NULL,NOW()) ON CONFLICT(slot) DO UPDATE SET title_ku=EXCLUDED.title_ku,title_ar=EXCLUDED.title_ar,title_en=EXCLUDED.title_en,caption_ku=EXCLUDED.caption_ku,caption_ar=EXCLUDED.caption_ar,caption_en=EXCLUDED.caption_en,link=EXCLUDED.link,visible=EXCLUDED.visible,image=NULL,mime_type=NULL,updated_at=NOW()`,vals)}else{await pool.query(`INSERT INTO site_content(slot,title_ku,title_ar,title_en,caption_ku,caption_ar,caption_en,link,visible,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) ON CONFLICT(slot) DO UPDATE SET title_ku=EXCLUDED.title_ku,title_ar=EXCLUDED.title_ar,title_en=EXCLUDED.title_en,caption_ku=EXCLUDED.caption_ku,caption_ar=EXCLUDED.caption_ar,caption_en=EXCLUDED.caption_en,link=EXCLUDED.link,visible=EXCLUDED.visible,updated_at=NOW()`,vals)}res.json({ok:true,saved:true})}catch(e){console.error(e);res.status(500).json({ok:false,error:'Could not save content'})}});

app.get('/api/content',async(req,res)=>{try{const {rows}=await pool.query(`SELECT slot,title_ku AS "titleKu",title_ar AS "titleAr",title_en AS "titleEn",caption_ku AS "captionKu",caption_ar AS "captionAr",caption_en AS "captionEn",link,visible,(image IS NOT NULL) AS "hasImage",EXTRACT(EPOCH FROM updated_at)::bigint AS version FROM site_content ORDER BY slot`);res.setHeader('Cache-Control','no-store');res.json({ok:true,items:rows.map(x=>({...x,imageUrl:x.hasImage?`/content-image/${encodeURIComponent(x.slot)}?v=${x.version}`:null}))})}catch{res.json({ok:true,items:[]})}});
app.get('/content-image/:slot',async(req,res)=>{try{const slot=clean(req.params.slot,80);if(!CONTENT_SLOTS.has(slot))return res.status(404).end();const {rows}=await pool.query(`SELECT image,mime_type FROM site_content WHERE slot=$1`,[slot]);if(!rows[0]?.image)return res.status(404).end();res.setHeader('Content-Type',rows[0].mime_type||'image/jpeg');res.setHeader('Cache-Control','public,max-age=86400');res.send(rows[0].image)}catch{res.status(404).end()}});

app.get('/status',async(req,res)=>{try{await pool.query('SELECT 1');res.json({ready:true,database:true,ai:!!process.env.OPENAI_API_KEY})}catch{res.status(503).json({ready:false,database:false,ai:!!process.env.OPENAI_API_KEY})}});
function fromMessage(message=''){const get=k=>{const m=String(message).match(new RegExp('^'+k+':\\s*(.*)$','mi'));return m?m[1].trim():''};return{name:get('Name'),phone:get('Phone'),car:get('Car'),year:get('Year'),vin:get('VIN'),service:get('Service'),date:get('Date & Time'),notes:get('Notes')}}
app.post('/send-booking',async(req,res)=>{try{const parsed=fromMessage(req.body?.message),b=req.body?.booking||parsed,type=requestType(b);const r={id:crypto.randomUUID(),date:clean(b.date,100),name:clean(b.name,160),phone:clean(b.phone,80),car:clean(b.car,200),year:clean(b.year,20),vin:clean(b.vin,30).toUpperCase(),service:clean(b.service,300),serviceCode:clean(b.serviceCode,80),requestType:type,notes:clean(b.notes),language:clean(b.language,10)};if(!r.name||!r.phone||!r.car||!r.year||r.vin.length!==17||!r.service)return res.status(400).json({ok:false,error:'Missing or invalid booking data'});await pool.query(`INSERT INTO bookings(id,booking_date,name,phone,car,year,vin,service,service_code,request_type,notes,language) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,[r.id,r.date,r.name,r.phone,r.car,r.year,r.vin,r.service,r.serviceCode,r.requestType,r.notes,r.language]);res.json({ok:true,saved:true,id:r.id,requestType:r.requestType})}catch(e){console.error('Booking save failed:',e.message);res.status(500).json({ok:false,error:'Could not save booking'})}});

function aiAllowed(req){const ip=req.ip||req.socket.remoteAddress||'unknown',now=Date.now(),windowMs=10*60*1000,max=15,item=aiRate.get(ip);if(!item||now-item.start>windowMs){aiRate.set(ip,{start:now,count:1});return true}if(item.count>=max)return false;item.count++;return true}
function extractResponseText(data){if(typeof data?.output_text==='string'&&data.output_text.trim())return data.output_text.trim();for(const item of data?.output||[]){if(item?.type==='message')for(const c of item.content||[])if(c?.type==='output_text'&&c.text)return String(c.text).trim()}return ''}
const ZEBAZ_AI_INSTRUCTIONS=`You are ZEBAZ AI, the official automotive intelligence assistant of ZEBAZ Group in Erbil, Kurdistan Region of Iraq.
Primary expertise: cars, vehicle specifications, comparisons, engines, EVs, hybrids, 4x4 systems, towing and tug-of-war analysis, maintenance, diagnostics at a general informational level, tires, batteries, paint protection film (PPF), polishing, window tint, automotive advertising, car reviews, detailing, car wash, fuel topics, and ZEBAZ Group services.
ZEBAZ Group facts you may state when relevant:
- Founder and owner: Barzan Sleman.
- ZEBAZ PPF Studio: PPF, polishing, window tint, car advertising and professional car reviews.
- ZEBAZ Car Studio: automotive media, photography, videography, advertising and review services.
- ZEBAZ Car Wash: Erbil 60m, opposite Silo.
- FB Oil: three fuel stations, all owned by Barzan Sleman: (1) Erbil 100m near Ahmadi Khani School, (2) Erbil-Shaqlawa road near Pirmam Tunnel, (3) Erbil-Shaqlawa road at Darbandi Kore.
- ZEBAZ Game Center: Erbil 100m, WOW Tower.
- Main website: zebaz.co. Divisions include /ppf, /studio, /carwash, /fb-oil, /game-center, /media and /ai.
Communication rules:
- Answer in the same language as the user. If the user writes Kurdish Sorani, answer natural Sorani; if Arabic, answer Arabic; if English, answer English.
- Be concise first, but provide technical detail when useful.
- For comparisons, give a clear verdict and explain the key deciding factors.
- For current model-year specifications, prices, regulations, recalls, or rapidly changing facts, use web search when available and distinguish confirmed facts from estimates.
- Never invent specifications. If uncertain, say what needs verification.
- Do not claim ZEBAZ performed a service or has inventory unless that information is explicitly provided.
- For dangerous mechanical procedures, give safe high-level guidance and recommend qualified inspection where needed.
- For fuel chemistry, additives, octane blending, or hazardous materials, do not provide dangerous step-by-step chemical mixing instructions; keep guidance safety-focused and general.
Your tone should feel premium, confident, technically strong, and practical.`;
app.post('/api/ai',async(req,res)=>{if(!process.env.OPENAI_API_KEY)return res.status(503).json({ok:false,error:'AI engine is not configured'});if(!aiAllowed(req))return res.status(429).json({ok:false,error:'Too many requests. Please try again shortly.'});const message=clean(req.body?.message,1800),history=Array.isArray(req.body?.history)?req.body.history.slice(-8):[];if(!message)return res.status(400).json({ok:false,error:'Message is required'});const input=[];for(const h of history){const role=h?.role==='assistant'?'assistant':'user',txt=clean(h?.content,1800);if(txt)input.push({role,content:[{type:role==='assistant'?'output_text':'input_text',text:txt}]})}input.push({role:'user',content:[{type:'input_text',text:message}]});try{const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5.6-terra',instructions:ZEBAZ_AI_INSTRUCTIONS,input,tools:[{type:'web_search'}],tool_choice:'auto',max_output_tokens:1400})});const data=await r.json();if(!r.ok){console.error('OpenAI error:',r.status,data?.error?.type||data?.error?.code||'unknown');return res.status(502).json({ok:false,error:'ZEBAZ AI could not answer right now'})}const answer=extractResponseText(data);if(!answer)return res.status(502).json({ok:false,error:'No AI response received'});res.json({ok:true,answer})}catch(e){console.error('ZEBAZ AI request failed:',e.message);res.status(502).json({ok:false,error:'ZEBAZ AI connection failed'})}});

const page=file=>(req,res)=>res.sendFile(path.join(__dirname,'public',file));
app.get('/',page('home.html'));
app.get(['/studio','/studio/'],page('studio.html'));
app.get(['/ppf','/ppf/'],page('index.html'));
app.get(['/fb-oil','/fb-oil/','/oil','/oil/'],page('fb-oil.html'));
app.get(['/carwash','/carwash/'],page('carwash.html'));
app.get(['/game-center','/game-center/','/game','/game/'],page('game-center.html'));
app.get(['/media','/media/'],page('media.html'));
app.get(['/ai','/ai/'],page('ai.html'));
app.get('/admin',page('admin.html'));
app.use((req,res)=>res.status(404).sendFile(path.join(__dirname,'public','home.html')));
const port=process.env.PORT||3000;app.listen(port,'0.0.0.0',()=>console.log(`ZEBAZ Group running on port ${port}`));