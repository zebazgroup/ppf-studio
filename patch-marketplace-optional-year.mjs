import { readFile, writeFile } from 'fs/promises';
const file='server.js';
let src=await readFile(file,'utf8');
const old="if(!r.sellerName||r.phone.length<7||!r.make||!r.model||!r.year||!r.price||!r.city||!images.length||(r.vin&&r.vin.length!==17))";
const next="if(!r.sellerName||r.phone.length<7||!r.make||!r.model||!r.price||!r.city||!images.length||(r.vin&&r.vin.length!==17))";
if(src.includes(old))src=src.replace(old,next);
else if(!src.includes(next))throw new Error('Marketplace validation anchor not found');
await writeFile(file,src);
console.log('ZEBAZ marketplace optional year patch applied');
