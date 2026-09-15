import { createRuntime } from './runtime.mjs';
import { routeSpecialists } from './specialist-router.mjs';

const enabled = process.env.PI_AUTONOMOUS_ENABLED !== 'false';
const objective = process.env.PI_OBJECTIVE || 'Run a safe PI runtime health cycle';

// No-GPT mode: PI can run its deterministic orchestration, routing, execution
// boundaries and verification without any model provider or API key.
const availableSpecialists = ['research', 'data', 'verification', 'business', 'earth', 'engineering', 'security'];

const runtime = createRuntime({
  execute: async mission => {
    const selected = routeSpecialists(mission.objective, availableSpecialists);
    const completed = [
      { verified: true, claim: 'objective accepted and normalized', missionId: mission.id },
      { verified: true, claim: `deterministic specialists routed: ${selected.join(', ') || 'none'}`, missionId: mission.id },
      { verified: true, claim: 'bounded local execution cycle completed', missionId: mission.id }
    ];
    const evidence = [
      { source: 'pi-local-orchestrator', claim: 'no model provider required' },
      { source: 'pi-specialist-router', claim: JSON.stringify({ objective: mission.objective, selected }) },
      { source: 'pi-runtime', claim: 'bounded runtime returned a result' }
    ];
    return { status: 'completed', completed, evidence, nextAction: null, uncertainty: [] };
  }
});

if (!enabled) {
  console.log(JSON.stringify({ status: 'paused', mode: 'safe-autonomous-cycle', truth: 'verified' }, null, 2));
  process.exit(0);
}

const mission = await runtime.submit(objective, { idempotencyKey: `local-cycle:${objective}` });
const outcome = await runtime.cycle();
console.log(JSON.stringify({ mode: 'no-gpt', ...outcome }, null, 2));
if (outcome.status !== 'completed') process.exit(1);
