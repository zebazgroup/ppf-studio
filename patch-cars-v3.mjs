import { readFile, writeFile } from 'fs/promises';

let html=await readFile('public/cars.html','utf8');
if(!html.includes('/cars-v3.css')){
  html=html.replace('</head>','  <link rel="stylesheet" href="/cars-v3.css?v=3">\n</head>');
}
if(!html.includes('/cars-v3.js')){
  html=html.replace('</body>','<script src="/cars-v3.js?v=3"></script>\n</body>');
}
await writeFile('public/cars.html',html);
console.log('ZEBAZ Cars V3 assets loaded');
