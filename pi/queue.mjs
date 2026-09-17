export function createQueue() {
  const items = [];
  const queuedIds = new Set();
  return {
    enqueue(mission) {
      if (!mission?.id) throw new Error('mission_id_required');
      if (queuedIds.has(mission.id)) return mission.id;
      items.push({ mission, queuedAt: new Date().toISOString() });
      queuedIds.add(mission.id);
      return mission.id;
    },
    next() {
      const item = items.shift() || null;
      if (item) queuedIds.delete(item.mission.id);
      return item;
    },
    size() { return items.length; },
    snapshot() { return items.map(x => ({ id: x.mission.id, objective: x.mission.objective, queuedAt: x.queuedAt })); }
  };
}
