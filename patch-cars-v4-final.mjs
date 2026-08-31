import { readFile, writeFile } from 'fs/promises';

// Load the final visual override after all older Cars styles and force a fresh browser copy.
{
  const file='public/cars.html';
  let src=await readFile(file,'utf8');
  src=src.replace(/\/cars-v4-fix\.css\?v=\d+/g,'/cars-v4-fix.css?v=3');
  if(!src.includes('/cars-v4-fix.css?v=3')) src=src.replace('</head>','<link rel="stylesheet" href="/cars-v4-fix.css?v=3"></head>');
  src=src.replace(/\/cars-v4\.js\?v=\d+/g,'/cars-v4.js?v=6');
  await writeFile(file,src);
}

// Force fresh local transparent PNG logo URLs so old/blank browser or PWA cached images cannot remain visible.
{
  const file='public/cars-v4.js';
  let src=await readFile(file,'utf8');
  src=src.replace(/\/brands\/\$\{brandSlug\(name\)\}\.png(?:\?v=\d+)?/g,'/brands/${brandSlug(name)}.png?v=6');
  await writeFile(file,src);
}

// Rotate the PWA cache so installed-app and normal browser users receive the clean brand UI immediately.
{
  const file='public/sw.js';
  let src=await readFile(file,'utf8');
  src=src.replace(/const CACHE='zebaz-app-v\d+';/,"const CACHE='zebaz-app-v7';");
  await writeFile(file,src);
}

console.log('ZEBAZ Cars clean brand cards and cache refresh loaded');
