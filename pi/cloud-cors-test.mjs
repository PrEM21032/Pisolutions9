import assert from 'node:assert/strict';
import { handler } from '../netlify/functions/pi.mjs';

const originalToken = process.env.PI_OWNER_TOKEN;
process.env.PI_OWNER_TOKEN = 'test-owner-token';

try {
  const preflight = await handler({ httpMethod: 'OPTIONS', headers: { origin: 'https://pisolutions9.github.io' } });
  assert.equal(preflight.statusCode, 204);
  assert.equal(preflight.headers['access-control-allow-origin'], 'https://pisolutions9.github.io');
  assert.match(preflight.headers['access-control-allow-methods'], /POST/);

  const health = await handler({ httpMethod: 'GET', headers: { origin: 'https://pisolutions9.github.io' } });
  assert.equal(health.statusCode, 200);
  assert.equal(health.headers['access-control-allow-origin'], 'https://pisolutions9.github.io');

  const unauthorized = await handler({
    httpMethod: 'POST',
    headers: { origin: 'https://pisolutions9.github.io' },
    body: JSON.stringify({ objective: 'test' })
  });
  assert.equal(unauthorized.statusCode, 401);
  assert.equal(unauthorized.headers['access-control-allow-origin'], 'https://pisolutions9.github.io');

  const authorized = await handler({
    httpMethod: 'POST',
    headers: {
      origin: 'https://pisolutions9.github.io',
      authorization: 'Bearer test-owner-token'
    },
    body: JSON.stringify({ objective: 'research Indian agriculture exports' })
  });
  assert.equal(authorized.statusCode, 200);
  const body = JSON.parse(authorized.body);
  assert.equal(body.ok, true);
  assert.equal(body.truth, 'verified');
  assert.equal(authorized.headers['access-control-allow-origin'], 'https://pisolutions9.github.io');

  console.log(JSON.stringify({ ok: true, phase: 58, cors: true, auth: true, cloudContract: true, truth: 'verified' }));
} finally {
  if (originalToken === undefined) delete process.env.PI_OWNER_TOKEN;
  else process.env.PI_OWNER_TOKEN = originalToken;
}
