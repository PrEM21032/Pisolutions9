const HUMAN_GATES = new Set(['irreversible_external_action','legal_commitment','financial_transfer','secret_rotation','production_destructive_change']);

export function createExecutionPolicy({ humanApprovalRequiredFor = [...HUMAN_GATES], allowedTools = [] } = {}) {
  const gates = new Set(humanApprovalRequiredFor);
  return Object.freeze({
    allowedTools: [...allowedTools],
    requiresApproval(actionType) { return gates.has(actionType); },
    checkAction(action = {}) {
      if (!action?.tool) return { ok: false, reason: 'tool_required' };
      if (allowedTools.length && !allowedTools.includes(action.tool)) return { ok: false, reason: 'tool_not_allowed' };
      if (action?.type && gates.has(action.type) && action?.approved !== true) return { ok: false, reason: 'human_approval_required', actionType: action.type };
      return { ok: true };
    }
  });
}
