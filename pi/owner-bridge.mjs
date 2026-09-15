export function createOwnerRequest({ objective, context = {}, idempotencyKey = null } = {}) {
  const text = String(objective || '').trim();
  if (!text) throw new Error('objective_required');
  return { objective: text, context, idempotencyKey, requestedAt: new Date().toISOString() };
}

export function renderOwnerOutcome(outcome = {}) {
  return {
    status: outcome.status || 'unknown',
    missionId: outcome.missionId || null,
    completed: Array.isArray(outcome.completed) ? outcome.completed.filter(item => item?.verified === true) : [],
    evidence: Array.isArray(outcome.evidence) ? outcome.evidence : [],
    uncertainty: Array.isArray(outcome.uncertainty) ? outcome.uncertainty : [],
    nextAction: outcome.nextAction || null
  };
}
