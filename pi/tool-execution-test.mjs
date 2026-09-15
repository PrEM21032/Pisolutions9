import { createToolRegistry } from './tool-adapters.mjs';
import { executeToolRequest } from './tool-execution.mjs';

const tools = createToolRegistry();
tools.register('bounded-read', async input => ({ value: input.value * 2 }), { capabilities: ['read'] });
const success = await executeToolRequest({ tool: 'bounded-read', input: { value: 21 } }, { tools, allowedTools: ['bounded-read'] });
if (success.result.value !== 42) throw new Error('tool_result_failed');
if (success.evidence.source !== 'tool:bounded-read') throw new Error('tool_evidence_failed');

const external = createToolRegistry();
external.register('external-write', async () => ({ changed: true }), { capabilities: ['write', 'external'], actionType: 'irreversible_external_action' });
let blocked = false;
try { await executeToolRequest({ tool: 'external-write', input: {} }, { tools: external, allowedTools: ['external-write'] }); } catch (error) { blocked = error.message === 'external_tool_approval_required'; }
if (!blocked) throw new Error('external_approval_not_enforced');

let disallowed = false;
try { await executeToolRequest({ tool: 'bounded-read', input: {} }, { tools, allowedTools: [] }); } catch (error) { disallowed = error.message === 'tool_not_allowed'; }
if (!disallowed) throw new Error('allowlist_not_enforced');

console.log(JSON.stringify({ ok: true, boundedExecution: true, evidence: true, externalApproval: true, allowlist: true }));
