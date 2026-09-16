import { createMission, markFailure, safeOutcome } from './core.mjs';
import { createQueue } from './queue.mjs';
import { createStateAdapter } from './state-adapter.mjs';
import { saveMission, loadMission, findMissionByIdempotencyKey, listMissions, clearState } from './state.mjs';
import { verifyOutcome } from './verify.mjs';
import { createObserver } from './observability.mjs';
import { createCostGuard } from './cost-guard.mjs';
import { createDeadLetterStore } from './dead-letter.mjs';
import { createDelegationPlan, validateDelegation } from './delegation.mjs';
import { createExecutionPolicy } from './policy.mjs';
import { classifyBlocker, createAlternativePlan, runAlternativePlan } from './blocker-router.mjs';
import { createNetra } from './netra.mjs';
import { verifyLearningAction } from './learning-prevention.mjs';
import { createV2MissionGraph } from './v2-mission-plan.mjs';

const defaultState = createStateAdapter({
  save: saveMission,
  load: loadMission,
  findByIdempotencyKey: findMissionByIdempotencyKey,
  list: listMissions,
  clear: clearState
});

export function createRuntime({
  execute = async () => ({ completed: [], evidence: [], status: 'blocked' }),
  alternatives = [],
  verify = null,
  observer = createObserver(),
  cost = {},
  deadLetters = createDeadLetterStore(),
  state = defaultState,
  policy = createExecutionPolicy(),
  netra = createNetra(),
  learn = null,
  v2MaxParallel = 2
} = {}) {
  if (!state || typeof state.save !== 'function' || typeof state.load !== 'function') throw new Error('invalid_state_adapter');
  if (!netra || typeof netra.inspect !== 'function') throw new Error('invalid_netra');
  if (learn !== null && typeof learn !== 'function') throw new Error('invalid_learning_hook');
  if (!Number.isInteger(v2MaxParallel) || v2MaxParallel < 1) throw new Error('invalid_v2_max_parallel');
  const queue = createQueue();
  const guard = createCostGuard(cost);

  async function submit(objective, context = {}) {
    const preCheck = netra.inspect(objective, 'pre');
    observer.emit({ missionId: null, step: 'netra_precheck', status: preCheck.allowed ? 'allowed' : 'blocked', truth: 'verified', message: preCheck.severity, findings: preCheck.findings });
    if (!preCheck.allowed) throw new Error(`netra_precheck_blocked:${preCheck.severity}`);
    const key = context?.idempotencyKey;
    if (key) {
      const existing = await state.findByIdempotencyKey(key);
      if (existing) return existing;
    }
    const mission = await state.save(createMission(objective, context));
    const delegation = createDelegationPlan(mission);
    const delegationCheck = validateDelegation(delegation);
    if (!delegationCheck.ok) throw new Error('delegation_validation_failed');
    const missionGraph = createV2MissionGraph(mission, { maxParallel: v2MaxParallel });
    const enriched = { ...mission, delegation, missionGraph };
    await state.save(enriched);
    queue.enqueue(enriched);
    observer.emit({ missionId: mission.id, step: 'submit', status: 'planned', truth: 'verified', message: 'mission_queued', missionGraph: { maxParallel: missionGraph.maxParallel, stepCount: missionGraph.steps.length } });
    return enriched;
  }

  async function executeMission(mission) {
    try {
      return await execute(mission, { cost: guard, policy });
    } catch (error) {
      const plan = createAlternativePlan({ blocker: error, alternatives });
      observer.emit({
        missionId: mission.id,
        step: 'recovery',
        status: plan.ownerRequired ? 'blocked' : 'rerouting',
        truth: 'unknown',
        message: plan.ownerRequired ? 'no_safe_fallback' : 'primary_failed_fallback_started'
      });
      if (plan.ownerRequired) throw error;
      const fallback = await runAlternativePlan(plan, option => option.execute(mission, { cost: guard, policy }));
      if (fallback.status !== 'completed') throw error;
      observer.emit({ missionId: mission.id, step: 'recovery', status: 'completed', truth: 'probable', message: `fallback_selected:${fallback.selected}` });
      return fallback.attempts.at(-1).result;
    }
  }

  async function recordLearning(mission, error) {
    if (!learn) return null;
    const evidence = [{ source: 'runtime-error', claim: String(error?.message || error) }];
    const action = await learn({ mission, error, evidence });
    const check = verifyLearningAction(action);
    observer.emit({ missionId: mission.id, step: 'learning_prevention', status: check.verified ? 'verified' : 'rejected', truth: check.verified ? 'verified' : 'unknown', message: check.reason });
    if (!check.verified) throw new Error(`learning_prevention_rejected:${check.reason}`);
    return action;
  }

  async function cycle() {
    const queued = queue.next();
    if (!queued) return { status: 'idle' };
    let mission = await state.load(queued.mission.id) || queued.mission;
    const started = Date.now();
    observer.emit({ missionId: mission.id, step: 'cycle', status: 'running', truth: 'unknown', message: 'cycle_started' });
    try {
      mission = await state.save({ ...mission, status: 'running' });
      guard.action();
      const result = await executeMission(mission);
      const gate = verifyOutcome(result);
      if (!gate.ok) throw new Error('verification_failed');
      if (result.status === 'completed' && (!Array.isArray(result.evidence) || result.evidence.length === 0)) throw new Error('evidence_required_for_completed');
      const checked = verify ? await verify(result, mission) : result;
      const finalCheck = netra.inspect({ outcome: checked?.status, evidence: checked?.evidence }, 'final');
      observer.emit({ missionId: mission.id, step: 'netra_finalcheck', status: finalCheck.allowed ? 'allowed' : 'blocked', truth: 'verified', message: finalCheck.severity, findings: finalCheck.findings });
      if (!finalCheck.allowed) throw new Error(`netra_finalcheck_blocked:${finalCheck.severity}`);
      const outcome = safeOutcome(mission, checked);
      mission = await state.save({ ...mission, status: outcome.status, result: outcome });
      observer.emit({ missionId: mission.id, step: 'verify', status: outcome.status, truth: outcome.truth?.verified?.length ? 'verified' : 'probable', durationMs: Date.now() - started, message: 'cycle_verified' });
      return outcome;
    } catch (error) {
      let learningError = null;
      try { await recordLearning(mission, error); } catch (learnError) { learningError = learnError; }
      const blocker = classifyBlocker(error);
      const humanGate = !blocker.safeToReroute || Boolean(learningError);
      mission = humanGate
        ? await state.save({ ...mission, status: 'blocked' })
        : markFailure(mission, error);
      const nextAction = humanGate ? 'owner_required' : null;
      if (mission.status === 'retrying') queue.enqueue(mission);
      else if (mission.status === 'blocked') deadLetters.add(mission, error);
      observer.emit({
        missionId: mission.id,
        step: 'recovery',
        status: mission.status,
        truth: 'unknown',
        durationMs: Date.now() - started,
        message: humanGate ? `owner_required:${blocker.reason}` : blocker.reason
      });
      return safeOutcome(mission, {
        status: mission.status,
        uncertainty: [String(error?.message || error), ...(learningError ? [String(learningError?.message || learningError)] : [])],
        nextAction
      });
    }
  }

  async function runCycles({ maxCycles = 1 } = {}) {
    const limit = Number.isInteger(maxCycles) && maxCycles >= 0 ? maxCycles : 1;
    const outcomes = [];
    for (let index = 0; index < limit; index += 1) {
      const outcome = await cycle();
      outcomes.push(outcome);
      if (outcome.status === 'idle') break;
    }
    return {
      status: outcomes.some(outcome => outcome.status === 'blocked') ? 'blocked' : 'completed',
      cycles: outcomes,
      executedCycles: outcomes.filter(outcome => outcome.status !== 'idle').length
    };
  }

  return { submit, cycle, runCycles, queue, cost: guard, deadLetters, policy, state, netra };
}
