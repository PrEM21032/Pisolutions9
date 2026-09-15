export function createStateAdapter({ save, load, findByIdempotencyKey, list, clear } = {}) {
  if (typeof save !== 'function' || typeof load !== 'function') throw new Error('invalid_state_adapter');
  return Object.freeze({
    async save(mission) { return save(mission); },
    async load(id) { return load(id); },
    async findByIdempotencyKey(key) { return findByIdempotencyKey ? findByIdempotencyKey(key) : null; },
    async list() { return list ? list() : []; },
    async clear() { return clear ? clear() : undefined; }
  });
}

export function createMemoryStateAdapter() {
  const memory = new Map();
  return createStateAdapter({
    save(mission) { const copy = structuredClone(mission); memory.set(mission.id, copy); return structuredClone(copy); },
    load(id) { const value = memory.get(id); return value ? structuredClone(value) : null; },
    findByIdempotencyKey(key) { for (const value of memory.values()) if (value?.context?.idempotencyKey === key) return structuredClone(value); return null; },
    list() { return [...memory.values()].map(value => structuredClone(value)); },
    clear() { memory.clear(); }
  });
}
