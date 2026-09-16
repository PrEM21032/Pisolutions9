import fs from 'node:fs';
import assert from 'node:assert/strict';

const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

const forbiddenCustomerCopy = [
  'I recognized this as an informational question',
  'Classification:',
  'Plan:',
  'I will answer directly when the required knowledge is available.'
];

for (const phrase of forbiddenCustomerCopy) {
  assert.equal(app.includes(phrase), false, `customer UI must not contain leaked phrase: ${phrase}`);
}

assert.match(app, /PI’s live answer service is temporarily unavailable/);
assert.match(app, /answer\.textContent = response\.message/);
assert.match(app, /meta\.textContent = source/);
assert.match(app, /chatApiUrl\(\)/);

console.log('Customer UI regression tests passed.');
