import { createRuntime } from './runtime.mjs';
import { planNoGpt, executeNoGptPlan } from './no-gpt-engine.mjs';
import { createOpenAIResponsesProvider, createModelProviderAdapters, createConfiguredModelProvider } from './model-adapters.mjs';
import { createModelRouter } from './model-router.mjs';

const enabled = process.env.PI_AUTONOMOUS_ENABLED !== 'false';
const objective = process.env.PI_OBJECTIVE || 'Run a safe PI runtime health cycle';

const deterministic = createConfiguredModelProvider({
  name: 'deterministic',
  capabilities: ['reasoning', 'local-execution'],
  run: async input => executeNoGptPlan(planNoGpt(input?.objective || objective))
});
const openai = process.env.OPENAI_API_KEY ? createOpenAIResponsesProvider() : null;
const adapters = createModelProviderAdapters([openai, deterministic]);
const modelRouter = createModelRouter({ adapters, fallbackProviders: ['openai', 'deterministic'] });

// PI prefers GPT when configured. If GPT is unavailable, the router immediately
// falls through to deterministic PI execution without requiring the owner.
const runtime = createRuntime({
  execute: async mission => {
    const routed = await modelRouter.run({ objective: mission.objective, missionId: mission.id });
    if (!routed.ok) {
      const error = new Error(routed.reason || 'intelligence_providers_failed');
      error.code = routed.reason === 'all_model_providers_failed' ? 'provider_unavailable' : routed.reason;
      throw error;
    }
    return {
      ...routed.value,
      evidence: [
        ...(routed.value.evidence || []),
        { source: `model-router:${routed.provider}`, claim: JSON.stringify({ attempts: routed.attempts }) }
      ]
    };
  },
  alternatives: [
    { name: 'deterministic-pi', safe: true, execute: async mission => executeNoGptPlan(planNoGpt(mission.objective)) }
  ]
});

if (!enabled) {
  console.log(JSON.stringify({ status: 'paused', mode: 'adaptive-intelligence', providers: modelRouter.available(), truth: 'verified' }, null, 2));
  process.exit(0);
}

const mission = await runtime.submit(objective, { idempotencyKey: `local-cycle:${objective}` });
const outcome = await runtime.cycle();
console.log(JSON.stringify({ mode: 'adaptive-intelligence', providers: modelRouter.available(), ...outcome }, null, 2));
if (outcome.status !== 'completed') process.exit(1);
