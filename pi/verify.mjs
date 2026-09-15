export function verifyOutcome(outcome) {
  const completed = Array.isArray(outcome?.completed) ? outcome.completed : [];
  const evidence = Array.isArray(outcome?.evidence) ? outcome.evidence : [];
  const invalid = completed.filter(item => !item || !item.verified);
  return {
    ok: invalid.length === 0,
    truth: invalid.length === 0 && evidence.length ? 'probable' : 'unknown',
    invalidCompleted: invalid,
    rule: 'unverified work must never be reported as completed'
  };
}
