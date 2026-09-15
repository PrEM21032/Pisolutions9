import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const dir = await mkdtemp(join(tmpdir(), 'pi-runner-'));
const statePath = join(dir, 'state.json');
try {
  const child = spawn(process.execPath, ['pi/runner.mjs'], {
    env: {
      ...process.env,
      PI_AUTONOMOUS_ENABLED: 'true',
      PI_OBJECTIVE: 'Verify zero-cost runner behavior',
      PI_STATE_FILE_PATH: statePath,
      OPENAI_API_KEY: ''
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  const exitCode = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', resolve);
  });
  if (exitCode !== 0) throw new Error(`runner_exit_${exitCode}:${stderr}`);
  const result = JSON.parse(stdout);
  if (result.mode !== 'zero-cost-first') throw new Error('runner_mode_failed');
  if (!result.providers?.includes('deterministic')) throw new Error('deterministic_provider_missing');
  if (result.providers.includes('openai')) throw new Error('unexpected_openai_provider');
  if (result.status !== 'completed') throw new Error('runner_not_completed');
  const persisted = JSON.parse(await readFile(statePath, 'utf8'));
  if (!Array.isArray(persisted) || persisted.length !== 1) throw new Error('runner_state_not_persisted');
  if (persisted[0]?.status !== 'completed') throw new Error('runner_state_status_failed');
  console.log(JSON.stringify({ ok: true, zeroCostRunner: true, deterministicProvider: true, fileState: true }));
} finally {
  await rm(dir, { recursive: true, force: true });
}
