import { normalizeToolEvidence, verifyToolEvidence } from './tool-evidence.mjs';

const record = normalizeToolEvidence({ tool: 'safe-read', result: { value: 42 }, confidence: 'probable' });
if (!verifyToolEvidence(record, 'safe-read').ok) throw new Error('tool_evidence_failed');
if (verifyToolEvidence(record, 'other-tool').ok) throw new Error('evidence_mismatch_not_blocked');

console.log(JSON.stringify({ ok: true, normalizedEvidence: true, independentSourceCheck: true }));
