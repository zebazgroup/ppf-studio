import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

export function phoneDigits(value) {
  const latin = String(value ?? '').replace(/[٠-٩۰-۹]/g, (digit) => {
    const arabic = '٠١٢٣٤٥٦٧٨٩'.indexOf(digit);
    if (arabic >= 0) return String(arabic);
    return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit));
  });
  return latin.replace(/\D/g, '').slice(0, 15);
}

export function canonicalIraqPhone(value) {
  let digits = phoneDigits(value);
  if (digits.startsWith('00964')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = `964${digits.slice(1)}`;
  else if (/^7\d{9}$/.test(digits)) digits = `964${digits}`;
  return /^9647\d{9}$/.test(digits) ? digits : '';
}

export function phoneVariants(value) {
  return [...new Set([canonicalIraqPhone(value), phoneDigits(value)].filter(Boolean))];
}

export function maskPhone(value) {
  const digits = phoneDigits(value);
  return digits.length > 4 ? `+${digits.slice(0, 3)} •••••• ${digits.slice(-3)}` : '••••';
}

export function generateOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

export async function hashOtp(code, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = Buffer.from(await scryptAsync(String(code), salt, 64)).toString('hex');
  return { hash, salt };
}

export async function verifyOtp(code, expectedHash, salt) {
  if (!/^\d{6}$/.test(String(code ?? '')) || !expectedHash || !salt) return false;
  const actual = Buffer.from((await hashOtp(String(code), salt)).hash, 'hex');
  const expected = Buffer.from(String(expectedHash), 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function smirqConfig(env = process.env) {
  const config = {
    apiUrl: String(env.SMIRQ_API_URL ?? '').trim(),
    apiKey: String(env.SMIRQ_API_KEY ?? '').trim(),
    tokenId: String(env.SMIRQ_TOKEN_ID ?? '').trim(),
    senderId: String(env.SMIRQ_SENDER_ID ?? 'ZEBAZ').trim(),
  };
  try {
    const url = new URL(config.apiUrl);
    if (url.protocol !== 'https:') return null;
  } catch {
    return null;
  }
  return config.apiKey && config.tokenId && config.senderId ? config : null;
}

export async function sendOtpSms({ phone, code, env = process.env, fetchImpl = fetch }) {
  const config = smirqConfig(env);
  const canonical = canonicalIraqPhone(phone);
  if (!config) {
    const error = new Error('SMS provider is not configured');
    error.code = 'SMS_NOT_CONFIGURED';
    throw error;
  }
  if (!canonical || !/^\d{6}$/.test(String(code ?? ''))) {
    const error = new Error('Invalid SMS verification request');
    error.code = 'INVALID_SMS_REQUEST';
    throw error;
  }

  let response;
  try {
    response = await fetchImpl(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        apiKey: config.apiKey,
        tokenId: config.tokenId,
        senderId: config.senderId,
        to: `+${canonical}`,
        body: `ZEBAZ Motors verification code: ${code}. Expires in 10 minutes.`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    const error = new Error('SMS provider is unavailable');
    error.code = 'SMS_UNAVAILABLE';
    throw error;
  }
  if (!response?.ok) {
    const error = new Error('SMS provider rejected the request');
    error.code = 'SMS_REJECTED';
    throw error;
  }
  return true;
}
