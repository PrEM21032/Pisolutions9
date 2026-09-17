import assert from 'node:assert/strict';
import { createAutonomousRecovery } from './autonomous-recovery.mjs';

let repaired = 0;
const recovery = createAutonomousRecovery({
  repair: async ({ error }) => {
    repaired += 1;
    assert.equal(error.message, 'temporary_failure');
    return {
      status: 'repaired',
      completed: [{ verified: true, claim: 'repair path completed' }],
      evidence: [{ source: 'autonomous-repair-test', claim: 'safe repair executed' }]
    };
  }
});

const fixed = await recovery.recover({ mission: { id: 'm1' }, error: new Error('temporary_failure') });
assert.equal(fixed.status, 'completed');
assert.equal(fixed.ownerRequired, false);
assert.equal(repaired, 1);
assert.ok(fixed.trace.some(step => step.phase === 'diagnose'));
assert.ok(fixed.trace.some(step => step.action === 'repair'));

const fallback = createAutonomousRecovery({
  alternatives: [{
    name: 'alternate-path',
    safe: true,
    execute: async () => ({
      status: 'completed',
      completed: [{ verified: true, claim: 'alternate path completed' }],
      evidence: [{ source: 'autonomous-recovery-test', claim: 'alternate path verified' }]
    })
  }]
});
const alternate = await fallback.recover({ mission: { id: 'm2' }, error: new Error('provider_unavailable') });
assert.equal(alternate.status, 'completed');
assert.equal(alternate.selected, 'alternate-path');
assert.ok(alternate.trace.some(step => step.action === 'alternative'));

const retry = await fallback.recover({ mission: { id: 'm3' }, error: new Error('temporary_failure') });
assert.equal(retry.status, 'completed');

const gated = await fallback.recover({ mission: { id: 'm4' }, error: new Error('authorization_needed') });
assert.equal(gated.status, 'blocked');
assert.equal(gated.ownerRequired, true);
assert.ok(gated.trace.some(step => step.action === 'escalate'));

console.log(JSON.stringify({ ok: true, diagnose: true, repair: true, alternative: true, boundedRetry: true, humanGatePreserved: true }));
