export function createModelRouter({ adapters = {} } = {}) {
  return {
    available() { return Object.keys(adapters); },
    async run(input, options = {}) {
      const name = options.provider || process.env.PI_MODEL_PROVIDER;
      const adapter = adapters[name];
      if (!adapter) return { ok: false, status: 'unknown', reason: 'model_provider_not_configured', provider: name || null };
      const value = await adapter(input, options);
      return { ok: true, provider: name, value };
    }
  };
}
