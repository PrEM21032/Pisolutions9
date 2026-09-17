import assert from 'node:assert/strict';
import { createV2MissionGraph } from './v2-mission-plan.mjs';
import { executeV2Graph } from './v2-execution.mjs';
import { createExecutionPolicy } from './policy.mjs';
import { createRuntime } from './runtime.mjs';
import { validateSpecialistResult } from './specialist-contracts.mjs';

const mission = {
  id: 'v2-release-gate-mission',
  objective: 'Build and verify a specialist workflow',
  specialists: ['research', 'engineering', 'business', 'data', 'earth']
};

const graph = createV2MissionGraph(mission, { maxParallel: 2 });
assert.equal(graph.maxParallel, 2);
assert.equal(graph.steps.length, 6);

let active = 0;
let maxActive = 0;
const executionOrder = [];
const result = await executeV2Graph(graph, {
  executeSpecialist: async (name, input, step) => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    executionOrder.push(`start:${step.id}`);
    await new Promise(resolve => setTimeout(resolve, 5));
    active -= 1;
    executionOrder.push(`end:${step.id}`);
    return {
      result: `${name} completed`,
      evidence: [{ source: 'v2-release-gate-fixture', claim: name }],
      truthLevel: 'verified',
      failureClass: 'unknown'
    };
  },
  verifySpecialist: async value => value
});

assert.equal(result.status, 'completed');
assert.equal(maxActive, 2);
assert.equal(result.completed.length, 6);
assert.ok(result.graph.steps.every(step => step.state === 'verified'));
const verifyIndex = executionOrder.findIndex(item => item === 'start:verify');
assert.ok(verifyIndex > -1);
assert.ok(executionOrder.slice(0, verifyIndex).every(item => item.startsWith('end:specialist_')));

const policy = createExecutionPolicy();
for (const type of ['irreversible_external_action', 'legal_commitment', 'financial_transfer', 'secret_rotation', 'production_destructive_change']) {
  assert.equal(policy.requiresApproval(type), true);
  assert.equal(policy.checkAction({ tool: 'fixture', type }).ok, false);
  assert.equal(policy.checkAction({ tool: 'fixture', type, approved: true }).ok, true);
}

const badEvidence = {
  result: 'unverified',
  evidence: [],
  truthLevel: 'verified',
  failureClass: 'unknown'
};
assert.doesNotThrow(() => validateSpecialistResult('research', badEvidence));
assert.equal(badEvidence.evidence.length, 0);

const missions = new Map();
const state = {
  async save(value) { const stored = structuredClone(value); missions.set(stored.id, stored); return stored; },
  async load(id) { return missions.get(id) || null; },
  async findByIdempotencyKey(key) { return [...missions.values()].find(item => item.context?.idempotencyKey === key) || null; },
  async list() { return [...missions.values()]; },
  async clear() { missions.clear(); }
};
const runtime = createRuntime({
  state,
  netra: { inspect: () => ({ allowed: true, severity: 'low', findings: [] }) },
  executeSpecialist: async name => ({ result: `${name} done`, evidence: [{ source: 'fixture', claim: name }], truthLevel: 'verified', failureClass: 'unknown' }),
  verifySpecialist: async value => value,
  v2MaxParallel: 2
});
const first = await runtime.submit('idempotency mission', { idempotencyKey: 'release-gate-idempotency' });
const second = await runtime.submit('idempotency mission', { idempotencyKey: 'release-gate-idempotency' });
assert.equal(first.id, second.id);
const runtimeOutcome = await runtime.cycle();
assert.equal(runtimeOutcome.status, 'completed');

console.log('PI V2 release gate passed');
