import { deterministicFallback } from './deterministic-fallback.mjs';

const ALLOWED_ORIGIN = 'https://pisolutions9.github.io';
const MAX_INPUT = 8000;
const MAX_OUTPUT_TOKENS = 500;
const MAX_RATE_LIMIT_RETRIES = 2;
const DEFAULT_EDGE_MODEL = '@cf/zai-org/glm-4.7-flash';
const EDGE_ALTERNATIVE_MODEL = '@cf/google/gemma-4-26b-a4b-it';
const PI_INSTRUCTIONS = "You are PI, an autonomous intelligence assistant coordinated by Krishna. Answer the user's actual question directly and naturally. Do not expose internal routing, classification, planning, tool, or verification language. If current facts or an external action cannot be verified, say what is missing instead of inventing it. Never claim an action was completed unless it actually was.";

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
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(origin), ...extraHeaders } });
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

async function callProvider({ apiKey, model, baseUrl, message }) {
  let lastResponse;
  for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/responses`, {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        store: false,
        max_output_tokens: MAX_OUTPUT_TOKENS,
        instructions: PI_INSTRUCTIONS,
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

function extractAnswer(body) {
  return body?.output_text?.trim() || body?.output?.flatMap(item => item?.content || []).find(part => part?.type === 'output_text')?.text?.trim();
}

function extractEdgeAnswer(result) {
  if (typeof result === 'string') return result.trim() || null;
  const direct = result?.response?.trim?.() || result?.output_text?.trim?.() || result?.choices?.[0]?.message?.content?.trim?.();
  if (direct) return direct;
  const content = result?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) return content.map(part => part?.text || part?.content || '').join('').trim() || null;
  return null;
}

async function callWorkersAI(env, message) {
  if (!env.AI || typeof env.AI.run !== 'function') return null;
  const configured = env.PI_EDGE_MODEL || DEFAULT_EDGE_MODEL;
  const models = [...new Set([configured, EDGE_ALTERNATIVE_MODEL])];
  let lastError = null;
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const result = await env.AI.run(model, {
          messages: [
            { role: 'system', content: PI_INSTRUCTIONS },
            { role: 'user', content: message }
          ],
          max_tokens: MAX_OUTPUT_TOKENS
        });
        const answer = extractEdgeAnswer(result);
        if (answer) return answer;
        lastError = new Error(`empty response from ${model}`);
      } catch (error) {
        lastError = error;
      }
    }
  }
  throw lastError || new Error('edge model unavailable');
}

function recoveryResponse(message, request, failure) {
  const answer = deterministicFallback(message);
  if (!answer) return null;
  const headers = failure?.response && failure.failure.error === 'chat_provider_rate_limited' ? rateLimitHeaders(failure.response) : {};
  return json({ ok: true, answer, source: 'pi-chat-deterministic-recovery', truth: 'deterministic', providerFailure: failure?.failure?.error || 'chat_provider_unavailable' }, 200, request, headers);
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

    const providers = [];
    if (env.OPENAI_API_KEY) providers.push({ name: 'openai', apiKey: env.OPENAI_API_KEY, model: env.PI_CHAT_MODEL || 'gpt-5.6-luna', baseUrl: 'https://api.openai.com/v1' });
    if (env.PI_FALLBACK_API_KEY && env.PI_FALLBACK_API_URL && env.PI_FALLBACK_MODEL) providers.push({ name: 'fallback', apiKey: env.PI_FALLBACK_API_KEY, model: env.PI_FALLBACK_MODEL, baseUrl: env.PI_FALLBACK_API_URL });

    let lastFailure = null;
    for (const provider of providers) {
      try {
        const response = await callProvider({ ...provider, message });
        if (!response.ok) {
          lastFailure = { response, failure: providerError(response), provider: provider.name };
          if (response.status === 429 || response.status >= 500) continue;
          const recovered = recoveryResponse(message, request, lastFailure);
          return recovered || json({ ok: false, error: lastFailure.failure.error }, lastFailure.failure.status, request);
        }
        const body = await response.json();
        const answer = extractAnswer(body);
        if (!answer) {
          lastFailure = { failure: { error: 'empty_model_response', status: 502 }, provider: provider.name };
          continue;
        }
        return json({ ok: true, answer, source: `pi-chat-${provider.name}`, truth: 'model-response' }, 200, request);
      } catch {
        lastFailure = { failure: { error: 'chat_provider_network_error', status: 503 }, provider: provider.name };
      }
    }

    try {
      const answer = await callWorkersAI(env, message);
      return json({ ok: true, answer, source: 'pi-chat-cloudflare-ai', truth: 'model-response', recoveredFrom: lastFailure?.failure?.error || null }, 200, request);
    } catch {
      lastFailure = { failure: { error: 'edge_model_unavailable', status: 503 }, provider: 'cloudflare-ai' };
    }

    const recovered = recoveryResponse(message, request, lastFailure);
    if (recovered) return recovered;

    const failure = lastFailure?.failure || { error: 'chat_provider_unavailable', status: 503 };
    const headers = lastFailure?.response && failure.error === 'chat_provider_rate_limited' ? rateLimitHeaders(lastFailure.response) : {};
    return json({ ok: false, error: failure.error }, failure.status, request, headers);
  }
};
