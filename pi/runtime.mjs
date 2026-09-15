import { createMission, markFailure, safeOutcome } from './core.mjs';
import { createQueue } from './queue.mjs';
import { saveMission, loadMission } from './state.mjs';

export function createRuntime({ execute = async () => ({ completed: [], evidence: [], status: 'blocked' }), verify = async outcome => outcome } = {}) {
  const queue = createQueue();

  async function submit(objective, context = {}) {
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
      const checked = await verify(result, mission);
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
