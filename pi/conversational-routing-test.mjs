import assert from 'node:assert/strict';
import { planNoGpt, executeNoGptPlan } from './no-gpt-engine.mjs';

const cases = [
  ['Hi', 'conversation', 'greeting'],
  ['What is 2 + 2?', 'conversation', 'math'],
  ['What is the weather today?', 'conversation', 'weather'],
  ['What time is it in Tokyo?', 'conversation', 'time'],
  ['Convert 5 miles to kilometers', 'conversation', 'conversion'],
  ['Explain photosynthesis', 'conversation', 'explanation']
];

for (const [input, route, intent] of cases) {
  const plan = planNoGpt(input);
  assert.equal(plan.route, route, input);
  if (intent) assert.equal(plan.intent, intent, input);
  const result = executeNoGptPlan(plan);
  assert.equal(result.status, 'completed', input);
  if (route === 'conversation') assert.ok(result.customerResponse?.message, input);
}

// V1 human-first acceptance: materially different objectives must route differently.
const objectiveCases = [
  ['Research the Indian pesticide market', 'research', 'research'],
  ['Build and test the next PI capability', 'creation', 'engineering'],
  ['Why is the API failing?', 'conversation', 'troubleshooting'],
  ['Should I compare these two business options?', 'decision-support', 'business'],
  ['Make a roadmap for launching PI', 'planning', 'engineering'],
  ['What is photosynthesis?', 'information', 'general']
];

const objectivePlans = objectiveCases.map(([input]) => planNoGpt(input));
for (let i = 0; i < objectiveCases.length; i += 1) {
  const [input, route, domain] = objectiveCases[i];
  assert.equal(objectivePlans[i].route, route, input);
  assert.equal(objectivePlans[i].intent, objectivePlans[i].humanUnderstanding.intents[0], input);
  assert.equal(objectivePlans[i].domains.includes(domain), true, input);
  if (route !== 'conversation') assert.equal(objectivePlans[i].planner, 'human-first-router', input);
}
assert.equal(new Set(objectivePlans.map(plan => plan.route)).size, objectiveCases.length, 'objectives collapsed into same route');

const vague = planNoGpt('help');
assert.equal(vague.route, 'clarification');
assert.equal(vague.humanUnderstanding.needsClarification, true);
assert.equal(executeNoGptPlan(vague).customerResponse?.title, 'Clarification needed');

const protectedLikeMission = planNoGpt('Transfer $500 to my account');
assert.notEqual(protectedLikeMission.route, 'conversation');

console.log(JSON.stringify({ ok: true, test: 'conversational-routing', humanFirst: true, cases: cases.length + objectiveCases.length + 2, truth: 'verified' }));
