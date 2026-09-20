import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { verifyProviderConfiguration } from './verify-provider-configuration.mjs';

// A dashboard-managed runtime secret is valid without a duplicate CI secret.
assert.doesNotThrow(() => verifyProviderConfiguration([{name:'OPENAI_API_KEY',type:'secret_text'}]));
for (const bindings of [[], null, {}, [{name:'OPEN_AI_API_KEY',type:'secret_text'}],
  [{name:'OPENAI_API_KEY',type:'plain_text'}], [{name:'PI_FALLBACK_API_KEY',type:'secret_text'}]]) {
  assert.throws(() => verifyProviderConfiguration(bindings));
}
// Fail closed on malformed CLI output, without printing any input contents.
const cli = fileURLToPath(new URL('./verify-provider-configuration.mjs', import.meta.url));
for (const input of ['not-json-sensitive-canary', '[]', '{}']) {
  const result = spawnSync(process.execPath, [cli], {input, encoding:'utf8'});
  assert.equal(result.status, 1);
  assert.doesNotMatch(result.stdout + result.stderr, /sensitive-canary/);
}
const valid = spawnSync(process.execPath, [cli], {
  input:JSON.stringify([{name:'OPENAI_API_KEY',type:'secret_text'}]), encoding:'utf8'
});
assert.equal(valid.status, 0);
console.log('Deployed provider configuration gate tests passed.');
