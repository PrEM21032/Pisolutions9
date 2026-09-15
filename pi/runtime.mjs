import { createMission, markFailure, safeOutcome } from './core.mjs';
import { createQueue } from './queue.mjs';
import { saveMission, loadMission, findMissionByIdempotencyKey } from './state.mjs';
import { verifyOutcome } from './verify.mjs';

export function createRuntime({ execute = async () => ({ completed: [], evidence: [], status: 'blocked' }), verify = null } = {}) {
  const queue = createQueue();

  async function submit(objective, context = {}) {
    const key = context?.idempotencyKey;
    if (key) {
      const existing = findMissionByIdempotencyKey(key);
      if (existing) return existing;
    }
    const mission = saveMission(createMission(objective, context));
    queue.enqueue(mission);
    return mission;
  }

  async function cycle() {
    const queued = queue.next();
    if (!queued) return { status: 'idle' };
    let mission = loadMission(queued.mission.id) || queued.mission;
    try {
      mission = saveMission({ ...mission, status: 'running' });
      const result = await execute(mission);
      const gate = verifyOutcome(result);
      if (!gate.ok) throw new Error('verification_failed');
      if (result.status === 'completed' && (!Array.isArray(result.evidence) || result.evidence.length === 0)) {
        throw new Error('evidence_required_for_completed');
      }
      const checked = verify ? await verify(result, mission) : result;
      const outcome = safeOutcome(mission, checked);
      mission = saveMission({ ...mission, status: outcome.status, result: outcome });
      return outcome;
    } catch (error) {
      mission = markFailure(mission, error);
      saveMission(mission);
      if (mission.status === 'retrying') queue.enqueue(mission);
      return safeOutcome(mission, { status: mission.status, uncertainty: [String(error?.message || error)] });
    }
  }

  return { submit, cycle, queue };
}
