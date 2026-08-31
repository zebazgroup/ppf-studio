import {readFile,writeFile} from 'fs/promises';

const file='server.js';
let src=await readFile(file,'utf8');
if(src.includes('ZEBAZ_CAR_TRIM_V1')){console.log('ZEBAZ car trim patch already present');process.exit(0)}

const migration='  // ZEBAZ_CAR_TRIM_V1\n  await pool.query("ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS trim TEXT");';
const imageTable='  await pool.query("CREATE TABLE IF NOT EXISTS car_listing_images';
if(!src.includes(imageTable))throw new Error('Marketplace database anchor not found');
src=src.replace(imageTable,migration+'\n'+imageTable);

const record='model:clean(b.model,120),year:clean(b.year,20)';
if(!src.includes(record))throw new Error('Marketplace listing record anchor not found');
src=src.replace(record,'model:clean(b.model,120),trim:clean(b.trim,120),year:clean(b.year,20)');
if(src.includes('!r.make||!r.model||!r.year'))src=src.replace('!r.make||!r.model||!r.year','!r.make||!r.model||!r.trim||!r.year');
else src=src.replace('!r.make||!r.model||!r.price','!r.make||!r.model||!r.trim||!r.price');

const insert='INSERT INTO car_listings(id,seller_name,phone,make,model,year,price,mileage,city,color,vin,description,language,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,\'pending\')';
const insertWithTrim='INSERT INTO car_listings(id,seller_name,phone,make,model,trim,year,price,mileage,city,color,vin,description,language,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,\'pending\')';
if(!src.includes(insert))throw new Error('Marketplace insert anchor not found');
src=src.replace(insert,insertWithTrim);
src=src.replace('[r.id,r.sellerName,r.phone,r.make,r.model,r.year,r.price,r.mileage,r.city,r.color,r.vin,r.description,r.language]','[r.id,r.sellerName,r.phone,r.make,r.model,r.trim,r.year,r.price,r.mileage,r.city,r.color,r.vin,r.description,r.language]');
src=src.replaceAll('phone,make,model,year,price','phone,make,model,trim,year,price');

await writeFile(file,src);
console.log('ZEBAZ Cars dependent trim field backend applied');
