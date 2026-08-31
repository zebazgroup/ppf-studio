import { readFile, writeFile } from 'fs/promises';

// Load the final visual overrides after all older Cars styles and force a fresh browser copy.
{
  const file='public/cars.html';
  let src=await readFile(file,'utf8');
  src=src.replace(/\/cars-v4-fix\.css\?v=\d+/g,'/cars-v4-fix.css?v=4');
  if(!src.includes('/cars-v4-fix.css?v=4')) src=src.replace('</head>','<link rel="stylesheet" href="/cars-v4-fix.css?v=4"></head>');
  src=src.replace(/<link rel="stylesheet" href="\/cars-brand-more\.css\?v=\d+">/g,'');
  src=src.replace('</head>','<link rel="stylesheet" href="/cars-brand-more.css?v=1"></head>');
  src=src.replace(/\/cars-v4\.js\?v=\d+/g,'/cars-v4.js?v=7');
  src=src.replace(/<script src="\/cars-brand-more\.js\?v=\d+"><\/script>/g,'');
  src=src.replace('</body>','<script src="/cars-brand-more.js?v=1"></script></body>');
  await writeFile(file,src);
}

// Force fresh local transparent PNG logo URLs so old/blank browser or PWA cached images cannot remain visible.
{
  const file='public/cars-v4.js';
  let src=await readFile(file,'utf8');
  src=src.replace(/\/brands\/\$\{brandSlug\(name\)\}\.png(?:\?v=\d+)?/g,'/brands/${brandSlug(name)}.png?v=7');
  await writeFile(file,src);
}

// Rotate the PWA cache so installed-app and normal browser users receive the new Cars UI immediately.
{
  const file='public/sw.js';
  let src=await readFile(file,'utf8');
  src=src.replace(/const CACHE='zebaz-app-v\d+';/,"const CACHE='zebaz-app-v8';");
  await writeFile(file,src);
}

console.log('ZEBAZ Cars one-row brands, gold frames and cache refresh loaded');
