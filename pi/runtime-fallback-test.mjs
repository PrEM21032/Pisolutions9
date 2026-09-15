import { createRuntime } from './runtime.mjs';
import { createStateAdapter } from './state-adapter.mjs';

const backing = new Map();
const state = createStateAdapter({
  save(mission) { const copy = structuredClone(mission); backing.set(copy.id, copy); return structuredClone(copy); },
  load(id) { const value = backing.get(id); return value ? structuredClone(value) : null; },
  findByIdempotencyKey(key) { for (const value of backing.values()) if (value?.context?.idempotencyKey === key) return structuredClone(value); return null; },
  list() { return [...backing.values()].map(value => structuredClone(value)); },
  clear() { backing.clear(); }
});

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
console.log(JSON.stringify({ ok: true, primaryAttempted: true, fallbackExecuted: true, verified: true, ownerNotRequired: true, missionId: mission.id }));
