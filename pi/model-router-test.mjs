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
console.log(JSON.stringify({ ok: true, primaryAttempted: true, fallbackSelected: true, verifiedShape: true }));
