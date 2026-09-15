export const HUMAN_GATES = Object.freeze([
  'credentials',
  'protected_production_approval',
  'paid_activation',
  'legal_commitment',
  'financial_commitment',
  'irreversible_production_action'
]);

export function evaluateProductionGate(state = {}) {
  const blockers = HUMAN_GATES.filter(key => state[key] !== true);
  return {
    ready: blockers.length === 0,
    blockers,
    rule: 'PI may build and test autonomously, but production activation requires explicit human authorization for protected or irreversible actions.'
  };
}
