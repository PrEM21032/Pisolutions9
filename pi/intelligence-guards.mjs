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
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('invalid_model_result');
  if (typeof result.truth !== 'string' || !TRUTH.has(result.truth)) throw new Error('invalid_truth_level');
  if (!Array.isArray(result.completed)) throw new Error('invalid_completed_shape');
  if (!Array.isArray(result.evidence)) throw new Error('invalid_evidence_shape');
  if (result.truth === 'verified' && result.evidence.length === 0) throw new Error('verified_model_result_requires_evidence');
  if (result.uncertainty != null && !Array.isArray(result.uncertainty)) throw new Error('invalid_uncertainty_shape');
  if (result.nextAction != null && typeof result.nextAction !== 'string') throw new Error('invalid_next_action_shape');
  return Object.freeze({ ok: true, result });
}

export function verifyModelClaim(claim, evidence = []) {
  const text = String(claim || '').trim();
  if (!text) return { verified: false, truth: 'unknown', reason: 'empty_claim' };
  if (!Array.isArray(evidence) || evidence.length === 0) return { verified: false, truth: 'unknown', reason: 'no_evidence' };
  return { verified: false, truth: 'probable', reason: 'evidence_present_independent_verification_required' };
}
