const memory = new Map();

export function saveMission(mission) {
  if (!mission?.id) throw new Error('mission_id_required');
  const copy = structuredClone(mission);
  memory.set(mission.id, copy);
  return structuredClone(copy);
}

export function loadMission(id) {
  const value = memory.get(id);
  return value ? structuredClone(value) : null;
}

export function listMissions() {
  return [...memory.values()].map(value => structuredClone(value));
}

export function clearState() { memory.clear(); }
