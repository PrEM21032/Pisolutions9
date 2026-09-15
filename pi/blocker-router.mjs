const SAFE_BLOCKERS = new Set(['tool_unavailable','provider_unavailable','network_unavailable','temporary_failure','unsupported_action']);

export function classifyBlocker(error) {
  const reason = String(error?.code || error?.message || error || 'unknown_blocker');
  return { reason, safeToReroute: SAFE_BLOCKERS.has(reason) };
}

export function createAlternativePlan({ blocker, alternatives = [] } = {}) {
  const classification = classifyBlocker(blocker);
  const safe = alternatives.filter(option => option && option.safe !== false).slice(0, 3);
  return { blocker: classification.reason, safeToReroute: classification.safeToReroute, alternatives: safe, ownerRequired: !classification.safeToReroute || safe.length === 0 };
}

export async function runAlternativePlan(plan, execute) {
  if (!plan?.alternatives?.length || typeof execute !== 'function') return { status: 'blocked', ownerRequired: true, attempts: [] };
  const attempts = [];
  for (const option of plan.alternatives) {
    try {
      const result = await execute(option);
      attempts.push({ option: option.name || 'alternative', status: 'completed', result });
      return { status: 'completed', ownerRequired: false, attempts, selected: option.name || 'alternative' };
    } catch (error) {
      attempts.push({ option: option.name || 'alternative', status: 'failed', error: String(error?.message || error) });
    }
  }
  return { status: 'blocked', ownerRequired: true, attempts };
}
