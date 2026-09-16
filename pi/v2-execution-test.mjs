import assert from 'node:assert/strict';
import { createV2MissionGraph } from './v2-mission-plan.mjs';
import { executeV2Graph } from './v2-execution.mjs';

const graph = createV2MissionGraph({
  id: 'v2-execution-test',
  objective: 'build a market research system',
  specialists: ['business', 'research', 'data']
}, { maxParallel: 2 });

let active = 0;
let peak = 0;
const calls = [];
const output = await executeV2Graph(graph, {
  context: { source: 'test' },
  constraints: { budget: 0 },
  executeSpecialist: async (name, input) => {
    active += 1;
    peak = Math.max(peak, active);
    calls.push(name);
    await new Promise(resolve => setTimeout(resolve, 2));
    active -= 1;
    return {
      result: `${name} result for ${input.objective}`,
      evidence: [{ source: 'deterministic-fixture', claim: name }],
      truthLevel: 'verified',
      failureClass: 'unknown'
    };
  },
  verifySpecialist: async result => ({ ...result, result: `${result.result} verified` })
});

assert.equal(output.status, 'completed');
assert.equal(output.unresolved.length, 0);
assert.equal(output.results.length, 4);
assert.equal(output.completed.length, 4);
assert.ok(output.completed.every(item => item.verified === true));
assert.ok(peak <= 2);
assert.deepEqual(output.graph.steps.map(step => step.state), ['verified', 'verified', 'verified', 'verified']);
assert.equal(output.graph.steps.at(-1).result.truthLevel, 'verified');
assert.ok(calls.includes('business'));
assert.ok(calls.includes('research'));
assert.ok(calls.includes('data-finance'));

await assert.rejects(() => executeV2Graph(graph, {
  executeSpecialist: async () => ({ result: 'bad', evidence: [], truthLevel: 'invalid', failureClass: 'unknown' })
}), /truthLevel/);

await assert.rejects(() => executeV2Graph(graph, {
  executeSpecialist: async () => ({ result: 'bad', evidence: [], truthLevel: 'verified', failureClass: 'unknown' }),
  verifySpecialist: async () => ({ result: 'bad', evidence: [], truthLevel: 'unknown' })
}), /failureClass/);

console.log('PI V2 execution tests passed');
