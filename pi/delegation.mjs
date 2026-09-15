export function createDelegationPlan(mission) {
  if (!mission?.id || !mission?.objective) throw new Error('mission_required');
  const text = String(mission.objective).toLowerCase();
  const specialists = text.match(/build|code|deploy/) ? ['engineering','security','verification'] : text.match(/business|market|export|import/) ? ['research','business','data'] : ['research','data','verification'];
  return { missionId: mission.id, specialists: [...new Set(specialists)], tasks: specialists.map((specialist, index) => ({ id: `${mission.id}_task_${index + 1}`, specialist, objective: mission.objective, status: 'ready' })) };
}

export function validateDelegation(plan) {
  const tasks = Array.isArray(plan?.tasks) ? plan.tasks : [];
  const ids = tasks.map(task => task.id);
  return { ok: Boolean(plan?.missionId) && tasks.length > 0 && new Set(ids).size === ids.length, taskCount: tasks.length };
}
