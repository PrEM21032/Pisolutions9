import { createRuntime } from './runtime.mjs';
import { createMemoryStateStore } from './state-store.mjs';
import { verifyOutcome } from './verify.mjs';

const state = createMemoryStateStore();
const runtime = createRuntime({
  state,
  cost: { maxActions: 2, maxModelCalls: 1 },
  execute: async (mission, { policy }) => {
    const actionCheck = policy.checkAction({ tool: 'local-test' });
    if (!actionCheck.ok && actionCheck.reason !== 'tool_not_allowed') throw new Error(actionCheck.reason);
    return {
      status: 'completed',
      completed: [{ verified: true, missionId: mission.id, claim: 'foundation execution completed' }],
      evidence: [{ source: 'foundation-e2e', claim: 'bounded runtime returned a result' }]
    };
  },
  verify: async outcome => {
    const check = verifyOutcome(outcome);
    if (!check.ok) throw new Error('independent_verification_failed');
    return outcome;
  }
});

const key = 'foundation-e2e-unique';
const mission = await runtime.submit('Build and verify PI execution foundation', { idempotencyKey: key });
const duplicate = await runtime.submit('Build and verify PI execution foundation', { idempotencyKey: key });
if (duplicate.id !== mission.id) throw new Error('idempotency_failed');
if (!mission.delegation?.tasks?.length) throw new Error('delegation_missing');
const outcome = await runtime.cycle();
if (outcome.status !== 'completed') throw new Error('execution_failed');
if (!outcome.completed?.[0]?.verified) throw new Error('verification_missing');
if (!(await state.list()).some(item => item.id === mission.id)) throw new Error('state_adapter_failed');
console.log(JSON.stringify({ ok: true, status: outcome.status, delegated: mission.delegation.tasks.length, idempotent: true, verified: true }, null, 2));
