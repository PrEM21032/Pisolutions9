import { planNoGpt, executeNoGptPlan } from './no-gpt-engine.mjs';

const cases = [
  ['What is photosynthesis?', 'information', 'information'],
  ['Should I start this business with a $10000 budget?', 'decision_support', 'decision-support'],
  ['Build a landing page for my business.', 'creation', 'creation'],
  ['My app keeps failing after deployment. Fix it.', 'troubleshooting', 'troubleshooting'],
  ['Research the Indian agricultural export market.', 'research', 'research'],
  ['Plan the steps to launch my business this month.', 'planning', 'planning']
];

const plans = cases.map(([objective, expectedIntent, expectedRoute]) => {
  const plan = planNoGpt(objective);
  if (plan.intent !== expectedIntent) throw new Error(`intent_mismatch:${objective}:${plan.intent}`);
  if (plan.route !== expectedRoute) throw new Error(`route_mismatch:${objective}:${plan.route}`);
  const result = executeNoGptPlan(plan);
  if (result.status !== 'completed' || !result.evidence?.length) throw new Error(`execution_verification_missing:${objective}`);
  return plan;
});

const signatures = new Set(plans.map(plan => `${plan.route}|${plan.tasks.join(',')}`));
if (signatures.size !== cases.length) throw new Error('materially_different_objectives_collapsed_to_same_plan');

const vague = planNoGpt('help me');
if (vague.route !== 'clarification') throw new Error('vague_objective_should_require_clarification');

console.log(JSON.stringify({ ok: true, cases: cases.length, distinctPlans: signatures.size, clarification: true, truth: 'verified' }));
