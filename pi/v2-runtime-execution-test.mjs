import assert from 'node:assert/strict';
import { createRuntime } from './runtime.mjs';

const missions = new Map();
const state = {
  async save(mission) { const stored = structuredClone(mission); missions.set(stored.id, stored); return stored; },
  async load(id) { return missions.get(id) || null; },
  async findByIdempotencyKey(key) { return [...missions.values()].find(m => m.context?.idempotencyKey === key) || null; },
  async list() { return [...missions.values()]; },
  async clear() { missions.clear(); }
};

const runtime = createRuntime({
  state,
  netra: { inspect: () => ({ allowed: true, severity: 'low', findings: [] }) },
  executeSpecialist: async (name, input) => ({
    result: `${name} completed ${input.objective}`,
    evidence: [{ source: 'runtime-fixture', claim: name }],
    truthLevel: 'verified',
    failureClass: 'unknown'
  }),
  verifySpecialist: async result => result,
  v2MaxParallel: 2
});

const mission = await runtime.submit('Build a market research system', { idempotencyKey: 'v2-runtime-execution' });
const outcome = await runtime.cycle();

assert.equal(outcome.status, 'completed');
assert.equal(outcome.completed.length, 4);
assert.ok(outcome.completed.every(item => item.verified === true));
assert.equal(outcome.evidence.length, 4);

console.log('PI V2 runtime execution tests passed');
