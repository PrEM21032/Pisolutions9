export function createDeadLetterStore() {
  const items = [];
  return {
    add(mission, error) {
      const record = Object.freeze({
        missionId: mission?.id ?? null,
        objective: mission?.objective ?? null,
        attempts: mission?.recovery?.attempts ?? null,
        error: String(error?.message || error || 'unknown_error'),
        recordedAt: new Date().toISOString()
      });
      items.push(record);
      return record;
    },
    list() { return items.map(item => ({ ...item })); },
    size() { return items.length; }
  };
}
