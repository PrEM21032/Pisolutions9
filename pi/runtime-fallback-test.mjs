import { createRuntime } from './runtime.mjs';
import { createStateAdapter } from './state-adapter.mjs';

function createTestState() {
  const backing = new Map();
  return createStateAdapter({
    save(mission) { const copy = structuredClone(mission); backing.set(copy.id, copy); return structuredClone(copy); },
    load(id) { const value = backing.get(id); return value ? structuredClone(value) : null; },
    findByIdempotencyKey(key) { for (const value of backing.values()) if (value?.context?.idempotencyKey === key) return structuredClone(value); return null; },
    list() { return [...backing.values()].map(value => structuredClone(value)); },
    clear() { backing.clear(); }
  });
}

const state = createTestState();
let primaryCalls = 0;
const runtime = createRuntime({
  state,
  execute: async () => { primaryCalls += 1; throw new Error('provider_unavailable'); },
  alternatives: [
    { name: 'deterministic-pi', safe: true, execute: async mission => ({
      status: 'completed',
      completed: [{ verified: true, claim: 'fallback execution completed', missionId: mission.id }],
      evidence: [{ source: 'deterministic-pi', claim: 'primary provider unavailable; safe fallback executed' }],
      uncertainty: ['Primary provider was unavailable; fallback path used.']
    }) }
  ]
});

const mission = await runtime.submit('Continue if the primary intelligence provider fails', { idempotencyKey: 'fallback-1' });
const outcome = await runtime.cycle();
if (primaryCalls !== 1) throw new Error('primary_not_attempted');
if (outcome.status !== 'completed') throw new Error('fallback_did_not_complete');
if (!outcome.completed.some(item => item.verified === true && item.claim.includes('fallback'))) throw new Error('fallback_result_missing');
if (!outcome.evidence.some(item => item.source === 'deterministic-pi')) throw new Error('fallback_evidence_missing');

const gateState = createTestState();
const gatedRuntime = createRuntime({
  state: gateState,
  execute: async () => { throw new Error('authorization_needed'); },
  alternatives: []
});
await gatedRuntime.submit('Perform a protected action', { idempotencyKey: 'human-gate-1' });
const gatedOutcome = await gatedRuntime.cycle();
if (gatedOutcome.status !== 'blocked') throw new Error('human_gate_not_blocked');
if (gatedOutcome.nextAction !== 'owner_required') throw new Error('owner_gate_not_reported');
if (gatedRuntime.queue.size() !== 0) throw new Error('human_gate_should_not_retry');

console.log(JSON.stringify({ ok: true, primaryAttempted: true, fallbackExecuted: true, verified: true, ownerGateImmediate: true, ownerNotRequiredForSafeFallback: true, missionId: mission.id }));
