const HUMAN_BOUNDARY_REASONS = new Set([
  'credentials_required',
  'permission_required',
  'human_authorization_required',
  'legal_authorization_required',
  'financial_commitment_required',
  'irreversible_action_required',
  'physical_capability_required',
  'high_risk_disagreement'
]);

const DEFAULT_ALTERNATIVES = Object.freeze([
  { name: 'retry_with_backoff', strategy: 'retry', safe: true },
  { name: 'reduced_scope', strategy: 'reduce_scope', safe: true },
  { name: 'degraded_mode', strategy: 'degraded_mode', safe: true }
]);

export function classifyProblem(error) {
  const reason = String(error?.code || error?.message || error || 'unknown_problem');
  const humanRequired = HUMAN_BOUNDARY_REASONS.has(reason)
    || /credential|permission|authorization|legal|financial|irreversible|physical|safety|high.?risk/i.test(reason);
  return Object.freeze({ reason, humanRequired, safeToAct: !humanRequired });
}

export function buildRecoveryDecision({ error, alternatives = DEFAULT_ALTERNATIVES, attempted = [] } = {}) {
  const classification = classifyProblem(error);
  if (classification.humanRequired) {
    return Object.freeze({
      action: 'escalate',
      ownerRequired: true,
      reason: classification.reason,
      attempted: [...attempted],
      alternatives: []
    });
  }

  const available = alternatives
    .filter(option => option && option.safe !== false && typeof option.name === 'string')
    .filter(option => !attempted.includes(option.name))
    .slice(0, 3);

  if (!available.length) {
    return Object.freeze({
      action: 'retry',
      ownerRequired: false,
      reason: classification.reason,
      attempted: [...attempted],
      alternatives: []
    });
  }

  return Object.freeze({
    action: 'recover',
    ownerRequired: false,
    reason: classification.reason,
    attempted: [...attempted],
    alternatives: available
  });
}

export function nextRecoveryAction({ error, alternatives, attempted = [], maxAttempts = 3 } = {}) {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) throw new Error('invalid_recovery_budget');
  if (attempted.length >= maxAttempts) {
    return { action: 'blocked', ownerRequired: false, reason: 'recovery_budget_exhausted', attempted: [...attempted], alternatives: [] };
  }
  return buildRecoveryDecision({ error, alternatives, attempted });
}
