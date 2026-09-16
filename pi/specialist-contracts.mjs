export const SPECIALIST_FAILURES = Object.freeze(['invalid-input', 'tool-failure', 'provider-failure', 'evidence-insufficient', 'policy-blocked', 'authorization-required', 'execution-failure', 'unknown']);

const names = ['research', 'engineering', 'business', 'data-finance', 'earth-intelligence'];

export const SPECIALIST_CONTRACTS = Object.freeze(Object.fromEntries(names.map(name => [name, Object.freeze({
  name,
  input: Object.freeze(['missionId', 'objective', 'context', 'constraints']),
  output: Object.freeze(['result', 'evidence', 'truthLevel', 'failureClass']),
  truthLevels: Object.freeze(['verified', 'probable', 'speculative', 'unknown']),
  failureClasses: SPECIALIST_FAILURES,
  requiresKrishna: true,
  canBypassOwnerGate: false
})])));

export function getSpecialistContract(name) {
  const contract = SPECIALIST_CONTRACTS[name];
  if (!contract) throw new Error(`unknown specialist: ${name}`);
  return contract;
}

export function validateSpecialistResult(name, result) {
  const contract = getSpecialistContract(name);
  if (!result || typeof result !== 'object') throw new Error(`${name} result must be an object`);
  if (typeof result.result !== 'string') throw new Error(`${name} result.result is required`);
  if (!Array.isArray(result.evidence)) throw new Error(`${name} result.evidence must be an array`);
  if (!contract.truthLevels.includes(result.truthLevel)) throw new Error(`${name} result has invalid truthLevel`);
  if (!contract.failureClasses.includes(result.failureClass)) throw new Error(`${name} result has invalid failureClass`);
  return true;
}
