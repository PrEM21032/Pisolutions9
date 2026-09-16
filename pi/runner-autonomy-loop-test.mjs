import fs from 'node:fs';
import assert from 'node:assert/strict';

const runner = fs.readFileSync(new URL('./runner.mjs', import.meta.url), 'utf8');
const workflow = fs.readFileSync(new URL('../.github/workflows/pi-team-24x7.yml', import.meta.url), 'utf8');

assert.match(runner, /PI_MAX_CYCLES/);
assert.match(runner, /Math\.min\(parsedMaxCycles, 10\)/);
assert.match(runner, /runtime\.runCycles\(\{ maxCycles \}\)/);
assert.match(runner, /if \(outcome\.status !== 'completed'\) process\.exit\(1\)/);
assert.match(workflow, /PI_MAX_CYCLES: '3'/);
assert.match(workflow, /run: node pi\/runner\.mjs/);

console.log(JSON.stringify({ ok: true, boundedAutonomousLoop: true, maxCycles: 3, hardCap: 10, failureExit: true }));
