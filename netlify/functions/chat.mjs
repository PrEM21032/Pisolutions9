import OpenAI from 'openai';

const ALLOWED_ORIGIN = 'https://prem21032.github.io';
const MAX_INPUT = 8000;

function json(body, statusCode = 200, origin = '') {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'access-control-allow-methods': 'POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    vary: 'Origin'
  };
  if (origin === ALLOWED_ORIGIN) headers['access-control-allow-origin'] = ALLOWED_ORIGIN;
  return { statusCode, headers, body: JSON.stringify(body) };
}

function requestOrigin(event) {
  return event?.headers?.origin || event?.headers?.Origin || '';
}

export async function handler(event) {
  const origin = requestOrigin(event);
  if (origin && origin !== ALLOWED_ORIGIN) return json({ ok: false, error: 'origin_not_allowed' }, 403, origin);
  if (event.httpMethod === 'OPTIONS') return json({ ok: true }, 204, origin);
  if (event.httpMethod !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405, origin);

  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch { return json({ ok: false, error: 'invalid_json' }, 400, origin); }
  const message = String(payload?.message || '').trim();
  if (!message) return json({ ok: false, error: 'message_required' }, 400, origin);
  if (message.length > MAX_INPUT) return json({ ok: false, error: 'message_too_large' }, 413, origin);

  try {
    const client = new OpenAI();
    const completion = await client.chat.completions.create({
      model: process.env.PI_CHAT_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 900,
      messages: [
        { role: 'system', content: 'You are PI, an autonomous intelligence assistant coordinated by Krishna. Answer the user\'s actual question directly and naturally. Do not repeat a generic template. If a request needs current external facts or an external action you cannot verify, say what is missing instead of inventing it. Do not claim that you executed an action unless the system actually did it. For multi-step objectives, explain the plan and separate planned work from completed work.' },
        { role: 'user', content: message }
      ]
    });
    const answer = completion.choices?.[0]?.message?.content?.trim();
    if (!answer) return json({ ok: false, error: 'empty_model_response' }, 502, origin);
    return json({ ok: true, answer, source: 'pi-chat-model', truth: 'model-response' }, 200, origin);
  } catch (error) {
    return json({ ok: false, error: 'chat_provider_unavailable', detail: String(error?.message || error).slice(0, 240) }, 503, origin);
  }
}
