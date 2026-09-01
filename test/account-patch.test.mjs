import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('the production patch creates a two-step, account-gated OTP contract', async () => {
  const build = await mkdtemp(path.join(tmpdir(), 'zebaz-account-patch-'));
  try {
    await cp(root, build, { recursive: true, filter: source => !source.includes(`${path.sep}.git${path.sep}`) });
    for (const script of [
      'patch-marketplace.mjs',
      'patch-marketplace-optional-year.mjs',
      'patch-cars-fast-api.mjs',
      'patch-car-trim.mjs',
      'patch-cars-accounts.mjs',
    ]) execFileSync(process.execPath, [script], { cwd: build, stdio: 'ignore' });
    execFileSync(process.execPath, ['--check', 'server.js'], { cwd: build, stdio: 'ignore' });

    const server = await readFile(path.join(build, 'server.js'), 'utf8');
    const html = await readFile(path.join(build, 'public/cars.html'), 'utf8');
    assert.match(server, /CREATE TABLE IF NOT EXISTS account_phone_challenges/);
    assert.match(server, /SMS_OTP_REQUIRED&&\!user\.phoneVerified/);
    assert.match(server, /app\.post\('\/api\/cars',accountRequired/);
    assert.match(server, /app\.post\('\/api\/account\/register'/);
    assert.match(server, /if\(SMS_OTP_REQUIRED\)\{const challenge=await storePhoneChallenge/);
    assert.match(server, /app\.post\('\/api\/account\/verify'/);
    assert.match(server, /userId\?challenge\.user_id!==userId:!!challenge\.user_id/);
    assert.match(html, /id="accountOtp"[^>]+autocomplete="one-time-code"/);
    assert.match(html, /id="accountMemberOtp"[^>]+autocomplete="one-time-code"/);
    assert.match(html, /cars-account\.js\?v=2/);
  } finally {
    await rm(build, { recursive: true, force: true });
  }
});
