import { createRuntime } from './runtime.mjs';
import { createStateAdapter } from './state-adapter.mjs';
import { createPersonalAIV2 } from './personal-ai-v2.mjs';
import { createPersonalExecutionBridge } from './personal-execution-bridge.mjs';
import { planNoGpt, executeNoGptPlan } from './no-gpt-engine.mjs';

const ITERATIONS = 100;
let passed = 0;

for (let i = 1; i <= ITERATIONS; i += 1) {
  const personalAI = createPersonalAIV2({ maxMemory: 3 });
  personalAI.remember({ content: `owner zero-cost preference ${i}`, tags: ['cost'] });
  const goal = personalAI.createGoal({ title: `V1 stress goal ${i}` });
  personalAI.addMilestone(goal.id, 'verify');
  personalAI.createTask({ goalId: goal.id, title: 'execute safely' });
  if (personalAI.recall(`zero-cost preference ${i}`).length !== 1) throw new Error(`memory_failed_${i}`);

  const bridge = createPersonalExecutionBridge({ actions: {
    inspect: async input => ({ inspected: true, input }),
    verify: async () => ({ verified: true })
  }});
  const safe = await bridge.execute({ type: 'inspect', input: { iteration: i } });
  if (safe.status !== 'completed' || safe.truth !== 'verified') throw new Error(`safe_failed_${i}`);
  const gated = await bridge.execute({ type: 'financial_transfer', input: { amount: i } });
  if (gated.status !== 'blocked' || gated.nextAction !== 'owner_required') throw new Error(`gate_failed_${i}`);

  const backing = new Map();
  const state = createStateAdapter({
    save(mission) { const copy = structuredClone(mission); backing.set(copy.id, copy); return structuredClone(copy); },
    load(id) { const value = backing.get(id); return value ? structuredClone(value) : null; },
    findByIdempotencyKey(key) { for (const value of backing.values()) if (value?.context?.idempotencyKey === key) return structuredClone(value); return null; },
    list() { return [...backing.values()].map(value => structuredClone(value)); },
    clear() { backing.clear(); }
  });
  const runtime = createRuntime({
    state,
    execute: async mission => {
      const result = executeNoGptPlan(planNoGpt(mission.objective));
      return { ...result, evidence: [...(result.evidence || []), { source: 'v1-stress-100', claim: `iteration:${i}` }] };
    }
  });
  const objective = `Build and verify PI V1 stress iteration ${i}`;
  const mission = await runtime.submit(objective, { idempotencyKey: `stress-${i}` });
  const duplicate = await runtime.submit(objective, { idempotencyKey: `stress-${i}` });
  if (mission.id !== duplicate.id) throw new Error(`idempotency_failed_${i}`);
  const outcome = await runtime.cycle();
  if (outcome.status !== 'completed' || !outcome.evidence?.length) throw new Error(`runtime_failed_${i}`);
  passed += 1;
}

if (passed !== ITERATIONS) throw new Error('stress_100_incomplete');
console.log(JSON.stringify({ ok: true, iterations: ITERATIONS, passed, memory: true, safeExecution: true, protectedGates: true, runtime: true, deterministicPath: true, idempotency: true, evidence: true, truth: 'verified' }));
