const CRITICAL_PATTERNS = [
  /disable\s+(netra|the\s+security\s+perimeter)/i,
  /bypass\s+netra/i,
  /turn\s+off\s+netra/i
];

const SUSPICIOUS_PATTERNS = [
  /ignore\s+(all|previous|prior)\s+instructions/i,
  /disable\s+(security|verification)/i,
  /bypass\s+(security|verification|approval)/i,
  /reveal\s+(secrets?|credentials?|tokens?)/i,
  /exfiltrat/i
];

const HIGH_RISK_TYPES = new Set([
  'financial_transfer',
  'legal_commitment',
  'secret_rotation',
  'production_destructive_change',
  'irreversible_external_action'
]);

export function createNetra({ clock = () => new Date().toISOString() } = {}) {
  const inspect = (target, phase = 'pre') => {
    const text = typeof target === 'string' ? target : JSON.stringify(target ?? {});
    const findings = [];
    if (!text.trim()) findings.push({ severity: 'medium', code: 'ambiguous_target', message: 'Target is empty or ambiguous' });
    for (const pattern of CRITICAL_PATTERNS) {
      if (pattern.test(text)) findings.push({ severity: 'critical', code: 'netra_bypass_attempt', message: 'Attempt to disable or bypass Netra detected' });
    }
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(text)) findings.push({ severity: 'high', code: 'suspicious_instruction', message: 'Suspicious instruction pattern detected' });
    }
    const type = target && typeof target === 'object' ? target.type : undefined;
    if (HIGH_RISK_TYPES.has(type)) findings.push({ severity: 'high', code: 'authorization_boundary', message: 'Owner authorization required for this action type' });
    if (phase === 'final' && target && typeof target === 'object') {
      const claimsOutcome = target.outcome || target.status || target.completed;
      const evidence = Array.isArray(target.evidence) ? target.evidence.filter(Boolean) : [];
      if (claimsOutcome && evidence.length === 0) findings.push({ severity: 'high', code: 'unsupported_outcome_claim', message: 'Final outcome claim lacks evidence' });
    }
    const severity = findings.some(f => f.severity === 'critical') ? 'critical'
      : findings.some(f => f.severity === 'high') ? 'high'
      : findings.some(f => f.severity === 'medium') ? 'medium' : 'low';
    return { inspected: true, phase, severity, allowed: severity !== 'high' && severity !== 'critical', findings, timestamp: clock() };
  };
  return { inspect };
}
