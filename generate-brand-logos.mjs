import { readFile, writeFile, mkdir } from 'fs/promises';
import sharp from 'sharp';
import * as SimpleIcons from 'simple-icons';

const catalogSource = await readFile('public/car-catalog.js', 'utf8');
const catalogBlock = catalogSource.match(/const CATALOG=\{([\s\S]*?)\n\s*\};\n\n\s*const BRAND_NAMES/);
if (!catalogBlock) throw new Error('Could not parse car catalog makes');
const makes = [...catalogBlock[1].matchAll(/^\s*'([^']+)'\s*:\s*\[/gm)].map(m => m[1]);
if (!makes.length) throw new Error('No car makes found in catalog');

await mkdir('public/brands', { recursive: true });

const normalize = value => String(value || '')
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[&+]/g, 'and')
  .replace(/[^a-z0-9]+/g, '');
const fileSlug = value => String(value || '')
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[&+]/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'brand';
const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));

const icons = Object.values(SimpleIcons).filter(icon => icon && typeof icon === 'object' && icon.title && icon.path && typeof icon.path === 'string');
const byTitle = new Map(icons.map(icon => [normalize(icon.title), icon]));

const aliases = {
  'Alfa Romeo':['Alfa Romeo'], 'Aston Martin':['Aston Martin'], 'BAIC':['BAIC Motor','BAIC'],
  'BYD':['BYD'], 'Changan':['Changan Automobile','Changan'], 'Chery':['Chery'], 'Chevrolet':['Chevrolet'],
  'Citroen':['Citroën','Citroen'], 'Cupra':['CUPRA','Cupra'], 'Denza':['Denza'], 'Dongfeng':['Dongfeng Motor','Dongfeng'],
  'Fangchengbao':['Fangchengbao'], 'GAC':['GAC Motor','GAC'], 'Geely':['Geely'], 'Genesis':['Genesis'],
  'Great Wall':['Great Wall Motor','Great Wall'], 'Hongqi':['Hongqi'], 'Infiniti':['INFINITI','Infiniti'], 'JAC':['JAC Motors','JAC'],
  'Jaecoo':['Jaecoo'], 'Jetour':['Jetour'], 'KGM':['KG Mobility','KGM'], 'Land Rover':['Land Rover'],
  'Li Auto':['Li Auto'], 'Mahindra':['Mahindra'], 'Mercedes-Benz':['Mercedes-Benz','Mercedes Benz','Mercedes'], 'MG':['MG'],
  'Mini':['MINI','Mini'], 'NIO':['NIO'], 'Omoda':['Omoda'], 'Ram':['RAM','Ram'], 'Rolls-Royce':['Rolls-Royce','Rolls Royce'],
  'Seat':['SEAT','Seat'], 'Skoda':['ŠKODA','Škoda','Skoda'], 'Smart':['smart','Smart'], 'Tank':['Tank'], 'XPeng':['XPeng','Xpeng'],
  'Zeekr':['Zeekr'], 'Haval':['Haval'], 'GMC':['GMC'], 'Jeep':['Jeep']
};

function findIcon(make) {
  const candidates = [make, ...(aliases[make] || [])];
  for (const candidate of candidates) {
    const exact = byTitle.get(normalize(candidate));
    if (exact) return exact;
  }
  // Never fuzzy-match here: a wrong car logo is worse than a clean branded wordmark fallback.
  return null;
}

function iconSvg(icon) {
  const color = String(icon.hex || '111111').replace('#','');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#${color}" d="${icon.path}"/></svg>`;
}

function wordmarkSvg(make) {
  const label = esc(make);
  const len = [...make].length;
  const size = len > 16 ? 25 : len > 12 ? 30 : len > 9 ? 36 : len > 6 ? 43 : 52;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="256" viewBox="0 0 320 256">
    <rect width="320" height="256" fill="none"/>
    <text x="160" y="132" text-anchor="middle" dominant-baseline="middle" font-family="DejaVu Sans,Arial,Helvetica,sans-serif" font-size="${size}" font-weight="800" letter-spacing="-1" fill="#111111">${label}</text>
  </svg>`;
}

const manifest = {};
let officialCount = 0;
for (const make of makes) {
  const icon = findIcon(make);
  const filename = `${fileSlug(make)}.png`;
  const svg = icon ? iconSvg(icon) : wordmarkSvg(make);
  await sharp(Buffer.from(svg))
    .resize(320, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(`public/brands/${filename}`);
  manifest[make] = { file: `/brands/${filename}`, source: icon ? 'simple-icons' : 'wordmark-fallback', title: icon?.title || make };
  if (icon) officialCount++;
}

await writeFile('public/brands/manifest.json', JSON.stringify({ generatedAt: new Date().toISOString(), total: makes.length, officialCount, brands: manifest }, null, 2));
console.log(`ZEBAZ brand PNGs generated: ${makes.length} total, ${officialCount} exact icon matches, ${makes.length - officialCount} wordmark fallbacks`);
