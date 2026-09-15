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
    completed: [{ verified: true, claim: 'continuous cycle executed', missionId: mission.id }],
    evidence: [{ source: 'runtime-continuous-test', claim: 'bounded cycle execution verified' }]
  })
});

await runtime.submit('cycle one', { idempotencyKey: 'continuous-1' });
await runtime.submit('cycle two', { idempotencyKey: 'continuous-2' });
const result = await runtime.runCycles({ maxCycles: 5 });
const executedResults = result.cycles.filter(item => item.status !== 'idle');

if (result.status !== 'completed') throw new Error('continuous_cycle_failed');
if (result.executedCycles !== 2) throw new Error(`continuous_cycle_count_failed:${result.executedCycles}`);
if (executedResults.length !== 2) throw new Error(`continuous_cycle_result_count_failed:${executedResults.length}`);
if (executedResults.some(item => item.status !== 'completed')) throw new Error('continuous_cycle_outcome_failed');

console.log(JSON.stringify({ ok: true, continuousCycles: true, executedCycles: result.executedCycles, bounded: true }));
