import { mkdir, readFile, writeFile, rm, rename } from 'node:fs/promises';
import { dirname } from 'node:path';

export function createFileStateAdapter({ filePath = '.pi/state.json' } = {}) {
  async function readState() {
    try {
      const raw = await readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error?.code === 'ENOENT') return [];
      throw error;
    }
  }

  async function writeState(items) {
    await mkdir(dirname(filePath), { recursive: true });
    const temp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    try {
      await writeFile(temp, JSON.stringify(items, null, 2), 'utf8');
      await rename(temp, filePath);
    } finally {
      try { await rm(temp); } catch (error) { if (error?.code !== 'ENOENT') throw error; }
    }
  }

  return Object.freeze({
    async save(mission) {
      if (!mission?.id) throw new Error('mission_id_required');
      const items = await readState();
      const index = items.findIndex(item => item?.id === mission.id);
      const copy = structuredClone(mission);
      if (index >= 0) items[index] = copy;
      else items.push(copy);
      await writeState(items);
      return structuredClone(copy);
    },
    async load(id) {
      const value = (await readState()).find(item => item?.id === id);
      return value ? structuredClone(value) : null;
    },
    async findByIdempotencyKey(key) {
      if (!key) return null;
      const value = (await readState()).find(item => item?.context?.idempotencyKey === key);
      return value ? structuredClone(value) : null;
    },
    async list() {
      return (await readState()).map(item => structuredClone(item));
    },
    async clear() {
      try { await rm(filePath); } catch (error) { if (error?.code !== 'ENOENT') throw error; }
    }
  });
}
