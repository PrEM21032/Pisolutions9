import assert from 'node:assert/strict';
import { createPersonalAIV2 } from './personal-ai-v2.mjs';

const pi = createPersonalAIV2({ ownerId: 'test-owner', maxMemory: 2 });

const memory = pi.remember({ content: 'Build a durable objective-driven system', tags: ['goal', 'build'] });
assert.equal(memory.ownerId, 'test-owner');
assert.equal(pi.recall('durable').length, 1);
pi.remember({ content: 'Second memory' });
pi.remember({ content: 'Third memory' });
assert.equal(pi.snapshot().memoryCount, 2);

pi.setPreference('responseStyle', 'simple-humble-sharp');
assert.equal(pi.getPreferences().responseStyle, 'simple-humble-sharp');

const goal = pi.createGoal({ title: 'Reach the next verified phase', horizon: 'long' });
pi.addMilestone(goal.id, 'Build');
pi.addMilestone(goal.id, 'Verify');
const task = pi.createTask({ title: 'Run verification', goalId: goal.id });
assert.equal(task.status, 'ready');

const agent = pi.assignAgent({ role: 'verification', capabilities: ['testing', 'evidence'] });
assert.equal(agent.status, 'available');

const opportunity = pi.addOpportunity({ title: 'Safe improvement', evidence: [{ source: 'test', claim: 'observed' }] });
assert.equal(opportunity.status, 'detected');
assert.equal(pi.learnSkill('evidence-review').learned, true);
assert.deepEqual(pi.link(goal.id, 'drives', task.id), { from: goal.id, relation: 'drives', to: task.id });

assert.equal(pi.authorize({ type: 'inspect' }).allowed, true);
assert.equal(pi.authorize({ type: 'financial_transfer' }).allowed, false);
assert.equal(pi.authorize({ type: 'financial_transfer' }).nextAction, 'owner_required');

const snapshot = pi.snapshot();
assert.equal(snapshot.phaseRange, '47-57');
assert.equal(snapshot.protectedActionGate, true);
assert.equal(snapshot.goalCount, 1);
assert.equal(snapshot.agentCount, 1);
assert.equal(snapshot.skillCount, 1);
assert.equal(snapshot.auditEvents, 3);

console.log(JSON.stringify({ ok: true, phases: '47-57', memory: true, personalization: true, goals: true, tasks: true, team: true, proactive: true, learning: true, graph: true, privacyGate: true, integration: true }));
