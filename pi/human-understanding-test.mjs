import assert from 'node:assert/strict';
import { understandHumanInput } from './human-understanding.mjs';

const decision = understandHumanInput('Should I buy this? I am not sure and need help today.');
assert.equal(decision.intents.includes('decision_support'), true);
assert.equal(decision.explicitObjective, false);
assert.equal(decision.needsClarification, false);
assert.equal(decision.emotionalSignals.some((s) => s.type === 'uncertainty'), true);
assert.equal(decision.emotionalSignals.some((s) => s.type === 'urgency'), true);

const troubleshooting = understandHumanInput('The app keeps failing. Fix the API error.');
assert.equal(troubleshooting.intents.includes('troubleshooting'), true);

const vague = understandHumanInput('help');
assert.equal(vague.needsClarification, true);

console.log('human-understanding-test: ok');
