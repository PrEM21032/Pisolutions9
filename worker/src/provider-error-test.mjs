import assert from 'node:assert/strict';
import { providerError } from './provider-error.mjs';
import worker from './index.js';

for (const code of ['insufficient_quota','billing_hard_limit_reached',
  'organization_spend_limit_exceeded','organization_usage_limit_exceeded']) {
  const response = new Response(JSON.stringify({error:{code,message:'sensitive-canary'}}),{status:429});
  assert.deepEqual(await providerError(response), {error:'chat_provider_quota_exhausted',status:503});
}
for (const body of ['broken-json', JSON.stringify({error:{code:'rate_limit_exceeded'}}), 'x'.repeat(8193)]) {
  assert.deepEqual(await providerError(new Response(body,{status:429})), {error:'chat_provider_rate_limited',status:503});
}
const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async () => new Response(JSON.stringify({error:{code:'insufficient_quota',message:'sensitive-canary'}}),{status:429});
  const response = await worker.fetch(new Request('https://pi.test/api/chat',{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({message:'What is the weather today in Mobile, Alabama?'})
  }),{OPENAI_API_KEY:'test-key'});
  const body = await response.json();
  assert.equal(response.status,503);
  assert.equal(body.ok,false);
  assert.equal(body.error,'chat_provider_quota_exhausted');
  assert.equal(body.truth,'unknown');
  assert.doesNotMatch(JSON.stringify(body),/sensitive-canary|test-key/);
} finally { globalThis.fetch = originalFetch; }
console.log('Provider quota classification and live truth-boundary tests passed.');
