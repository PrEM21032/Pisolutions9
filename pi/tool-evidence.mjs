import { evidenceRecord } from './evidence.mjs';

export function normalizeToolEvidence({ tool, result, observedAt, confidence = 'probable', limitations = [] } = {}) {
  if (!tool) throw new Error('tool_required');
  return evidenceRecord({
    source: `tool:${tool}`,
    claim: JSON.stringify(result ?? null),
    observedAt,
    confidence,
    limitations
  });
}

export function verifyToolEvidence(record, expectedTool) {
  const validConfidence = ['verified','probable','speculative','unknown'].includes(record?.confidence);
  const validSource = record?.source === `tool:${expectedTool}`;
  return { ok: validConfidence && validSource, reason: !validSource ? 'evidence_source_mismatch' : !validConfidence ? 'invalid_confidence' : null };
}
