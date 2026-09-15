import { mkdir, rm } from 'node:fs/promises';
import { createFileStateAdapter } from './state-file.mjs';

const dir = '.pi-test';
const file = `${dir}/state.json`;
await rm(dir, { recursive: true, force: true });
await mkdir(dir, { recursive: true });

const state = createFileStateAdapter({ filePath: file });
const mission = { id: 'mission_test', context: { idempotencyKey: 'test-key' }, status: 'planned' };
await state.save(mission);

const loaded = await state.load(mission.id);
if (!loaded || loaded.id !== mission.id) throw new Error('file_state_load_failed');
const existing = await state.findByIdempotencyKey('test-key');
if (!existing || existing.id !== mission.id) throw new Error('file_state_idempotency_failed');

const second = await state.list();
if (second.length !== 1) throw new Error('file_state_list_failed');

const freshAdapter = createFileStateAdapter({ filePath: file });
const persisted = await freshAdapter.load(mission.id);
if (!persisted || persisted.status !== 'planned') throw new Error('file_state_persistence_failed');

await freshAdapter.clear();
const empty = await freshAdapter.list();
if (empty.length !== 0) throw new Error('file_state_clear_failed');
await rm(dir, { recursive: true, force: true });
console.log(JSON.stringify({ ok: true, durableFileState: true, idempotency: true }));
