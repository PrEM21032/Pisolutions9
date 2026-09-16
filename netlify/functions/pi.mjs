import { planNoGpt, executeNoGptPlan } from '../../pi/no-gpt-engine.mjs';

const ALLOWED_ORIGIN = 'https://pisolutions9.github.io';

function json(body, statusCode = 200, origin = ALLOWED_ORIGIN) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization',
      'access-control-max-age': '600',
      vary: 'Origin'
    },
    body: JSON.stringify(body)
  };
}

function requestOrigin(event) {
  const origin = event?.headers?.origin || event?.headers?.Origin || '';
  return origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
}

function authorized(event) {
  const expected = String(process.env.PI_OWNER_TOKEN || '');
  if (!expected) return false;
  const header = event?.headers?.authorization || event?.headers?.Authorization || '';
  return header === `Bearer ${expected}`;
}

export async function handler(event) {
  const origin = requestOrigin(event);
  if (event.httpMethod === 'OPTIONS') return json({ ok: true, service: 'pi', truth: 'verified' }, 204, origin);

  if (event.httpMethod === 'GET') {
    return json({ ok: true, service: 'pi', mode: 'zero-cost-first', capability: 'cloud-planning', truth: 'verified', ownerWriteProtected: true }, 200, origin);
  }
  if (event.httpMethod !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405, origin);
  if (!String(process.env.PI_OWNER_TOKEN || '')) return json({ ok: false, error: 'owner_auth_not_configured' }, 503, origin);
  if (!authorized(event)) return json({ ok: false, error: 'unauthorized' }, 401, origin);

  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch { return json({ ok: false, error: 'invalid_json' }, 400, origin); }
  const objective = String(payload?.objective || '').trim();
  if (!objective) return json({ ok: false, error: 'objective_required' }, 400, origin);
  if (objective.length > 4000) return json({ ok: false, error: 'objective_too_large' }, 413, origin);

  const plan = planNoGpt(objective);
  const result = executeNoGptPlan(plan);
  return json({ ok: true, service: 'pi', mode: 'zero-cost-first', plan, result, truth: 'verified' }, 200, origin);
}
