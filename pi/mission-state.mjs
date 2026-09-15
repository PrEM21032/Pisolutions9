export function transition(mission, nextStatus) {
  const allowed = {
    planned: ['ready_for_execution', 'blocked'],
    ready_for_execution: ['running', 'blocked'],
    running: ['verifying', 'retrying', 'blocked'],
    retrying: ['running', 'blocked'],
    verifying: ['completed', 'retrying', 'blocked'],
    completed: [],
    blocked: []
  };
  if (!allowed[mission.status]?.includes(nextStatus)) throw new Error(`invalid_transition:${mission.status}->${nextStatus}`);
  return { ...mission, status: nextStatus, updatedAt: new Date().toISOString() };
}
