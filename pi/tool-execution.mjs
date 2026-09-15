import { executeAction } from './executor.mjs';
import { normalizeToolEvidence, verifyToolEvidence } from './tool-evidence.mjs';
import { validateToolRequest } from './tool-contract.mjs';

export async function executeToolRequest(request, { tools, allowedTools = [], timeoutMs = 15000, maxInputBytes = 32768 } = {}) {
  if (!request?.tool) throw new Error('tool_required');
  const contract = tools?.get?.(request.tool);
  if (!contract) throw new Error(`tool_unavailable:${request.tool}`);
  const gate = validateToolRequest(contract, request);
  if (!gate.ok) throw new Error(gate.reason);
  const result = await executeAction(request, {
    tools,
    allowedTools,
    timeoutMs,
    maxInputBytes
  });
  const evidence = normalizeToolEvidence({ tool: request.tool, result, confidence: 'probable' });
  const evidenceCheck = verifyToolEvidence(evidence, request.tool);
  if (!evidenceCheck.ok) throw new Error(evidenceCheck.reason);
  return { result, evidence };
}
