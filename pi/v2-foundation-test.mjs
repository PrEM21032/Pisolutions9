import assert from 'node:assert/strict';
import { createMissionGraph, getRunnableSteps, isMissionComplete } from './mission-graph.mjs';
import { getSpecialistContract, validateSpecialistResult } from './specialist-contracts.mjs';
import { createV2MissionGraph } from './v2-mission-plan.mjs';

const graph = createMissionGraph({
  missionId: 'v2-foundation',
  objective: 'validate V2 mission orchestration',
  maxParallel: 2,
  steps: [
    { id: 'research', specialist: 'research', dependsOn: [], state: 'completed' },
    { id: 'business', specialist: 'business', dependsOn: [], state: 'completed' },
    { id: 'engineering', specialist: 'engineering', dependsOn: ['research'], state: 'queued' },
    { id: 'data', specialist: 'data-finance', dependsOn: [], state: 'queued' },
    { id: 'verify', specialist: 'research', dependsOn: ['engineering', 'business'], state: 'queued' }
  ]
});

assert.deepEqual(getRunnableSteps(graph).map(step => step.id), ['engineering', 'data']);
assert.equal(isMissionComplete(graph), false);
assert.equal(getSpecialistContract('engineering').requiresKrishna, true);
assert.equal(getSpecialistContract('engineering').canBypassOwnerGate, false);
assert.equal(validateSpecialistResult('engineering', {
  result: 'verified test output',
  evidence: [{ source: 'test', detail: 'deterministic fixture' }],
  truthLevel: 'verified',
  failureClass: 'unknown'
}), true);
assert.throws(() => getSpecialistContract('unknown-specialist'), /unknown specialist/);
assert.throws(() => createMissionGraph({ missionId: 'cycle', objective: 'cycle', steps: [
  { id: 'a', dependsOn: ['b'] }, { id: 'b', dependsOn: ['a'] }
]}), /cycle/);
assert.throws(() => createMissionGraph({ missionId: 'dup', objective: 'dup', steps: [
  { id: 'a', dependsOn: [] }, { id: 'a', dependsOn: [] }
]}), /duplicate mission step/);
assert.throws(() => createMissionGraph({ missionId: 'unknown', objective: 'unknown', steps: [
  { id: 'a', dependsOn: ['missing'] }
]}), /unknown dependency/);
assert.throws(() => createMissionGraph({ missionId: 'self', objective: 'self', steps: [
  { id: 'a', dependsOn: ['a'] }
]}), /self dependency/);
assert.throws(() => validateSpecialistResult('research', {
  result: 'bad', evidence: [], truthLevel: 'certain', failureClass: 'unknown'
}), /truthLevel/);
assert.throws(() => validateSpecialistResult('research', {
  result: 'bad', evidence: 'not-an-array', truthLevel: 'unknown', failureClass: 'unknown'
}), /evidence/);

for (const terminalState of ['blocked', 'dead-lettered']) {
  const dependencyGraph = createMissionGraph({
    missionId: `${terminalState}-dependency`,
    objective: `${terminalState} work cannot unlock dependents`,
    steps: [
      { id: 'dependency', dependsOn: [], state: terminalState },
      { id: 'downstream', dependsOn: ['dependency'], state: 'queued' }
    ]
  });
  assert.deepEqual(getRunnableSteps(dependencyGraph), []);
}

const verifiedDependency = createMissionGraph({
  missionId: 'verified-dependency',
  objective: 'verified work unlocks dependents',
  steps: [
    { id: 'verified', dependsOn: [], state: 'verified' },
    { id: 'downstream', dependsOn: ['verified'], state: 'queued' }
  ]
});
assert.deepEqual(getRunnableSteps(verifiedDependency).map(step => step.id), ['downstream']);

const parallelGraph = createMissionGraph({
  missionId: 'parallel-limit',
  objective: 'bounded parallelism',
  maxParallel: 2,
  steps: [
    { id: 'a', dependsOn: [] },
    { id: 'b', dependsOn: [] },
    { id: 'c', dependsOn: [] }
  ]
});
assert.deepEqual(getRunnableSteps(parallelGraph).map(step => step.id), ['a', 'b']);

const planned = createV2MissionGraph({
  id: 'mission-plan-test',
  objective: 'build a market research system',
  specialists: ['business', 'research', 'data', 'security']
}, { maxParallel: 2 });
assert.deepEqual(getRunnableSteps(planned).map(step => step.specialist), ['business', 'research']);
assert.equal(planned.steps.at(-1).id, 'verify');
assert.deepEqual(planned.steps.at(-1).dependsOn, planned.steps.slice(0, -1).map(step => step.id));

console.log('PI V2 foundation tests passed');
