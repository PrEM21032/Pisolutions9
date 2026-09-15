import { productionReadiness } from './production-readiness.mjs';

const blocked = productionReadiness({ testsPassing: true });
if (blocked.ready || !blocked.missingEngineering.length) throw new Error('readiness_should_be_blocked');

const ready = productionReadiness({
  testsPassing: true,
  durableState: true,
  modelConfigured: true,
  toolsVerified: true,
  auditability: true,
  deploymentVerified: true,
  humanApproval: Object.fromEntries(['credentials','protected_production_approval','paid_activation','legal_commitment','financial_commitment','irreversible_production_action'].map(key => [key, true]))
});
if (!ready.ready) throw new Error('readiness_should_pass');
console.log(JSON.stringify({ ok: true, blocked: true, ready: true }));
