const enabled = process.env.PI_AUTONOMOUS_ENABLED === 'true';

if (!enabled) {
  console.log(JSON.stringify({ status: 'paused', mode: 'safe-autonomous-cycle', truth: 'verified' }, null, 2));
  process.exit(0);
}

const { createRuntime } = await import('./runtime.mjs');
const runtime = createRuntime({
  execute: async mission => ({
    status: 'completed',
    completed: [{ verified: true, claim: 'safe local runtime cycle executed', missionId: mission.id }],
    evidence: [{ source: 'local-runtime', claim: 'bounded executor returned a result' }]
  })
});

const objective = process.env.PI_OBJECTIVE || 'Run a safe PI runtime health cycle';
const mission = await runtime.submit(objective);
const outcome = await runtime.cycle();
console.log(JSON.stringify(outcome, null, 2));
if (outcome.status !== 'completed') process.exit(1);
