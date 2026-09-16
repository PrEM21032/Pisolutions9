const ALLOWED_ORIGIN = 'https://pisolutions9.github.io';
const MAX_INPUT = 8000;
const MAX_OUTPUT_TOKENS = 500;
const MAX_RATE_LIMIT_RETRIES = 2;

function corsHeaders(origin) {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...(origin === ALLOWED_ORIGIN ? { 'access-control-allow-origin': ALLOWED_ORIGIN } : {}),
    'access-control-allow-methods': 'POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    vary: 'Origin'
  };
}

function json(body, status, request, extraHeaders = {}) {
  const origin = request.headers.get('Origin') || '';
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), ...extraHeaders }
  });
}

function providerError(response) {
  if (response.status === 401) return { error: 'chat_provider_auth_failed', status: 502 };
  if (response.status === 403) return { error: 'chat_provider_access_denied', status: 502 };
  if (response.status === 404) return { error: 'chat_provider_model_or_endpoint_not_found', status: 502 };
  if (response.status === 429) return { error: 'chat_provider_rate_limited', status: 503 };
  if (response.status >= 500) return { error: 'chat_provider_server_error', status: 503 };
  if (response.status >= 400) return { error: 'chat_provider_request_rejected', status: 502 };
  return { error: 'chat_provider_unavailable', status: 503 };
}

function retryDelayMs(response, attempt) {
  const retryAfter = Number(response.headers.get('retry-after'));
  if (Number.isFinite(retryAfter) && retryAfter >= 0 && retryAfter <= 2) return retryAfter * 1000;
  return 250 * (2 ** attempt);
}

function rateLimitHeaders(response) {
  const headers = {};
  for (const name of ['x-ratelimit-limit-requests', 'x-ratelimit-remaining-requests', 'x-ratelimit-reset-requests']) {
    const value = response.headers.get(name);
    if (value) headers[name] = value;
  }
  return headers;
}

async function callOpenAI(env, message) {
  const model = env.PI_CHAT_MODEL || 'gpt-5.6-luna';
  let lastResponse;
  for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model,
        store: false,
        max_output_tokens: MAX_OUTPUT_TOKENS,
        instructions: "You are PI, an autonomous intelligence assistant coordinated by Krishna. Answer the user's actual question directly and naturally. Do not repeat generic templates or expose internal routing, classification, planning, tool, or verification language. If current external facts or an external action cannot be verified, say what is missing instead of inventing it. Never claim an action was completed unless it actually was. For multi-step objectives, separate planned work from completed work.",
        input: message
      })
    });
    if (response.ok || response.status !== 429 || attempt === MAX_RATE_LIMIT_RETRIES) return response;
    lastResponse = response;
    const delay = retryDelayMs(response, attempt);
    if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
  }
  return lastResponse;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    if (url.pathname !== '/api/chat') return new Response('Not found', { status: 404 });
    if (origin && origin !== ALLOWED_ORIGIN) return json({ ok: false, error: 'origin_not_allowed' }, 403, request);
    if (request.method === 'OPTIONS') return json({ ok: true }, 204, request);
    if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405, request);

    let payload;
    try { payload = await request.json(); } catch { return json({ ok: false, error: 'invalid_json' }, 400, request); }
    const message = String(payload?.message || '').trim();
    if (!message) return json({ ok: false, error: 'message_required' }, 400, request);
    if (message.length > MAX_INPUT) return json({ ok: false, error: 'message_too_large' }, 413, request);
    if (!env.OPENAI_API_KEY) return json({ ok: false, error: 'chat_provider_not_configured' }, 503, request);

    try {
      const response = await callOpenAI(env, message);
      if (!response.ok) {
        const failure = providerError(response);
        const headers = failure.error === 'chat_provider_rate_limited' ? rateLimitHeaders(response) : {};
        return json({ ok: false, error: failure.error }, failure.status, request, headers);
      }
      const body = await response.json();
      const answer = body?.output_text?.trim() || body?.output?.flatMap(item => item?.content || []).find(part => part?.type === 'output_text')?.text?.trim();
      if (!answer) return json({ ok: false, error: 'empty_model_response' }, 502, request);
      return json({ ok: true, answer, source: 'pi-chat-model', truth: 'model-response' }, 200, request);
    } catch {
      return json({ ok: false, error: 'chat_provider_network_error' }, 503, request);
    }
  }
};
