const LEGACY_MARKERS = [
  /^\s*classification\s*:/i,
  /\bi recognized this as an informational question\b/i,
  /\btemporarily operating in verified recovery mode\b/i
];

export async function decideKrishnaRoute({
  message = '',
  history = [],
  attachmentInfo = null,
  directTools = [],
  requiresLiveEvidence = () => false,
  requiresHardReasoning = () => false
} = {}) {
  const trace = [];
  if (!attachmentInfo) {
    for (const tool of directTools) {
      if (!tool || typeof tool.run !== 'function') continue;
      const result = await tool.run();
      trace.push({ step: 'direct_tool', name: tool.name || 'unnamed', matched: Boolean(result) });
      if (result) return { route: 'direct', result, trace };
    }
  }
  if (requiresLiveEvidence(history, message)) {
    trace.push({ step: 'route', route: 'live' });
    return { route: 'live', trace };
  }
  if (requiresHardReasoning(message)) {
    trace.push({ step: 'route', route: 'hard' });
    return { route: 'hard', trace };
  }
  trace.push({ step: 'route', route: 'general' });
  return { route: 'general', trace };
}

export function validateKrishnaAnswer(payload = {}, { route = 'general' } = {}) {
  if (!payload || typeof payload !== 'object') return { ok: false, reason: 'answer_not_object' };
  if (payload.ok === false) return { ok: true, reason: 'explicit_failure' };
  const answer = typeof payload.answer === 'string' ? payload.answer.trim() : '';
  if (!answer) return { ok: false, reason: 'empty_answer' };
  if (LEGACY_MARKERS.some(pattern => pattern.test(answer))) {
    return { ok: false, reason: 'internal_planner_leakage' };
  }
  if (route === 'live') {
    const sources = Array.isArray(payload.sources) ? payload.sources.filter(source => source && source.url) : [];
    const acceptable = payload.truth === 'live-data-response' || payload.truth === 'web-grounded-model-response' || payload.truth === 'retailer-search-link';
    if (!acceptable) return { ok: false, reason: 'live_route_without_live_truth' };
    if (payload.truth !== 'retailer-search-link' && sources.length === 0) return { ok: false, reason: 'live_route_without_sources' };
  }
  if (payload.truth === 'verified-model-response' && payload.verification !== 'independent-pass') {
    return { ok: false, reason: 'verified_claim_without_independent_pass' };
  }
  if (payload.truth === 'deterministic-verified' && !payload.verification) {
    return { ok: false, reason: 'deterministic_verified_without_method' };
  }
  return { ok: true, reason: 'accepted' };
}
