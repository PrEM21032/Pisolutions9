const memory = new Map();

export function saveMission(mission) {
  if (!mission?.id) throw new Error('mission_id_required');
  memory.set(mission.id, structuredClone(mission));
  return structuredClone(mission);
}

export function loadMission(id) {
  const value = memory.get(id);
  return value ? structuredClone(value) : null;
}

export function listMissions() {
  return [...memory.values()].map(value => structuredClone(value));
}

export function clearState() { memory.clear(); }
