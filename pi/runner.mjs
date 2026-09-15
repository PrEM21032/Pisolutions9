import { createRuntime } from './runtime.mjs';
import { planNoGpt, executeNoGptPlan } from './no-gpt-engine.mjs';

const enabled = process.env.PI_AUTONOMOUS_ENABLED !== 'false';
const objective = process.env.PI_OBJECTIVE || 'Run a safe PI runtime health cycle';

// No-GPT mode is the default execution path. It uses deterministic rules and
// local code only; it does not require an LLM, model provider, or API key.
const runtime = createRuntime({
  execute: async mission => {
    const plan = planNoGpt(mission.objective);
    return executeNoGptPlan(plan);
  }
});

if (!enabled) {
  console.log(JSON.stringify({ status: 'paused', mode: 'no-gpt', truth: 'verified' }, null, 2));
  process.exit(0);
}

const mission = await runtime.submit(objective, { idempotencyKey: `local-cycle:${objective}` });
const outcome = await runtime.cycle();
console.log(JSON.stringify({ mode: 'no-gpt', ...outcome }, null, 2));
if (outcome.status !== 'completed') process.exit(1);
