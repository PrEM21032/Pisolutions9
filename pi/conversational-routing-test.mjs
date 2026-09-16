import assert from 'node:assert/strict';
import { planNoGpt, executeNoGptPlan } from './no-gpt-engine.mjs';

const cases = [
  ['Hi', 'conversation', 'greeting'],
  ['What is 2 + 2?', 'conversation', 'math'],
  ['What is the weather today?', 'conversation', 'weather'],
  ['What time is it in Tokyo?', 'conversation', 'time'],
  ['Convert 5 miles to kilometers', 'conversation', 'conversion'],
  ['Explain photosynthesis', 'conversation', 'explanation'],
  ['Research the Indian pesticide market', 'mission', null],
  ['Build and test the next PI capability', 'mission', null]
];

for (const [input, route, intent] of cases) {
  const plan = planNoGpt(input);
  assert.equal(plan.route, route, input);
  if (intent) assert.equal(plan.intent, intent, input);
  const result = executeNoGptPlan(plan);
  assert.equal(result.status, 'completed', input);
  if (route === 'conversation') assert.ok(result.customerResponse?.message, input);
}

const protectedLikeMission = planNoGpt('Transfer $500 to my account');
assert.equal(protectedLikeMission.route, 'mission');
assert.notEqual(protectedLikeMission.domains[0], 'conversation');

console.log(JSON.stringify({ ok: true, test: 'conversational-routing', cases: cases.length + 1, truth: 'verified' }));
