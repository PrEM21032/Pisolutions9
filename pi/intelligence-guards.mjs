const TRUTH = new Set(['verified','probable','speculative','unknown']);

export function createModelBudget({ maxCalls = 10, maxInputBytes = 32768, maxOutputBytes = 65536 } = {}) {
  let calls = 0;
  return Object.freeze({
    before(input) {
      if (++calls > maxCalls) throw new Error('model_call_budget_exceeded');
      const bytes = Buffer.byteLength(JSON.stringify(input ?? {}), 'utf8');
      if (bytes > maxInputBytes) throw new Error('model_input_budget_exceeded');
    },
    validateOutput(output) {
      const bytes = Buffer.byteLength(JSON.stringify(output ?? null), 'utf8');
      if (bytes > maxOutputBytes) throw new Error('model_output_budget_exceeded');
      return output;
    },
    usage() { return { calls, maxCalls }; }
  });
}

export function validateModelResult(result = {}) {
  if (!result || typeof result !== 'object') throw new Error('invalid_model_result');
  if (result.truth != null && !TRUTH.has(result.truth)) throw new Error('invalid_truth_level');
  if (result.completed != null && !Array.isArray(result.completed)) throw new Error('invalid_completed_shape');
  if (result.evidence != null && !Array.isArray(result.evidence)) throw new Error('invalid_evidence_shape');
  return Object.freeze({ ok: true, result });
}

export function verifyModelClaim(claim, evidence = []) {
  const text = String(claim || '').trim();
  if (!text) return { verified: false, truth: 'unknown', reason: 'empty_claim' };
  if (!Array.isArray(evidence) || evidence.length === 0) return { verified: false, truth: 'unknown', reason: 'no_evidence' };
  return { verified: false, truth: 'probable', reason: 'evidence_present_independent_verification_required' };
}
