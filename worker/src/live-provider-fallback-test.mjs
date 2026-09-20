import assert from 'node:assert/strict';
import worker from './index.js';

const originalFetch = globalThis.fetch;
const seenModels = [];
globalThis.fetch = async (_url, init = {}) => {
  const body = JSON.parse(init.body || '{}');
  seenModels.push(body.model);
  if (seenModels.length === 1) {
    return new Response(JSON.stringify({ error: { message: 'busy' } }), {
      status: 429,
      headers: { 'content-type': 'application/json' }
    });
  }
  return new Response(JSON.stringify({
    output_text: 'It is 78°F right now.',
    output: [{ type:'web_search_call', action:{ sources:[{ url:'https://example.com/weather', title:'Weather' }] } }]
  }), { status:200, headers:{'content-type':'application/json'} });
};

try {
  const request = new Request('https://pi.test/api/chat', {
    method:'POST',
    headers:{'content-type':'application/json',origin:'https://pisolutions9.github.io'},
    body:JSON.stringify({message:'What is the weather right now?'})
  });
  const response = await worker.fetch(request, { OPENAI_API_KEY:'test-key', PI_WEB_MODEL:'model-a', PI_CHAT_MODEL:'model-b' });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.truth, 'web-grounded-model-response');
  assert.deepEqual(seenModels.slice(0,2), ['model-a','model-b']);
  console.log('PI live provider fallback test passed');
} finally {
  globalThis.fetch = originalFetch;
}
