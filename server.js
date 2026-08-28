import express from 'express';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename=fileURLToPath(import.meta.url);const __dirname=path.dirname(__filename);
const app=express();app.use(express.json({limit:'2mb'}));app.use(express.static(path.join(__dirname,'public')));
const ADMIN_USER=process.env.ADMIN_USER||'admin';
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||crypto.randomBytes(12).toString('base64url');
if(!process.env.ADMIN_PASSWORD) console.log('ADMIN_PASSWORD is not set.');
const sessions=new Map();
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL?.includes('railway.internal')?false:{rejectUnauthorized:false}});
async function initDb(){await pool.query(`CREATE TABLE IF NOT EXISTS bookings (id UUID PRIMARY KEY, received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), booking_date TEXT, name TEXT NOT NULL, phone TEXT NOT NULL, car TEXT NOT NULL, year TEXT NOT NULL, vin TEXT NOT NULL, service TEXT NOT NULL, notes TEXT, language TEXT)`);console.log('ZEBAZ PostgreSQL database ready')}
initDb().catch(e=>{console.error('Database init failed:',e.message);process.exit(1)});
function cookie(req,name){const m=(req.headers.cookie||'').match(new RegExp('(?:^|; )'+name+'=([^;]*)'));return m?decodeURIComponent(m[1]):null}
function auth(req,res,next){const t=cookie(req,'zebaz_admin');if(t&&sessions.has(t))return next();return res.status(401).json({ok:false,error:'Unauthorized'})}
app.post('/admin/login',(req,res)=>{const {username,password}=req.body||{};if(username!==ADMIN_USER||password!==ADMIN_PASSWORD)return res.status(401).json({ok:false,error:'Wrong username or password'});const t=crypto.randomBytes(32).toString('hex');sessions.set(t,Date.now());res.setHeader('Set-Cookie',`zebaz_admin=${t}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`);res.json({ok:true})});
app.post('/admin/logout',auth,(req,res)=>{sessions.delete(cookie(req,'zebaz_admin'));res.setHeader('Set-Cookie','zebaz_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');res.json({ok:true})});
app.get('/admin/api/bookings',auth,async(req,res)=>{try{const {rows}=await pool.query('SELECT id, received_at AS "receivedAt", booking_date AS date, name, phone, car, year, vin, service, notes, language FROM bookings ORDER BY received_at DESC');res.json({ok:true,bookings:rows,databaseReady:true})}catch(e){res.status(500).json({ok:false,error:'Database error'})}});
app.get('/admin/api/qr',auth,(req,res)=>res.json({ok:true,ready:true,database:true}));
app.get('/status',async(req,res)=>{try{await pool.query('SELECT 1');res.json({ready:true,database:true})}catch{res.status(503).json({ready:false,database:false})}});
app.post('/send-booking',async(req,res)=>{try{const b=req.body?.booking||req.body||{};const record={id:crypto.randomUUID(),date:String(b.date||''),name:String(b.name||'').trim(),phone:String(b.phone||'').trim(),car:String(b.car||'').trim(),year:String(b.year||'').trim(),vin:String(b.vin||'').trim().toUpperCase(),service:String(b.service||'').trim(),notes:String(b.notes||'').trim(),language:String(b.language||'')};if(!record.name||!record.phone||!record.car||!record.year||record.vin.length!==17||!record.service)return res.status(400).json({ok:false,error:'Missing or invalid booking data'});await pool.query('INSERT INTO bookings (id,booking_date,name,phone,car,year,vin,service,notes,language) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[record.id,record.date,record.name,record.phone,record.car,record.year,record.vin,record.service,record.notes,record.language]);res.json({ok:true,saved:true,id:record.id})}catch(e){console.error('Booking save failed:',e.message);res.status(500).json({ok:false,error:'Could not save booking'})}});
app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'public','admin.html')));
app.use((req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
const port=process.env.PORT||3000;app.listen(port,'0.0.0.0',()=>console.log(`ZEBAZ PPF Studio running on port ${port}`));