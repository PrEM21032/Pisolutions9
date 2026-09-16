import assert from 'node:assert/strict';
import { createRuntime } from './runtime.mjs';

const missions = new Map();
const state = {
  async save(mission) {
    const stored = structuredClone(mission);
    missions.set(stored.id, stored);
    return stored;
  },
  async load(id) { return missions.get(id) || null; },
  async findByIdempotencyKey(key) {
    return [...missions.values()].find(mission => mission.context?.idempotencyKey === key) || null;
  },
  async list() { return [...missions.values()]; },
  async clear() { missions.clear(); }
};

const runtime = createRuntime({
  state,
  netra: { inspect: () => ({ allowed: true, severity: 'low', findings: [] }) },
  v2MaxParallel: 2
});

const mission = await runtime.submit('Build a market research system', {
  idempotencyKey: 'v2-runtime-test'
});

assert.equal(mission.missionGraph.maxParallel, 2);
assert.ok(Array.isArray(mission.missionGraph.steps));
assert.ok(mission.missionGraph.steps.some(step => step.specialist === 'business'));
assert.equal(mission.missionGraph.steps.at(-1).id, 'verify');
assert.deepEqual(
  mission.missionGraph.steps.at(-1).dependsOn,
  mission.missionGraph.steps.slice(0, -1).map(step => step.id)
);

const sameMission = await runtime.submit('Build a market research system', {
  idempotencyKey: 'v2-runtime-test'
});
assert.equal(sameMission.id, mission.id);
assert.deepEqual(sameMission.missionGraph, mission.missionGraph);

assert.throws(() => createRuntime({
  state,
  netra: { inspect: () => ({ allowed: true, severity: 'low', findings: [] }) },
  v2MaxParallel: 0
}), /invalid_v2_max_parallel/);

console.log('PI V2 runtime integration tests passed');
