import { getRunnableSteps } from './mission-graph.mjs';
import { validateSpecialistInput, validateSpecialistResult } from './specialist-contracts.mjs';

export async function executeV2Graph(graph, {
  executeSpecialist,
  verifySpecialist = async result => result,
  context = {},
  constraints = {}
} = {}) {
  if (typeof executeSpecialist !== 'function') throw new Error('v2_specialist_executor_required');
  if (typeof verifySpecialist !== 'function') throw new Error('v2_verifier_required');

  let current = structuredClone(graph);
  const results = [];
  const completedIds = new Set();

  while (true) {
    const runnable = getRunnableSteps(current);
    if (!runnable.length) break;

    const batch = await Promise.all(runnable.map(async step => {
      const input = {
        missionId: current.missionId,
        objective: step.objective || current.objective,
        context,
        constraints
      };
      validateSpecialistInput(step.specialist, input);
      const raw = await executeSpecialist(step.specialist, input, step);
      validateSpecialistResult(step.specialist, raw);
      const verified = await verifySpecialist(raw, step, input);
      validateSpecialistResult(step.specialist, verified);
      return { step, result: verified };
    }));

    const byId = new Map(batch.map(({ step, result }) => [step.id, { step, result }]));
    current = {
      ...current,
      steps: current.steps.map(step => {
        const item = byId.get(step.id);
        return item ? { ...step, state: 'verified', result: item.result } : step;
      })
    };
    for (const item of batch) {
      completedIds.add(item.step.id);
      results.push(item);
    }
  }

  const unresolved = current.steps.filter(step => !['verified', 'completed'].includes(step.state));
  return {
    graph: current,
    results,
    completed: [...completedIds],
    status: unresolved.length === 0 ? 'completed' : 'blocked',
    unresolved: unresolved.map(step => step.id)
  };
}
