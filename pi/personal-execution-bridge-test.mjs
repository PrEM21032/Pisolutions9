import { createPersonalExecutionBridge } from './personal-execution-bridge.mjs';

const seen = [];
const bridge = createPersonalExecutionBridge({
  actions: {
    inspect: async input => {
      seen.push(input);
      return { inspected: true, input };
    },
    plan: async () => ({ planned: true })
  }
});

const completed = await bridge.execute({ type: 'inspect', input: { scope: 'personal' } });
if (completed.status !== 'completed' || completed.truth !== 'verified') throw new Error('safe_execution_failed');
if (seen.length !== 1 || seen[0]?.scope !== 'personal') throw new Error('safe_handler_input_failed');
if (!completed.evidence?.length) throw new Error('safe_execution_evidence_missing');

const gated = await bridge.execute({ type: 'financial_transfer', input: { amount: 1 } });
if (gated.status !== 'blocked' || gated.nextAction !== 'owner_required') throw new Error('financial_gate_failed');

const unknown = await bridge.execute({ type: 'send_email' });
if (unknown.status !== 'blocked' || unknown.nextAction !== 'owner_required') throw new Error('unknown_action_gate_failed');

const missing = await bridge.execute({ type: 'verify' });
if (missing.status !== 'blocked' || missing.nextAction !== 'tool_required') throw new Error('missing_handler_gate_failed');

console.log(JSON.stringify({ ok: true, phase: 47, safeExecution: true, humanGates: true }));
