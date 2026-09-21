import assert from 'node:assert/strict';
import { createRuntime } from './runtime.mjs';

function memoryState() {
  const store = new Map();
  return {
    async save(mission) { store.set(mission.id, structuredClone(mission)); return structuredClone(mission); },
    async load(id) { const value=store.get(id); return value ? structuredClone(value) : null; },
    async findByIdempotencyKey(key) { return [...store.values()].find(m=>m.context?.idempotencyKey===key) || null; },
    async list() { return [...store.values()].map(value=>structuredClone(value)); },
    async clear() { store.clear(); }
  };
}

let safeExecutions=0;
const safeRuntime=createRuntime({
  state:memoryState(),
  execute:async()=> {
    safeExecutions += 1;
    return { status:'completed', completed:[{ claim:'read completed', verified:true }], evidence:[{ source:'fixture', claim:'read evidence' }] };
  }
});
await safeRuntime.submit('Read the current project status',{
  action:{ tool:'repo-read', risk:{ readOnly:true, retrySafe:true, idempotent:true } }
});
const safe=await safeRuntime.cycle();
assert.equal(safe.status,'completed');
assert.equal(safeExecutions,1);

let protectedExecutions=0;
const protectedRuntime=createRuntime({
  state:memoryState(),
  execute:async()=> {
    protectedExecutions += 1;
    return { status:'completed', completed:[{ claim:'charged', verified:true }], evidence:[{ source:'fixture' }] };
  }
});
await protectedRuntime.submit('Prepare a customer charge',{
  action:{ tool:'billing-charge', risk:{ spendsMoney:true, externalSideEffect:true } }
});
const blocked=await protectedRuntime.cycle();
assert.equal(blocked.status,'blocked');
assert.equal(blocked.nextAction,'owner_required');
assert.equal(protectedExecutions,0);

console.log('PI autonomous runtime tool-risk gate tests passed.');
