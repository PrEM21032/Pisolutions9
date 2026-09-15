import { handler } from './pi.mjs';

const health = await handler({ httpMethod: 'GET' });
if (health.statusCode !== 200) throw new Error('cloud_health_failed');
const healthBody = JSON.parse(health.body);
if (healthBody.ok !== true || healthBody.service !== 'pi') throw new Error('cloud_health_invalid');

const planned = await handler({ httpMethod: 'POST', body: JSON.stringify({ objective: 'Build a business intelligence app' }) });
if (planned.statusCode !== 200) throw new Error('cloud_plan_failed');
const body = JSON.parse(planned.body);
if (body.ok !== true || body.plan.mode !== 'no-gpt') throw new Error('cloud_plan_invalid');
if (body.result.status !== 'completed') throw new Error('cloud_cycle_failed');
if (!Array.isArray(body.result.uncertainty) || !body.result.uncertainty.some(item => item.includes('plan only'))) throw new Error('truth_boundary_missing');

const bad = await handler({ httpMethod: 'POST', body: '{' });
if (bad.statusCode !== 400) throw new Error('invalid_json_not_rejected');

console.log(JSON.stringify({ ok: true, cloudFunction: true, zeroCostFirst: true, truthBoundary: true }));
