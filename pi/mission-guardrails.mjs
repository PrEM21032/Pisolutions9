const DEFAULT_LIMITS = Object.freeze({
  maxActions: 25,
  maxModelCalls: 10,
  maxToolCalls: 50,
  maxRetries: 3,
  maxMissionMs: 300000,
  maxInputChars: 8000
});

const HIGH_IMPACT_PATTERNS = [
  /\b(send|transfer|wire|pay|purchase)\b.{0,80}\b(money|funds|payment|cash)\b/i,
  /\b(delete|destroy|drop|purge)\b.{0,80}\b(database|repository|account|production|data)\b/i,
  /\b(change|rotate|revoke|disable)\b.{0,80}\b(password|credential|secret|api key|security)\b/i,
  /\b(sign|accept|agree)\b.{0,80}\b(contract|legal|terms)\b/i
];

const INJECTION_PATTERNS = [
  /ignore (all|any|previous|prior) (instructions|rules|policies)/i,
  /reveal (the )?(system|developer|hidden) (prompt|instructions)/i,
  /disable (security|netra|verification|safety)/i,
  /bypass (security|authentication|approval|permission)/i,
  /act as (the )?(system|developer|owner)/i
];

export function classifyMissionRisk(objective = '') {
  const text = String(objective);
  if (HIGH_IMPACT_PATTERNS.some(pattern => pattern.test(text))) return 'L3';
  if (/\b(deploy|production|publish|merge|modify|update|create|execute)\b/i.test(text)) return 'L2';
  if (/\b(run|test|research|analyze|draft|calculate)\b/i.test(text)) return 'L1';
  return 'L0';
}

export function inspectInstructionBoundary(text = '') {
  const value = String(text);
  const findings = INJECTION_PATTERNS
    .filter(pattern => pattern.test(value))
    .map(pattern => pattern.source);
  return {
    trusted: findings.length === 0,
    findings,
    reason: findings.length ? 'untrusted_instruction_pattern_detected' : 'no_known_instruction_injection_pattern'
  };
}

export function createMissionGuardrails({ limits = {}, clock = () => Date.now() } = {}) {
  const effective = Object.freeze({ ...DEFAULT_LIMITS, ...limits });
  for (const [name, value] of Object.entries(effective)) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`invalid_guardrail_${name}`);
  }
  const startedAt = clock();
  let actions = 0;
  let modelCalls = 0;
  let toolCalls = 0;
  let retries = 0;

  function snapshot() {
    return {
      actions,
      modelCalls,
      toolCalls,
      retries,
      elapsedMs: Math.max(0, clock() - startedAt),
      limits: effective
    };
  }

  function checkBudget(kind, amount = 1) {
    if (!Number.isFinite(amount) || amount < 0) throw new Error('invalid_guardrail_increment');
    if (kind === 'action') actions += amount;
    else if (kind === 'model') modelCalls += amount;
    else if (kind === 'tool') toolCalls += amount;
    else if (kind === 'retry') retries += amount;
    else throw new Error('unknown_guardrail_budget');

    const current = snapshot();
    const checks = [
      ['actions', current.actions, effective.maxActions, 'action_budget_exceeded'],
      ['modelCalls', current.modelCalls, effective.maxModelCalls, 'model_call_budget_exceeded'],
      ['toolCalls', current.toolCalls, effective.maxToolCalls, 'tool_call_budget_exceeded'],
      ['retries', current.retries, effective.maxRetries, 'retry_budget_exceeded'],
      ['elapsedMs', current.elapsedMs, effective.maxMissionMs, 'mission_time_budget_exceeded']
    ];
    const exceeded = checks.find(([, value, max]) => value > max);
    if (exceeded) throw new Error(exceeded[3]);
    return current;
  }

  return {
    limits: effective,
    risk(objective) { return classifyMissionRisk(objective); },
    boundary(text) { return inspectInstructionBoundary(text); },
    action() { return checkBudget('action'); },
    model() { return checkBudget('model'); },
    tool() { return checkBudget('tool'); },
    retry() { return checkBudget('retry'); },
    snapshot
  };
}

export function memoryAdmission({ value, source = 'unknown', confidence = 0 } = {}) {
  const text = String(value ?? '').trim();
  const score = Number(confidence);
  const sourceTrusted = ['owner', 'verified-system', 'verified-result'].includes(source);
  const accepted = Boolean(text) && sourceTrusted && Number.isFinite(score) && score >= 0.8 && !inspectInstructionBoundary(text).findings.length;
  return {
    accepted,
    reason: accepted ? 'memory_admitted' : 'memory_rejected_or_unverified',
    source,
    confidence: score
  };
}
