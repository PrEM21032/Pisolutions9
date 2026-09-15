import { classifyBlocker, createAlternativePlan, runAlternativePlan } from './blocker-router.mjs';

if (!classifyBlocker(new Error('tool_unavailable')).safeToReroute) throw new Error('safe_blocker_not_classified');
const plan = createAlternativePlan({ blocker: new Error('tool_unavailable'), alternatives: [{ name: 'primary', safe: true }, { name: 'fallback', safe: true }] });
if (plan.ownerRequired || plan.alternatives.length !== 2) throw new Error('alternative_plan_failed');
const outcome = await runAlternativePlan(plan, async option => {
  if (option.name === 'primary') throw new Error('temporary_failure');
  return { ok: true };
});
if (outcome.status !== 'completed' || outcome.selected !== 'fallback') throw new Error('fallback_execution_failed');
const blocked = createAlternativePlan({ blocker: new Error('credentials_required'), alternatives: [] });
if (!blocked.ownerRequired) throw new Error('human_gate_failed');
console.log(JSON.stringify({ ok: true, adaptiveRecovery: true, fallbackExecution: true, humanGatePreserved: true }));
