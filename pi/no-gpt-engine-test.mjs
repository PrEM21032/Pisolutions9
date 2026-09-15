import { planNoGpt, executeNoGptPlan } from './no-gpt-engine.mjs';

const plan = planNoGpt('Build a business intelligence app and test it');
if (plan.mode !== 'no-gpt') throw new Error('wrong_mode');
if (!plan.domains.includes('business') || !plan.domains.includes('engineering')) throw new Error('domain_detection_failed');
if (!plan.tasks.includes('run_tests')) throw new Error('engineering_plan_missing');

const result = executeNoGptPlan(plan);
if (result.status !== 'completed') throw new Error('execution_failed');
if (!result.completed.length || result.completed.some(item => item.verified !== true)) throw new Error('completion_verification_failed');
if (!result.evidence.length) throw new Error('evidence_missing');

let rejected = false;
try { planNoGpt(''); } catch (error) { rejected = error.message === 'objective_required'; }
if (!rejected) throw new Error('empty_objective_not_rejected');

console.log(JSON.stringify({ ok: true, mode: 'no-gpt', deterministicPlanning: true, boundedExecution: true, evidence: true }));
