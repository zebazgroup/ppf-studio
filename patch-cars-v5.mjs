import { readFile, writeFile } from 'fs/promises';

{
  const file='public/cars.html';
  let src=await readFile(file,'utf8');
  if(!src.includes('/cars-v5.css?v=1'))src=src.replace('</head>','<link rel="stylesheet" href="/cars-v5.css?v=1"></head>');
  if(!src.includes('/cars-v5.js?v=1'))src=src.replace('</body>','<script src="/cars-v5.js?v=1"></script></body>');
  await writeFile(file,src);
}

{
  const file='public/sw.js';
  let src=await readFile(file,'utf8');
  src=src.replace(/const CACHE='zebaz-app-v\d+';/,"const CACHE='zebaz-app-v9';");
  await writeFile(file,src);
}

console.log('ZEBAZ Cars V5 real-logo, AI Compare Lab and AI Ad Writer loaded');
