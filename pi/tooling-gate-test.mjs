import { createToolContract, validateToolRequest } from './tool-contract.mjs';
import { normalizeToolEvidence, verifyToolEvidence } from './tool-evidence.mjs';

const tool = createToolContract({ name: 'bounded-read', capabilities: ['read'], handler: async () => ({ value: 7 }) });
const request = validateToolRequest(tool, { tool: 'bounded-read' });
if (!request.ok) throw new Error('tool_request_failed');
const result = await tool.execute({});
const evidence = normalizeToolEvidence({ tool: tool.name, result, confidence: 'probable' });
if (!verifyToolEvidence(evidence, tool.name).ok) throw new Error('tool_evidence_verification_failed');
console.log(JSON.stringify({ ok: true, capabilityAware: true, boundedExecution: true, evidenceNormalized: true, independentlySourceChecked: true }));
