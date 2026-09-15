import { createModelBudget, validateModelResult, verifyModelClaim } from './intelligence-guards.mjs';

const budget = createModelBudget({ maxCalls: 1, maxInputBytes: 100 });
budget.before({ prompt: 'hello' });
budget.validateOutput({ answer: 'ok' });
if (budget.usage().calls !== 1) throw new Error('budget_usage_failed');
let blocked = false;
try { budget.before({ prompt: 'second' }); } catch (error) { blocked = error.message === 'model_call_budget_exceeded'; }
if (!blocked) throw new Error('call_budget_failed');

validateModelResult({ completed: [], evidence: [], truth: 'probable' });
let invalid = false;
try { validateModelResult({ truth: 'made_up' }); } catch (error) { invalid = error.message === 'invalid_truth_level'; }
if (!invalid) throw new Error('truth_validation_failed');

const check = verifyModelClaim('claim', [{ source: 'test', claim: 'support' }]);
if (check.verified || check.truth !== 'probable') throw new Error('claim_verification_failed');

console.log(JSON.stringify({ ok: true, budget: true, outputValidation: true, verificationBoundary: true }));
