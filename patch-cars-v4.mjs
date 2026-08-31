import { readFile, writeFile } from 'fs/promises';

// --- cars.html assets + copy ---
{
  const file='public/cars.html';
  let src=await readFile(file,'utf8');
  if(!src.includes('/cars-v4.css?v=4'))src=src.replace('</head>','<link rel="stylesheet" href="/cars-v4.css?v=4"></head>');
  if(!src.includes('/cars-v4.js?v=4'))src=src.replace('</body>','<script src="/cars-v4.js?v=4"></script></body>');
  src=src.replace(/وێنەکانی ئۆتۆمبێل — تا 5/g,'وێنەکانی ئۆتۆمبێل — تا 12')
    .replace(/صور السيارة — حتى 5/g,'صور السيارة — حتى 12')
    .replace(/Car photos — up to 5/g,'Car photos — up to 12');
  await writeFile(file,src);
}

// --- expose Cars app internals safely and upgrade photo preparation ---
{
  const file='public/cars-v2.js';
  let src=await readFile(file,'utf8');
  src=src.replace(/\.slice\(0,5-state\.photos\.length\)/g,'.slice(0,12-state.photos.length)');
  src=src.replace(/\.filter\(Boolean\)\.slice\(0,5\)/g,'.filter(Boolean).slice(0,12)');
  src=src.replace(
    /function canvasData\(c,q=\.82\)\{[\s\S]*?\}\nasync function fileData/,
    `function canvasData(c,q=.84,type='image/webp'){return new Promise(r=>c.toBlob(b=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(b)},type,q))}\nasync function fileData`
  );
  src=src.replace(
    /async function smartPhoto\(file\)\{[\s\S]*?\}\nfunction renderPhotos/,
    `async function smartPhoto(file){const img=await bitmap(file),w=img.width||img.naturalWidth,h=img.height||img.naturalHeight,max=1600,scale=Math.min(1,max/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*scale));c.height=Math.max(1,Math.round(h*scale));const x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.filter='contrast(1.015) saturate(1.015) brightness(1.005)';x.drawImage(img,0,0,c.width,c.height);img.close?.();return canvasData(c,.84,'image/webp')}\nfunction renderPhotos`
  );
  if(!src.includes('window.ZebazCarsApp=')){
    const end=src.lastIndexOf('})();');
    if(end<0)throw new Error('cars-v2.js end anchor not found');
    const expose=`window.ZebazCarsApp={state,render,renderPhotos,showDetail,openAI,sendAI,modal,tr,esc,money,loadCars};\n`;
    src=src.slice(0,end)+expose+src.slice(end);
  }
  await writeFile(file,src);
}

// --- server-side 12-photo support, optimized storage, AI Studio ---
{
  const file='server.js';
  let src=await readFile(file,'utf8');
  if(!src.includes("import sharp from 'sharp';")){
    const anchor="import pg from 'pg';";
    if(!src.includes(anchor))throw new Error('server import anchor not found');
    src=src.replace(anchor,anchor+"\nimport sharp from 'sharp';");
  }
  src=src.replace(/\.slice\(0,5\)\{?/g,m=>m); // intentional no-op guard for unrelated code
  src=src.replace("(Array.isArray(images)?images:[]).slice(0,5)","(Array.isArray(images)?images:[]).slice(0,12)");
  src=src.replace(/Math\.min\(5,x\.imageCount\|\|0\)/g,'Math.min(12,x.imageCount||0)');
  src=src.replace(/Math\.min\(5,Number\(req\.params\.position\)\|\|1\)/g,'Math.min(12,Number(req.params.position)||1)');

  if(!src.includes('ZEBAZ_MARKET_IMAGE_OPT_V4')){
    const parseRe=/function parseMarketImages\(images\)\{[^\n]+\}/;
    const m=src.match(parseRe);if(!m)throw new Error('parseMarketImages anchor not found');
    const extra=`\n// ZEBAZ_MARKET_IMAGE_OPT_V4\nasync function normalizeMarketImage(item){try{const out=await sharp(item.image,{failOn:'none'}).rotate().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:84,effort:4}).toBuffer();return{image:out,mime:'image/webp'}}catch{return item}}`;
    src=src.replace(m[0],m[0]+extra);
    const oldLoop=`for(let i=0;i<images.length;i++)await pool.query("INSERT INTO car_listing_images(id,listing_id,position,image,mime_type) VALUES($1,$2,$3,$4,$5)",[crypto.randomUUID(),r.id,i+1,images[i].image,images[i].mime]);`;
    const newLoop=`for(let i=0;i<images.length;i++){const optimized=await normalizeMarketImage(images[i]);await pool.query("INSERT INTO car_listing_images(id,listing_id,position,image,mime_type) VALUES($1,$2,$3,$4,$5)",[crypto.randomUUID(),r.id,i+1,optimized.image,optimized.mime])}`;
    if(!src.includes(oldLoop))throw new Error('market image insert loop anchor not found');
    src=src.replace(oldLoop,newLoop);
  }

  if(!src.includes('ZEBAZ_AI_STUDIO_V1')){
    const anchor="app.get('/admin/api/cars',auth,async(req,res)=>{";
    if(!src.includes(anchor))throw new Error('admin cars anchor not found');
    const api=`// ZEBAZ_AI_STUDIO_V1\nconst studioRate=new Map();\nfunction studioAllowed(req){const ip=req.ip||req.socket.remoteAddress||'unknown',now=Date.now(),w=60*60*1000,item=studioRate.get(ip);if(!item||now-item.start>w){studioRate.set(ip,{start:now,count:1});return true}if(item.count>=12)return false;item.count++;return true}\napp.post('/api/cars/ai-studio',async(req,res)=>{\n  if(!studioAllowed(req))return res.status(429).json({ok:false,error:'AI Studio rate limit reached. Please try again later.'});\n  if(!process.env.OPENAI_API_KEY)return res.status(503).json({ok:false,error:'AI Studio is not configured right now. Normal photo upload still works.'});\n  const raw=String(req.body?.image||''),m=raw.match(/^data:(image\\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);\n  if(!m)return res.status(400).json({ok:false,error:'Please choose a valid JPEG, PNG or WebP car photo.'});\n  const input=Buffer.from(m[2],'base64');if(!input.length||input.length>5*1024*1024)return res.status(400).json({ok:false,error:'Photo is too large. Please use a photo under 5 MB.'});\n  try{\n    const meta=await sharp(input,{failOn:'none'}).metadata(),w=meta.width||0,h=meta.height||0;if(Math.max(w,h)<1000||Math.min(w,h)<600)return res.status(400).json({ok:false,code:'LOW_QUALITY',error:'This photo is too small for a high-quality AI Studio result. Use a sharper, larger photo.'});\n    const prepared=await sharp(input,{failOn:'none'}).rotate().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).jpeg({quality:92,mozjpeg:true}).toBuffer();\n    const form=new FormData();form.append('model','gpt-image-2');form.append('image[]',new Blob([prepared],{type:'image/jpeg'}),'car.jpg');form.append('size','1536x1024');form.append('quality','medium');form.append('output_format','webp');form.append('output_compression','82');form.append('prompt',
      'Edit this exact real vehicle photo into a premium neutral automotive photography studio. Preserve the vehicle identity with very high fidelity: same make/model/body shape, paint color, trim, wheels, tires, lights, glass, badges, visible accessories, visible damage/condition, proportions, camera perspective and all real vehicle details. Do not redesign the car, do not add or remove vehicle parts, do not change wheels, color or trim, and do not invent hidden sides. Change only the surrounding environment/background and lighting. Use a clean dark-neutral luxury studio, realistic floor contact shadow and natural reflections, no people, no text, no logos added to the scene. The result must look like the same photographed car placed in a professional studio.');\n    const ai=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY},body:form,signal:AbortSignal.timeout(90000)});const data=await ai.json().catch(()=>({}));\n    if(!ai.ok){const code=String(data?.error?.code||'');const friendly=(ai.status===403||/verification|access/i.test(code))?'AI Studio image access needs to be enabled for this OpenAI project. Normal photo upload still works.':'AI Studio could not process this photo right now. Normal photo upload still works.';return res.status(502).json({ok:false,code:code||'AI_STUDIO_UNAVAILABLE',error:friendly})}\n    const b64=data?.data?.[0]?.b64_json;if(!b64)return res.status(502).json({ok:false,error:'AI Studio returned no image. Please try again.'});const generated=Buffer.from(b64,'base64');const finalImage=await sharp(generated,{failOn:'none'}).resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:84,effort:4}).toBuffer();res.json({ok:true,mime:'image/webp',image:'data:image/webp;base64,'+finalImage.toString('base64')});\n  }catch(e){console.error('AI Studio failed:',e?.message||e);res.status(500).json({ok:false,error:'AI Studio could not process this photo. Your original photo is unchanged and can still be used.'})}\n});\n\n`;
    src=src.replace(anchor,api+anchor);
  }
  await writeFile(file,src);
}

console.log('ZEBAZ Cars V4 patches applied');
