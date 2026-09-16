import assert from 'node:assert/strict';
import { diagnoseFailure, createPreventionAction, verifyLearningAction } from './learning-prevention.mjs';

const diagnosis = diagnoseFailure({
  missionId: 'mission_test',
  failure: 'tool timed out',
  taxonomy: 'timeout',
  rootCause: 'tool exceeded bounded execution window',
  evidence: [{ source: 'runtime-test', claim: 'timeout observed' }]
});
assert.equal(diagnosis.taxonomy, 'timeout');

const action = createPreventionAction({
  diagnosis,
  correction: 'retry once with bounded backoff',
  prevention: 'add timeout regression coverage',
  regressionTest: 'learning-prevention-test: timeout must produce prevention action'
});
assert.deepEqual(verifyLearningAction(action), { verified: true, reason: 'failure_to_prevention_chain_supported' });

assert.deepEqual(verifyLearningAction({ ...action, evidence: [] }), { verified: false, reason: 'no_evidence' });
assert.deepEqual(verifyLearningAction({ ...action, regressionTest: null }), { verified: false, reason: 'no_prevention_mechanism' });
assert.throws(() => diagnoseFailure({ missionId: 'x', failure: 'x', taxonomy: 'timeout', rootCause: 'x' }), /diagnosis_evidence_required/);
assert.throws(() => createPreventionAction({ diagnosis, correction: 'fix', prevention: 'prevent' }), /prevention_evidence_required/);

console.log('learning-prevention-test: PASS');
