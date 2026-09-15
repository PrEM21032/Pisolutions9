export async function withRecovery(task, options = {}) {
  const maxAttempts = options.maxAttempts ?? 3;
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try { return { ok: true, attempt, value: await task(attempt) }; }
    catch (error) {
      lastError = error;
      if (options.onFailure) await options.onFailure(error, attempt);
      if (attempt < maxAttempts && options.backoffMs) await new Promise(r => setTimeout(r, options.backoffMs * attempt));
    }
  }
  return { ok: false, attempts: maxAttempts, error: String(lastError?.message || lastError || 'unknown_error') };
}
