import { classifyProblem, buildRecoveryDecision, nextRecoveryAction } from './autonomous-problem-solving.mjs';

const safe = classifyProblem(new Error('temporary_failure'));
if (safe.humanRequired || !safe.safeToAct) throw new Error('safe_problem_misclassified');

const decision = buildRecoveryDecision({
  error: new Error('temporary_failure'),
  alternatives: [
    { name: 'primary_retry', safe: true },
    { name: 'alternate_path', safe: true }
  ]
});
if (decision.action !== 'recover' || decision.ownerRequired || decision.alternatives.length !== 2) {
  throw new Error('autonomous_recovery_decision_failed');
}

const afterAttempt = buildRecoveryDecision({
  error: new Error('temporary_failure'),
  alternatives: [{ name: 'alternate_path', safe: true }],
  attempted: ['alternate_path']
});
if (afterAttempt.ownerRequired || afterAttempt.action !== 'retry') throw new Error('recovery_continuation_failed');

const boundary = classifyProblem(new Error('credentials_required'));
if (!boundary.humanRequired || boundary.safeToAct) throw new Error('human_boundary_failed');

const blocked = nextRecoveryAction({
  error: new Error('temporary_failure'),
  attempted: ['a', 'b', 'c'],
  maxAttempts: 3
});
if (blocked.action !== 'blocked' || blocked.ownerRequired) throw new Error('recovery_budget_failed');

console.log(JSON.stringify({ ok: true, autonomousDiagnosis: true, autonomousDecision: true, humanBoundaryPreserved: true, boundedRecovery: true }));
