export function verifyOutcome(outcome) {
  const completed = Array.isArray(outcome?.completed) ? outcome.completed : [];
  const evidence = Array.isArray(outcome?.evidence) ? outcome.evidence : [];
  const invalid = completed.filter(item => !item || !item.verified);
  const requiresCompletionProof = outcome?.status === 'completed';
  const claimsMissing = requiresCompletionProof && completed.length === 0;
  const evidenceMissing = requiresCompletionProof && evidence.length === 0;
  const ok = invalid.length === 0 && !claimsMissing && !evidenceMissing;
  return {
    ok,
    truth: ok ? 'verified' : 'unknown',
    invalidCompleted: invalid,
    claimsMissing,
    evidenceMissing,
    rule: 'completed work must contain at least one verified item and supporting evidence'
  };
}
