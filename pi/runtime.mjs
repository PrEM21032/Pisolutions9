import { createMission, markFailure, safeOutcome } from './core.mjs';
import { createQueue } from './queue.mjs';
import { saveMission, loadMission, findMissionByIdempotencyKey } from './state.mjs';
import { verifyOutcome } from './verify.mjs';
import { createObserver } from './observability.mjs';
import { createCostGuard } from './cost-guard.mjs';
import { createDeadLetterStore } from './dead-letter.mjs';

export function createRuntime({
  execute = async () => ({ completed: [], evidence: [], status: 'blocked' }),
  verify = null,
  observer = createObserver(),
  cost = {},
  deadLetters = createDeadLetterStore()
} = {}) {
  const queue = createQueue();
  const guard = createCostGuard(cost);

  async function submit(objective, context = {}) {
    const key = context?.idempotencyKey;
    if (key) {
      const existing = findMissionByIdempotencyKey(key);
      if (existing) return existing;
    }
    const mission = saveMission(createMission(objective, context));
    queue.enqueue(mission);
    observer.emit({ missionId: mission.id, step: 'submit', status: 'planned', truth: 'verified', message: 'mission_queued' });
    return mission;
  }

  async function cycle() {
    const queued = queue.next();
    if (!queued) return { status: 'idle' };
    let mission = loadMission(queued.mission.id) || queued.mission;
    const started = Date.now();
    observer.emit({ missionId: mission.id, step: 'cycle', status: 'running', truth: 'unknown', message: 'cycle_started' });
    try {
      mission = saveMission({ ...mission, status: 'running' });
      guard.action();
      const result = await execute(mission, { cost: guard });
      const gate = verifyOutcome(result);
      if (!gate.ok) throw new Error('verification_failed');
      if (result.status === 'completed' && (!Array.isArray(result.evidence) || result.evidence.length === 0)) {
        throw new Error('evidence_required_for_completed');
      }
      const checked = verify ? await verify(result, mission) : result;
      const outcome = safeOutcome(mission, checked);
      mission = saveMission({ ...mission, status: outcome.status, result: outcome });
      observer.emit({ missionId: mission.id, step: 'verify', status: outcome.status, truth: outcome.truth?.verified?.length ? 'verified' : 'probable', durationMs: Date.now() - started, message: 'cycle_verified' });
      return outcome;
    } catch (error) {
      mission = markFailure(mission, error);
      saveMission(mission);
      if (mission.status === 'retrying') {
        queue.enqueue(mission);
      } else if (mission.status === 'blocked') {
        deadLetters.add(mission, error);
      }
      observer.emit({ missionId: mission.id, step: 'recovery', status: mission.status, truth: 'unknown', durationMs: Date.now() - started, message: String(error?.message || error) });
      return safeOutcome(mission, { status: mission.status, uncertainty: [String(error?.message || error)] });
    }
  }

  return { submit, cycle, queue, cost: guard, deadLetters };
}
