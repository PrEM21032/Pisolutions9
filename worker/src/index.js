const ALLOWED_ORIGIN = 'https://pisolutions9.github.io';
const MAX_INPUT = 8000;

function corsHeaders(origin) {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'access-control-allow-origin': origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    'access-control-allow-methods': 'POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    vary: 'Origin'
  };
}

function json(body, status, request) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(request.headers.get('Origin') || '') });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/chat') return new Response('Not found', { status: 404 });
    if (request.method === 'OPTIONS') return json({ ok: true }, 204, request);
    if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405, request);

    let payload;
    try { payload = await request.json(); } catch { return json({ ok: false, error: 'invalid_json' }, 400, request); }
    const message = String(payload?.message || '').trim();
    if (!message) return json({ ok: false, error: 'message_required' }, 400, request);
    if (message.length > MAX_INPUT) return json({ ok: false, error: 'message_too_large' }, 413, request);
    if (!env.OPENAI_API_KEY) return json({ ok: false, error: 'chat_provider_not_configured' }, 503, request);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: env.PI_CHAT_MODEL || 'gpt-4o-mini',
          temperature: 0.2,
          max_tokens: 900,
          messages: [
            { role: 'system', content: "You are PI, an autonomous intelligence assistant coordinated by Krishna. Answer the user's actual question directly and naturally. Do not repeat generic templates. If current external facts or an external action cannot be verified, say what is missing instead of inventing it. Never claim an action was completed unless it actually was. For multi-step objectives, separate planned work from completed work." },
            { role: 'user', content: message }
          ]
        })
      });
      const body = await response.json();
      if (!response.ok) return json({ ok: false, error: 'chat_provider_unavailable' }, 503, request);
      const answer = body?.choices?.[0]?.message?.content?.trim();
      if (!answer) return json({ ok: false, error: 'empty_model_response' }, 502, request);
      return json({ ok: true, answer, source: 'pi-chat-model', truth: 'model-response' }, 200, request);
    } catch {
      return json({ ok: false, error: 'chat_provider_unavailable' }, 503, request);
    }
  }
};
