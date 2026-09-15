import { planNoGpt, executeNoGptPlan } from '../../pi/no-gpt-engine.mjs';

function json(body, statusCode = 200) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    body: JSON.stringify(body)
  };
}

export async function handler(event) {
  if (event.httpMethod === 'GET') {
    return json({ ok: true, service: 'pi', mode: 'zero-cost-first', capability: 'cloud-planning', truth: 'verified' });
  }
  if (event.httpMethod !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);

  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch { return json({ ok: false, error: 'invalid_json' }, 400); }
  const objective = String(payload?.objective || '').trim();
  if (!objective) return json({ ok: false, error: 'objective_required' }, 400);

  const plan = planNoGpt(objective);
  const result = executeNoGptPlan(plan);
  return json({ ok: true, service: 'pi', mode: 'zero-cost-first', plan, result, truth: 'verified' });
}
