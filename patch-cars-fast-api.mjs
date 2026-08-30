import { readFile, writeFile } from 'fs/promises';
const file='server.js';
let src=await readFile(file,'utf8');
if(!src.includes('ZEBAZ_CARS_FAST_API_V1')){
  const anchor="app.get('/status',async(req,res)=>{";
  if(!src.includes(anchor))throw new Error('status anchor not found');
  const route=`// ZEBAZ_CARS_FAST_API_V1\napp.get('/api/cars-fast',async(req,res)=>{\n  try{\n    const {rows}=await pool.query(\`SELECT id,seller_name AS "sellerName",phone,make,model,year,price,mileage,city,color,description,language,created_at AS "createdAt" FROM car_listings WHERE status='approved' ORDER BY created_at DESC LIMIT 250\`);\n    const cars=rows.map(x=>({...x,coverUrl:'/car-image/'+encodeURIComponent(x.id)+'/1',imageUrls:['/car-image/'+encodeURIComponent(x.id)+'/1']}));\n    res.setHeader('Cache-Control','no-store');\n    res.json({ok:true,cars});\n  }catch(e){console.error('Cars fast load failed:',e.message);res.status(500).json({ok:false,error:'Could not load cars'})}\n});\n\n`;
  src=src.replace(anchor,route+anchor);
}
await writeFile(file,src);
console.log('ZEBAZ Cars fast API patch applied');
