import { createRuntime } from './runtime.mjs';
import { createOwnerRuntimeBridge } from './owner-runtime.mjs';
import { createMemoryStateAdapter } from './state-adapter.mjs';

const state = createMemoryStateAdapter();
const runtime = createRuntime({
  state,
  execute: async mission => ({
    status: 'completed',
    completed: [{ verified: true, claim: mission.objective }],
    evidence: [{ source: 'owner-runtime-test', claim: 'bounded execution returned evidence' }]
  })
});
const bridge = createOwnerRuntimeBridge(runtime);
const request = await bridge.submit({ objective: 'Run owner bridge test', idempotencyKey: 'owner-bridge-e2e' });
if (!request.missionId || request.status !== 'planned') throw new Error('owner_submit_failed');
const outcome = await bridge.cycle();
if (outcome.status !== 'completed') throw new Error('owner_cycle_failed');
if (outcome.completed.length !== 1 || outcome.completed[0].verified !== true) throw new Error('owner_outcome_failed');
console.log(JSON.stringify({ ok: true, ownerRuntimeBridge: true, completed: outcome.completed.length }, null, 2));
