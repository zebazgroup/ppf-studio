import { readFile, writeFile } from 'fs/promises';

// Load the final visual override after all older Cars styles.
{
  const file='public/cars.html';
  let src=await readFile(file,'utf8');
  if(!src.includes('/cars-v4-fix.css?v=2')){
    src=src.replace('/cars-v4-fix.css?v=1','/cars-v4-fix.css?v=2');
    if(!src.includes('/cars-v4-fix.css?v=2')) src=src.replace('</head>','<link rel="stylesheet" href="/cars-v4-fix.css?v=2"></head>');
  }
  src=src.replace('/cars-v4.js?v=4','/cars-v4.js?v=5');
  await writeFile(file,src);
}

// Force new local logo URLs so old/blank service-worker cached PNGs cannot remain visible.
{
  const file='public/cars-v4.js';
  let src=await readFile(file,'utf8');
  src=src.replace(/\/brands\/\$\{brandSlug\(name\)\}\.png(?:\?v=\d+)?/g,'/brands/${brandSlug(name)}.png?v=5');
  await writeFile(file,src);
}

// Rotate the PWA cache so existing installed-app users receive the new Cars UI/assets immediately.
{
  const file='public/sw.js';
  let src=await readFile(file,'utf8');
  src=src.replace(/const CACHE='zebaz-app-v\d+';/,"const CACHE='zebaz-app-v6';");
  await writeFile(file,src);
}

console.log('ZEBAZ Cars V4 final visual/cache fixes loaded');
