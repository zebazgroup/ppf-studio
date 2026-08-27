import express from 'express';
import QRCode from 'qrcode';
import pino from 'pino';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';

const __filename=fileURLToPath(import.meta.url);const __dirname=path.dirname(__filename);
const app=express();app.use(express.json({limit:'20mb'}));app.use(express.static(path.join(__dirname,'public')));
const ADMIN_USER=process.env.ADMIN_USER||'admin';
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||crypto.randomBytes(12).toString('base64url');
if(!process.env.ADMIN_PASSWORD) console.log('ADMIN_PASSWORD is not set. Set it in Railway Variables before using /admin.');
const sessions=new Map();const bookingsFile=path.join(__dirname,'bookings.json');
function loadBookings(){try{return JSON.parse(fs.readFileSync(bookingsFile,'utf8'))}catch{return[]}}
function saveBookings(x){fs.writeFileSync(bookingsFile,JSON.stringify(x,null,2))}
function cookie(req,name){const m=(req.headers.cookie||'').match(new RegExp('(?:^|; )'+name+'=([^;]*)'));return m?decodeURIComponent(m[1]):null}
function auth(req,res,next){const t=cookie(req,'zebaz_admin');if(t&&sessions.has(t))return next();return res.status(401).json({ok:false,error:'Unauthorized'})}
let sock=null,ready=false,qrDataUrl=null,starting=false;
async function startWhatsApp(){if(starting)return;starting=true;try{const {state,saveCreds}=await useMultiFileAuthState('.baileys_auth');sock=makeWASocket({auth:state,printQRInTerminal:false,logger:pino({level:'silent'}),browser:['ZEBAZ PPF Studio','Chrome','1.0.0'],syncFullHistory:false,markOnlineOnConnect:false});sock.ev.on('creds.update',saveCreds);sock.ev.on('connection.update',async({connection,lastDisconnect,qr})=>{if(qr){ready=false;qrDataUrl=await QRCode.toDataURL(qr);console.log('ZEBAZ WhatsApp QR ready')}if(connection==='open'){ready=true;qrDataUrl=null;console.log('ZEBAZ WhatsApp connected')}if(connection==='close'){ready=false;const c=lastDisconnect?.error?.output?.statusCode||lastDisconnect?.error?.statusCode;const out=c===DisconnectReason.loggedOut;console.log('WhatsApp disconnected'+(out?' (logged out)':''));if(!out)setTimeout(()=>{starting=false;startWhatsApp().catch(console.error)},2000)}})}catch(e){console.error(e);setTimeout(()=>{starting=false;startWhatsApp().catch(console.error)},5000);return}starting=false}startWhatsApp().catch(console.error);
app.post('/admin/login',(req,res)=>{const {username,password}=req.body||{};if(username!==ADMIN_USER||password!==ADMIN_PASSWORD)return res.status(401).json({ok:false,error:'Wrong username or password'});const t=crypto.randomBytes(32).toString('hex');sessions.set(t,Date.now());res.setHeader('Set-Cookie',`zebaz_admin=${t}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`);res.json({ok:true})});
app.post('/admin/logout',auth,(req,res)=>{sessions.delete(cookie(req,'zebaz_admin'));res.setHeader('Set-Cookie','zebaz_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');res.json({ok:true})});
app.get('/admin/api/bookings',auth,(req,res)=>res.json({ok:true,bookings:loadBookings(),whatsappReady:ready}));
app.get('/admin/api/qr',auth,(req,res)=>res.json({ok:true,ready,qr:qrDataUrl}));
app.get('/status',(req,res)=>res.json({ready,needsQr:!ready&&!!qrDataUrl}));
app.get('/qr',(req,res)=>res.redirect('/admin'));
app.post('/send-booking',async(req,res)=>{try{const {to='9647502122220',message,pdfBase64,filename='ZEBAZ-Booking.pdf',booking}=req.body;const record={id:crypto.randomUUID(),receivedAt:new Date().toISOString(),...(booking||{})};const all=loadBookings();all.unshift(record);saveBookings(all);if(!ready||!sock)return res.status(503).json({ok:false,saved:true,error:'Request saved. WhatsApp is not connected yet'});const digits=String(to).replace(/\D/g,'');if(!digits||!message)return res.status(400).json({ok:false,error:'Missing booking data'});const jid=`${digits}@s.whatsapp.net`;if(pdfBase64){const clean=String(pdfBase64).replace(/^data:application\/pdf;base64,/,'');await sock.sendMessage(jid,{document:Buffer.from(clean,'base64'),mimetype:'application/pdf',fileName:filename,caption:message})}else await sock.sendMessage(jid,{text:message});res.json({ok:true,saved:true})}catch(e){console.error(e);res.status(500).json({ok:false,error:e.message})}});
app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'public','admin.html')));
app.use((req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
const port=process.env.PORT||3000;app.listen(port,'0.0.0.0',()=>console.log(`ZEBAZ PPF Studio running on port ${port}`));