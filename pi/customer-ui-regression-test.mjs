import fs from 'node:fs';
import assert from 'node:assert/strict';

const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

const forbiddenCustomerCopy = [
  'I recognized this as an informational question',
  'Classification:',
  'Plan:',
  'decompose_question',
  'respond_or_request_required_data'
];

for (const phrase of forbiddenCustomerCopy) {
  assert.equal(app.includes(phrase), false, `customer UI must not contain internal phrase: ${phrase}`);
}

assert.match(app, /showCustomerResponse\(text, \{ title: 'PI', message: 'PI’s live answer service is temporarily unavailable/);
assert.match(app, /answer\.textContent = response\.message/);
assert.match(app, /meta\.textContent = source/);
assert.match(app, /chatApiUrl\(\)/);

console.log('Customer UI regression tests passed.');
