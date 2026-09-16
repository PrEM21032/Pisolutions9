import { planNoGpt, executeNoGptPlan } from './no-gpt-engine.mjs';

const plan = planNoGpt('Build a business intelligence app and test it');
if (plan.mode !== 'no-gpt') throw new Error('wrong_mode');
if (!plan.domains.includes('business') || !plan.domains.includes('engineering')) throw new Error('domain_detection_failed');
if (!plan.tasks.includes('run_tests')) throw new Error('engineering_plan_missing');

const result = executeNoGptPlan(plan);
if (result.status !== 'completed') throw new Error('execution_failed');
if (result.completed.length !== 1 || result.completed[0].task !== 'deterministic_route_generated' || result.completed[0].verified !== true) throw new Error('planning_verification_failed');
if (!result.planned.length || result.planned.some(item => !plan.tasks.includes(item.task))) throw new Error('planned_tasks_missing');
if (result.nextAction !== plan.tasks[0]) throw new Error('next_action_missing');
if (!result.evidence.length) throw new Error('evidence_missing');
if (!result.uncertainty.some(item => /does not invent current external facts/i.test(item) && /live data requests require a verified data source/i.test(item))) throw new Error('truth_boundary_missing');

let rejected = false;
try { planNoGpt(''); } catch (error) { rejected = error.message === 'objective_required'; }
if (!rejected) throw new Error('empty_objective_not_rejected');

console.log(JSON.stringify({ ok: true, mode: 'no-gpt', deterministicPlanning: true, externalExecutionClaimed: false, evidence: true }));
