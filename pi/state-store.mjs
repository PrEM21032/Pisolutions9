export function createMemoryStateStore() {
  const memory = new Map();
  return {
    async save(mission) { if (!mission?.id) throw new Error('mission_id_required'); const copy = structuredClone(mission); memory.set(copy.id, copy); return structuredClone(copy); },
    async load(id) { const value = memory.get(id); return value ? structuredClone(value) : null; },
    async findByIdempotencyKey(key) { if (!key) return null; for (const value of memory.values()) if (value?.context?.idempotencyKey === key) return structuredClone(value); return null; },
    async list() { return [...memory.values()].map(value => structuredClone(value)); },
    async clear() { memory.clear(); }
  };
}

export function createStateAdapter({ save, load, findByIdempotencyKey, list, clear } = {}) {
  if (typeof save !== 'function' || typeof load !== 'function' || typeof findByIdempotencyKey !== 'function' || typeof list !== 'function') throw new Error('invalid_state_adapter');
  return Object.freeze({ save, load, findByIdempotencyKey, list, clear: typeof clear === 'function' ? clear : async () => {} });
}
