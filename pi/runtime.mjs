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
import { createAlternativePlan, runAlternativePlan } from './blocker-router.mjs';

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
  policy = createExecutionPolicy()
} = {}) {
  if (!state || typeof state.save !== 'function' || typeof state.load !== 'function') throw new Error('invalid_state_adapter');
  const queue = createQueue();
  const guard = createCostGuard(cost);

  async function submit(objective, context = {}) {
    const key = context?.idempotencyKey;
    if (key) {
      const existing = await state.findByIdempotencyKey(key);
      if (existing) return existing;
    }
    const mission = await state.save(createMission(objective, context));
    const delegation = createDelegationPlan(mission);
    const delegationCheck = validateDelegation(delegation);
    if (!delegationCheck.ok) throw new Error('delegation_validation_failed');
    const enriched = { ...mission, delegation };
    await state.save(enriched);
    queue.enqueue(enriched);
    observer.emit({ missionId: mission.id, step: 'submit', status: 'planned', truth: 'verified', message: 'mission_queued' });
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
      const outcome = safeOutcome(mission, checked);
      mission = await state.save({ ...mission, status: outcome.status, result: outcome });
      observer.emit({ missionId: mission.id, step: 'verify', status: outcome.status, truth: outcome.truth?.verified?.length ? 'verified' : 'probable', durationMs: Date.now() - started, message: 'cycle_verified' });
      return outcome;
    } catch (error) {
      mission = markFailure(mission, error);
      await state.save(mission);
      if (mission.status === 'retrying') queue.enqueue(mission);
      else if (mission.status === 'blocked') deadLetters.add(mission, error);
      observer.emit({ missionId: mission.id, step: 'recovery', status: mission.status, truth: 'unknown', durationMs: Date.now() - started, message: String(error?.message || error) });
      return safeOutcome(mission, { status: mission.status, uncertainty: [String(error?.message || error)] });
    }
  }

  return { submit, cycle, queue, cost: guard, deadLetters, policy, state };
}
