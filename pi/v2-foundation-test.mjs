import assert from 'node:assert/strict';
import { createMissionGraph, getRunnableSteps, isMissionComplete } from './mission-graph.mjs';
import { getSpecialistContract, validateSpecialistResult } from './specialist-contracts.mjs';

const graph = createMissionGraph({
  missionId: 'v2-test',
  objective: 'validate specialist coordination',
  maxParallel: 2,
  steps: [
    { id: 'research', specialist: 'research', dependsOn: [], state: 'completed' },
    { id: 'business', specialist: 'business', dependsOn: [], state: 'completed' },
    { id: 'engineering', specialist: 'engineering', dependsOn: ['research'], state: 'queued' },
    { id: 'verify', specialist: 'research', dependsOn: ['engineering', 'business'], state: 'queued' }
  ]
});
assert.deepEqual(getRunnableSteps(graph).map(step => step.id), ['engineering']);
assert.equal(isMissionComplete(graph), false);
assert.equal(getSpecialistContract('engineering').requiresKrishna, true);
assert.equal(getSpecialistContract('engineering').canBypassOwnerGate, false);
assert.equal(validateSpecialistResult('engineering', {
  result: 'verified test output',
  evidence: [{ source: 'test', detail: 'deterministic fixture' }],
  truthLevel: 'verified',
  failureClass: 'unknown'
}), true);
assert.throws(() => createMissionGraph({ missionId: 'cycle', objective: 'cycle', steps: [
  { id: 'a', dependsOn: ['b'] }, { id: 'b', dependsOn: ['a'] }
]}), /cycle/);
assert.throws(() => validateSpecialistResult('research', {
  result: 'bad', evidence: [], truthLevel: 'certain', failureClass: 'unknown'
}), /truthLevel/);
console.log('PI V2 foundation tests passed');
