export function verifyOutcome(outcome) {
  const completed = Array.isArray(outcome?.completed) ? outcome.completed : [];
  const evidence = Array.isArray(outcome?.evidence) ? outcome.evidence : [];
  const invalid = completed.filter(item => !item || !item.verified);
  const hasCompletedWork = completed.length > 0;
  const ok = hasCompletedWork && invalid.length === 0 && evidence.length > 0;
  return {
    ok,
    truth: ok ? 'verified' : 'unknown',
    invalidCompleted: invalid,
    rule: 'completed work must contain at least one verified item and supporting evidence'
  };
}
