import { createModelRouter } from './model-router.mjs';

let primaryCalls = 0;
const router = createModelRouter({
  adapters: {
    primary: async () => { primaryCalls += 1; throw new Error('provider_unavailable'); },
    fallback: async input => ({
      truth: 'probable',
      completed: [{ verified: true, claim: 'fallback model executed', objective: input.objective }],
      evidence: [{ source: 'fallback-model', claim: 'primary failed and fallback executed' }],
      nextAction: null,
      uncertainty: ['Primary provider unavailable.']
    })
  },
  fallbackProviders: ['primary', 'fallback']
});

const result = await router.run({ objective: 'test adaptive model fallback' }, { provider: 'primary' });
if (!result.ok || result.provider !== 'fallback') throw new Error('model_fallback_failed');
if (primaryCalls !== 1) throw new Error('primary_not_attempted');
if (!result.value.completed?.[0]?.verified) throw new Error('fallback_not_verified');
if (result.attempts.length !== 2) throw new Error('attempt_trace_missing');

const adversarialProviders = ['gpt-5.6-luna', 'fallback-llm', 'glm-4.7-flash', 'gemma-4-26b'];
for (const mode of ['empty', 'malformed', 'timeout']) {
  let calls = 0;
  const adversarial = createModelRouter({
    adapters: Object.fromEntries(adversarialProviders.map((name, index) => [name, async () => {
      calls += 1;
      if (mode === 'timeout') await new Promise((_, reject) => setTimeout(() => reject(new Error('provider_timeout')), 1));
      if (mode === 'empty') return {};
      if (mode === 'malformed') return { truth: 'verified', completed: [], evidence: [] };
      return {};
    }])),
    fallbackProviders: adversarialProviders
  });
  const failed = await adversarial.run({ objective: `adversarial ${mode}` });
  if (failed.ok) throw new Error(`adversarial_${mode}_accepted`);
  if (failed.reason !== 'all_model_providers_failed') throw new Error(`adversarial_${mode}_reason_missing`);
  if (failed.attempts.length !== adversarialProviders.length) throw new Error(`adversarial_${mode}_coverage_missing`);
  if (calls !== adversarialProviders.length) throw new Error(`adversarial_${mode}_providers_not_exercised`);
}

const healthy = createModelRouter({
  adapters: Object.fromEntries(adversarialProviders.map(name => [name, async () => ({
    truth: 'probable',
    completed: [{ verified: false, claim: `${name} completed analysis` }],
    evidence: [{ source: name, claim: 'fixture evidence' }],
    uncertainty: ['Fixture result requires independent verification.'],
    nextAction: null
  })])),
  fallbackProviders: adversarialProviders
});
const healthyResult = await healthy.run({ objective: 'all model adapters healthy' });
if (!healthyResult.ok || !adversarialProviders.includes(healthyResult.provider)) throw new Error('healthy_model_matrix_failed');

console.log(JSON.stringify({ ok: true, primaryAttempted: true, fallbackSelected: true, verifiedShape: true, adversarialModes: ['empty', 'malformed', 'timeout'], modelMatrix: adversarialProviders }));
