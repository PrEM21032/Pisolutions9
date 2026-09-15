import { createRuntime } from './runtime.mjs';
import { verifyOutcome } from './verify.mjs';
import { clearState, listMissions } from './state.mjs';

clearState();
const runtime = createRuntime({
  execute: async mission => ({
    status: 'completed',
    completed: [{ verified: true, missionId: mission.id, claim: 'test execution completed' }],
    evidence: [{ source: 'local-runtime-test', claim: 'execution path returned a result' }]
  }),
  verify: async outcome => {
    const checked = verifyOutcome(outcome);
    if (!checked.ok) throw new Error('independent_verification_failed');
    return outcome;
  }
});

const mission = await runtime.submit('Execute and verify a PI runtime test');
const outcome = await runtime.cycle();
if (outcome.status !== 'completed') throw new Error('runtime_execution_failed');
if (!outcome.completed?.length) throw new Error('no_completed_result');
if (!listMissions().some(item => item.id === mission.id)) throw new Error('state_persistence_adapter_failed');
console.log(JSON.stringify({ ok: true, missionId: mission.id, status: outcome.status, verified: true }, null, 2));
