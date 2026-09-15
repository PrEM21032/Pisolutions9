import { evaluateProductionGate } from './final-gate.mjs';

export function productionReadiness({ testsPassing = false, durableState = false, modelConfigured = false, toolsVerified = false, auditability = false, deploymentVerified = false, humanApproval = {} } = {}) {
  const gate = evaluateProductionGate(humanApproval);
  const engineering = { testsPassing, durableState, modelConfigured, toolsVerified, auditability, deploymentVerified };
  const missingEngineering = Object.entries(engineering).filter(([, ok]) => ok !== true).map(([name]) => name);
  return { ready: gate.ready && missingEngineering.length === 0, missingEngineering, humanGate: gate };
}
