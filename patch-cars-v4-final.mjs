import { readFile, writeFile } from 'fs/promises';
const file='public/cars.html';
let src=await readFile(file,'utf8');
if(!src.includes('/cars-v4-fix.css?v=1')) src=src.replace('</head>','<link rel="stylesheet" href="/cars-v4-fix.css?v=1"></head>');
await writeFile(file,src);
console.log('ZEBAZ Cars V4 final visual fixes loaded');
