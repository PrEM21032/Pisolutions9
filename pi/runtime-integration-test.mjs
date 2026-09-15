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

const runtime = createRuntime({
  state,
  execute: async mission => ({
    status: 'completed',
    completed: [{ verified: true, claim: 'integration test executed', missionId: mission.id }],
    evidence: [{ source: 'runtime-integration-test', claim: 'state adapter and runtime executed together' }]
  })
});

const first = await runtime.submit('Run runtime integration test', { idempotencyKey: 'integration-1' });
const duplicate = await runtime.submit('Run runtime integration test again', { idempotencyKey: 'integration-1' });
if (first.id !== duplicate.id) throw new Error('runtime_idempotency_failed');

const outcome = await runtime.cycle();
if (outcome.status !== 'completed') throw new Error('runtime_cycle_failed');
const stored = await state.load(first.id);
if (!stored?.result || stored.status !== 'completed') throw new Error('runtime_state_persistence_failed');

console.log(JSON.stringify({ ok: true, stateAdapter: true, idempotency: true, execution: true, verification: true }));
