import { readFile, writeFile, mkdir } from 'fs/promises';
import sharp from 'sharp';
import * as SimpleIcons from 'simple-icons';

const catalogSource = await readFile('public/car-catalog.js', 'utf8');
const catalogBlock = catalogSource.match(/const CATALOG=\{([\s\S]*?)\n\s*\};\n\n\s*const BRAND_NAMES/);
if (!catalogBlock) throw new Error('Could not parse car catalog makes');
const makes = [...catalogBlock[1].matchAll(/^\s*'([^']+)'\s*:\s*\[/gm)].map(m => m[1]);
if (!makes.length) throw new Error('No car makes found in catalog');

await mkdir('public/brands', { recursive: true });

const DATASET_COMMIT='3f0929e70e0a9a2a502063edc4b3e5c0146cba74';
const DATASET_BASE=`https://raw.githubusercontent.com/vehiclespecs/brand-logos/${DATASET_COMMIT}`;
const normalize=value=>String(value||'').toLowerCase().normalize('NFKD').replace(/[&+]/g,'and').replace(/[^a-z0-9]+/g,'');
const fileSlug=value=>String(value||'').toLowerCase().normalize('NFKD').replace(/[&+]/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'brand';

const icons=Object.values(SimpleIcons).filter(icon=>icon&&typeof icon==='object'&&icon.title&&icon.path&&typeof icon.path==='string');
const byTitle=new Map(icons.map(icon=>[normalize(icon.title),icon]));
const simpleAliases={
  'Alfa Romeo':['Alfa Romeo'],'Aston Martin':['Aston Martin'],'BAIC':['BAIC Motor','BAIC'],'Changan':['Changan Automobile','Changan'],
  'Citroen':['Citroën','Citroen'],'Dongfeng':['Dongfeng Motor','Dongfeng'],'Fangchengbao':['Fangchengbao'],'GAC':['GAC Motor','GAC'],
  'Great Wall':['Great Wall Motor','Great Wall'],'KGM':['KG Mobility','KGM'],'Land Rover':['Land Rover'],'Li Auto':['Li Auto'],
  'Mercedes-Benz':['Mercedes-Benz','Mercedes Benz','Mercedes'],'Ram':['RAM','Ram'],'Rolls-Royce':['Rolls-Royce','Rolls Royce'],
  'Tank':['Tank'],'XPeng':['XPeng','Xpeng'],'Exeed':['Exeed']
};
const datasetAliases={
  'Changan':'changan','Dongfeng':'dongfeng','Ram':'ram','XPeng':'xpeng','Citroen':'citroen','Mercedes-Benz':'mercedes-benz',
  'Rolls-Royce':'rolls-royce','Land Rover':'land-rover','Great Wall':'great-wall','Alfa Romeo':'alfa-romeo','Aston Martin':'aston-martin'
};
const directAssets={
  'Exeed':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Exeed_logo.png'
};
const officialDomains={
  'Exeed':'exeedinternational.com','Fangchengbao':'fangchengbao.com','GAC':'gacmotor.com','Li Auto':'lixiang.com','Tank':'tankglobal.com'
};

function findSimpleIcon(make){
  for(const candidate of [make,...(simpleAliases[make]||[])]){
    const icon=byTitle.get(normalize(candidate));
    if(icon)return icon;
  }
  return null;
}
function iconSvg(icon){
  const color=String(icon.hex||'111111').replace('#','');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#${color}" d="${icon.path}"/></svg>`);
}
function genericVehicleSvg(){
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 256"><g fill="none" stroke="#b9954f" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><path d="M58 157h204l-17-51c-5-15-18-25-34-25H109c-16 0-29 10-34 25l-17 51Z"/><path d="M77 157v30m166-30v30M94 187h132"/><circle cx="94" cy="184" r="17" fill="#111" stroke="#b9954f"/><circle cx="226" cy="184" r="17" fill="#111" stroke="#b9954f"/></g></svg>`);
}
async function fetchBuffer(url,timeout=7000){
  try{
    const r=await fetch(url,{signal:AbortSignal.timeout(timeout),headers:{'user-agent':'ZEBAZ-Cars-logo-builder/1.0'}});
    if(!r.ok)return null;
    const ab=await r.arrayBuffer();
    return ab.byteLength?Buffer.from(ab):null;
  }catch{return null}
}
async function datasetLogo(make){
  const slug=datasetAliases[make]||fileSlug(make);
  for(const ext of ['svg','png']){
    const url=`${DATASET_BASE}/${slug}-logo.${ext}`;
    const buf=await fetchBuffer(url);
    if(buf)return{buffer:buf,source:`vehiclespecs-${ext}`,url};
  }
  return null;
}
async function directLogo(make){
  const url=directAssets[make];if(!url)return null;
  const buffer=await fetchBuffer(url);
  return buffer?{buffer,source:'official-published-logo',url}:null;
}
async function domainLogo(make){
  const domain=officialDomains[make];
  if(!domain)return null;
  const url=`https://www.google.com/s2/favicons?domain_url=https://${domain}&sz=256`;
  const buffer=await fetchBuffer(url);
  return buffer?{buffer,source:'official-domain-icon',url}:null;
}
async function pngFrom(buffer){
  return sharp(buffer,{failOn:'none',density:320})
    .resize(320,256,{fit:'contain',background:{r:0,g:0,b:0,alpha:0},withoutEnlargement:false})
    .png({compressionLevel:9,adaptiveFiltering:true})
    .toBuffer();
}

const manifest={};
let actualCount=0,genericCount=0;
async function buildMake(make){
  const filename=`${fileSlug(make)}.png`;
  let picked=null;
  if(make!=='Other')picked=await datasetLogo(make);
  if(!picked&&make!=='Other')picked=await directLogo(make);
  if(!picked&&make!=='Other'){
    const icon=findSimpleIcon(make);
    if(icon)picked={buffer:iconSvg(icon),source:'simple-icons',title:icon.title};
  }
  if(!picked&&make!=='Other')picked=await domainLogo(make);
  if(!picked){picked={buffer:genericVehicleSvg(),source:'generic-vehicle'};genericCount++}else actualCount++;
  const out=await pngFrom(picked.buffer);
  await writeFile(`public/brands/${filename}`,out);
  manifest[make]={file:`/brands/${filename}`,source:picked.source,title:picked.title||make,sourceUrl:picked.url||null};
}

let cursor=0;
const workers=Array.from({length:8},async()=>{
  while(true){
    const i=cursor++;
    if(i>=makes.length)return;
    await buildMake(makes[i]);
  }
});
await Promise.all(workers);

await writeFile('public/brands/manifest.json',JSON.stringify({generatedAt:new Date().toISOString(),total:makes.length,actualCount,genericCount,datasetCommit:DATASET_COMMIT,brands:manifest},null,2));
if(actualCount<Math.min(83,makes.length-1))throw new Error(`Too few real brand logos generated: ${actualCount}/${makes.length}`);
console.log(`ZEBAZ real brand PNGs generated: ${makes.length} total, ${actualCount} real logos, ${genericCount} generic fallback`);
