import { readFile, writeFile } from 'fs/promises';

const file='public/admin.html';
let src=await readFile(file,'utf8');
let changed=false;
if(!src.includes('/admin-v2.css?v=2')){
  src=src.replace('</head>','<link rel="stylesheet" href="/admin-v2.css?v=2"></head>');
  changed=true;
}
if(!src.includes('/admin-v2.js?v=2')){
  src=src.replace('</body>','<script src="/admin-v2.js?v=2" defer></script></body>');
  changed=true;
}
if(changed)await writeFile(file,src);
console.log(changed?'ZEBAZ Admin V2 assets loaded':'ZEBAZ Admin V2 already loaded');
