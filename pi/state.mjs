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

export function findMissionByIdempotencyKey(key) {
  if (!key) return null;
  for (const value of memory.values()) {
    if (value?.context?.idempotencyKey === key) return structuredClone(value);
  }
  return null;
}

export function listMissions() {
  return [...memory.values()].map(value => structuredClone(value));
}

export function clearState() { memory.clear(); }
