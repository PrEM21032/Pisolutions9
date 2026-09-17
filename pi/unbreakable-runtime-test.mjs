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

let executions = 0;
let release;
const gate = new Promise(resolve => { release = resolve; });
const runtime = createRuntime({
  state,
  execute: async mission => {
    executions += 1;
    await gate;
    return {
      status: 'completed',
      completed: [{ verified: true, claim: 'cycle survived concurrency guard', missionId: mission.id }],
      evidence: [{ source: 'unbreakable-runtime-test', claim: 'single-flight execution verified' }]
    };
  }
});

await runtime.submit('single flight', { idempotencyKey: 'single-flight-1' });
const first = runtime.cycle();
await new Promise(resolve => setTimeout(resolve, 0));
const second = await runtime.cycle();
if (second.status !== 'blocked' || second.nextAction !== 'retry_later') throw new Error('overlap_guard_failed');
release();
const firstResult = await first;
if (firstResult.status !== 'completed') throw new Error('primary_cycle_failed');
if (executions !== 1) throw new Error(`duplicate_execution_failed:${executions}`);

const duplicateA = runtime.queue.enqueue({ id: 'dedupe-1', objective: 'same' });
const duplicateB = runtime.queue.enqueue({ id: 'dedupe-1', objective: 'same' });
if (duplicateA !== duplicateB || runtime.queue.size() !== 1) throw new Error('queue_dedup_failed');

console.log(JSON.stringify({ ok: true, singleFlight: true, queueDeduplication: true, executions }));
