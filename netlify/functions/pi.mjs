import { planNoGpt, executeNoGptPlan } from '../../pi/no-gpt-engine.mjs';

function json(body, statusCode = 200) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
    body: JSON.stringify(body)
  };
}

function authorized(event) {
  const expected = String(process.env.PI_OWNER_TOKEN || '');
  if (!expected) return false;
  const header = event?.headers?.authorization || event?.headers?.Authorization || '';
  return header === `Bearer ${expected}`;
}

export async function handler(event) {
  if (event.httpMethod === 'GET') {
    return json({ ok: true, service: 'pi', mode: 'zero-cost-first', capability: 'cloud-planning', truth: 'verified', ownerWriteProtected: true });
  }
  if (event.httpMethod !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);
  if (!String(process.env.PI_OWNER_TOKEN || '')) return json({ ok: false, error: 'owner_auth_not_configured' }, 503);
  if (!authorized(event)) return json({ ok: false, error: 'unauthorized' }, 401);

  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch { return json({ ok: false, error: 'invalid_json' }, 400); }
  const objective = String(payload?.objective || '').trim();
  if (!objective) return json({ ok: false, error: 'objective_required' }, 400);
  if (objective.length > 4000) return json({ ok: false, error: 'objective_too_large' }, 413);

  const plan = planNoGpt(objective);
  const result = executeNoGptPlan(plan);
  return json({ ok: true, service: 'pi', mode: 'zero-cost-first', plan, result, truth: 'verified' });
}
