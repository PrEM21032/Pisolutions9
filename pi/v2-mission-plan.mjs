import { createMissionGraph } from './mission-graph.mjs';
import { getSpecialistContract } from './specialist-contracts.mjs';

const SPECIALIST_ALIASES = Object.freeze({
  data: 'data-finance',
  earth: 'earth-intelligence'
});

function canonicalSpecialist(name) {
  const canonical = SPECIALIST_ALIASES[name] || name;
  try {
    getSpecialistContract(canonical);
    return canonical;
  } catch {
    return null;
  }
}

export function createV2MissionGraph(mission, { maxParallel = 2 } = {}) {
  if (!mission?.id || !mission?.objective) throw new Error('mission_required');
  const requested = Array.isArray(mission.specialists) ? mission.specialists : [];
  const specialists = [...new Set(requested.map(canonicalSpecialist).filter(Boolean))];
  if (!specialists.length) specialists.push('research');

  const specialistSteps = specialists.map((specialist, index) => ({
    id: `specialist_${index + 1}_${specialist}`,
    specialist,
    objective: mission.objective,
    dependsOn: [],
    state: 'queued'
  }));

  return createMissionGraph({
    missionId: mission.id,
    objective: mission.objective,
    maxParallel,
    steps: [
      ...specialistSteps,
      {
        id: 'verify',
        specialist: 'research',
        objective: mission.objective,
        dependsOn: specialistSteps.map(step => step.id),
        state: 'queued'
      }
    ]
  });
}

export { SPECIALIST_ALIASES };
