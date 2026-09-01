import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canonicalIraqPhone,
  generateOtp,
  hashOtp,
  phoneVariants,
  sendOtpSms,
  smirqConfig,
  verifyOtp,
} from '../sms-otp.mjs';

test('normalizes common Iraqi mobile formats and Arabic digits', () => {
  assert.equal(canonicalIraqPhone('0750 370 0007'), '9647503700007');
  assert.equal(canonicalIraqPhone('+964 750 370 0007'), '9647503700007');
  assert.equal(canonicalIraqPhone('00964 750 370 0007'), '9647503700007');
  assert.equal(canonicalIraqPhone('٠٧٥٠٣٧٠٠٠٠٧'), '9647503700007');
  assert.equal(canonicalIraqPhone('12345'), '');
  assert.deepEqual(phoneVariants('07503700007'), ['9647503700007', '07503700007']);
});

test('creates and verifies six digit codes without storing plaintext', async () => {
  const code = generateOtp();
  assert.match(code, /^\d{6}$/);
  const stored = await hashOtp('123456', 'fixed-test-salt');
  assert.notEqual(stored.hash, '123456');
  assert.equal(await verifyOtp('123456', stored.hash, stored.salt), true);
  assert.equal(await verifyOtp('123455', stored.hash, stored.salt), false);
  assert.equal(await verifyOtp('12345', stored.hash, stored.salt), false);
});

test('requires a complete HTTPS SMIRQ configuration', () => {
  assert.equal(smirqConfig({}), null);
  assert.equal(smirqConfig({
    SMIRQ_API_URL: 'http://sms.example.test/send',
    SMIRQ_API_KEY: 'key',
    SMIRQ_TOKEN_ID: 'token',
    SMIRQ_SENDER_ID: 'ZEBAZ',
  }), null);
  assert.ok(smirqConfig({
    SMIRQ_API_URL: 'https://sms.example.test/send',
    SMIRQ_API_KEY: 'key',
    SMIRQ_TOKEN_ID: 'token',
    SMIRQ_SENDER_ID: 'ZEBAZ',
  }));
});

test('sends the provider contract to an Iraqi E.164 number', async () => {
  let request;
  const ok = await sendOtpSms({
    phone: '07503700007',
    code: '418205',
    env: {
      SMIRQ_API_URL: 'https://sms.example.test/send',
      SMIRQ_API_KEY: 'secret-key',
      SMIRQ_TOKEN_ID: 'secret-token',
      SMIRQ_SENDER_ID: 'ZEBAZ',
    },
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true };
    },
  });
  assert.equal(ok, true);
  assert.equal(request.url, 'https://sms.example.test/send');
  assert.deepEqual(JSON.parse(request.options.body), {
    apiKey: 'secret-key',
    tokenId: 'secret-token',
    senderId: 'ZEBAZ',
    to: '+9647503700007',
    body: 'ZEBAZ Motors verification code: 418205. Expires in 10 minutes.',
  });
});

test('does not expose provider response details on failure', async () => {
  await assert.rejects(
    sendOtpSms({
      phone: '07503700007',
      code: '418205',
      env: {
        SMIRQ_API_URL: 'https://sms.example.test/send',
        SMIRQ_API_KEY: 'secret-key',
        SMIRQ_TOKEN_ID: 'secret-token',
        SMIRQ_SENDER_ID: 'ZEBAZ',
      },
      fetchImpl: async () => ({ ok: false, status: 401, text: async () => 'secret provider detail' }),
    }),
    (error) => error.code === 'SMS_REJECTED' && !error.message.includes('secret provider detail'),
  );
});
