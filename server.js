import express from 'express';
import QRCode from 'qrcode';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

let sock = null;
let ready = false;
let qrDataUrl = null;
let starting = false;

async function startWhatsApp() {
  if (starting) return;
  starting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState('.baileys_auth');

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: ['ZEBAZ PPF Studio', 'Chrome', '1.0.0'],
      syncFullHistory: false,
      markOnlineOnConnect: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        ready = false;
        qrDataUrl = await QRCode.toDataURL(qr);
        console.log('ZEBAZ WhatsApp QR ready');
      }

      if (connection === 'open') {
        ready = true;
        qrDataUrl = null;
        console.log('ZEBAZ WhatsApp connected');
      }

      if (connection === 'close') {
        ready = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.statusCode;
        const loggedOut = statusCode === DisconnectReason.loggedOut;
        console.log(`WhatsApp disconnected${loggedOut ? ' (logged out)' : ''}`);
        if (!loggedOut) {
          setTimeout(() => {
            starting = false;
            startWhatsApp().catch(console.error);
          }, 2000);
        }
      }
    });
  } catch (error) {
    console.error('WhatsApp start error:', error);
    setTimeout(() => {
      starting = false;
      startWhatsApp().catch(console.error);
    }, 5000);
    return;
  }

  starting = false;
}

startWhatsApp().catch(console.error);

app.get('/status', (req, res) => {
  res.json({ ready, needsQr: !ready && !!qrDataUrl });
});

app.get('/qr', (req, res) => {
  if (ready) {
    return res.send('<h2 style="font-family:Arial">WhatsApp is connected ✅</h2>');
  }

  if (!qrDataUrl) {
    return res.send('<h2 style="font-family:Arial">Waiting for QR… refresh in a few seconds.</h2>');
  }

  res.send(`<!doctype html><html><body style="margin:0;background:#050505;color:white;text-align:center;font-family:Arial;padding:30px"><h1>ZEBAZ PPF STUDIO</h1><p>WhatsApp → Linked devices → Link a device</p><img src="${qrDataUrl}" style="max-width:360px;width:90%;background:white;padding:14px;border-radius:18px"></body></html>`);
});

app.post('/send-booking', async (req, res) => {
  try {
    if (!ready || !sock) {
      return res.status(503).json({ ok: false, error: 'WhatsApp is not connected yet' });
    }

    const {
      to = '9647502122220',
      message,
      pdfBase64,
      filename = 'ZEBAZ-Booking.pdf'
    } = req.body;

    const digits = String(to).replace(/\D/g, '');
    if (!digits || !message) {
      return res.status(400).json({ ok: false, error: 'Missing booking data' });
    }

    const jid = `${digits}@s.whatsapp.net`;

    if (pdfBase64) {
      const clean = String(pdfBase64).replace(/^data:application\/pdf;base64,/, '');
      await sock.sendMessage(jid, {
        document: Buffer.from(clean, 'base64'),
        mimetype: 'application/pdf',
        fileName: filename,
        caption: message
      });
    } else {
      await sock.sendMessage(jid, { text: message });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Send booking error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`ZEBAZ PPF Studio running on port ${port}`);
});
