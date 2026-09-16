const TERMINAL_STATES = new Set(['verified', 'completed', 'blocked', 'dead-lettered']);
const VALID_STATES = new Set(['queued', 'running', 'retrying', 'verified', 'completed', 'blocked', 'dead-lettered']);

function assertStep(step) {
  if (!step || typeof step.id !== 'string' || !step.id.trim()) throw new Error('mission step id is required');
  if (!Array.isArray(step.dependsOn)) throw new Error(`mission step ${step.id} dependsOn must be an array`);
  if (step.state && !VALID_STATES.has(step.state)) throw new Error(`invalid mission step state: ${step.state}`);
}

export function createMissionGraph({ missionId, objective, steps, maxParallel = 2 }) {
  if (!missionId || !objective) throw new Error('missionId and objective are required');
  if (!Array.isArray(steps) || steps.length === 0) throw new Error('mission steps are required');
  if (!Number.isInteger(maxParallel) || maxParallel < 1) throw new Error('maxParallel must be a positive integer');

  const ids = new Set();
  for (const step of steps) {
    assertStep(step);
    if (ids.has(step.id)) throw new Error(`duplicate mission step: ${step.id}`);
    ids.add(step.id);
  }
  for (const step of steps) {
    for (const dependency of step.dependsOn) {
      if (!ids.has(dependency)) throw new Error(`unknown dependency ${dependency} for ${step.id}`);
      if (dependency === step.id) throw new Error(`self dependency for ${step.id}`);
    }
  }

  const graph = Object.freeze({
    missionId,
    objective,
    maxParallel,
    steps: steps.map(step => Object.freeze({
      ...step,
      dependsOn: Object.freeze([...step.dependsOn]),
      state: step.state || 'queued'
    }))
  });

  assertAcyclic(graph);
  return graph;
}

export function assertAcyclic(graph) {
  const byId = new Map(graph.steps.map(step => [step.id, step]));
  const visiting = new Set();
  const visited = new Set();
  const visit = id => {
    if (visiting.has(id)) throw new Error(`mission dependency cycle at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id).dependsOn) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  };
  for (const step of graph.steps) visit(step.id);
  return true;
}

export function getRunnableSteps(graph) {
  const byId = new Map(graph.steps.map(step => [step.id, step]));
  return graph.steps.filter(step => {
    if (step.state !== 'queued' && step.state !== 'retrying') return false;
    return step.dependsOn.every(id => TERMINAL_STATES.has(byId.get(id).state) && byId.get(id).state === 'verified');
  }).slice(0, graph.maxParallel);
}

export function isMissionComplete(graph) {
  return graph.steps.every(step => step.state === 'completed' || step.state === 'verified');
}
