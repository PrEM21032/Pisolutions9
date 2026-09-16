const FAILURE_TAXONOMY = Object.freeze([
  'execution_failure',
  'verification_failure',
  'evidence_gap',
  'routing_failure',
  'tool_failure',
  'model_failure',
  'permission_failure',
  'timeout',
  'contradiction',
  'unknown_failure'
]);

function clean(value) {
  return String(value ?? '').trim();
}

export function diagnoseFailure({ missionId, failure, taxonomy, rootCause, evidence = [] } = {}) {
  if (!clean(missionId)) throw new Error('mission_id_required');
  if (!clean(failure)) throw new Error('failure_required');
  const category = FAILURE_TAXONOMY.includes(taxonomy) ? taxonomy : 'unknown_failure';
  if (!clean(rootCause)) throw new Error('root_cause_required');
  if (!Array.isArray(evidence) || evidence.length === 0) throw new Error('diagnosis_evidence_required');
  return Object.freeze({ missionId: clean(missionId), failure: clean(failure), taxonomy: category, rootCause: clean(rootCause), evidence: [...evidence] });
}

export function createPreventionAction({ diagnosis, correction, prevention, regressionTest = null, guard = null } = {}) {
  if (!diagnosis?.missionId || !diagnosis?.rootCause) throw new Error('diagnosis_required');
  if (!clean(correction) || !clean(prevention)) throw new Error('correction_and_prevention_required');
  if (!regressionTest && !guard) throw new Error('prevention_evidence_required');
  return Object.freeze({
    missionId: diagnosis.missionId,
    taxonomy: diagnosis.taxonomy,
    correction: clean(correction),
    prevention: clean(prevention),
    regressionTest: regressionTest ? clean(regressionTest) : null,
    guard: guard ? clean(guard) : null,
    evidence: [...diagnosis.evidence]
  });
}

export function verifyLearningAction(action) {
  if (!action?.missionId || !action?.correction || !action?.prevention) return { verified: false, reason: 'incomplete_learning_action' };
  if (!Array.isArray(action.evidence) || action.evidence.length === 0) return { verified: false, reason: 'no_evidence' };
  if (!action.regressionTest && !action.guard) return { verified: false, reason: 'no_prevention_mechanism' };
  return { verified: true, reason: 'failure_to_prevention_chain_supported' };
}

export { FAILURE_TAXONOMY };
