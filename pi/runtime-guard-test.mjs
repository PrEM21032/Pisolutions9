import { createRuntime } from './runtime.mjs';
import { clearState } from './state.mjs';

clearState();
const events = [];
const runtime = createRuntime({
  cost: { maxActions: 1, maxModelCalls: 0 },
  observer: { emit(event) { events.push(event); return event; } },
  execute: async () => ({
    status: 'completed',
    completed: [{ verified: true }],
    evidence: [{ source: 'runtime-guard-test', claim: 'bounded execution returned' }]
  })
});

const mission = await runtime.submit('guard test', { idempotencyKey: 'guard-test' });
const outcome = await runtime.cycle();
if (outcome.status !== 'completed') throw new Error('guard_runtime_failed');
if (runtime.cost.snapshot().actions !== 1) throw new Error('action_budget_not_recorded');
if (!events.some(event => event.step === 'verify')) throw new Error('verification_event_missing');

const deadLetterRuntime = createRuntime({
  cost: { maxActions: 0 },
  observer: { emit() {} },
  execute: async () => ({ status: 'completed', completed: [{ verified: true }], evidence: [{ source: 'never' }] })
});
const blockedMission = await deadLetterRuntime.submit('dead letter test');
let blocked;
for (let i = 0; i < 3; i += 1) blocked = await deadLetterRuntime.cycle();
if (blocked.status !== 'blocked') throw new Error('dead_letter_blocking_failed');
if (deadLetterRuntime.deadLetters.size() !== 1) throw new Error('dead_letter_record_missing');
if (deadLetterRuntime.deadLetters.list()[0].missionId !== blockedMission.id) throw new Error('dead_letter_wrong_mission');

console.log(JSON.stringify({ ok: true, missionId: mission.id, status: outcome.status, observed: events.length, deadLetters: 1 }));
