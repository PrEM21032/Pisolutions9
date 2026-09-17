import { classifyBlocker, createAlternativePlan, runAlternativePlan } from './blocker-router.mjs';

export function createAutonomousRecovery({ repair = null, alternatives = [] } = {}) {
  if (repair !== null && typeof repair !== 'function') throw new Error('invalid_repair_hook');

  return Object.freeze({
    async recover({ mission, error, context = {} } = {}) {
      const blocker = classifyBlocker(error);
      const trace = [{ phase: 'diagnose', reason: blocker.reason, safeToReroute: blocker.safeToReroute }];

      if (!blocker.safeToReroute) {
        trace.push({ phase: 'decision', action: 'escalate', reason: 'unsafe_or_authorization_boundary' });
        return { status: 'blocked', ownerRequired: true, trace };
      }

      if (repair) {
        trace.push({ phase: 'decision', action: 'repair' });
        try {
          const result = await repair({ mission, error, blocker, context });
          if (result?.status === 'completed' || result?.status === 'repaired') {
            trace.push({ phase: 'verify', action: 'repair_result_returned', status: result.status });
            return { status: 'completed', ownerRequired: false, result, trace };
          }
          trace.push({ phase: 'repair', action: 'repair_not_complete', status: result?.status || 'unknown' });
        } catch (repairError) {
          trace.push({ phase: 'repair', action: 'failed', reason: String(repairError?.message || repairError) });
        }
      }

      const plan = createAlternativePlan({ blocker: error, alternatives });
      if (plan.alternatives.length) {
        trace.push({ phase: 'decision', action: 'alternative', count: plan.alternatives.length });
        const fallback = await runAlternativePlan(plan, option => option.execute(mission, context));
        trace.push({ phase: 'verify', action: 'alternative_result', status: fallback.status, selected: fallback.selected || null });
        if (fallback.status === 'completed') return { ...fallback, trace };
      }

      trace.push({ phase: 'decision', action: 'retry', reason: 'safe_bounded_retry' });
      return { status: 'retry', ownerRequired: false, trace };
    }
  });
}
