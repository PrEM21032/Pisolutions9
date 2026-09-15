const CAPABILITIES = new Set(['read','write','network','compute','external']);

export function createToolContract({ name, handler, capabilities = [], inputSchema = null, actionType = 'read_only' } = {}) {
  if (!name || typeof handler !== 'function') throw new Error('invalid_tool_contract');
  const normalized = [...new Set(capabilities)];
  if (normalized.some(capability => !CAPABILITIES.has(capability))) throw new Error('invalid_tool_capability');
  return Object.freeze({
    name,
    capabilities: normalized,
    inputSchema,
    actionType,
    async execute(input = {}) { return handler(input); }
  });
}

export function validateToolRequest(contract, request = {}) {
  if (!contract || typeof contract.execute !== 'function') return { ok: false, reason: 'tool_contract_required' };
  if (request?.tool !== contract.name) return { ok: false, reason: 'tool_name_mismatch' };
  if (contract.capabilities.includes('external') && request?.approved !== true) {
    return { ok: false, reason: 'external_tool_approval_required' };
  }
  return { ok: true };
}
