const DEFAULT_SAFE_ACTIONS = Object.freeze(['inspect', 'plan', 'verify', 'product_search', 'availability_check', 'compare_options', 'prepare_cart', 'prepare_booking']);
const HUMAN_GATE_ACTIONS = Object.freeze([
  'financial_transfer',
  'legal_commitment',
  'secret_rotation',
  'production_destructive_change',
  'irreversible_external_action',
  'purchase',
  'place_order',
  'submit_payment',
  'booking_commitment'
]);

function normalizeAction(action = {}) {
  const type = String(action.type || '').trim();
  if (!type) throw new Error('action_type_required');
  return {
    type,
    input: action.input ?? null,
    idempotencyKey: action.idempotencyKey ? String(action.idempotencyKey) : null
  };
}

export function createPersonalExecutionBridge({
  actions = {},
  safeActions = DEFAULT_SAFE_ACTIONS,
  humanGateActions = HUMAN_GATE_ACTIONS
} = {}) {
  const safe = new Set(safeActions.map(String));
  const gated = new Set(humanGateActions.map(String));
  const handlers = new Map(Object.entries(actions));

  async function execute(action = {}) {
    const normalized = normalizeAction(action);
    if (gated.has(normalized.type)) {
      return {
        status: 'blocked',
        action: normalized.type,
        truth: 'verified',
        nextAction: 'owner_required',
        readyToExecute: true,
        approvalReason: 'protected_external_commitment',
        evidence: [{ source: 'personal-execution-bridge', claim: 'human authorization required for irreversible or protected action' }]
      };
    }
    if (!safe.has(normalized.type)) {
      return {
        status: 'blocked',
        action: normalized.type,
        truth: 'verified',
        nextAction: 'owner_required',
        readyToExecute: false,
        approvalReason: 'action_outside_safe_allowlist',
        evidence: [{ source: 'personal-execution-bridge', claim: 'action is outside the configured safe execution allowlist' }]
      };
    }

    const handler = handlers.get(normalized.type);
    if (!handler) {
      return {
        status: 'blocked',
        action: normalized.type,
        truth: 'verified',
        nextAction: 'tool_required',
        evidence: [{ source: 'personal-execution-bridge', claim: `no handler registered for safe action:${normalized.type}` }]
      };
    }

    const result = await handler(normalized.input, normalized);
    return {
      status: 'completed',
      action: normalized.type,
      result: result ?? null,
      truth: 'verified',
      readyToExecute: false,
      evidence: [{ source: 'personal-execution-bridge', claim: `safe action executed:${normalized.type}` }]
    };
  }

  return Object.freeze({ execute, safeActions: [...safe], humanGateActions: [...gated] });
}
