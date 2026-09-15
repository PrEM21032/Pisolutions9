import { handler } from '../netlify/functions/pi.mjs';

const methods = await handler({ httpMethod: 'PUT', body: '{}' });
if (methods.statusCode !== 405) throw new Error('unsupported_method_not_rejected');

const empty = await handler({ httpMethod: 'POST', body: JSON.stringify({}) });
if (empty.statusCode !== 400) throw new Error('empty_objective_not_rejected');

const health = await handler({ httpMethod: 'GET' });
const healthBody = JSON.parse(health.body);
if (healthBody.ok !== true || healthBody.truth !== 'verified') throw new Error('health_contract_failed');

console.log(JSON.stringify({ ok: true, cloudContract: true, methodGuard: true, inputGuard: true }));
