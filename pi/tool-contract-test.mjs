import { createToolContract, validateToolRequest } from './tool-contract.mjs';

const tool = createToolContract({ name: 'safe-read', capabilities: ['read'], handler: async input => ({ ok: true, input }) });
if (!validateToolRequest(tool, { tool: 'safe-read' }).ok) throw new Error('safe_tool_rejected');
const result = await tool.execute({ value: 1 });
if (!result.ok || result.input.value !== 1) throw new Error('tool_execution_failed');

const external = createToolContract({ name: 'external-write', capabilities: ['write','external'], handler: async () => ({ ok: true }) });
const blocked = validateToolRequest(external, { tool: 'external-write' });
if (blocked.ok || blocked.reason !== 'external_tool_approval_required') throw new Error('external_gate_failed');
if (!validateToolRequest(external, { tool: 'external-write', approved: true }).ok) throw new Error('approved_external_rejected');

let invalid = false;
try { createToolContract({ name: 'bad', capabilities: ['telepathy'], handler() {} }); } catch (error) { invalid = error.message === 'invalid_tool_capability'; }
if (!invalid) throw new Error('capability_validation_failed');

console.log(JSON.stringify({ ok: true, capabilityBoundary: true, approvalGate: true }));
