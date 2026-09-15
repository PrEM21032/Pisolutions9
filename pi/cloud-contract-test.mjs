import { handler } from '../netlify/functions/pi.mjs';

const methods = await handler({ httpMethod: 'PUT', body: '{}' });
if (methods.statusCode !== 405) throw new Error('unsupported_method_not_rejected');

const unconfigured = await handler({ httpMethod: 'POST', body: JSON.stringify({ objective: 'test' }), headers: {} });
if (unconfigured.statusCode !== 503) throw new Error('missing_owner_token_not_blocked');

const previous = process.env.PI_OWNER_TOKEN;
process.env.PI_OWNER_TOKEN = 'contract-token';
try {
  const unauthorized = await handler({ httpMethod: 'POST', body: JSON.stringify({ objective: 'test' }), headers: {} });
  if (unauthorized.statusCode !== 401) throw new Error('unauthorized_not_rejected');

  const empty = await handler({ httpMethod: 'POST', body: JSON.stringify({}), headers: { authorization: 'Bearer contract-token' } });
  if (empty.statusCode !== 400) throw new Error('empty_objective_not_rejected');

  const health = await handler({ httpMethod: 'GET' });
  const healthBody = JSON.parse(health.body);
  if (healthBody.ok !== true || healthBody.truth !== 'verified' || healthBody.ownerWriteProtected !== true) throw new Error('health_contract_failed');
} finally {
  if (previous === undefined) delete process.env.PI_OWNER_TOKEN;
  else process.env.PI_OWNER_TOKEN = previous;
}

console.log(JSON.stringify({ ok: true, cloudContract: true, methodGuard: true, authGuard: true, inputGuard: true }));
