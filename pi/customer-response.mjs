// Customer-visible outcomes are explicit; HTTP 200 alone is not task completion.
const UNAVAILABLE = 'PI’s live answer service is temporarily unavailable. Please try again in a moment.';

const BLOCKERS = {
  live_data_connector_not_configured: {
    answer: 'PI needs a connected live data source for this request. Live research is not connected yet, so PI will not guess. Your question is kept below; you can edit it or ask a question that does not need current data.',
    label: 'Live data needed',
  },
  live_research_unverified: {
    answer: 'PI reached live research, but the response did not include source evidence for the current facts. PI will not present that as verified. Your question is kept below so you can try again.',
    label: 'Live evidence missing',
  },
  live_research_provider_unavailable: {
    answer: 'PI could not reach a working live-research provider for this current-data request. Your question is kept below; PI will not guess from stale information.',
    label: 'Live research unavailable',
  },
  empty_live_research_response: {
    answer: 'PI reached live research, but the provider returned no usable answer. Your question is kept below; PI did not claim completion.',
    label: 'Empty live response',
  },
  hard_reasoning_not_verified: {
    answer: 'PI could not independently verify this answer, so no reliable result was produced. Your question is kept below. You can add the missing facts or narrow the question and try again.',
    label: 'Verification blocked',
  },
  chat_provider_rate_limited: {
    answer: 'PI’s answer provider is temporarily rate-limited. Your question is kept below. PI did not complete the request; try again shortly.',
    label: 'Provider rate-limited',
  },
  chat_provider_quota_exhausted: {
    answer: 'PI’s configured answer provider has exhausted its current usage quota. Your question is kept below. PI needs provider quota to be restored or another live provider to take over.',
    label: 'Provider quota exhausted',
  },
  edge_model_unavailable: {
    answer: 'PI’s primary edge model is temporarily unavailable and no live fallback completed the request. Your question is kept below.',
    label: 'Live model unavailable',
  },
  chat_provider_server_error: {
    answer: 'PI reached the live provider, but the provider returned a server error. Your question is kept below; PI did not claim completion.',
    label: 'Provider error',
  },
  chat_provider_network_error: {
    answer: 'PI could not reach the configured live provider from the runtime. Your question is kept below.',
    label: 'Provider network error',
  },
  customer_request_deadline_exceeded: {
    answer: 'PI could not complete the answer within the safe response window. Your question is kept below so you can try again.',
    label: 'Answer timed out',
  },
  attachment_invalid: { answer: 'PI could not read that attachment. Choose a supported file and try again.', label: 'Attachment invalid' },
  attachment_unsupported: { answer: 'That attachment type is not supported yet. Try PDF, Word, Excel, CSV, HTML/XML, ODT/ODS, Numbers, or a common image format.', label: 'File type unsupported' },
  attachment_too_large: { answer: 'That attachment is too large for this PI V1.02 path. Use a file of 4 MB or smaller.', label: 'File too large' },
  attachment_conversion_failed: { answer: 'PI could not safely extract usable content from that attachment, so it will not guess about the file.', label: 'File conversion failed' },
  attachment_conversion_unavailable: { answer: 'PI’s file-understanding service is temporarily unavailable. The file was not stored by PI.', label: 'File service unavailable' },
  message_too_large: {
    answer: 'This question is too long. Shorten it to 8,000 characters or fewer and try again. Your question is kept below.',
    label: 'Shorter question needed',
  },
};

export function chatOutcome(response, body) {
  if (!response.ok || !body || typeof body.answer !== 'string' || !body.answer.trim()) {
    const blocker = BLOCKERS[body?.error];
    const safeBackendAnswer = body && body.ok === false && body.truth === 'unknown' && typeof body.answer === 'string' && body.answer.trim() ? body.answer.trim() : '';
    return { answer: blocker?.answer || safeBackendAnswer || UNAVAILABLE, label: blocker?.label || (safeBackendAnswer ? 'Request not completed' : 'Request failed'), state: 'blocked', remember: false, complete: false, restoreDraft: true, note: 'No completed result.', artifacts: [], sources: [] };
  }
  if (body.status === 'incomplete') {
    return { answer: body.answer + '\n\nThis answer reached its output limit and is incomplete. Ask for a shorter response or the next section.', label: 'Answer incomplete', state: 'limited', remember: true, complete: false, restoreDraft: false, note: 'Partial answer — not a completed result.', artifacts: [], sources: [] };
  }
  if (body.ok !== true) {
    return { answer: UNAVAILABLE, label: 'Request failed', state: 'blocked', remember: false, complete: false, restoreDraft: true, note: 'No completed result.', artifacts: [], sources: [] };
  }
  const notes = {
    'verified-calculation': 'CSV checked: rows and totals independently recomputed.',
    'verified-model-response': 'Reviewed by another model · facts not independently established.',
    'provisional-model-response': 'Useful reasoning provided, but independent verification did not complete. Treat assumptions and estimates cautiously.',
    'web-grounded-model-response': 'Current answer grounded with live web research sources.',
    'file-grounded-model-response': 'Answer grounded in the attached file or image.',
    'deterministic-verified': 'Verified deterministic PI capability · no model required.',
    'runtime-derived': 'Live value from PI’s runtime clock.',
    'live-data-response': 'Current answer from a direct live data source.',
    deterministic: 'Limited offline recovery; live model unavailable.',
    'needs-input': 'Waiting for valid inventory rows.',
  };
  const completedArtifact = body.truth === 'verified-calculation' && body.status === 'completed';
  const limited = ['deterministic', 'needs-input', 'provisional-model-response'].includes(body.truth);
  return {
    answer: body.answer, note: notes[body.truth] || 'Model answer · facts not independently checked',
    label: completedArtifact ? 'File verified' : body.truth === 'needs-input' ? 'More detail needed' : limited ? 'Limited reply' : 'Reply received',
    state: limited ? 'limited' : 'answered', remember: true, complete: !limited, restoreDraft: false,
    artifacts: completedArtifact && Array.isArray(body.artifacts) ? body.artifacts : [],
    sources: ['web-grounded-model-response','live-data-response'].includes(body.truth) && Array.isArray(body.sources) ? body.sources.filter(source => source && typeof source.url === 'string' && /^https:\/\//.test(source.url)).slice(0, 8) : [],
  };
}

export function transportOutcome(error, online = true) {
  const answer = !online
    ? 'This device is offline. Your question is kept below. Reconnect before trying again.'
    : error?.name === 'AbortError'
      ? 'PI did not return an answer before the time limit. Completion is not confirmed. Your question is kept below so you can try again.'
      : UNAVAILABLE + ' Your question is kept below.';
  return { answer, label: online ? 'Request failed' : 'Offline', state: 'blocked', remember: false, complete: false, restoreDraft: true, note: 'No completed result.', artifacts: [], sources: [] };
}
