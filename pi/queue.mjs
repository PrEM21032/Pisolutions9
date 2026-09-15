export function createQueue() {
  const items = [];
  return {
    enqueue(mission) { items.push({ mission, queuedAt: new Date().toISOString() }); return mission.id; },
    next() { return items.shift() || null; },
    size() { return items.length; },
    snapshot() { return items.map(x => ({ id: x.mission.id, objective: x.mission.objective, queuedAt: x.queuedAt })); }
  };
}
