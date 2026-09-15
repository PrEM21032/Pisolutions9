import { createRuntime } from './runtime.mjs';
import { verifyOutcome } from './verify.mjs';
import { clearState } from './state.mjs';
clearState();
const runtime = createRuntime({
  execute: async mission => ({ status: 'completed', completed: [{ verified: true, missionId: mission.id }], evidence: [{ source: 'smoke', claim: 'execution returned' }] }),
  verify: async outcome => { const check = verifyOutcome(outcome); if (!check.ok) throw new Error('verification_failed'); return outcome; }
});
const mission = await runtime.submit('runtime smoke');
const outcome = await runtime.cycle();
if (outcome.status !== 'completed' || !outcome.completed?.[0]?.verified) throw new Error('smoke_failed');
console.log(JSON.stringify({ ok: true, missionId: mission.id, status: outcome.status, verified: true }));
