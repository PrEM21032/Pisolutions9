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


const originalFetch2 = globalThis.fetch;
const vendorAttempts = [];
globalThis.fetch = async (url, init = {}) => {
  const body = JSON.parse(init.body || '{}');
  vendorAttempts.push({url:String(url), model:body.model});
  if (String(url).startsWith('https://api.openai.com/')) {
    return new Response(JSON.stringify({ error: { code:'insufficient_quota', message:'quota' } }), {
      status:429, headers:{'content-type':'application/json'}
    });
  }
  if (String(url).startsWith('https://fallback.example/')) {
    return new Response(JSON.stringify({ output_text:'Independent fallback answered successfully.' }), {
      status:200, headers:{'content-type':'application/json'}
    });
  }
  throw new Error('unexpected provider URL');
};

try {
  const request = new Request('https://pi.test/api/chat', {
    method:'POST',
    headers:{'content-type':'application/json',origin:'https://pisolutions9.github.io'},
    body:JSON.stringify({message:'Explain why backups matter in one sentence.'})
  });
  const response = await worker.fetch(request, {
    OPENAI_API_KEY:'openai-test-key',
    PI_CHAT_MODEL:'model-a',
    PI_FALLBACK_API_KEY:'fallback-test-key',
    PI_FALLBACK_API_URL:'https://fallback.example/v1',
    PI_FALLBACK_MODEL:'fallback-model'
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.answer, 'Independent fallback answered successfully.');
  assert.equal(vendorAttempts.filter(x => x.url.startsWith('https://api.openai.com/')).length, 1);
  assert.equal(vendorAttempts.filter(x => x.url.startsWith('https://fallback.example/')).length, 1);
  console.log('PI quota-aware independent vendor failover test passed');
} finally {
  globalThis.fetch = originalFetch2;
}
