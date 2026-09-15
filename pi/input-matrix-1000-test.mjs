import { planNoGpt, executeNoGptPlan } from './no-gpt-engine.mjs';
import { createPersonalAIV2 } from './personal-ai-v2.mjs';
import { createPersonalExecutionBridge } from './personal-execution-bridge.mjs';

const templates = [
  'Research {topic} and compare available evidence',
  'Analyze {topic} for business opportunities and constraints',
  'Build and test {topic} software feature',
  'Plan {topic} agriculture project using available data',
  'Find the best evidence for {topic}',
  'Compare {topic} options and identify tradeoffs',
  'Investigate {topic} and verify what is known',
  'Study {topic} and create a bounded decision plan',
  'Develop an export strategy for {topic}',
  'Review {topic} and identify the next safe action'
];
const topics = [
  'Indian agriculture exports','satellite crop monitoring','Vijayawada market demand','software reliability','import pricing','solar energy','geospatial land data','customer research','supply chains','semiconductors'
];

const inputs = [];
for (const template of templates) for (const topic of topics) for (let i = 0; i < 10; i += 1) {
  inputs.push(template.replace('{topic}', `${topic} case ${i + 1}`));
}
if (inputs.length !== 1000 || new Set(inputs).size !== 1000) throw new Error('input_matrix_not_1000_unique');

let passed = 0;
const failures = [];
for (let i = 0; i < inputs.length; i += 1) {
  const input = inputs[i];
  try {
    const plan = planNoGpt(input);
    if (!plan.objective || !plan.domains?.length || !plan.tasks?.length || plan.planner !== 'deterministic-rule-engine') throw new Error('invalid_plan');
    const output = executeNoGptPlan(plan);
    if (output.status !== 'completed' || !output.completed?.every(item => item.verified === true) || !output.evidence?.length) throw new Error('invalid_output');

    const ai = createPersonalAIV2({ maxMemory: 2 });
    ai.remember({ content: input, tags: ['stress', String(i)] });
    if (ai.recall(input).length !== 1) throw new Error('memory_recall_failed');

    const bridge = createPersonalExecutionBridge({ actions: {
      inspect: async value => ({ inspected: true, value }),
      verify: async value => ({ verified: true, value })
    }});
    const safe = await bridge.execute({ type: 'inspect', input: { index: i } });
    if (safe.status !== 'completed' || safe.truth !== 'verified') throw new Error('safe_execution_failed');
    const gated = await bridge.execute({ type: 'financial_transfer', input: { amount: 1 } });
    if (gated.status !== 'blocked' || gated.nextAction !== 'owner_required') throw new Error('protected_gate_failed');
    passed += 1;
  } catch (error) {
    failures.push({ index: i + 1, input, error: error.message });
  }
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, total: inputs.length, passed, failed: failures.length, failures: failures.slice(0, 20) }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, total: 1000, unique: new Set(inputs).size, passed, failed: 0, planning: true, outputs: true, memory: true, safeExecution: true, protectedGates: true, evidence: true, truth: 'verified' }));
