import assert from 'node:assert/strict';
import { decideKrishnaRoute, validateKrishnaAnswer } from './krishna-core.mjs';

const direct = await decideKrishnaRoute({
  message: '2+2',
  directTools: [
    { name: 'miss', run: async () => null },
    { name: 'math', run: async () => ({ ok:true, answer:'4', truth:'deterministic-verified', verification:'local-calculation' }) }
  ],
  requiresLiveEvidence: () => true,
  requiresHardReasoning: () => true
});
assert.equal(direct.route, 'direct');
assert.equal(direct.result.answer, '4');

const live = await decideKrishnaRoute({
  message: 'weather today',
  requiresLiveEvidence: () => true,
  requiresHardReasoning: () => true
});
assert.equal(live.route, 'live');

const hard = await decideKrishnaRoute({
  message: 'prove why this architecture is safe',
  requiresLiveEvidence: () => false,
  requiresHardReasoning: () => true
});
assert.equal(hard.route, 'hard');

const general = await decideKrishnaRoute({ message: 'hello' });
assert.equal(general.route, 'general');

assert.equal(validateKrishnaAnswer({
  ok:true,
  answer:'The answer is 4.',
  truth:'deterministic-verified',
  verification:'local-calculation'
},{route:'direct'}).ok,true);

assert.equal(validateKrishnaAnswer({
  ok:true,
  answer:'Classification: BUSINESS_OBJECTIVE\nPlan: ...',
  truth:'model-response'
}).reason,'internal_planner_leakage');

assert.equal(validateKrishnaAnswer({
  ok:true,
  answer:'It is sunny.',
  truth:'model-response'
},{route:'live'}).reason,'live_route_without_live_truth');

assert.equal(validateKrishnaAnswer({
  ok:true,
  answer:'Current weather is 80F.',
  truth:'live-data-response',
  sources:[{url:'https://example.com'}]
},{route:'live'}).ok,true);

assert.equal(validateKrishnaAnswer({
  ok:true,
  answer:'Verified result.',
  truth:'verified-model-response'
}).reason,'verified_claim_without_independent_pass');

console.log('Krishna core routing and answer contract tests passed.');
