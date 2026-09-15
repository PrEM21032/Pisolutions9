import { createModelBudget, validateModelResult } from './intelligence-guards.mjs';

export function createModelRouter({ adapters = {}, budget = {}, fallbackProviders = [] } = {}) {
  const providers = Object.keys(adapters);
  const configuredFallbacks = fallbackProviders.filter(name => providers.includes(name));

  return {
    available() { return providers; },
    async run(input, options = {}) {
      const requested = options.provider || process.env.PI_MODEL_PROVIDER;
      const candidates = requested
        ? [requested, ...configuredFallbacks.filter(name => name !== requested)]
        : configuredFallbacks;
      const attempts = [];

      if (!candidates.length) {
        return { ok: false, status: 'unknown', reason: 'model_provider_not_configured', provider: requested || null, attempts };
      }

      for (const name of candidates) {
        const adapter = adapters[name];
        if (typeof adapter !== 'function') {
          attempts.push({ provider: name, ok: false, reason: 'adapter_unavailable' });
          continue;
        }
        const guard = createModelBudget(budget);
        try {
          guard.before(input);
          const value = guard.validateOutput(await adapter(input, options));
          const checked = validateModelResult(value);
          attempts.push({ provider: name, ok: true, usage: guard.usage() });
          return { ok: true, provider: name, value: checked.result, attempts };
        } catch (error) {
          attempts.push({ provider: name, ok: false, reason: String(error?.message || error) });
        }
      }

      return {
        ok: false,
        status: 'failed',
        reason: 'all_model_providers_failed',
        provider: requested || null,
        attempts
      };
    }
  };
}
