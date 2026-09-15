import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRuntime } from './runtime.mjs';
import { createFileStateAdapter } from './state-file.mjs';

const dir = await mkdtemp(join(tmpdir(), 'pi-runtime-'));
const filePath = join(dir, 'state.json');
const state = createFileStateAdapter({ filePath });
try {
  const runtime = createRuntime({
    state,
    execute: async () => ({
      status: 'completed',
      completed: [{ verified: true, task: 'file_state_runtime_test', order: 1 }],
      evidence: [{ source: 'runtime-file-state-test', claim: 'runtime persisted mission through file adapter' }]
    })
  });

  const mission = await runtime.submit('Verify durable runtime state', { idempotencyKey: 'runtime-file-state-test' });
  const outcome = await runtime.cycle();
  if (outcome.status !== 'completed') throw new Error('file_state_runtime_cycle_failed');

  const persisted = await state.load(mission.id);
  if (!persisted || persisted.status !== 'completed') throw new Error('mission_not_persisted');
  if (!persisted.result || persisted.result.truth?.verified?.length === 0) throw new Error('verified_result_not_persisted');

  const duplicate = await runtime.submit('Verify durable runtime state', { idempotencyKey: 'runtime-file-state-test' });
  if (duplicate.id !== mission.id) throw new Error('idempotency_not_persistent');

  console.log(JSON.stringify({ ok: true, runtimeFileState: true, idempotency: true }));
} finally {
  await rm(dir, { recursive: true, force: true });
}
