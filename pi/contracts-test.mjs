import { createOwnerRequest, renderOwnerOutcome } from './owner-bridge.mjs';
import { createDelegationPlan, validateDelegation } from './delegation.mjs';
import { createExecutionPolicy } from './policy.mjs';
import { createModelProvider, createModelProviderRegistry } from './model-contract.mjs';

const request = createOwnerRequest({ objective: 'Build PI software', idempotencyKey: 'contract-test' });
if (!request.objective || !request.idempotencyKey) throw new Error('owner_request_failed');
const plan = createDelegationPlan({ id: 'mission_contract', objective: request.objective });
if (!validateDelegation(plan).ok || plan.specialists.length !== 3) throw new Error('delegation_contract_failed');
const policy = createExecutionPolicy({ allowedTools: ['safe_tool'] });
if (!policy.checkAction({ tool: 'blocked_tool' }).ok) throw new Error('tool_policy_failed');
if (policy.checkAction({ tool: 'safe_tool', type: 'financial_transfer' }).reason !== 'human_approval_required') throw new Error('approval_gate_failed');
const provider = createModelProvider({ name: 'test', run: async input => ({ text: String(input) }) });
const registry = createModelProviderRegistry([provider]);
const model = await registry.run('test', 'ok');
if (!model.ok || model.value.text !== 'ok') throw new Error('model_contract_failed');
const rendered = renderOwnerOutcome({ status: 'completed', completed: [{ verified: true }], evidence: ['e'] });
if (rendered.completed.length !== 1) throw new Error('owner_render_failed');
console.log(JSON.stringify({ ok: true, ownerBridge: true, delegation: true, policy: true, modelContract: true }, null, 2));
