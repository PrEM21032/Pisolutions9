import { handler } from './pi.mjs';

const health = await handler({ httpMethod: 'GET' });
if (health.statusCode !== 200) throw new Error('cloud_health_failed');
const healthBody = JSON.parse(health.body);
if (healthBody.ok !== true || healthBody.service !== 'pi' || healthBody.ownerWriteProtected !== true) throw new Error('cloud_health_invalid');

const previous = process.env.PI_OWNER_TOKEN;
delete process.env.PI_OWNER_TOKEN;
const unconfigured = await handler({ httpMethod: 'POST', body: JSON.stringify({ objective: 'Build a business intelligence app' }), headers: {} });
if (unconfigured.statusCode !== 503) throw new Error('missing_owner_token_not_blocked');

process.env.PI_OWNER_TOKEN = 'test-owner-token';
try {
  const unauthorized = await handler({ httpMethod: 'POST', body: JSON.stringify({ objective: 'Build a business intelligence app' }), headers: {} });
  if (unauthorized.statusCode !== 401) throw new Error('unauthorized_request_not_rejected');

  const wrong = await handler({ httpMethod: 'POST', body: JSON.stringify({ objective: 'Build a business intelligence app' }), headers: { authorization: 'Bearer wrong-token' } });
  if (wrong.statusCode !== 401) throw new Error('wrong_token_not_rejected');

  const planned = await handler({ httpMethod: 'POST', body: JSON.stringify({ objective: 'Build a business intelligence app' }), headers: { authorization: 'Bearer test-owner-token' } });
  if (planned.statusCode !== 200) throw new Error('cloud_plan_failed');
  const body = JSON.parse(planned.body);
  if (body.ok !== true || body.plan.mode !== 'no-gpt') throw new Error('cloud_plan_invalid');
  if (body.result.status !== 'completed') throw new Error('cloud_cycle_failed');
  if (!Array.isArray(body.result.uncertainty) || !body.result.uncertainty.some(item => /does not invent current external facts/i.test(item) && /live data requests require a verified data source/i.test(item))) throw new Error('truth_boundary_missing');

  const bad = await handler({ httpMethod: 'POST', body: '{', headers: { authorization: 'Bearer test-owner-token' } });
  if (bad.statusCode !== 400) throw new Error('invalid_json_not_rejected');

  const empty = await handler({ httpMethod: 'POST', body: JSON.stringify({ objective: '' }), headers: { authorization: 'Bearer test-owner-token' } });
  if (empty.statusCode !== 400) throw new Error('empty_objective_not_rejected');

  const huge = await handler({ httpMethod: 'POST', body: JSON.stringify({ objective: 'x'.repeat(4001) }), headers: { authorization: 'Bearer test-owner-token' } });
  if (huge.statusCode !== 413) throw new Error('oversized_objective_not_rejected');
} finally {
  if (previous === undefined) delete process.env.PI_OWNER_TOKEN;
  else process.env.PI_OWNER_TOKEN = previous;
}

console.log(JSON.stringify({ ok: true, cloudFunction: true, ownerAuth: true, inputLimits: true, truthBoundary: true }));
