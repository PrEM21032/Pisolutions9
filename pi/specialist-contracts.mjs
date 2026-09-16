export const SPECIALIST_FAILURES = Object.freeze(['invalid-input', 'tool-failure', 'provider-failure', 'evidence-insufficient', 'policy-blocked', 'authorization-required', 'execution-failure', 'unknown']);

const names = ['research', 'engineering', 'business', 'data-finance', 'earth-intelligence'];
const TRUTH_LEVELS = Object.freeze(['verified', 'probable', 'speculative', 'unknown']);
const REQUIRED_INPUTS = Object.freeze(['missionId', 'objective', 'context', 'constraints']);
const REQUIRED_OUTPUTS = Object.freeze(['result', 'evidence', 'truthLevel', 'failureClass']);

export const SPECIALIST_CONTRACTS = Object.freeze(Object.fromEntries(names.map(name => [name, Object.freeze({
  name,
  input: REQUIRED_INPUTS,
  output: REQUIRED_OUTPUTS,
  truthLevels: TRUTH_LEVELS,
  failureClasses: SPECIALIST_FAILURES,
  requiresKrishna: true,
  canBypassOwnerGate: false
})])));

export function getSpecialistContract(name) {
  const contract = SPECIALIST_CONTRACTS[name];
  if (!contract) throw new Error(`unknown specialist: ${name}`);
  return contract;
}

export function validateSpecialistInput(name, input) {
  const contract = getSpecialistContract(name);
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error(`${name} input must be an object`);
  for (const field of contract.input) {
    if (!(field in input)) throw new Error(`${name} input.${field} is required`);
  }
  if (typeof input.missionId !== 'string' || !input.missionId.trim()) throw new Error(`${name} input.missionId is required`);
  if (typeof input.objective !== 'string' || !input.objective.trim()) throw new Error(`${name} input.objective is required`);
  if (!input.context || typeof input.context !== 'object' || Array.isArray(input.context)) throw new Error(`${name} input.context must be an object`);
  if (!input.constraints || typeof input.constraints !== 'object' || Array.isArray(input.constraints)) throw new Error(`${name} input.constraints must be an object`);
  return true;
}

export function validateSpecialistResult(name, result) {
  const contract = getSpecialistContract(name);
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error(`${name} result must be an object`);
  for (const field of contract.output) {
    if (!(field in result)) throw new Error(`${name} result.${field} is required`);
  }
  if (typeof result.result !== 'string') throw new Error(`${name} result.result is required`);
  if (!Array.isArray(result.evidence)) throw new Error(`${name} result.evidence must be an array`);
  if (!contract.truthLevels.includes(result.truthLevel)) throw new Error(`${name} result has invalid truthLevel`);
  if (!contract.failureClasses.includes(result.failureClass)) throw new Error(`${name} result has invalid failureClass`);
  if (contract.canBypassOwnerGate !== false) throw new Error(`${name} contract cannot bypass owner gate`);
  return true;
}

export { REQUIRED_INPUTS, REQUIRED_OUTPUTS, TRUTH_LEVELS };
