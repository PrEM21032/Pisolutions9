// Only classify known provider codes. Never return provider messages, IDs, or credentials.
async function quotaExhausted(response) {
  const copy = response.clone();
  const reader = copy.body?.getReader();
  if (!reader) return false;
  let timer;
  try {
    const read = async () => {
      let text = '';
      let bytes = 0;
      const decoder = new TextDecoder();
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 8192) return false;
        text += decoder.decode(value, {stream:true});
      }
      text += decoder.decode();
      const error = JSON.parse(text)?.error;
      const codes = new Set(['insufficient_quota', 'billing_hard_limit_reached',
        'organization_spend_limit_exceeded', 'organization_usage_limit_exceeded']);
      return codes.has(error?.code) || error?.type === 'insufficient_quota';
    };
    return await Promise.race([read(), new Promise(resolve => {
      timer = setTimeout(() => resolve(false), 1000);
    })]);
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
    void reader.cancel().catch(() => {});
  }
}

export async function providerError(response) {
  if (response.status === 401) return {error:'chat_provider_auth_failed',status:502};
  if (response.status === 403) return {error:'chat_provider_access_denied',status:502};
  if (response.status === 404) return {error:'chat_provider_model_or_endpoint_not_found',status:502};
  if (response.status === 429) return {
    error:await quotaExhausted(response) ? 'chat_provider_quota_exhausted' : 'chat_provider_rate_limited',
    status:503
  };
  if (response.status >= 500) return {error:'chat_provider_server_error',status:503};
  if (response.status >= 400) return {error:'chat_provider_request_rejected',status:502};
  return {error:'chat_provider_unavailable',status:503};
}
